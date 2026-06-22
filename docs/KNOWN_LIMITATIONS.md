# Known Limitations — PureMI Fishing MVP

This document records known limitations, missing features, and deferred work as of the Phase 4 (Smart Fishing Intelligence) milestone.

---

## Data & Intelligence

### All Species Profiles Are Sample Guidance
All 7 species profiles in `speciesProfiles.ts` carry `isSampleGuidance: true`. The optimal water temps, time windows, and method suggestions are based on general Great Lakes fishing knowledge, not verified with Michigan DNR or MDNR-certified biologists.

**Impact:** Scores and recommendations are directionally correct but should not be used for license or regulation decisions.

**Mitigation:** All UI surfaces display a "sample guidance" warning.

---

### Weather & Water Data Is Mock/Seed Only
The seed snapshots in `weatherSnapshots.ts` and `waterSnapshots.ts` use `capturedAt: new Date(0)` (Unix epoch) and `source: 'mock'`. They will always be considered stale.

**Impact:** Confidence will always be `'low'` until live API adapters are wired.

**Deferred to:** Phase 6 (live service integration)

---

### Regulation Data Is Sample Only
All regulation rules were seeded from publicly available DNR summaries but have not been officially verified by MDNR staff.

**Impact:** Regulation checks are advisory only. Users must verify at michigan.gov/dnr before fishing.

**Mitigation:** All regulation-derived outputs display: *"Sample data — verify at michigan.gov/dnr."*

---

### Recent Catches Are Logbook-Only
The `recentCatchScore` sub-component is only active when `recentCatches` are explicitly passed to `generateRecommendation()`. The Conditions tab currently calls with no `recentCatches` argument.

**Impact:** Recent catch bonus is always 0 on the Conditions tab until the logbook store is wired in.

**Deferred to:** Post-Phase 4 polish or Phase 6

---

## Map & Offline Tiles

### Map Tiles Require Network
The `MapView` uses the system tile provider (`PROVIDER_DEFAULT`), which requires an internet connection to render tiles. True offline tile caching (downloading a tile bundle) is deferred to Phase 5.

**Impact:** Map is blank or shows cached system tiles when fully offline.

**Mitigation:** Access points, regulations, and all intelligence work offline — only the background map tiles require network.

**Deferred to:** Phase 5

---

### Offline Pack Download Is Simulated
`startPackDownload` in `useOfflinePackStore` simulates a download with a `setInterval` progress ticker. No actual tile bundle is transferred.

**Deferred to:** Phase 5 (requires MapLibre or similar tile bundler)

---

## Waterbodies & Coverage

### MVP Covers Detroit River Corridor Only
Species profiles, access points, and regulation rules are all scoped to the Detroit River, Lake Erie shoreline, and Lake St. Clair. Fishing intelligence for other Michigan waterbodies will require expanded data.

**Deferred to:** Phase 7+ (data expansion)

---

## Emergency Mode

### Battery Percentage Not Available
`expo-battery` is not installed. Battery level is stored as `null` in incident records and shown as "Battery: unavailable" in emergency messages.

**To enable:** `npx expo install expo-battery`, import `useBatteryLevel()` in `emergency-mode.tsx`, and pass the value to `generateEmergencyMessage()`.

---

### Incident Sync Is Push-Only (Phase 7)
Emergency incidents are saved to SQLite first. When Supabase is configured **and** the user is signed in **and** online, `syncService.syncNow()` upserts them to the `emergency_incidents` table. Pull/merge back to the device is not implemented.

**Status:** Push (upload) only. No two-way sync. Works fully without backend.

---

### No Background Location
`useLocation` only requests foreground permission. If the app is backgrounded while in Emergency Mode, GPS updates stop.

**Deferred to:** Future phase (requires `expo-task-manager` + background location permission)

---

## Citizen Reports

### Photo Attachment Not Available
`expo-image-picker` is not installed. The photo field shows a placeholder:
> "Photo attachment coming in Phase 7/8."

**To enable:** `npx expo install expo-image-picker`, then wire `ImagePicker.launchImageLibraryAsync()` in `report-problem.tsx` and store the `photoUri` in the report.

---

### Reports Sync Is Push-Only (Phase 7)
Citizen reports save to SQLite with `status: 'draft'`. When Supabase is configured + signed in + online, `syncService.syncNow()` upserts them to `citizen_reports` and marks them synced. Without backend they remain local drafts. Photo upload is still deferred.

---

### Waterbody Resolution Uses 20-Mile Cap
`resolveNearestWaterbody()` will not attribute a report to a waterbody if the nearest one is > 20 miles away. Reports in out-of-range areas will have no `waterbodyId`.

---

### Fish Forecast Computed on Every Mount
`generateRecommendation()` is called inside `useMemo` on the Conditions screen. For MVP (7 species, simple math), this is instant. If species profiles grow significantly, consider moving to a background worker.

---

## Backend & Sync (Phase 7)

### Push-Only, One-Way Sync
`syncService.syncNow()` only uploads (upserts) local records to Supabase. There is no pull/merge, so changes made directly in Supabase do not flow back to the device, and multi-device sync is not supported.

**Deferred to:** Future phase (two-way sync + conflict resolution).

---

### Backend Is Optional and Off by Default
If `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` are missing, `isSupabaseConfigured()` is false and all auth/sync calls return a structured "not configured" result. The app never requires the backend.

---

### No Auth UI Yet
`authService.ts` exists (sign up / in / out, session, reset) but there are no sign-up/sign-in screens. Until an account UI is added, "Sync Now" reports "not signed in" when configured.

**Deferred to:** Future phase (auth screens).

---

### No Photo Upload / Storage
Supabase Storage is not wired. `citizen_reports.photo_uri` is always sent as `null`.

---

### Real Weather/USGS/NOAA APIs Still Mocked
Phase 7 added the backend but did **not** swap the weather/water service mocks for live API calls. Those remain seed/mock data.

---

## Security Notes

- Local seed/reference data is read-only and cannot be tampered with at runtime.
- Supabase access uses the **anon key only** + a signed-in session. **No service-role key** is shipped in the app.
- Row Level Security isolates every user's rows (`auth.uid() = user_id`); default deny, no anonymous/public access.
- All synced records are user-owned; no PII is shared across users.

## Beta Metadata Notes
- The current beta includes placeholder privacy policy and terms URLs in Expo `extra` values. These are documented for review but should be replaced with real public URLs before App Store / Play Store submission.
- Support email is also a placeholder value and should be updated with a valid support address before production.
