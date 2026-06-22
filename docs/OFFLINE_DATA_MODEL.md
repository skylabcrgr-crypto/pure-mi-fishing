# Pure MI Fishing — Offline Data Model

> Phase 3 Reference · June 2026
> Updated: Phases 1–3 complete. Phase 3 adds useOfflinePackStore + saved access points.

---

## Storage Architecture

The app uses two persistence layers:

| Layer | Library | Used For |
|---|---|---|
| **AsyncStorage** | `@react-native-async-storage/async-storage` | User preferences, Zustand store hydration, offline pack status, saved access point IDs |
| **SQLite** | `expo-sqlite` | Structured offline data: catch log, trips, regulations, conditions snapshots, citizen reports, emergency incidents |

**Rule:** Lightweight user preferences + pack status → AsyncStorage. Queryable structured data → SQLite.

---

## AsyncStorage Key Registry

All keys namespaced under `@puremi/`.

| Key | Type | Description |
|---|---|---|
| `@puremi/preferences` | `UserPreferences` | App settings, saved waterbody/launch IDs, onboarding status |
| `@puremi/trips` | `Trip[]` | Active + completed trips |
| `@puremi/logbook` | `CatchEntry[]` | Catch log entries |
| `@puremi/region-pack-status` | `Record<id, {status, downloadedAt}>` | **Phase 3** — OfflineRegionPack download status (persisted by useOfflinePackStore) |
| `@puremi/saved-access-points` | `string[]` | **Phase 3** — Access point IDs saved as favorite spots |
| `@puremi/onboarding-done` | `boolean` | Onboarding gate flag |
| `@puremi/emergency-contact` | `EmergencyContact` | Stored emergency contact |
| `@puremi/citizen-reports` | `CitizenReport[]` | Offline report queue |
| `@puremi/emergency-incidents` | `EmergencyIncident[]` | Offline emergency records |
| `@puremi/weather-snapshots` | `WeatherSnapshot[]` | Cached weather (last 5) |
| `@puremi/water-snapshots` | `WaterConditionSnapshot[]` | Cached water conditions (last 5) |

**Note:** `@puremi/offline-packs` (legacy key, `OfflinePack[]` type) is no longer used. Replaced by `@puremi/region-pack-status`.

---

## SQLite Tables

Database file: `puremi.db`  
Initialize on app start via `initDatabase()` in `src/lib/db.ts`.

### `catch_log` (existing)
Mirrors `CatchEntry`. Primary catch logging table.

```sql
CREATE TABLE IF NOT EXISTS catch_log (
  id            TEXT PRIMARY KEY NOT NULL,
  trip_id       TEXT,
  species_id    TEXT NOT NULL,
  species_name  TEXT NOT NULL,
  length_in     REAL,
  weight_lb     REAL,
  method        TEXT,
  bait          TEXT,
  notes         TEXT,
  waterbody_id  TEXT NOT NULL,
  waterbody_name TEXT NOT NULL,
  is_public     INTEGER NOT NULL DEFAULT 0,
  timestamp     TEXT NOT NULL,
  sync_status   TEXT NOT NULL DEFAULT 'pending'
);
```

### `offline_pack_meta` (existing, extending)
Tracks downloaded region pack metadata.

```sql
CREATE TABLE IF NOT EXISTS offline_pack_meta (
  id                      TEXT PRIMARY KEY NOT NULL,
  region_id               TEXT NOT NULL,
  name                    TEXT NOT NULL,
  version                 TEXT NOT NULL,
  map_data_version        TEXT,
  regulation_data_version TEXT,
  size_mb                 REAL NOT NULL,
  downloaded              INTEGER NOT NULL DEFAULT 0,
  downloaded_at           TEXT,
  last_updated            TEXT,
  access_point_count      INTEGER NOT NULL DEFAULT 0
);
```

### `saved_spots` (existing)
```sql
CREATE TABLE IF NOT EXISTS saved_spots (
  id       TEXT PRIMARY KEY NOT NULL,
  type     TEXT NOT NULL CHECK(type IN ('waterbody', 'launch', 'access_point', 'custom')),
  name     TEXT NOT NULL,
  saved_at TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  notes    TEXT
);
```

### `regulation_rules` (new)
Structured offline regulation data. One row per rule per species per waterbody.

```sql
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
```

### `weather_snapshots` (new)
Cached weather data for offline use.

```sql
CREATE TABLE IF NOT EXISTS weather_snapshots (
  id              TEXT PRIMARY KEY NOT NULL,
  waterbody_id    TEXT NOT NULL,
  captured_at     TEXT NOT NULL,
  source          TEXT NOT NULL DEFAULT 'mock',
  temp_f          REAL NOT NULL,
  feels_like_f    REAL,
  description     TEXT NOT NULL,
  wind_speed_mph  REAL NOT NULL,
  wind_direction  TEXT NOT NULL,
  humidity_pct    INTEGER,
  icon_code       TEXT,
  forecast_summary TEXT
);
```

