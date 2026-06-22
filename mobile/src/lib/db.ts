/**
 * db.ts
 * Expo SQLite schema, migration, seeding, and query helpers for Pure MI Fishing.
 *
 * WHY SQLite?
 * AsyncStorage is used for lightweight preferences and Zustand persistence.
 * SQLite is the right layer for structured offline data that needs
 * querying — catch log history, downloaded waterbody snapshots, etc.
 *
 * SCHEMA VERSIONING
 * We use PRAGMA user_version to track migrations.
 *   0 → initial (pre-Phase 1, no user_version set)
 *   1 → Phase 1 (regulation_rules, weather/water snapshots, citizen_reports,
 *                 emergency_incidents; saved_spots + catch_log columns added)
 */

import * as SQLite from 'expo-sqlite';
import type { CatchEntry, RegulationRule, WeatherSnapshot, WaterConditionSnapshot, CitizenReport, EmergencyIncident } from '../types';

const DB_VERSION = 1;

// ── Database instance ────────────────────────────────────────────────

let _db: SQLite.SQLiteDatabase | null = null;

/** Open (or re-use) the singleton database connection. */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!_db) {
    _db = SQLite.openDatabaseSync('puremi.db');
  }
  return _db;
}

// ── Schema ───────────────────────────────────────────────────────────

/**
 * Create all tables and apply any pending migrations.
 * Must be called once on app startup (in app/_layout.tsx).
 * Uses PRAGMA user_version to track schema version.
 */
