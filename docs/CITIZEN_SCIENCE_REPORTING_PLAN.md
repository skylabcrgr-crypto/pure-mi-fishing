# Citizen Science / Report a Problem — Phase 6

## Overview

Anglers can file field observations from the water — invasive species sightings, pollution, broken launches, dead fish kills, navigation hazards, and more. All reports save **locally first**. Backend sync is deferred to Phase 7.

> ⚠️ Pure MI Fishing is not an official government reporting channel.
> For immediate danger, call 911.
> For urgent enforcement issues, contact the Michigan DNR RAP Line: 1-800-292-7800.

---

## Route

`app/report-problem.tsx` — registered in `_layout.tsx` as `presentation: 'modal'`, `animation: 'slide_from_bottom'`.

Accepts optional query params:
- `reportType` — pre-selects a report type (e.g., from Trip Mode "Report" action)
- `waterbodyId` — pre-fills the associated waterbody (e.g., from Trip Mode with active trip)

---

## Entry Points

| Location | Action |
|---|---|
| Explore tab bottom sheet | "Report a Problem" button → `/report-problem` |
| Trip Mode action grid | "Report" tile → `/report-problem?waterbodyId=[id]` |
| Direct navigation | Any screen can `router.push('/report-problem')` |

---

## Report Types (13)

| Type | Emoji | Urgency |
|---|---|---|
| `invasive_species` | 🦀 | High |
| `dead_fish` | 🐟 | High |
| `pollution` | 🏭 | High |
| `algae_bloom` | 🟢 | High |
| `oil_spill` | 🛢️ | High |
| `poaching_concern` | 🚨 | High |
| `illegal_dumping` | 🗑️ | Medium |
| `broken_launch` | 🚣 | Medium |
| `flooding` | 🌊 | Medium |
| `damaged_dock` | ⚓ | Medium |
| `navigation_hazard` | ⚠️ | Medium |
| `erosion` | ⛰️ | Low |
| `other` | 📋 | Low |

---

## Service Layer

`mobile/src/services/citizenReportService.ts`

### Exported functions

| Function | Description |
|---|---|
| `createCitizenReport(input)` | Create + persist report to SQLite; auto-resolves nearest waterbody from GPS |
| `getCitizenReports()` | All reports, newest first |
| `getCitizenReportById(id)` | Single report by id |
| `getPendingCitizenReports()` | Only `status: 'draft'` reports |
| `getCitizenReportsByType(type)` | Filter by type |
| `getCitizenReportsByWaterbody(id)` | Filter by waterbody |
| `updateCitizenReport(id, patch)` | Patch status/notes |
| `deleteCitizenReport(id)` | Hard delete |
| `resolveNearestWaterbody(lat, lon)` | Haversine search over static WATERBODIES; returns null if > 20 mi away |
| `formatReportTypeLabel(type)` | Human-readable label string |
| `getReportTypeMeta(type)` | Full `ReportTypeMeta` object |
| `REPORT_TYPE_META` | Array of all 13 type metadata objects |

---

## Data Storage

| Data | Storage | Key / Table |
|---|---|---|
| Citizen reports | SQLite | `citizen_reports` table (Phase 1 schema) |

Reports are **never stored in AsyncStorage** — SQLite is the durable store.

---

## Report Schema (SQLite, Phase 1)

```sql
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
```

---

## Offline/Pending Status

- All reports created with `status: 'draft'` and `syncAttempts: 0`
- `status` progresses: `draft` → `submitted` → `synced` (Phase 7)
- UI shows a "Local / Submitted / Synced" badge on each report row
- History tab footer shows pending count: "X pending sync · Reports are local-only until Phase 7"

---

## Location & Waterbody Resolution

1. **Current GPS** — used if `position` is available from `useLocation()`
2. **Last known location** — fallback from `getLastKnownLocation()` (AsyncStorage, written by Emergency Mode and this screen)
3. **Toggle** — user can switch between current and last known in the UI
4. **Waterbody** — if not passed as a param, `resolveNearestWaterbody()` finds the closest within 20 mi; otherwise left blank

---

## Photo Attachment

**Deferred to Phase 7/8.** A clearly labeled placeholder is shown:
> "Photo attachment coming in Phase 7/8."

No `expo-image-picker` or storage dependency added.

---

## Safety Disclaimers

Shown at the bottom of every report form:

> Reports are saved locally and may sync later when backend sync is enabled.
> For immediate danger or emergencies, call 911.
> For urgent poaching or enforcement issues, contact the Michigan DNR RAP Line: 1-800-292-7800.
> Pure MI Fishing is not an official government reporting channel.

High-urgency report types (invasive, dead fish, pollution, algae, oil, poaching) also show an inline urgency banner with a direct-contact reminder.