### `water_condition_snapshots` (new)
Cached USGS water condition data.

```sql
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
```

### `citizen_reports` (new)
Offline-first citizen science reports.

```sql
CREATE TABLE IF NOT EXISTS citizen_reports (
  id                  TEXT PRIMARY KEY NOT NULL,
  report_type         TEXT NOT NULL,
  latitude            REAL,
  longitude           REAL,
  waterbody_id        TEXT,
  waterbody_name      TEXT,
  photo_uri           TEXT,
  notes               TEXT,
  timestamp           TEXT NOT NULL,
  is_anonymous        INTEGER NOT NULL DEFAULT 1,
  status              TEXT NOT NULL DEFAULT 'draft',
  sync_attempts       INTEGER NOT NULL DEFAULT 0,
  last_sync_attempt   TEXT
);
```

### `emergency_incidents` (new)
Offline emergency incident records.

```sql
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
```

---

## TypeScript Type Catalog

All types defined in `src/types/index.ts`.

### New Types (Phase 1)

| Type | Description |
|---|---|
| `Region` | Geographic region with bounds and waterbody list |
| `AccessPoint` | Detailed access point (boat launch, shore, bait shop, emergency resource, etc.) |
| `OfflineRegionPack` | Extended pack type with version tracking and layer metadata |
| `RegulationRule` | Enhanced regulation with sourceUrl, verificationStatus, lastVerifiedAt |
| `WeatherSnapshot` | Cached weather data with source tracking |
| `WaterConditionSnapshot` | Cached USGS water data with source tracking |
| `CitizenReport` | Citizen science report with sync state |
| `EmergencyIncident` | Emergency incident record with GPS + sync state |
| `EmergencyContact` | Stored emergency contact (name + phone) |

### Verification Status Values

```typescript
type VerificationStatus = 'official' | 'sample_unverified' | 'pending_review';
```

| Status | Meaning | UI Treatment |
|---|---|---|
| `official` | Verified against current DNR source | No extra warning |
| `sample_unverified` | Seed/placeholder data, not yet verified | Show 🚧 warning |
| `pending_review` | Data exists but needs re-verification | Show ⚠️ caution |

---

## Seed Data Included in Phase 1

### Regions
- `detroit-river-corridor` — Detroit River Corridor, SE Michigan

### Access Points (9)
- Elizabeth Park Marina (boat ramp)
- Wyandotte Boat Ramp (boat ramp)
- Milliken State Park Harbor (marina)
- Lake Erie Metropark Launch (boat ramp)
- Flat Rock Community Launch (boat ramp + steelhead access)
- Belle Isle Carry-In (carry-in/shore)
- Detroit Riverfront Shore (shore access)
- Trenton Walleye Hotspot (fishing hotspot)
- Grosse Ile North Shore (shore + emergency resource)

### Regulation Rules (10)
- Walleye — Detroit River (special 20-inch rule)
- Walleye — Trenton Channel
- Smallmouth Bass — Detroit River (combined bass rule)
- Largemouth Bass — Detroit River
- Yellow Perch — Detroit River
- Muskellunge — Lake St. Clair / Detroit (54-inch rule)
- Northern Pike — Detroit River
- Steelhead — Detroit River (tributary closure notes)
- Walleye — Lake St. Clair Edge
- Yellow Perch — Lake Erie / Metropark area

### Weather + Water Snapshots
- 1 mock weather snapshot for `detroit-river` (source: `mock`)
- 1 mock water condition snapshot for `detroit-river` (source: `mock`, USGS gauge 04165500)

---

## Data Flow Summary

```
App Start
  └─ initDatabase() creates/migrates all SQLite tables
  └─ useAppStore.loadPreferences() hydrates Zustand from AsyncStorage
  └─ useTripsStore.loadTrips() hydrates trips from AsyncStorage
  └─ useLogbookStore.loadCatches() hydrates logbook from AsyncStorage

User Opens Conditions Screen
  └─ regulationService.getRulesForWaterbody('detroit-river', today)
       └─ queries regulation_rules SQLite table
       └─ falls back to REGULATION_RULES seed data if table empty

User Creates Citizen Report (offline)
  └─ CitizenReport created with status: 'draft'
  └─ Saved to SQLite citizen_reports table
  └─ Queued for sync: status → 'submitted' when online

User Activates Emergency Mode
  └─ EmergencyIncident created with GPS, timestamp, battery
  └─ Nearest access point calculated from AccessPoint seed data
  └─ Saved to SQLite emergency_incidents table
  └─ Queued for sync: sync_status → 'synced' when backend available
```
