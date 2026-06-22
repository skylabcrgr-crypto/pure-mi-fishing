// Pure MI Fishing — Sync Service (Phase 7)
// ----------------------------------------------------------------------------
// Pushes locally-created records to Supabase when (and only when) the backend
// is configured, a user is signed in, and the network call succeeds.
//
// HARD GUARANTEES (offline-first):
//   * Never throws to callers. Always returns a structured SyncResult.
//   * Never deletes or mutates local payload data — only updates sync metadata.
//   * If backend is unconfigured / signed out / offline / request fails, the
//     local record stays pending and the failure is counted, never lost.
//   * SQLite + AsyncStorage remain the source of truth. This is push-only
//     (one-way) for the MVP; pull/merge is deferred.
// ----------------------------------------------------------------------------

import type { CatchEntry, Trip, CitizenReport, EmergencyIncident } from '../types';
import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { STORAGE_KEYS, storageGet, storageSet } from '../lib/storage';
import {
  getPendingCitizenReports,
} from './citizenReportService';
import {
  queryEmergencyIncidents,
  updateCitizenReportStatus,
  updateEmergencyIncidentSync,
} from '../lib/db';
import { getCurrentUser } from './authService';

// ── Result shapes ────────────────────────────────────────────────────

export interface EntitySyncResult {
  entity: 'trips' | 'catch_logs' | 'citizen_reports' | 'emergency_incidents';
  pending: number;
  pushed: number;
  failed: number;
}

export interface SyncResult {
  ok: boolean;
  ranAt: string;
  configured: boolean;
  signedIn: boolean;
  /** High-level reason when nothing was pushed. */
  reason?: 'not-configured' | 'not-signed-in' | 'nothing-pending' | 'completed';
  entities: EntitySyncResult[];
  totalPushed: number;
  totalFailed: number;
  error?: string;
}

export interface PendingCounts {
  trips: number;
  catches: number;
  citizenReports: number;
  emergencyIncidents: number;
  total: number;
}

// ── Pending detection (read-only, safe offline) ──────────────────────

function isTripPending(t: Trip): boolean {
  // Demo/seed trips are never synced.
  if (t.id.startsWith('trip-demo')) return false;
  return t.syncStatus !== 'synced';
}

function isCatchPending(c: CatchEntry): boolean {
  return c.syncStatus !== 'synced';
}

/** Count records awaiting upload across all entities. Never throws. */
export async function getPendingCounts(): Promise<PendingCounts> {
  let trips = 0;
  let catches = 0;
  let citizenReports = 0;
  let emergencyIncidents = 0;

  try {
    const stored = (await storageGet<Trip[]>(STORAGE_KEYS.trips)) ?? [];
    trips = stored.filter(isTripPending).length;
  } catch {
    /* ignore */
  }
  try {
    const stored = (await storageGet<CatchEntry[]>(STORAGE_KEYS.logbook)) ?? [];
    catches = stored.filter(isCatchPending).length;
  } catch {
    /* ignore */
  }
  try {
    citizenReports = getPendingCitizenReports().length;
  } catch {
    /* ignore */
  }
  try {
    emergencyIncidents = queryEmergencyIncidents().filter(
      (i) => i.syncStatus !== 'synced',
    ).length;
  } catch {
    /* ignore */
  }

  return {
    trips,
    catches,
    citizenReports,
    emergencyIncidents,
    total: trips + catches + citizenReports + emergencyIncidents,
  };
}

// ── Row mappers (local → Supabase column shape) ──────────────────────

function tripToRow(t: Trip, userId: string) {
  return {
    user_id: userId,
    client_id: t.id,
    title: t.title,
    waterbody_id: t.waterbodyId,
    waterbody_name: t.waterbodyName,
    start_time: t.startTime,
    end_time: t.endTime ?? null,
    launch_id: t.launchId ?? null,
    launch_name: t.launchName ?? null,
    notes: t.notes ?? null,
    is_active: t.isActive,
  };
}

function catchToRow(c: CatchEntry, userId: string) {
  return {
    user_id: userId,
    client_id: c.id,
    trip_client_id: c.tripId ?? null,
    species_id: c.speciesId,
    species_name: c.speciesName,
    length_in: c.lengthIn ?? null,
    weight_lb: c.weightLb ?? null,
    method: c.method ?? null,
    bait: c.bait ?? null,
    notes: c.notes ?? null,
    waterbody_id: c.waterbodyId,
    waterbody_name: c.waterbodyName,
    is_public: c.isPublic,
    caught_at: c.timestamp,
  };
}

