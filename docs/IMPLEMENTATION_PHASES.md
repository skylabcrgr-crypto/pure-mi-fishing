# Pure MI Fishing — Implementation Phases

> Last Updated: June 19, 2026
> Active Phase: Phase 8 — Testing and Launch Readiness
> Completed: Phase 0, Phase 1, Phase 2, Phase 3

---

## Phase 0 — Audit & Documentation (Complete)

**Goal:** Understand what exists, define what needs to be built, and create guiding documents.

**Deliverables:**
- [x] Full repo audit
- [x] `docs/PRODUCT_SCOPE_V2.md`
- [x] `docs/IMPLEMENTATION_PHASES.md` (this file)
- [x] `docs/OFFLINE_DATA_MODEL.md`
- [x] `docs/REGULATION_ENGINE_PLAN.md`
- [x] `docs/BETA_ACCEPTANCE_CRITERIA.md`

**Key Findings from Audit:**
- All 13 screens render correctly with static seed data
- Expo SQLite is installed but schema only covers `catch_log`, `offline_pack_meta`, `saved_spots`
- All API services are mocked — clean swap pattern in place
- Emergency Mode is a bare Alert dialog — needs full implementation
- No citizen reporting exists
- No regulation engine service exists — just static array lookups
- No fishing intelligence engine exists
- No tests exist
- No backend sync exists (infrastructure wired to Railway/Supabase but no integration code)

---

## Phase 1 — Offline Data Foundation

**Goal:** Establish the complete local data model for all MVP features. No new UI yet.

**Files Changed / Created:**
- `src/types/index.ts` — add 7 new types, extend `Regulation`
- `src/lib/db.ts` — add 6 new SQLite table definitions
- `src/lib/storage.ts` — add new AsyncStorage keys
- `src/data/regions.ts` — NEW: Detroit River Corridor region
- `src/data/accessPoints.ts` — NEW: 9 access points with full metadata
- `src/data/regulationRules.ts` — NEW: enhanced regulation rules with verification metadata
- `src/data/regulations.ts` — UPDATE: backfill `verificationStatus`, `sourceUrl`, `notes`

**Acceptance Criteria:**
- [ ] TypeScript builds with zero errors (`tsc --noEmit`)
- [ ] All new types are exported from `src/types/index.ts`
- [ ] SQLite schema initializes without errors on app start
- [ ] Detroit River Corridor region object exists
- [ ] 9 access points seeded for Detroit River Corridor
- [ ] All 7 MVP species have enhanced regulation rules with `verificationStatus`
- [ ] All regulation rules have `sourceUrl`, `lastVerifiedAt`, `verificationStatus`, `notes`
- [ ] No existing screens break

---

## Phase 2 — Offline Regulation Engine ✅ COMPLETE

**Goal:** Implement a query service that resolves fishing rules from local data. Wire to existing screens.

**Completed:**
- `src/services/regulationService.ts` — full offline engine with season status logic
- `app/waterbody/[id].tsx` — regulation engine wired, expandable species cards, sample data warning
- `app/trip-mode/[id].tsx` — Rules button opens inline Modal with regulation summary

**Acceptance Criteria:**
- [x] User can select a species and see rules for Detroit River
- [x] Rules show open/closed/restricted status based on current date
- [x] Rules show size limit, bag limit, possession limit, special notes
- [x] Last verified date is visible
- [x] Sample data warning visible when `verificationStatus !== 'official'`

---

## Phase 3 — Offline GIS Map Pack ✅ COMPLETE

**Goal:** Implement Detroit River region pack with version tracking and full access point layer.

**Completed:**
- `src/store/useOfflinePackStore.ts` — NEW: OfflineRegionPack status + saved access point IDs (AsyncStorage)
- `app/offline-packs.tsx` — Migrated to OfflineRegionPack; Detroit River Corridor pack with version metadata
- `app/(tabs)/explore.tsx` — MAP_PINS replaced with ACCESS_POINTS (9 points); 6 type filter chips; access point detail card; pack status row; save spot support
- `src/data/accessPoints.ts` — Added `getAccessPointDistanceMi()` helper
- `app/_layout.tsx` — `useOfflinePackStore.loadFromStorage()` wired on boot

**Acceptance Criteria:**
- [x] Detroit River pack shows version, downloaded status, data versions
- [x] Access point pins visible on map (9 points, color-coded by type)
- [x] Emergency resource points visible on map
- [x] Pack download simulation shows progress
- [x] User can save/remove access point spots (AsyncStorage-backed)
- [x] Access points filterable by type (All / Launches / Shore / Marina / Emergency / Saved)
- [x] Access point detail card with name, type, distance, hours, fee, notes, amenities, emergency phone

