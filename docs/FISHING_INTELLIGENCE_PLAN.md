# Fishing Intelligence Plan — Phase 4

## Overview

PureMI Fishing uses a **deterministic, rules-based scoring engine** to answer the question:
> "What should I fish for today, when, and why?"

No paid AI. No backend calls. No ML. Every score is computed from explicit rules that can be read, audited, and explained.

---

## Engine Location

`mobile/src/services/fishingIntelligenceService.ts`

---

## Public API

```ts
// Main entry point — never throws
generateRecommendation(input: FishingConditionInput): FishingRecommendation

// Quick helper — returns top species or null
getTopSpecies(waterbodyId: string, date?: Date): SpeciesScore | null
```

---

## Inputs

| Field | Type | Source |
|---|---|---|
| `date` | `Date` | Current device time |
| `waterbodyId` | `string` | `'detroit-river'` for MVP |
| `weatherSnapshot?` | `WeatherSnapshot` | NOAA adapter (Phase 6+) or seed data |
| `waterSnapshot?` | `WaterConditionSnapshot` | USGS adapter (Phase 6+) or seed data |
| `recentCatches?` | `CatchEntry[]` | Logbook store (optional) |

If no live snapshots are provided, the engine falls back to seed data with `source: 'mock'` — always treated as stale.

---

## Species Profiles

Defined in `mobile/src/data/speciesProfiles.ts`. Each profile specifies:

- Optimal water temp range (min/max °F)
- Survival threshold temps (cold/heat cutoff)
- Peak months (bonus applied)
- Time windows (excellent / good / fair)
- Max wind tolerance (mph)
- Minimum clarity (ft)
- Depth zones (shallow / deep in ft)
- Methods (method + detail strings)
- Detroit River-specific notes

**Species covered (7):**
1. Walleye
2. Smallmouth Bass
3. Largemouth Bass
4. Yellow Perch
5. Muskellunge
6. Northern Pike
7. Steelhead

> ⚠️ All profiles carry `isSampleGuidance: true` in MVP. Always display the sample guidance disclaimer.

---

## Scoring Model

Each species is scored on **8 sub-components**, then combined into a weighted composite:

| Sub-score | Weight | Description |
|---|---|---|
| `seasonScore` | 28% | Open (1.0), Restricted (0.4), Closed (0.0) per regulation engine |
| `waterTempScore` | 18% | Bell curve vs. species optimal temp range |
| `timeOfDayScore` | 14% | Time window match (excellent=1.0, good=0.7, fair=0.4) |
| `weatherScore` | 12% | Overcast/cloudy=0.9, Storm=0.05, Clear=0.7 |
| `windScore` | 10% | vs. species `maxWindMph` tolerance |
| `waterConditionScore` | 8% | Clarity vs. species `minClarityFt`, rising/falling trend |
| `recentCatchScore` | 6% | Catch frequency in last 7 days (optional bonus) |
| `regulationScore` | 4% | Data quality: 1.0 if official, 0.6 if sample |

**Peak month bonus:** +15 weighted points (additive, capped at 100)

**Closed species hard cap:** Score is capped at 15/100. `isClosed: true` in output.

**Final score:** 0–100 (integer)

---

## Confidence Levels

| Level | Condition |
|---|---|
| `low` | Any mock/seed data in use, or score < 40 |
| `medium` | Live data, score 40–64 |
| `high` | Live data, score ≥ 65 |

---

## Offline Fallback

1. No live weather/water? → falls back to seed snapshots (`capturedAt: epoch`, `source: 'mock'`)
2. Seed snapshots always trigger `isWeatherStale=true`, `isWaterStale=true`, `hasMockData=true`
3. `dataWarnings[]` populated with human-readable explanations
4. Score still computed — just flagged as low confidence
5. Engine error? → `_degradedRecommendation()` returns safe generic output, never crashes

---

## UI Integration

### Conditions Tab (`app/(tabs)/conditions.tsx`)
- Section: **"Fish Forecast"**
- Top-pick card: emoji + species name + score pill + confidence pill + best window + depth + method
- Explanation lines (up to 4 per species)
- Data quality warning banners
- Ranked species list (all 7) with score bar

### Explore Tab (`app/(tabs)/explore.tsx`)
- Compact "Fish Today" row in map bottom sheet
- Shows: top species emoji + name + score
- Tap navigates to Conditions tab for full forecast

---

## Regulation Integration

Phase 2's `regulationService.getRulesForWaterbody()` and `getSeasonStatus()` are called directly. If no rule exists for a species, a heuristic fallback (hardcoded season windows) is used.

---

## Recent Catch Integration

If `recentCatches` is passed in (from `useLogbookStore`), catches within the last 7 days contribute a small bonus (up to +0.9 sub-score weight × 0.06). This is purely additive and transparent.

---

## Not Included (by design)

- No OpenAI / Claude / paid AI APIs
- No backend database calls
- No ML model or personalization beyond recent catches
- No real-time weather — live adapters deferred to Phase 6
- No guaranteed catch predictions — always labeled as guidance
