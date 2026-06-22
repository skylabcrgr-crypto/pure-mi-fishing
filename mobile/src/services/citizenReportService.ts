/**
 * citizenReportService.ts — Phase 6
 *
 * Offline-first Citizen Science / Report a Problem service for Pure MI Fishing.
 *
 * ALL functions work without network, authentication, or backend availability.
 * Reports are stored in the local SQLite `citizen_reports` table.
 * They remain in `status: 'draft'` / `syncStatus: 'pending'` until
 * Phase 7 backend sync is implemented.
 *
 * ⚠️  Pure MI Fishing is not an official government reporting channel.
 *     For immediate danger, call 911.
 *     For urgent poaching / enforcement issues, contact authorities directly.
 *     Reports may sync later when backend sync is enabled in Phase 7.
 */

import {
  insertCitizenReport,
  queryCitizenReports,
  queryCitizenReportById,
  queryCitizenReportsByType,
  queryCitizenReportsByWaterbody,
  deleteCitizenReportById,
  patchCitizenReport,
} from '../lib/db';
import { WATERBODIES } from '../data/waterbodies';
import type { CitizenReport, CitizenReportType, Coordinates } from '../types';

// ── Report type metadata ──────────────────────────────────────────────────────

export interface ReportTypeMeta {
  type: CitizenReportType;
  label: string;
  emoji: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
}

export const REPORT_TYPE_META: ReportTypeMeta[] = [
  {
    type: 'invasive_species',
    label: 'Invasive Species',
    emoji: '🦀',
    description: 'Spotted an invasive plant, fish, or aquatic organism.',
    urgency: 'high',
  },
  {
    type: 'dead_fish',
    label: 'Dead Fish',
    emoji: '🐟',
    description: 'Found dead or dying fish (possible kill event).',
    urgency: 'high',
  },
  {
    type: 'pollution',
    label: 'Pollution',
    emoji: '🏭',
    description: 'Observed water or shoreline pollution.',
    urgency: 'high',
  },
  {
    type: 'illegal_dumping',
    label: 'Illegal Dumping',
    emoji: '🗑️',
    description: 'Waste, trash, or materials dumped illegally.',
    urgency: 'medium',
  },
  {
    type: 'broken_launch',
    label: 'Broken Launch',
    emoji: '🚣',
    description: 'Boat launch ramp is damaged, blocked, or unusable.',
    urgency: 'medium',
  },
  {
    type: 'flooding',
    label: 'Flooding',
    emoji: '🌊',
    description: 'High water levels affecting access or safety.',
    urgency: 'medium',
  },
  {
    type: 'erosion',
    label: 'Erosion',
    emoji: '⛰️',
    description: 'Significant shoreline or bank erosion observed.',
    urgency: 'low',
  },
  {
    type: 'damaged_dock',
    label: 'Damaged Dock',
    emoji: '⚓',
    description: 'Dock or pier is damaged or unsafe.',
    urgency: 'medium',
  },
  {
    type: 'algae_bloom',
    label: 'Algae Bloom',
    emoji: '🟢',
    description: 'Visible algae bloom, particularly blue-green (cyanobacteria).',
    urgency: 'high',
  },
  {
    type: 'oil_spill',
    label: 'Oil / Chemical Spill',
    emoji: '🛢️',
    description: 'Oil sheen, chemical spill, or fuel on the water.',
    urgency: 'high',
  },
  {
    type: 'poaching_concern',
    label: 'Poaching Concern',
    emoji: '🚨',
    description: 'Observed possible illegal fishing, netting, or wildlife taking.',
    urgency: 'high',
  },
  {
    type: 'navigation_hazard',
    label: 'Navigation Hazard',
    emoji: '⚠️',
    description: 'Submerged obstacle, debris, or hazard in the waterway.',
    urgency: 'medium',
  },
  {
    type: 'other',
    label: 'Other',
    emoji: '📋',
    description: 'Something else that should be noted.',
    urgency: 'low',
  },
];

/** Get metadata for a specific report type. */
export function getReportTypeMeta(type: CitizenReportType): ReportTypeMeta {
  return (
    REPORT_TYPE_META.find((m) => m.type === type) ?? {
      type: 'other',
      label: 'Other',
      emoji: '📋',
      description: '',
      urgency: 'low',
    }
  );
}

/** Format a CitizenReportType to a human-readable label. */
export function formatReportTypeLabel(type: CitizenReportType): string {
  return getReportTypeMeta(type).label;
}

// ── Create ────────────────────────────────────────────────────────────────────