export function initDatabase(): void {
  const db = getDatabase();
  const { user_version: currentVersion } = db.getFirstSync<{ user_version: number }>(
    'PRAGMA user_version;',
  ) ?? { user_version: 0 };

  // ── Create base tables (safe on fresh install) ─────────────────────

  // Catch log — mirrors the CatchEntry interface
  db.execSync(`
    CREATE TABLE IF NOT EXISTS catch_log (
      id             TEXT PRIMARY KEY NOT NULL,
      trip_id        TEXT,
      species_id     TEXT NOT NULL,
      species_name   TEXT NOT NULL,
      length_in      REAL,
      weight_lb      REAL,
      method         TEXT,
      bait           TEXT,
      notes          TEXT,
      waterbody_id   TEXT NOT NULL,
      waterbody_name TEXT NOT NULL,
      is_public      INTEGER NOT NULL DEFAULT 0,
      timestamp      TEXT NOT NULL,
      sync_status    TEXT NOT NULL DEFAULT 'pending'
    );
  `);

  // Offline pack cache metadata
  db.execSync(`
    CREATE TABLE IF NOT EXISTS offline_pack_meta (
      id                      TEXT PRIMARY KEY NOT NULL,
      region_id               TEXT NOT NULL DEFAULT '',
      name                    TEXT NOT NULL,
      version                 TEXT NOT NULL DEFAULT '1',
      map_data_version        TEXT,
      regulation_data_version TEXT,
      size_mb                 REAL NOT NULL,
      downloaded              INTEGER NOT NULL DEFAULT 0,
      downloaded_at           TEXT,
      last_updated            TEXT,
      access_point_count      INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Saved spots
  db.execSync(`
    CREATE TABLE IF NOT EXISTS saved_spots (
      id         TEXT PRIMARY KEY NOT NULL,
      type       TEXT NOT NULL,
      name       TEXT NOT NULL,
      saved_at   TEXT NOT NULL,
      latitude   REAL,
      longitude  REAL,
      notes      TEXT
    );
  `);

  // Structured offline regulation rules
  db.execSync(`
    CREATE TABLE IF NOT EXISTS regulation_rules (
      id                  TEXT PRIMARY KEY NOT NULL,
      region_id           TEXT NOT NULL,
      waterbody_id        TEXT,
      species_id          TEXT NOT NULL,
      species_name        TEXT NOT NULL,
      rule_type           TEXT NOT NULL,
      summary             TEXT NOT NULL,
      min_length_in       REAL,
      max_length_in       REAL,
      daily_bag_limit     INTEGER,
      possession_limit    INTEGER,
      season_start        TEXT,
      season_end          TEXT,
      gear_restrictions   TEXT,
      special_notes       TEXT,
      source_url          TEXT NOT NULL,
      last_verified_at    TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'sample_unverified',
      verification_notes  TEXT,
      effective_year      INTEGER NOT NULL,
      expires_year        INTEGER
    );
  `);

  // Cached weather snapshots
  db.execSync(`
    CREATE TABLE IF NOT EXISTS weather_snapshots (
      id               TEXT PRIMARY KEY NOT NULL,
      waterbody_id     TEXT NOT NULL,
      captured_at      TEXT NOT NULL,
      source           TEXT NOT NULL DEFAULT 'mock',
      temp_f           REAL NOT NULL,
      feels_like_f     REAL,
      description      TEXT NOT NULL,
      wind_speed_mph   REAL NOT NULL,
      wind_direction   TEXT NOT NULL,
      humidity_pct     INTEGER,
      icon_code        TEXT,
      forecast_summary TEXT
    );
  `);

  // Cached water condition snapshots
  db.execSync(`
    CREATE TABLE IF NOT EXISTS water_condition_snapshots (
      id           TEXT PRIMARY KEY NOT NULL,
      waterbody_id TEXT NOT NULL,
      captured_at  TEXT NOT NULL,
      source       TEXT NOT NULL DEFAULT 'mock',
      gauge_id     TEXT,
      temp_f       REAL,
      level_ft     REAL,
      clarity_ft   REAL,
      flow_cfs     REAL,
      trend        TEXT,
      ice_status   TEXT NOT NULL DEFAULT 'open'
    );
  `);

  // Citizen science / problem reports
  db.execSync(`
    CREATE TABLE IF NOT EXISTS citizen_reports (
      id                TEXT PRIMARY KEY NOT NULL,
      report_type       TEXT NOT NULL,
      latitude          REAL,
      longitude         REAL,
      waterbody_id      TEXT,
      waterbody_name    TEXT,
      photo_uri         TEXT,
      notes             TEXT,
      timestamp         TEXT NOT NULL,
      is_anonymous      INTEGER NOT NULL DEFAULT 1,
      status            TEXT NOT NULL DEFAULT 'draft',
      sync_attempts     INTEGER NOT NULL DEFAULT 0,
      last_sync_attempt TEXT
    );
  `);

  // Emergency incident records
  db.execSync(`
    CREATE TABLE IF NOT EXISTS emergency_incidents (
      id                          TEXT PRIMARY KEY NOT NULL,
      created_at                  TEXT NOT NULL,
      latitude                    REAL,
      longitude                   REAL,
      last_known_latitude         REAL,
      last_known_longitude        REAL,
      last_known_at               TEXT,
      battery_level               REAL,
      notes                       TEXT,
      emergency_contact_name      TEXT,
      emergency_contact_phone     TEXT,
      nearest_access_point_id     TEXT,
      nearest_access_point_name   TEXT,
      nearest_access_distance_mi  REAL,
      status                      TEXT NOT NULL DEFAULT 'active',
      sync_status                 TEXT NOT NULL DEFAULT 'pending',
      sync_attempts               INTEGER NOT NULL DEFAULT 0
    );
  `);

  // ── Migrations for existing installs ──────────────────────────────

  if (currentVersion < 1) {
    _migrateV0toV1(db);
  }

  // Stamp the version
  db.execSync(`PRAGMA user_version = ${DB_VERSION};`);
}

/**
 * Migration v0 → v1: add columns that were not present in the pre-Phase 1 schema.
 * Each ALTER TABLE is wrapped in try/catch — SQLite throws if a column already exists,
 * which is fine for idempotent migrations.
 */
function _migrateV0toV1(db: SQLite.SQLiteDatabase): void {
  const addColumn = (sql: string) => {
    try { db.execSync(sql); } catch { /* column already exists — safe to ignore */ }
  };

  // catch_log: add trip_id and sync_status (columns absent in v0 schema)
  addColumn('ALTER TABLE catch_log ADD COLUMN trip_id TEXT;');
  addColumn('ALTER TABLE catch_log ADD COLUMN sync_status TEXT NOT NULL DEFAULT \'pending\';');

  // saved_spots: add latitude, longitude, notes
  addColumn('ALTER TABLE saved_spots ADD COLUMN latitude REAL;');
  addColumn('ALTER TABLE saved_spots ADD COLUMN longitude REAL;');
  addColumn('ALTER TABLE saved_spots ADD COLUMN notes TEXT;');

  // offline_pack_meta: add new columns for region packs
  addColumn('ALTER TABLE offline_pack_meta ADD COLUMN region_id TEXT NOT NULL DEFAULT \'\';');
  addColumn('ALTER TABLE offline_pack_meta ADD COLUMN map_data_version TEXT;');
  addColumn('ALTER TABLE offline_pack_meta ADD COLUMN regulation_data_version TEXT;');
  addColumn('ALTER TABLE offline_pack_meta ADD COLUMN downloaded_at TEXT;');
  addColumn('ALTER TABLE offline_pack_meta ADD COLUMN access_point_count INTEGER NOT NULL DEFAULT 0;');
}

// ── Catch log queries ────────────────────────────────────────────────

/**
 * Insert a new catch entry.
 * TODO: Replace AsyncStorage writes in useLogbookStore with this
 * function in Sprint 2.
 */
export function insertCatch(entry: CatchEntry): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO catch_log
       (id, trip_id, species_id, species_name, length_in, weight_lb,
        method, bait, notes, waterbody_id, waterbody_name, is_public, timestamp, sync_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    entry.id,
    entry.tripId ?? null,
    entry.speciesId,
    entry.speciesName,
    entry.lengthIn ?? null,
    entry.weightLb ?? null,
    entry.method ?? null,
    entry.bait ?? null,
    entry.notes ?? null,
    entry.waterbodyId,
    entry.waterbodyName,
    entry.isPublic ? 1 : 0,
    entry.timestamp,
    'pending',
  );
}

/** Return all catch entries, newest first. */
export function queryCatches(): CatchEntry[] {
  const db = getDatabase();
  const rows = db.getAllSync<{
    id: string;
    trip_id: string | null;
    species_id: string;
    species_name: string;
    length_in: number | null;
    weight_lb: number | null;
    method: string | null;
    bait: string | null;
    notes: string | null;
    waterbody_id: string;
    waterbody_name: string;
    is_public: number;
    timestamp: string;
  }>('SELECT * FROM catch_log ORDER BY timestamp DESC;');

  return rows.map((r) => ({
    id: r.id,
    tripId: r.trip_id ?? undefined,
    speciesId: r.species_id,
    speciesName: r.species_name,
    lengthIn: r.length_in ?? undefined,
    weightLb: r.weight_lb ?? undefined,
    method: r.method ?? undefined,
    bait: r.bait ?? undefined,
    notes: r.notes ?? undefined,
    waterbodyId: r.waterbody_id,
    waterbodyName: r.waterbody_name,
    isPublic: r.is_public === 1,
    timestamp: r.timestamp,
  }));
}

/** Delete a single catch by ID. */
export function deleteCatchById(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM catch_log WHERE id = ?;', id);
}

/** Return the total number of catches stored in SQLite. */
export function catchCount(): number {
  const db = getDatabase();
  const row = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM catch_log;',
  );
  return row?.count ?? 0;
}

// ── Regulation rules queries ─────────────────────────────────────────

/** Upsert a regulation rule (insert or replace). */
export function upsertRegulationRule(rule: RegulationRule): void {
  const db = getDatabase();
  db.runSync(
    `INSERT OR REPLACE INTO regulation_rules
       (id, region_id, waterbody_id, species_id, species_name, rule_type, summary,
        min_length_in, max_length_in, daily_bag_limit, possession_limit,
        season_start, season_end, gear_restrictions, special_notes,
        source_url, last_verified_at, verification_status, verification_notes,
        effective_year, expires_year)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    rule.id,
    rule.regionId,
    rule.waterbodyId ?? null,
    rule.speciesId,
    rule.speciesName,
    rule.ruleType,
    rule.summary,
    rule.minLengthIn ?? null,
    rule.maxLengthIn ?? null,
    rule.dailyBagLimit ?? null,
    rule.possessionLimit ?? null,
    rule.seasonStart ?? null,
    rule.seasonEnd ?? null,
    rule.gearRestrictions ?? null,
    rule.specialNotes ?? null,
    rule.sourceUrl,
    rule.lastVerifiedAt,
    rule.verificationStatus,
    rule.verificationNotes ?? null,
    rule.effectiveYear,
    rule.expiresYear ?? null,
  );
}

