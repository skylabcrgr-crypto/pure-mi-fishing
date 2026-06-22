# Pure MI Fishing — Launch & Testing Checklist

> **Status:** Backend = **Supabase Free only** (Auth + Postgres + RLS). Offline-first; backend is optional cloud backup. Phase: **Beta Readiness / Pre-Launch Testing**.

## Phase 8 Beta Readiness
- [ ] Confirm offline-first behavior with no Supabase env vars configured
- [ ] Verify offline data persistence: trips, catches, emergency incidents, report drafts
- [ ] Confirm location permission handling and Emergency Mode fallback
- [ ] Confirm `mobile/app.json` includes iOS location usage descriptions and Android location permissions
- [ ] Confirm `mobile/eas.json` production profile is valid for App Store / internal testing
- [ ] Confirm `mobile/package.json` includes `typecheck` and `smoke-check` scripts
- [ ] Run `yarn typecheck` or `npx tsc --noEmit` from `mobile/`
- [ ] Run `yarn smoke-check` or `node mobile/scripts/smoke-check.mjs`
- [ ] Confirm main screens render without crashes on iOS and Android

## Documentation
- [ ] Create `docs/BETA_TEST_PLAN.md`
- [ ] Create `docs/QA_TEST_MATRIX.md`
- [ ] Create `docs/APP_STORE_PREP.md`
- [ ] Create `docs/PRIVACY_AND_SAFETY_NOTES.md`
- [ ] Update `docs/KNOWN_LIMITATIONS.md` with current beta limitations
- [ ] Keep `docs/BETA_ACCEPTANCE_CRITERIA.md` current with actual scope and deferred features

## App Store / Release Prep
- [ ] Confirm bundle identifier: `com.skylabcreativegroup.puremifishing`
- [ ] Confirm app package name: `com.skylabcreativegroup.puremifishing`
- [ ] Confirm version/build metadata is set for initial beta
- [ ] Confirm screenshot and metadata preparation for TestFlight and Android internal track
- [ ] Confirm support and privacy placeholders are documented and ready for replacement

## Known Acceptable Beta Limitations
- [ ] Regulation guidance remains sample/advisory only
- [ ] Report photo attachment is deferred
- [ ] Two-way sync and auth UI are deferred beyond beta
- [ ] Offline map tile caching is deferred

## Notes
- The app currently supports optional Supabase backup with push-only sync.
- The app should be stable and functional without network or backend configuration.
- This checklist is the final validation before internal distribution.