**Note:** Map tile offline download deferred to Phase 5. Access points + rules work fully offline.

---

## Phase 4 — Smart Fishing Intelligence V1 ✅ COMPLETE

**Goal:** Rules-based fishing recommendation engine with no paid AI.

**Files Created/Modified:**
- `src/types/index.ts` — Added `FishingConditionInput`, `SpeciesScore`, `FishingRecommendation`, `FishingMethodSuggestion`, `ConfidenceLevel`
- `src/data/speciesProfiles.ts` — NEW: 7 species preference profiles (walleye, smallmouth/largemouth bass, yellow perch, muskellunge, northern pike, steelhead)
- `src/services/fishingIntelligenceService.ts` — NEW: deterministic scoring engine; 8 sub-scores per species, composite weighted score
- `app/(tabs)/conditions.tsx` — UPDATED: "Fish Forecast" section with top-pick card, ranked species list, explanation lines
- `app/(tabs)/explore.tsx` — UPDATED: compact "Fish Today" card in map bottom sheet

**Scoring Weights:** season (0.28), water temp (0.18), time of day (0.14), weather (0.12), wind (0.10), water condition (0.08), recent catches (0.06), regulation quality (0.04)

**Acceptance Criteria:**
- [x] User can request fishing recommendation for Detroit River
- [x] Output is labeled as "condition-based fishing guidance"
- [x] Never claims guaranteed catch prediction
- [x] Works fully offline using cached weather/water snapshots
- [x] Confidence level (Low / Medium / High) displayed
- [x] Closed-season species hard-capped at score 15 and flagged
- [x] Mock/stale data banners shown when seed data is in use
- [x] `npx tsc --noEmit` exits 0

---

## Phase 5 — Emergency Mode ✅ COMPLETE

**Goal:** Full Emergency Mode replacing the current Alert dialog placeholder.

**Files Created/Modified:**
- `app/emergency-mode.tsx` — NEW: full emergency screen (GPS coords, last known location, contact, message, actions)
- `src/services/emergencyService.ts` — NEW: all service functions (contact, incident, message, nearest point, last known location)
- `src/lib/storage.ts` — UPDATED: added `lastKnownLocation` storage key
- `app/trip-mode/[id].tsx` — UPDATED: Emergency action navigates to `/emergency-mode` with `tripId`
- `app/_layout.tsx` — UPDATED: `emergency-mode` route registered as modal

**No new package dependencies required.** Battery deferred (expo-battery not installed).

**Acceptance Criteria:**
- [x] One-tap to Emergency Mode from trip-mode
- [x] Current GPS coordinates visible
- [x] Last known location + timestamp visible
- [ ] Battery level displayed — deferred, expo-battery not installed
- [x] Emergency contact stored in AsyncStorage, editable in-screen modal
- [x] Generated emergency message shown and shareable/copyable
- [x] Nearest known access/resource point calculated from local data
- [x] Emergency incident saved offline to SQLite
- [ ] Queue sync when connection returns — deferred to Phase 7 (backend sync)
- [x] Visible disclaimer on every screen surface
- [x] App does not crash if GPS denied / no contact / no network
- [x] `npx tsc --noEmit` exits 0

---

## Phase 6 — Citizen Science / Report a Problem ✅ COMPLETE

**Goal:** Offline-first report flow for environmental and access issues.

**Files Created/Modified:**
- `app/report-problem.tsx` — NEW: full report screen (form + history tabs, 13 report types, type picker modal, detail modal)
- `src/services/citizenReportService.ts` — NEW: all service functions + `REPORT_TYPE_META` + `resolveNearestWaterbody()`
- `src/lib/db.ts` — UPDATED: added `queryCitizenReportById`, `queryCitizenReportsByType`, `queryCitizenReportsByWaterbody`, `deleteCitizenReportById`, `patchCitizenReport`, `mapRowToCitizenReport`; refactored existing `queryCitizenReports` to use shared mapper
- `app/(tabs)/explore.tsx` — UPDATED: "Report a Problem" shortcut button in bottom sheet
- `app/trip-mode/[id].tsx` — UPDATED: "Report" action added to action grid (pre-fills waterbodyId)
- `app/_layout.tsx` — UPDATED: `report-problem` route registered as modal