/** Query regulation rules for a waterbody. */
export function queryRulesForWaterbody(waterbodyId: string): RegulationRule[] {
  const db = getDatabase();
  const rows = db.getAllSync<Record<string, unknown>>(
    `SELECT * FROM regulation_rules WHERE waterbody_id = ? OR waterbody_id IS NULL ORDER BY species_name ASC;`,
    waterbodyId,
  );
  return rows.map(mapRowToRegulationRule);
}

/** Query regulation rules for a specific species + waterbody. */
export function queryRuleForSpecies(
  speciesId: string,
  waterbodyId: string,
): RegulationRule | undefined {
  const db = getDatabase();
  const row = db.getFirstSync<Record<string, unknown>>(
    `SELECT * FROM regulation_rules WHERE species_id = ? AND (waterbody_id = ? OR waterbody_id IS NULL) LIMIT 1;`,
    speciesId,
    waterbodyId,
  );
  return row ? mapRowToRegulationRule(row) : undefined;
}

function mapRowToRegulationRule(r: Record<string, unknown>): RegulationRule {
  return {
    id: r['id'] as string,
    regionId: r['region_id'] as string,
    waterbodyId: (r['waterbody_id'] as string | null) ?? undefined,
    speciesId: r['species_id'] as string,
    speciesName: r['species_name'] as string,
    ruleType: r['rule_type'] as RegulationRule['ruleType'],
    summary: r['summary'] as string,
    minLengthIn: (r['min_length_in'] as number | null) ?? undefined,
    maxLengthIn: (r['max_length_in'] as number | null) ?? undefined,
    dailyBagLimit: (r['daily_bag_limit'] as number | null) ?? undefined,
    possessionLimit: (r['possession_limit'] as number | null) ?? undefined,
    seasonStart: (r['season_start'] as string | null) ?? undefined,
    seasonEnd: (r['season_end'] as string | null) ?? undefined,
    gearRestrictions: (r['gear_restrictions'] as string | null) ?? undefined,
    specialNotes: (r['special_notes'] as string | null) ?? undefined,
    sourceUrl: r['source_url'] as string,
    lastVerifiedAt: r['last_verified_at'] as string,
    verificationStatus: r['verification_status'] as RegulationRule['verificationStatus'],
    verificationNotes: (r['verification_notes'] as string | null) ?? undefined,
    effectiveYear: r['effective_year'] as number,
    expiresYear: (r['expires_year'] as number | null) ?? undefined,
  };
}