function reportToRow(r: CitizenReport, userId: string) {
  return {
    user_id: userId,
    client_id: r.id,
    report_type: r.reportType,
    latitude: r.coordinates?.latitude ?? null,
    longitude: r.coordinates?.longitude ?? null,
    waterbody_id: r.waterbodyId ?? null,
    waterbody_name: r.waterbodyName ?? null,
    photo_uri: null, // photo upload deferred
    notes: r.notes ?? null,
    is_anonymous: r.isAnonymous,
    status: 'submitted',
    reported_at: r.timestamp,
  };
}

function incidentToRow(i: EmergencyIncident, userId: string) {
  return {
    user_id: userId,
    client_id: i.id,
    latitude: i.coordinates?.latitude ?? null,
    longitude: i.coordinates?.longitude ?? null,
    last_known_latitude: i.lastKnownCoordinates?.latitude ?? null,
    last_known_longitude: i.lastKnownCoordinates?.longitude ?? null,
    last_known_at: i.lastKnownAt ?? null,
    battery_level: i.batteryLevel ?? null,
    notes: i.notes ?? null,
    emergency_contact_name: i.emergencyContact?.name ?? null,
    emergency_contact_phone: i.emergencyContact?.phone ?? null,
    nearest_access_point_id: i.nearestAccessPointId ?? null,
    nearest_access_point_name: i.nearestAccessPointName ?? null,
    nearest_access_distance_mi: i.nearestAccessPointDistanceMi ?? null,
    status: i.status,
    occurred_at: i.createdAt,
  };
}

// ── Push routines ────────────────────────────────────────────────────

async function syncTrips(userId: string): Promise<EntitySyncResult> {
  const result: EntitySyncResult = { entity: 'trips', pending: 0, pushed: 0, failed: 0 };
  const sb = getSupabase();
  if (!sb) return result;

  let all: Trip[];
  try {
    all = (await storageGet<Trip[]>(STORAGE_KEYS.trips)) ?? [];
  } catch {
    return result;
  }

  const pending = all.filter(isTripPending);
  result.pending = pending.length;
  if (pending.length === 0) return result;

  let mutated = false;
  for (const trip of pending) {
    const idx = all.findIndex((t) => t.id === trip.id);
    try {
      const { error } = await sb
        .from('trips')
        .upsert(tripToRow(trip, userId), { onConflict: 'user_id,client_id' });
      if (error) throw new Error(error.message);
      all[idx] = {
        ...all[idx],
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
        lastSyncAttemptAt: new Date().toISOString(),
      };
      result.pushed += 1;
    } catch {
      all[idx] = {
        ...all[idx],
        syncStatus: 'failed',
        syncAttempts: (all[idx].syncAttempts ?? 0) + 1,
        lastSyncAttemptAt: new Date().toISOString(),
      };
      result.failed += 1;
    }
    mutated = true;
  }

  if (mutated) {
    try {
      await storageSet<Trip[]>(STORAGE_KEYS.trips, all);
    } catch {
      /* preserve in memory; local file write failure is non-fatal */
    }
  }
  return result;
}

async function syncCatches(userId: string): Promise<EntitySyncResult> {
  const result: EntitySyncResult = { entity: 'catch_logs', pending: 0, pushed: 0, failed: 0 };
  const sb = getSupabase();
  if (!sb) return result;

  let all: CatchEntry[];
  try {
    all = (await storageGet<CatchEntry[]>(STORAGE_KEYS.logbook)) ?? [];
  } catch {
    return result;
  }

  const pending = all.filter(isCatchPending);
  result.pending = pending.length;
  if (pending.length === 0) return result;

  let mutated = false;
  for (const entry of pending) {
    const idx = all.findIndex((c) => c.id === entry.id);
    try {
      const { error } = await sb
        .from('catch_logs')
        .upsert(catchToRow(entry, userId), { onConflict: 'user_id,client_id' });
      if (error) throw new Error(error.message);
      all[idx] = {
        ...all[idx],
        syncStatus: 'synced',
        syncedAt: new Date().toISOString(),
        lastSyncAttemptAt: new Date().toISOString(),
      };
      result.pushed += 1;
    } catch {
      all[idx] = {
        ...all[idx],
        syncStatus: 'failed',
        syncAttempts: (all[idx].syncAttempts ?? 0) + 1,
        lastSyncAttemptAt: new Date().toISOString(),
      };
      result.failed += 1;
    }
    mutated = true;
  }

  if (mutated) {
    try {
      await storageSet<CatchEntry[]>(STORAGE_KEYS.logbook, all);
    } catch {
      /* non-fatal */
    }
  }
  return result;
}

