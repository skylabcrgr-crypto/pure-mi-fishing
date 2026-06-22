# Pure MI Fishing — Beta Acceptance Criteria

> Phase 8 Reference · June 2026

---

## Definition of Done for Beta Launch

All items below must pass before the app is submitted to TestFlight or Google Play Internal Track.

---

## Core Offline Functionality

- [ ] App can be opened in airplane mode after data pack download
- [x] Detroit River pack download status is visible on the Offline Packs screen (Phase 3)
- [x] Detroit River pack shows version, downloaded date, and layer breakdown (Phase 3)
- [ ] User can view Detroit River regulation rules offline (no network required)
- [ ] User can start a trip offline (trip saved to SQLite/AsyncStorage)
- [ ] User can log a catch offline (catch saved to SQLite)
- [ ] App does not crash when all API services return errors or timeouts
- [ ] Offline status indicator ("Offline Ready" / "No Connection") displays correctly
- [ ] App resumes correctly after backgrounding for 5+ minutes

---

## Regulation Engine

- [ ] Regulation rules load for Detroit River without internet
- [ ] Season status (Open / Closed / Restricted) reflects the current date correctly:
  - Walleye is open May 1 – March 15 (cross-year)
  - Smallmouth Bass is open June 1 – November 30
  - Yellow Perch is open all year
  - Muskellunge is open June 7 – December 31
- [ ] Placeholder regulation data is clearly marked as "sample — not official until verified"
- [ ] Every regulation shows source URL + last verified date
- [ ] No regulation screen shows data without the standard DNR disclaimer

---

## Map and Access Points

- [x] Explore map shows all 9 Detroit River Corridor access point pins (Phase 3)
- [x] Boat launches, shore access, and emergency resource points are visible (Phase 3)
- [x] Map falls back to Detroit River center if GPS permission denied (Phase 3 — via useLocation)
- [x] Tapping a pin shows name, type, fee, hours, notes (Phase 3 — AccessPointDetailCard)
- [x] Saved spots are stored and visible on map (Phase 3 — filter chip + AsyncStorage)

---

## Smart Fishing Intelligence

- [x] User can request a fishing recommendation for Detroit River
- [x] Output is clearly labeled "Condition-Based Fishing Guidance"
- [x] At least one recommended species returned for any date
- [x] Confidence level (Low / Medium / High) displayed
- [ ] Recommendation updates when conditions snapshot changes (requires live API — Phase 6+)
- [x] Works fully offline using cached weather/water snapshots

---

## Emergency Mode

- [x] Emergency Mode is accessible from the trip-mode screen in one tap
- [x] Emergency screen shows current GPS coordinates (or last known if GPS fails)
- [x] Last known location + timestamp visible
- [x] Nearest access/resource point from local data is displayed
- [x] Emergency contact (name + phone) can be stored in app
- [x] Generated SMS message shown with copy/share button
- [x] Emergency incident saved to SQLite offline
- [x] Disclaimer visible: "This app does not replace emergency services. Call 911 for life-threatening emergencies."
- [x] Emergency Mode is accessible even in airplane mode
- [ ] Battery level shown — deferred (expo-battery not installed)

---

## Citizen Reports

- [x] User can open a "Report a Problem" screen
- [x] All 13 report types are selectable
- [x] GPS location auto-fills from current position
- [x] Report saves as draft offline
- [x] Draft reports visible in "My Reports" history tab
- [x] Anonymous flag is respected
- [x] User can delete a local draft report
- [x] Report uploads via Sync & Backup when Supabase configured + signed in (Phase 7, push-only)
- [ ] Photo attachment — deferred (no ImagePicker installed)

---

## Sync and Backend

> Backend = **Supabase Free** (Auth + Postgres + RLS). Optional cloud backup; app is fully offline-first. Sync is **push-only** for MVP.

- [x] App boots and works with NO backend env vars configured
- [x] Local data still saves offline (SQLite + AsyncStorage) regardless of backend
- [x] Sync & Backup screen opens (Settings → Sync & Backup)
- [x] Screen shows "not configured" when Supabase env vars are missing
- [x] "Sync Now" does not crash offline / signed out / on request failure
- [x] When configured + signed in + online: trips, catches, citizen reports, emergency incidents upsert to Supabase
- [x] Failed sync preserves local data and increments the attempt counter (never deletes local)
- [x] Per-user Row Level Security (users access only their own rows)
- [x] No service-role key shipped in the mobile app
- [ ] Two-way (pull/merge) sync — deferred to a future phase
- [ ] Auth UI (sign-up/sign-in screens) — deferred (service layer only)

---

## Performance and Quality

- [ ] App cold starts in < 3 seconds on iPhone 12 or newer
- [ ] Map renders within 2 seconds of Explore tab open
- [ ] No TypeScript errors (`tsc --noEmit` passes with zero errors)
- [ ] No lint errors in changed files
- [ ] All existing screens render without crashing

---

## Legal and Compliance

- [ ] Privacy Policy URL set in app.json
- [ ] Terms of Service URL set in app.json
- [ ] Regulation disclaimer shown on every regulation display
- [ ] "Sample data" warning shown for all unverified regulation rules
- [ ] Emergency Mode disclaimer visible and non-dismissable
- [ ] Citizen report anonymous flag defaults to `true`

---

## App Store Readiness

- [ ] App icon (1024×1024) present in assets/
- [ ] Splash screen configured in app.json
- [ ] `bundleIdentifier` set: `com.skylabcreativegroup.puremifishing`
- [ ] `scheme` set: `puremi`
- [ ] `eas.json` production profile configured
- [ ] EAS build succeeds on iOS (`.ipa`)
- [ ] EAS build succeeds on Android (`.aab`)
- [ ] App tested on physical iOS device before submission
- [ ] App Store metadata prepared (name, description, keywords, screenshots)
- [ ] App Review notes written and ready

---

## Known Acceptable Limitations for Beta

The following are **known limitations acceptable for the initial beta** — they do not block
TestFlight distribution:

- Regulation data is sample/placeholder — not yet officially verified for 2025-26 season
- Offline map tiles are react-native-maps online tiles (PMTiles offline deferred to Sprint 4)
- Weather data may be mock/cached rather than live
- Water condition data may be mock/cached rather than live
- Backend sync is not required for TestFlight — local-only mode is acceptable
- Community features (real-time citizen report feed) not included in beta
- Fish ID (ML Kit) not included

These limitations must be documented in `docs/KNOWN_LIMITATIONS.md` before beta submission.