**Acceptance Criteria:**
- [x] User can create a report with type, GPS, waterbody, notes, anonymous flag
- [x] Report saves offline as draft (`status: 'draft'`, `syncAttempts: 0`)
- [x] Report queued for sync when online — local pending flag set (sync deferred to Phase 7)
- [x] User can view pending/submitted reports in history tab
- [x] User can delete a local report
- [ ] Photo attachment — deferred (no Expo ImagePicker installed)

---

## Phase 7 — Backend + Sync Hardening ✅ COMPLETE

**Goal:** Add the lowest-cost backend (Supabase Free) for cloud backup while keeping the app fully offline-first. SQLite/AsyncStorage remain the source of truth; backend availability is never required for core usage.

**Backend decision:** Supabase Free (Auth + Postgres + RLS). No Railway / custom Node API. No paid weather/AI APIs. No server-side map tiles. Push-only one-way sync for MVP (pull/merge deferred).

**Files Created / Changed:**
- `supabase/schema.sql` — NEW: Postgres schema + RLS for `profiles`, `trips`, `catch_logs`, `citizen_reports`, `emergency_incidents`, `sync_events`; per-user RLS (deny by default), `handle_new_user` trigger, idempotent `(user_id, client_id)` upsert keys
- `mobile/src/lib/supabase.ts` — NEW: graceful client; `getSupabase()`, `isSupabaseConfigured()`, `getSupabaseConfigSummary()`; returns null (never throws) when env vars missing
- `mobile/src/services/authService.ts` — NEW: `signUpWithEmail`, `signInWithEmail`, `signOut`, `getCurrentUser`, `getSession`, `resetPassword`, `isAuthConfigured`
- `mobile/src/services/syncService.ts` — NEW: `syncNow()`, `getPendingCounts()`; push trips/catches/citizen reports/emergency incidents; marks synced on success, increments attempts + preserves local on failure; never deletes local data; structured `SyncResult`
- `mobile/app/sync-status.tsx` — NEW: Sync & Backup screen (backend configured?, signed in?, pending counts, last sync, "Sync Now")
- `mobile/src/lib/db.ts` — UPDATED: added `updateEmergencyIncidentSync()`
- `mobile/src/types/index.ts` — UPDATED: added `SyncStatus` type + optional `syncStatus/syncAttempts/lastSyncAttemptAt/syncedAt` on `Trip` and `CatchEntry`
- `mobile/app/settings.tsx` — UPDATED: "Sync & Backup" entry row
- `mobile/app/_layout.tsx` — UPDATED: `sync-status` route registered
- `mobile/.env.example` — NEW: documents `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_APP_ENV`, `EXPO_PUBLIC_DATA_PACK_BASE_URL`
- `package.json` — added `@supabase/supabase-js`

**Acceptance Criteria:**
- [x] App boots and works offline with NO env vars configured
- [x] Local data still saves offline (SQLite + AsyncStorage unchanged)
- [x] Sync Status screen opens and shows "not configured" when env vars missing
- [x] "Sync Now" never crashes offline / signed out / on request failure
- [x] When configured + signed in, pending records upsert to Supabase
- [x] Failed sync preserves local data and increments attempt counter
- [x] Per-user RLS: users access only their own rows
- [x] No service-role key in the mobile app
- [x] `npx tsc --noEmit` passes
- [ ] Pull/merge (two-way sync) — deferred
- [ ] Photo upload to Storage — deferred
- [ ] Real weather/USGS/NOAA API calls — deferred (kept offline mocks)
- [ ] Auth UI screens — deferred (service layer only this phase)

---

## Phase 8 — Testing and Launch Readiness

**Goal:** Tests, final checklist, App Store / Play Store prep.

**Files to Create / Change:**
- Tests for: regulation lookup, offline pack availability, fishing recommendation scoring, emergency incident creation, citizen report creation, trip/catch offline sync queue
- Update `docs/LAUNCH_CHECKLIST.md`
- Create `docs/BETA_TEST_PLAN.md`
- Create `docs/KNOWN_LIMITATIONS.md`

**Acceptance Criteria:** See `docs/BETA_ACCEPTANCE_CRITERIA.md`.

---

## Phase Dependencies

```
Phase 0 (Audit) → Phase 1 (Data Foundation) → Phase 2 (Regulation Engine)
                                             → Phase 3 (GIS Map Pack)
                                             → Phase 4 (Intelligence)
                                             → Phase 5 (Emergency Mode)
                                             → Phase 6 (Citizen Reports)
                                             
Phase 2-6 → Phase 7 (Sync Hardening)
Phase 7   → Phase 8 (Testing + Launch)
```

Phases 2–6 can be worked in parallel after Phase 1 is complete.