// ── Citizen report queries ───────────────────────────────────────────

/** Insert a new citizen report. */
export function insertCitizenReport(report: CitizenReport): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO citizen_reports
       (id, report_type, latitude, longitude, waterbody_id, waterbody_name,
        photo_uri, notes, timestamp, is_anonymous, status, sync_attempts, last_sync_attempt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    report.id,
    report.reportType,
    report.coordinates?.latitude ?? null,
    report.coordinates?.longitude ?? null,
    report.waterbodyId ?? null,
    report.waterbodyName ?? null,
    report.photoUri ?? null,
    report.notes ?? null,
    report.timestamp,
    report.isAnonymous ? 1 : 0,
    report.status,
    report.syncAttempts,
    report.lastSyncAttemptAt ?? null,
  );
}

/** Return all citizen reports, newest first. */
export function queryCitizenReports(): CitizenReport[] {
  const db = getDatabase();
  const rows = db.getAllSync<Record<string, unknown>>(
    'SELECT * FROM citizen_reports ORDER BY timestamp DESC;',
  );
  return rows.map(mapRowToCitizenReport);
}

/** Return a single citizen report by id, or undefined. */
export function queryCitizenReportById(id: string): CitizenReport | undefined {
  const db = getDatabase();
  const row = db.getFirstSync<Record<string, unknown>>(
    'SELECT * FROM citizen_reports WHERE id = ?;',
    id,
  );
  if (!row) return undefined;
  return mapRowToCitizenReport(row);
}

/** Return citizen reports matching a specific type. */
export function queryCitizenReportsByType(
  reportType: CitizenReport['reportType'],
): CitizenReport[] {
  const db = getDatabase();
  const rows = db.getAllSync<Record<string, unknown>>(
    'SELECT * FROM citizen_reports WHERE report_type = ? ORDER BY timestamp DESC;',
    reportType,
  );
  return rows.map(mapRowToCitizenReport);
}

/** Return citizen reports for a specific waterbody. */
export function queryCitizenReportsByWaterbody(waterbodyId: string): CitizenReport[] {
  const db = getDatabase();
  const rows = db.getAllSync<Record<string, unknown>>(
    'SELECT * FROM citizen_reports WHERE waterbody_id = ? ORDER BY timestamp DESC;',
    waterbodyId,
  );
  return rows.map(mapRowToCitizenReport);
}

/** Delete a citizen report by id. */
export function deleteCitizenReportById(id: string): void {
  const db = getDatabase();
  db.runSync('DELETE FROM citizen_reports WHERE id = ?;', id);
}

