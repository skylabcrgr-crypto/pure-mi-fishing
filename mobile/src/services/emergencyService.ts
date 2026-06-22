/**
 * emergencyService.ts — Phase 5
 *
 * Offline-first Emergency Mode service for Pure MI Fishing.
 *
 * ALL functions work without network, authentication, or backend availability.
 * Emergency incidents are stored in the local SQLite database.
 * Emergency contacts and last known location are stored in AsyncStorage.
 *
 * ⚠️  This app does NOT contact emergency services automatically.
 *     If you are in immediate danger, call 911.
 *     Location data may be inaccurate or unavailable.
 */

import { STORAGE_KEYS, storageGet, storageSet, storageRemove } from '../lib/storage';
import { insertEmergencyIncident, queryEmergencyIncidents } from '../lib/db';
import { getEmergencyResources } from '../data/accessPoints';
import type { EmergencyContact, EmergencyIncident, Coordinates, AccessPoint } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────

export interface LastKnownLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  timestamp: string; // ISO 8601
}

export interface NearestEmergencyPoint {
  accessPoint: AccessPoint;
  distanceMi: number;
}

export interface EmergencyMessageInput {
  currentCoords: Coordinates | null;
  lastKnownLocation: LastKnownLocation | null;
  nearestPoint: NearestEmergencyPoint | null;
  batteryPercent: number | null;
  tripId?: string | null;
}

// ── Emergency Contact ────────────────────────────────────────────────────────

export interface SaveableEmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

/** Persist an emergency contact to AsyncStorage. Overwrites any existing entry. */
export async function saveEmergencyContact(
  contact: SaveableEmergencyContact,
): Promise<void> {
  await storageSet(STORAGE_KEYS.emergencyContact, contact);
}

/** Retrieve the saved emergency contact, or null if none is set. */
export async function getEmergencyContact(): Promise<SaveableEmergencyContact | null> {
  return storageGet<SaveableEmergencyContact>(STORAGE_KEYS.emergencyContact);
}

/** Remove the saved emergency contact. */
export async function clearEmergencyContact(): Promise<void> {
  await storageRemove(STORAGE_KEYS.emergencyContact);
}

// ── Last Known Location ───────────────────────────────────────────────────────

/** Persist the user's last known GPS fix to AsyncStorage. */
export async function saveLastKnownLocation(
  loc: LastKnownLocation,
): Promise<void> {
  await storageSet(STORAGE_KEYS.lastKnownLocation, loc);
}

/** Retrieve the last successfully saved GPS fix. Returns null if never saved. */
export async function getLastKnownLocation(): Promise<LastKnownLocation | null> {
  return storageGet<LastKnownLocation>(STORAGE_KEYS.lastKnownLocation);
}

// ── Nearest Emergency Resource ───────────────────────────────────────────────

/**
 * Find the nearest emergency/resource access point from local data.
 * Works fully offline — no network required.
 */
export function findNearestEmergencyAccessPoint(
  latitude: number,
  longitude: number,
): NearestEmergencyPoint | null {
  const resources = getEmergencyResources();
  if (resources.length === 0) return null;

  let nearest = resources[0];
  let nearestDist = _haversineMi(
    latitude, longitude,
    nearest.coordinates.latitude, nearest.coordinates.longitude,
  );

  for (const ap of resources.slice(1)) {
    const dist = _haversineMi(
      latitude, longitude,
      ap.coordinates.latitude, ap.coordinates.longitude,
    );
    if (dist < nearestDist) {
      nearest = ap;
      nearestDist = dist;
    }
  }

  return {
    accessPoint: nearest,
    distanceMi: Math.round(nearestDist * 10) / 10,
  };
}

// ── Emergency Message ────────────────────────────────────────────────────────

/**
 * Generate a plaintext emergency message suitable for SMS or sharing.
 *
 * Example output:
 * "Emergency: I need help while fishing.
 *  Location: 42.1800, -83.1200
 *  Nearby: Flat Rock State Park Boat Launch (2.3 mi)
 *  Time: Mon Jun 22 2026 14:32:00 (EDT)
 *  Battery: 38% (or unavailable)
 *  Sent from Pure MI Fishing."
 */