export interface CreateReportInput {
  reportType: CitizenReportType;
  coordinates: Coordinates | null;
  waterbodyId?: string | null;
  waterbodyName?: string | null;
  notes?: string;
  isAnonymous?: boolean;
}

/**
 * Create and persist a new citizen report to SQLite.
 * Status is always 'draft' on creation — syncing belongs to Phase 7.
 */
export function createCitizenReport(input: CreateReportInput): CitizenReport {
  const id = `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const now = new Date().toISOString();

  // Attempt waterbody resolution if not supplied
  let waterbodyId = input.waterbodyId ?? undefined;
  let waterbodyName = input.waterbodyName ?? undefined;
  if (!waterbodyId && input.coordinates) {
    const resolved = resolveNearestWaterbody(
      input.coordinates.latitude,
      input.coordinates.longitude,
    );
    if (resolved) {
      waterbodyId = resolved.id;
      waterbodyName = resolved.name;
    }
  }

  const report: CitizenReport = {
    id,
    reportType: input.reportType,
    coordinates: input.coordinates ?? undefined,
    waterbodyId,
    waterbodyName,
    notes: input.notes?.trim() || undefined,
    timestamp: now,
    isAnonymous: input.isAnonymous ?? true,
    status: 'draft',
    syncAttempts: 0,
  };

  try {
    insertCitizenReport(report);
  } catch {
    // Non-fatal: report is still returned even if DB write fails
  }

  return report;
}

// ── Read ──────────────────────────────────────────────────────────────────────

/** Return all citizen reports, newest first. */
export function getCitizenReports(): CitizenReport[] {
  try {
    return queryCitizenReports();
  } catch {
    return [];
  }
}

/** Return a single citizen report by id. */
export function getCitizenReportById(id: string): CitizenReport | null {
  try {
    return queryCitizenReportById(id) ?? null;
  } catch {
    return null;
  }
}

/** Return only reports with status 'draft' (i.e., not yet synced). */
export function getPendingCitizenReports(): CitizenReport[] {
  try {
    return queryCitizenReports().filter((r) => r.status === 'draft');
  } catch {
    return [];
  }
}

/** Return reports of a specific type. */
export function getCitizenReportsByType(type: CitizenReportType): CitizenReport[] {
  try {
    return queryCitizenReportsByType(type);
  } catch {
    return [];
  }
}

/** Return reports for a specific waterbody. */
export function getCitizenReportsByWaterbody(waterbodyId: string): CitizenReport[] {
  try {
    return queryCitizenReportsByWaterbody(waterbodyId);
  } catch {
    return [];
  }
}

// ── Update ────────────────────────────────────────────────────────────────────

/** Apply a partial update to a citizen report. */
export function updateCitizenReport(
  id: string,
  patch: { status?: CitizenReport['status']; notes?: string; syncAttempts?: number },
): void {
  try {
    patchCitizenReport(id, patch);
  } catch {
    // Non-fatal
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────

/** Delete a citizen report by id. Only drafts should be deletable in the UI. */
export function deleteCitizenReport(id: string): void {
  try {
    deleteCitizenReportById(id);
  } catch {
    // Non-fatal
  }
}

// ── Waterbody resolution ──────────────────────────────────────────────────────

/**
 * Find the closest waterbody to a coordinate using simple Haversine distance.
 * Works fully offline — uses static waterbody data.
 * Returns null if WATERBODIES is empty.
 */
export function resolveNearestWaterbody(
  latitude: number,
  longitude: number,
): { id: string; name: string; distanceMi: number } | null {
  if (WATERBODIES.length === 0) return null;

  let nearest = WATERBODIES[0];
  let nearestDist = _haversineMi(
    latitude, longitude,
    nearest.coordinates.latitude, nearest.coordinates.longitude,
  );

  for (const wb of WATERBODIES.slice(1)) {
    const dist = _haversineMi(latitude, longitude, wb.coordinates.latitude, wb.coordinates.longitude);
    if (dist < nearestDist) {
      nearest = wb;
      nearestDist = dist;
    }
  }

  // Only resolve if within 20 miles — don't attribute reports to faraway waterbodies
  if (nearestDist > 20) return null;

  return {
    id: nearest.id,
    name: nearest.name,
    distanceMi: Math.round(nearestDist * 10) / 10,
  };
}

// ── Private helpers ───────────────────────────────────────────────────────────

function _haversineMi(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = _deg2rad(lat2 - lat1);
  const dLon = _deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(_deg2rad(lat1)) * Math.cos(_deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function _deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