/** Patch status + notes on an existing citizen report. */
export function patchCitizenReport(
  id: string,
  patch: { status?: CitizenReport['status']; notes?: string; syncAttempts?: number },
): void {
  const db = getDatabase();
  if (patch.status !== undefined) {
    db.runSync(
      'UPDATE citizen_reports SET status = ?, sync_attempts = ?, last_sync_attempt = ? WHERE id = ?;',
      patch.status,
      patch.syncAttempts ?? 0,
      new Date().toISOString(),
      id,
    );
  }
  if (patch.notes !== undefined) {
    db.runSync('UPDATE citizen_reports SET notes = ? WHERE id = ?;', patch.notes, id);
  }
}

/** Update a citizen report's sync status. */
export function updateCitizenReportStatus(
  id: string,
  status: CitizenReport['status'],
  syncAttempts: number,
): void {
  const db = getDatabase();
  db.runSync(
    `UPDATE citizen_reports SET status = ?, sync_attempts = ?, last_sync_attempt = ? WHERE id = ?;`,
    status,
    syncAttempts,
    new Date().toISOString(),
    id,
  );
}

function mapRowToCitizenReport(r: Record<string, unknown>): CitizenReport {
  return {
    id: r['id'] as string,
    reportType: r['report_type'] as CitizenReport['reportType'],
    coordinates:
      r['latitude'] != null && r['longitude'] != null
        ? { latitude: r['latitude'] as number, longitude: r['longitude'] as number }
        : undefined,
    waterbodyId: (r['waterbody_id'] as string | null) ?? undefined,
    waterbodyName: (r['waterbody_name'] as string | null) ?? undefined,
    photoUri: (r['photo_uri'] as string | null) ?? undefined,
    notes: (r['notes'] as string | null) ?? undefined,
    timestamp: r['timestamp'] as string,
    isAnonymous: (r['is_anonymous'] as number) === 1,
    status: r['status'] as CitizenReport['status'],
    syncAttempts: r['sync_attempts'] as number,
    lastSyncAttemptAt: (r['last_sync_attempt'] as string | null) ?? undefined,
  };
}

// ── Emergency incident queries ────────────────────────────────────────