export function generateEmergencyMessage(input: EmergencyMessageInput): string {
  const lines: string[] = [];

  lines.push('🚨 EMERGENCY — I need help while fishing.');
  lines.push('');

  // Best available coordinates
  if (input.currentCoords) {
    lines.push(
      `📍 Current location: ${_formatCoord(input.currentCoords.latitude)}, ${_formatCoord(input.currentCoords.longitude)}`,
    );
  } else if (input.lastKnownLocation) {
    const age = _timeSince(input.lastKnownLocation.timestamp);
    lines.push(
      `📍 Last known location (${age} ago): ` +
      `${_formatCoord(input.lastKnownLocation.latitude)}, ${_formatCoord(input.lastKnownLocation.longitude)}`,
    );
  } else {
    lines.push('📍 Location unavailable — GPS permission denied or no fix yet.');
  }

  // Google Maps deep link for rescuers
  const coords = input.currentCoords ?? (input.lastKnownLocation ? {
    latitude: input.lastKnownLocation.latitude,
    longitude: input.lastKnownLocation.longitude,
  } : null);
  if (coords) {
    lines.push(`🗺️  Maps: https://maps.google.com/?q=${coords.latitude},${coords.longitude}`);
  }

  lines.push('');

  // Nearest emergency resource
  if (input.nearestPoint) {
    lines.push(
      `🏥 Nearest help: ${input.nearestPoint.accessPoint.name} (${input.nearestPoint.distanceMi} mi away)`,
    );
    if (input.nearestPoint.accessPoint.emergencyPhone) {
      lines.push(`   Phone: ${input.nearestPoint.accessPoint.emergencyPhone}`);
    }
    if (input.nearestPoint.accessPoint.address) {
      lines.push(`   Address: ${input.nearestPoint.accessPoint.address}`);
    }
  } else {
    lines.push('🏥 Detroit River Corridor, SE Michigan');
  }

  lines.push('');

  // Time
  lines.push(`🕐 Time: ${new Date().toLocaleString('en-US', { timeZoneName: 'short' })}`);

  // Battery
  if (input.batteryPercent !== null) {
    lines.push(`🔋 Battery: ${Math.round(input.batteryPercent)}%`);
  } else {
    lines.push('🔋 Battery: unavailable');
  }

  lines.push('');
  lines.push('Sent from Pure MI Fishing.');
  lines.push('⚠️  This app does not contact emergency services automatically.');
  lines.push('Call 911 for life-threatening emergencies.');

  return lines.join('\n');
}

// ── Emergency Incident Logging ───────────────────────────────────────────────

export interface CreateIncidentInput {
  coordinates: Coordinates | null;
  lastKnownCoordinates: Coordinates | null;
  lastKnownAt: string | null;
  batteryLevel: number | null;
  notes?: string;
  emergencyContact?: EmergencyContact;
  tripId?: string | null;
}

/**
 * Create and persist a new emergency incident to SQLite.
 * Generates a UUID-like id from timestamp + random suffix.
 * Does NOT require network or authentication.
 */
export function createEmergencyIncident(input: CreateIncidentInput): EmergencyIncident {
  const now = new Date().toISOString();
  const id = `emg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Nearest point from best available coords
  const coords = input.coordinates ?? input.lastKnownCoordinates;
  const nearest = coords
    ? findNearestEmergencyAccessPoint(coords.latitude, coords.longitude)
    : null;

  const incident: EmergencyIncident = {
    id,
    createdAt: now,
    coordinates: input.coordinates ?? undefined,
    lastKnownCoordinates: input.lastKnownCoordinates ?? undefined,
    lastKnownAt: input.lastKnownAt ?? undefined,
    batteryLevel: input.batteryLevel ?? undefined,
    notes: input.notes,
    emergencyContact: input.emergencyContact,
    nearestAccessPointId: nearest?.accessPoint.id,
    nearestAccessPointName: nearest?.accessPoint.name,
    nearestAccessPointDistanceMi: nearest?.distanceMi,
    status: 'active',
    syncStatus: 'pending',
    syncAttempts: 0,
  };

  // Persist to SQLite — this is the offline-durable store
  try {
    insertEmergencyIncident(incident);
  } catch {
    // Non-fatal: incident still returned even if DB write fails
  }

  return incident;
}

/** Return all logged incidents, newest first. */
export function getEmergencyIncidents(): EmergencyIncident[] {
  try {
    return queryEmergencyIncidents();
  } catch {
    return [];
  }
}

/** Return the most recently created incident, or null. */
export function getLatestEmergencyIncident(): EmergencyIncident | null {
  const all = getEmergencyIncidents();
  return all[0] ?? null;
}

// ── Private helpers ──────────────────────────────────────────────────────────

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

function _formatCoord(n: number): string {
  return n.toFixed(5);
}

function _timeSince(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}
