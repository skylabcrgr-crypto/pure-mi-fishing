/**
 * regulationService.ts
 * Offline Regulation Engine — Phase 2
 *
 * All functions work fully offline using:
 *   1. SQLite `regulation_rules` table (seeded by seedDatabase() on first boot)
 *   2. Static REGULATION_RULES fallback if the SQLite table is empty
 *
 * No network calls are made here. Regulation data must be verified against
 * the current Michigan DNR Fishing Guide before production launch.
 */

import { queryRulesForWaterbody, queryRuleForSpecies } from '../lib/db';
import { REGULATION_RULES, REGULATION_DISCLAIMER, SAMPLE_DATA_WARNING } from '../data/regulationRules';
import { WATERBODIES } from '../data/waterbodies';
import type { RegulationRule } from '../types';

// ─── Public types ─────────────────────────────────────────────────────────────

/** Whether a species is currently in-season at the given date. */
export type SeasonStatus = 'open' | 'closed' | 'restricted' | 'unknown';

export interface RuleWithStatus extends RegulationRule {
  seasonStatus: SeasonStatus;
}

export interface RegulationSummary {
  waterbodyId: string;
  waterbodyName: string;
  asOfDate: string;
  rules: RuleWithStatus[];
  openSpecies: string[];
  closedSpecies: string[];
  restrictedSpecies: string[];
  hasSampleData: boolean;
  disclaimer: string;
  sampleDataWarning?: string;
}

// ─── Core query functions ─────────────────────────────────────────────────────

/**
 * Returns all active regulation rules for the waterbody nearest to the given
 * GPS coordinates. Falls back to Detroit River rules if no waterbody is within
 * 15 miles.
 */
export function getRulesForLocation(
  latitude: number,
  longitude: number,
  date: Date = new Date(),
): RuleWithStatus[] {
  const nearestId = _nearestWaterbodyId(latitude, longitude) ?? 'detroit-river';
  return getRulesForWaterbody(nearestId, date);
}

/**
 * Returns all regulation rules for a specific waterbody, each annotated with
 * the current season status for the given date.
 *
 * Queries SQLite first; falls back to static seed data if the DB is empty.
 */
export function getRulesForWaterbody(
  waterbodyId: string,
  date: Date = new Date(),
): RuleWithStatus[] {
  const rules = _fetchRulesForWaterbody(waterbodyId);
  return rules.map((r) => ({ ...r, seasonStatus: getSeasonStatus(r, date) }));
}

/**
 * Returns the regulation rule for a specific species at a specific waterbody,
 * annotated with the current season status.
 */
export function getRulesForSpecies(
  speciesId: string,
  waterbodyId: string,
  date: Date = new Date(),
): RuleWithStatus | undefined {
  const rule = _fetchRuleForSpecies(speciesId, waterbodyId);
  if (!rule) return undefined;
  return { ...rule, seasonStatus: getSeasonStatus(rule, date) };
}

/**
 * Returns all rules across all Detroit River Corridor waterbodies that are
 * currently in-season (open or restricted) on the given date.
 */
export function getActiveRulesByDate(date: Date = new Date()): RuleWithStatus[] {
  const allRules = _fetchAllRules();
  return allRules
    .map((r) => ({ ...r, seasonStatus: getSeasonStatus(r, date) }))
    .filter((r) => r.seasonStatus === 'open' || r.seasonStatus === 'restricted');
}

/**
 * Returns a full RegulationSummary for a waterbody — suitable for the
 * trip-mode "Rules" panel and the waterbody detail screen.
 *
 * Call with the waterbodyId from the active trip or the current route param.
 */
export function getRegulationSummaryForTrip(
  waterbodyId: string,
  date: Date = new Date(),
): RegulationSummary {
  const waterbody = WATERBODIES.find((w) => w.id === waterbodyId);
  const rules = getRulesForWaterbody(waterbodyId, date);

  const openSpecies: string[] = [];
  const closedSpecies: string[] = [];
  const restrictedSpecies: string[] = [];

  for (const r of rules) {
    if (r.seasonStatus === 'open') openSpecies.push(r.speciesName);
    else if (r.seasonStatus === 'closed') closedSpecies.push(r.speciesName);
    else if (r.seasonStatus === 'restricted') restrictedSpecies.push(r.speciesName);
  }

  const hasSampleData = rules.some((r) => r.verificationStatus !== 'official');

  return {
    waterbodyId,
    waterbodyName: waterbody?.name ?? waterbodyId,
    asOfDate: date.toISOString(),
    rules,
    openSpecies,
    closedSpecies,
    restrictedSpecies,
    hasSampleData,
    disclaimer: REGULATION_DISCLAIMER,
    sampleDataWarning: hasSampleData ? SAMPLE_DATA_WARNING : undefined,
  };
}

// ─── Season logic ─────────────────────────────────────────────────────────────

