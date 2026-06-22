# Pure MI Fishing — Regulation Engine Plan

> Phase 2 Reference · June 2026

---

## Overview

The Regulation Engine is a service layer that answers fishing regulation questions using
local (offline) data. It does not require network access.

**Scope:** Detroit River Corridor only. No statewide parsing.

**Data source:** `regulation_rules` SQLite table (seeded in Phase 1). Falls back to
`src/data/regulationRules.ts` static data if SQLite table is empty.

---

## Core Functions

### `getRulesForLocation(latitude, longitude, date)`

Returns all active regulation rules for the waterbody nearest to the given coordinates.
Uses a simple bounding-box lookup against the Detroit River Corridor access points.

```typescript
getRulesForLocation(lat: number, lon: number, date: Date): RegulationRule[]
```

**Logic:**
1. Find the nearest waterbody center within 10 miles of lat/lon
2. Call `getRulesForWaterbody(waterbodyId, date)`
3. If no waterbody found, return Detroit River rules as fallback

---

### `getRulesForWaterbody(waterbodyId, date)`

Returns all active rules for a specific waterbody on the given date.

```typescript
getRulesForWaterbody(waterbodyId: string, date: Date): RegulationRule[]
```

**Logic:**
1. Query `regulation_rules` where `waterbody_id = ?` (or `waterbody_id IS NULL` for region-wide)
2. Filter by season: if `season_start` and `season_end` are set, check if `date` falls within the season
3. Return all matching rules sorted by species name

---

### `getRulesForSpecies(speciesId, waterbodyId, date)`

Returns the specific rules for one species at one location on a given date.

```typescript
getRulesForSpecies(speciesId: string, waterbodyId: string, date: Date): RegulationRule | undefined
```

---

### `getActiveRulesByDate(date)`

Returns all rules currently in season for the given date across all Detroit River Corridor waterbodies.

```typescript
getActiveRulesByDate(date: Date): RegulationRule[]
```

---

### `getRegulationSummaryForTrip(tripId)`

Returns the regulation summary for the waterbody associated with a trip.
Useful for the trip-mode screen "Rules" button.

```typescript
getRegulationSummaryForTrip(tripId: string): RegulationSummary
```

**Returns:**
```typescript
interface RegulationSummary {
  waterbodyId: string;
  waterbodyName: string;
  asOfDate: string;
  rules: RegulationRule[];
  disclaimer: string;
  hasSampleData: boolean;  // true if any rule has verificationStatus !== 'official'
}
```

---

## Season Parsing

Michigan DNR seasons use `MM/DD` date strings (e.g., `"05/01"`, `"03/15"`).

The engine handles three cases:

| Pattern | Example | Logic |
|---|---|---|
| `"All year"` / null | Yellow Perch | Always open |
| Same-year range | `May 1 – Nov 30` | Check month/day within range |
| Cross-year range | `May 1 – Mar 15` (walleye) | Open if month >= May OR month <= March 15 |

**Season Status enum:**
```typescript
type SeasonStatus = 'open' | 'closed' | 'restricted' | 'unknown';
```

---

## Verification Status Display

| Status | Display |
|---|---|
| `official` | No extra warning; show last verified date |
| `sample_unverified` | 🚧 "Sample data — verify before fishing" banner |
| `pending_review` | ⚠️ "Data pending review — verify before fishing" banner |

---

## UI Wiring (Phase 2)

### Waterbody Detail Screen (`app/waterbody/[id].tsx`)
- Tab: "Rules" → calls `getRulesForWaterbody(id, new Date())`
- Species selector → calls `getRulesForSpecies(speciesId, waterbodyId, new Date())`
- Each rule card shows: size limit, bag limit, season dates, special rules, source URL, last verified date, verification status banner

### Trip Mode Screen (`app/trip-mode/[id].tsx`)
- "Rules" action → calls `getRegulationSummaryForTrip(tripId)`
- Shows compact summary with disclaimer

### Conditions Screen (`app/(tabs)/conditions.tsx`)
- Fishing Outlook section → calls `getActiveRulesByDate(new Date())`
- Shows which species are in season today

---

## Data Seeding Requirements (Phase 1 Output)

Every regulation rule must have:
- `sourceUrl` — direct URL to official Michigan DNR regulation page
- `lastVerifiedAt` — ISO date of last human verification
- `verificationStatus` — `'sample_unverified'` for all seed data until officially verified
- `verificationNotes` — human-readable note on the seed data quality
- `effectiveYear` — regulation year (e.g., 2025)

**Official source:**
- `https://www.michigan.gov/dnr/things-to-do/fishing/regulations`
- Michigan Fishing Guide PDF (published annually, typically March)
- Zone 6 Addendum for SE Michigan tributaries

---

## Testing Plan (Phase 8)

| Test | Input | Expected |
|---|---|---|
| Walleye in season | May 15 | `status: 'open'` |
| Walleye catch-and-release | April 15 | `status: 'restricted'` |
| Yellow perch all year | Any date | `status: 'open'` |
| Smallmouth bass pre-season | May 20 | `status: 'closed'` |
| Muskie before June 7 | June 1 | `status: 'closed'` |
| Location near Belle Isle | 42.34, -82.97 | Returns Belle Isle rules |
| Unknown location | 41.0, -83.5 | Returns Detroit River fallback |
| Sample data check | Any | `hasSampleData: true` until officially verified |