/** Insert a new emergency incident. */
export function insertEmergencyIncident(incident: EmergencyIncident): void {
  const db = getDatabase();
  db.runSync(
    `INSERT INTO emergency_incidents
       (id, created_at, latitude, longitude, last_known_latitude, last_known_longitude,
        last_known_at, battery_level, notes, emergency_contact_name, emergency_contact_phone,
        nearest_access_point_id, nearest_access_point_name, nearest_access_distance_mi,
        status, sync_status, sync_attempts)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    incident.id,
    incident.createdAt,
    incident.coordinates?.latitude ?? null,
    incident.coordinates?.longitude ?? null,
    incident.lastKnownCoordinates?.latitude ?? null,
    incident.lastKnownCoordinates?.longitude ?? null,
    incident.lastKnownAt ?? null,
    incident.batteryLevel ?? null,
    incident.notes ?? null,
    incident.emergencyContact?.name ?? null,
    incident.emergencyContact?.phone ?? null,
    incident.nearestAccessPointId ?? null,
    incident.nearestAccessPointName ?? null,
    incident.nearestAccessPointDistanceMi ?? null,
    incident.status,
    incident.syncStatus,
    incident.syncAttempts,
  );
}

/** Return all emergency incidents, newest first. */
export function queryEmergencyIncidents(): EmergencyIncident[] {
  const db = getDatabase();
  const rows = db.getAllSync<Record<string, unknown>>(
    'SELECT * FROM emergency_incidents ORDER BY created_at DESC;',
  );
  return rows.map((r) => ({
    id: r['id'] as string,
    createdAt: r['created_at'] as string,
    coordinates:
      r['latitude'] != null && r['longitude'] != null
        ? { latitude: r['latitude'] as number, longitude: r['longitude'] as number }
        : undefined,
    lastKnownCoordinates:
      r['last_known_latitude'] != null && r['last_known_longitude'] != null
        ? { latitude: r['last_known_latitude'] as number, longitude: r['last_known_longitude'] as number }
        : undefined,
    lastKnownAt: (r['last_known_at'] as string | null) ?? undefined,
    batteryLevel: (r['battery_level'] as number | null) ?? undefined,
    notes: (r['notes'] as string | null) ?? undefined,
    emergencyContact:
      r['emergency_contact_name'] != null
        ? { name: r['emergency_contact_name'] as string, phone: r['emergency_contact_phone'] as string }
        : undefined,
    nearestAccessPointId: (r['nearest_access_point_id'] as string | null) ?? undefined,
    nearestAccessPointName: (r['nearest_access_point_name'] as string | null) ?? undefined,
    nearestAccessPointDistanceMi: (r['nearest_access_distance_mi'] as number | null) ?? undefined,
    status: r['status'] as EmergencyIncident['status'],
    syncStatus: r['sync_status'] as EmergencyIncident['syncStatus'],
    syncAttempts: r['sync_attempts'] as number,
  }));
}

/** Update an emergency incident's sync status and attempt counter. */
export function updateEmergencyIncidentSync(
  id: string,
  syncStatus: EmergencyIncident['syncStatus'],
  syncAttempts: number,
): void {
  const db = getDatabase();
  db.runSync(
    'UPDATE emergency_incidents SET sync_status = ?, sync_attempts = ? WHERE id = ?;',
    syncStatus,
    syncAttempts,
    id,
  );
}

// ── Seed data ────────────────────────────────────────────────────────

/**
 * Populate SQLite tables with static seed data on a fresh install.
 * Each section is guarded — seed only runs if the table is empty.
 * Call after initDatabase() in app/_layout.tsx.
 *
 * Seed data is passed explicitly as parameters rather than imported
 * inside this file to keep the dependency graph clean and predictable
 * for Metro's static bundler.
 *
 * Usage in _layout.tsx:
 *   import { REGULATION_RULES } from '../src/data/regulationRules';
 *   import { SEED_WEATHER_SNAPSHOTS } from '../src/data/weatherSnapshots';
 *   import { SEED_WATER_SNAPSHOTS } from '../src/data/waterSnapshots';
 *   seedDatabase({ regulationRules: REGULATION_RULES, weatherSnapshots: SEED_WEATHER_SNAPSHOTS, waterSnapshots: SEED_WATER_SNAPSHOTS });
 */
export function seedDatabase(seeds: {
  regulationRules: RegulationRule[];
  weatherSnapshots: WeatherSnapshot[];
  waterSnapshots: WaterConditionSnapshot[];
}): void {
  _seedRegulationRules(seeds.regulationRules);
  _seedWeatherSnapshots(seeds.weatherSnapshots);
  _seedWaterSnapshots(seeds.waterSnapshots);
}

function _seedRegulationRules(rules: RegulationRule[]): void {
  const db = getDatabase();
  const existing = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM regulation_rules;',
  );
  if ((existing?.count ?? 0) > 0) return; // already seeded
  for (const rule of rules) {
    upsertRegulationRule(rule);
  }
}

function _seedWeatherSnapshots(snapshots: WeatherSnapshot[]): void {
  const db = getDatabase();
  const existing = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM weather_snapshots;',
  );
  if ((existing?.count ?? 0) > 0) return;
  for (const snap of snapshots) {
    db.runSync(
      `INSERT OR IGNORE INTO weather_snapshots
         (id, waterbody_id, captured_at, source, temp_f, feels_like_f, description,
          wind_speed_mph, wind_direction, humidity_pct, icon_code, forecast_summary)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      snap.id,
      snap.waterbodyId,
      snap.capturedAt,
      snap.source,
      snap.tempF,
      snap.feelsLikeF ?? null,
      snap.description,
      snap.windSpeedMph,
      snap.windDirection,
      snap.humidityPct ?? null,
      snap.iconCode ?? null,
      snap.forecastSummary ?? null,
    );
  }
}

function _seedWaterSnapshots(snapshots: WaterConditionSnapshot[]): void {
  const db = getDatabase();
  const existing = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM water_condition_snapshots;',
  );
  if ((existing?.count ?? 0) > 0) return;
  for (const snap of snapshots) {
    db.runSync(
      `INSERT OR IGNORE INTO water_condition_snapshots
         (id, waterbody_id, captured_at, source, gauge_id, temp_f, level_ft,
          clarity_ft, flow_cfs, trend, ice_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      snap.id,
      snap.waterbodyId,
      snap.capturedAt,
      snap.source,
      snap.gaugeId ?? null,
      snap.tempF ?? null,
      snap.levelFt ?? null,
      snap.clarityFt ?? null,
      snap.flowCfs ?? null,
      snap.trend ?? null,
      snap.iceStatus,
    );
  }
}