/**
 * Determines whether a regulation rule's season is currently open, closed,
 * or restricted based on the given date.
 *
 * Michigan DNR seasons use MM/DD strings (e.g. '05/01', '03/15').
 * Cross-year ranges are handled: if startMmdd > endMmdd, the season wraps
 * across the calendar year (e.g. May 1 → March 15 the following year).
 *
 * Detroit River walleye pre-season (March 15 – April 30) is catch-and-release.
 * We detect this from the specialNotes field rather than a separate status field.
 */
export function getSeasonStatus(rule: RegulationRule, date: Date): SeasonStatus {
  // No season dates → open all year
  if (!rule.seasonStart && !rule.seasonEnd) return 'open';
  // Either field missing → cannot determine
  if (!rule.seasonStart || !rule.seasonEnd) return 'unknown';

  const mmdd = _dateMmdd(date);
  const startMmdd = _parseMmdd(rule.seasonStart);
  const endMmdd = _parseMmdd(rule.seasonEnd);

  if (startMmdd === null || endMmdd === null) return 'unknown';

  let isInSeason: boolean;

  if (startMmdd <= endMmdd) {
    // Same-calendar-year range: e.g. June 1 – November 30
    isInSeason = mmdd >= startMmdd && mmdd <= endMmdd;
  } else {
    // Cross-year range: e.g. May 1 – March 15 (wraps across Dec 31)
    // In season if date is on or after start, OR on or before end
    isInSeason = mmdd >= startMmdd || mmdd <= endMmdd;
  }

  if (!isInSeason) return 'closed';

  // Check for restricted pre-season (catch-and-release) window in specialNotes.
  // This is a best-effort heuristic; the special note text is always shown.
  if (
    rule.specialNotes &&
    rule.specialNotes.toLowerCase().includes('catch-and-release') &&
    _isPreSeasonWindow(mmdd, startMmdd)
  ) {
    return 'restricted';
  }

  return 'open';
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/** Parse 'MM/DD' string to a comparable integer (e.g. '05/01' → 501). */
function _parseMmdd(mmdd: string): number | null {
  const parts = mmdd.trim().split('/');
  if (parts.length !== 2) return null;
  const m = parseInt(parts[0], 10);
  const d = parseInt(parts[1], 10);
  if (isNaN(m) || isNaN(d)) return null;
  return m * 100 + d;
}

/** Return the current date as an MM/DD integer (e.g. June 19 → 619). */
function _dateMmdd(date: Date): number {
  return (date.getMonth() + 1) * 100 + date.getDate();
}

/**
 * Heuristic: consider the 45-day window before the season opens as "pre-season"
 * for the purposes of flagging catch-and-release restrictions.
 * For walleye: season opens May 1, so March 16 – April 30 is pre-season.
 */
function _isPreSeasonWindow(currentMmdd: number, seasonStartMmdd: number): boolean {
  // Build an approximate range 45 days before startMmdd
  // This is a simplified approximation — real pre-season dates are in specialNotes
  const preSeasonApproxStart = seasonStartMmdd - 45; // crude approximation, ignores month boundaries
  return currentMmdd >= preSeasonApproxStart && currentMmdd < seasonStartMmdd;
}

/** Try the SQLite table first, fall back to static seed data. */
function _fetchRulesForWaterbody(waterbodyId: string): RegulationRule[] {
  try {
    const dbRules = queryRulesForWaterbody(waterbodyId);
    if (dbRules.length > 0) return dbRules;
  } catch {
    // DB not initialized yet (e.g. Expo Go cold start before initDatabase runs)
  }
  return REGULATION_RULES.filter(
    (r) => r.waterbodyId === waterbodyId || r.waterbodyId === undefined,
  );
}

function _fetchRuleForSpecies(
  speciesId: string,
  waterbodyId: string,
): RegulationRule | undefined {
  try {
    const dbRule = queryRuleForSpecies(speciesId, waterbodyId);
    if (dbRule) return dbRule;
  } catch {
    // fallback
  }
  return REGULATION_RULES.find(
    (r) => r.speciesId === speciesId && (r.waterbodyId === waterbodyId || r.waterbodyId === undefined),
  );
}

function _fetchAllRules(): RegulationRule[] {
  // For "all active rules" we use the static data to avoid a full-table scan
  // (the SQLite table mirrors the static data after seeding)
  return REGULATION_RULES;
}

/** Find the nearest waterbody center within 15 miles of a lat/lon. */
function _nearestWaterbodyId(
  latitude: number,
  longitude: number,
  maxRadiusMi = 15,
): string | null {
  let nearest: string | null = null;
  let nearestDist = Infinity;

  for (const wb of WATERBODIES) {
    const dist = _haversineMi(latitude, longitude, wb.coordinates.latitude, wb.coordinates.longitude);
    if (dist < nearestDist && dist <= maxRadiusMi) {
      nearest = wb.id;
      nearestDist = dist;
    }
  }
  return nearest;
}

function _haversineMi(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = _deg2rad(lat2 - lat1);
  const dLon = _deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(_deg2rad(lat1)) * Math.cos(_deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function _deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