async function syncCitizenReports(userId: string): Promise<EntitySyncResult> {
  const result: EntitySyncResult = {
    entity: 'citizen_reports',
    pending: 0,
    pushed: 0,
    failed: 0,
  };
  const sb = getSupabase();
  if (!sb) return result;

  let pending: CitizenReport[];
  try {
    pending = getPendingCitizenReports();
  } catch {
    return result;
  }
  result.pending = pending.length;

  for (const report of pending) {
    try {
      const { error } = await sb
        .from('citizen_reports')
        .upsert(reportToRow(report, userId), { onConflict: 'user_id,client_id' });
      if (error) throw new Error(error.message);
      updateCitizenReportStatus(report.id, 'synced', report.syncAttempts ?? 0);
      result.pushed += 1;
    } catch {
      updateCitizenReportStatus(report.id, 'draft', (report.syncAttempts ?? 0) + 1);
      result.failed += 1;
    }
  }
  return result;
}

async function syncEmergencyIncidents(userId: string): Promise<EntitySyncResult> {
  const result: EntitySyncResult = {
    entity: 'emergency_incidents',
    pending: 0,
    pushed: 0,
    failed: 0,
  };
  const sb = getSupabase();
  if (!sb) return result;

  let pending: EmergencyIncident[];
  try {
    pending = queryEmergencyIncidents().filter((i) => i.syncStatus !== 'synced');
  } catch {
    return result;
  }
  result.pending = pending.length;

  for (const incident of pending) {
    try {
      const { error } = await sb
        .from('emergency_incidents')
        .upsert(incidentToRow(incident, userId), { onConflict: 'user_id,client_id' });
      if (error) throw new Error(error.message);
      updateEmergencyIncidentSync(incident.id, 'synced', incident.syncAttempts);
      result.pushed += 1;
    } catch {
      updateEmergencyIncidentSync(incident.id, 'failed', incident.syncAttempts + 1);
      result.failed += 1;
    }
  }
  return result;
}

// ── Public entry point ───────────────────────────────────────────────

/**
 * Push all pending local records to Supabase. Safe to call anytime — returns
 * a structured result and never throws, even fully offline.
 */
export async function syncNow(): Promise<SyncResult> {
  const ranAt = new Date().toISOString();
  const configured = isSupabaseConfigured();

  if (!configured) {
    return {
      ok: false,
      ranAt,
      configured: false,
      signedIn: false,
      reason: 'not-configured',
      entities: [],
      totalPushed: 0,
      totalFailed: 0,
    };
  }

  // Must be signed in for RLS-protected writes.
  let userId: string | null = null;
  try {
    const user = await getCurrentUser();
    userId = user?.id ?? null;
  } catch {
    userId = null;
  }

  if (!userId) {
    return {
      ok: false,
      ranAt,
      configured: true,
      signedIn: false,
      reason: 'not-signed-in',
      entities: [],
      totalPushed: 0,
      totalFailed: 0,
    };
  }

  const entities: EntitySyncResult[] = [];
  try {
    entities.push(await syncTrips(userId));
    entities.push(await syncCatches(userId));
    entities.push(await syncCitizenReports(userId));
    entities.push(await syncEmergencyIncidents(userId));
  } catch (e) {
    return {
      ok: false,
      ranAt,
      configured: true,
      signedIn: true,
      reason: 'completed',
      entities,
      totalPushed: entities.reduce((s, e2) => s + e2.pushed, 0),
      totalFailed: entities.reduce((s, e2) => s + e2.failed, 0),
      error: e instanceof Error ? e.message : 'Unknown sync error',
    };
  }

  const totalPushed = entities.reduce((s, e) => s + e.pushed, 0);
  const totalFailed = entities.reduce((s, e) => s + e.failed, 0);
  const totalPending = entities.reduce((s, e) => s + e.pending, 0);

  return {
    ok: totalFailed === 0,
    ranAt,
    configured: true,
    signedIn: true,
    reason: totalPending === 0 ? 'nothing-pending' : 'completed',
    entities,
    totalPushed,
    totalFailed,
  };
}
