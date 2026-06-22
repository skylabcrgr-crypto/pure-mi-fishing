# Beta Test Plan — Pure MI Fishing

## Purpose
This plan guides Phase 8 beta readiness testing for the Pure MI Fishing mobile app. It focuses on verifying offline-first behavior, safe Supabase backup handling, navigation stability, and launch-prep documentation.

## Test Setup
- Install app from the `mobile` workspace by running `expo prebuild` / `expo start` or a local EAS preview.
- Use both iOS and Android devices if available.
- Confirm the app runs with and without Supabase env vars.
- Use a fresh app install or reset local storage when needed.

## Test Environments
- Online with Supabase configured
- Online with Supabase not configured
- Airplane mode / offline
- GPS permission allowed
- GPS permission denied

## Key Test Flows

### 1. App Boot and Core Navigation
- Launch the app online and verify the home screen appears.
- Launch the app offline and verify it still opens and shows offline-ready status.
- Navigate to Explore, Trips, Profile, and Settings.
- Open `Emergency Mode`, `Report a Problem`, and `Sync & Backup` screens.

### 2. Offline Data Persistence
- Start a trip offline.
- Log a catch offline and verify it persists after app restart.
- Open the offline packs screen and confirm that downloaded pack state is visible.
- Verify that no crashes occur if network is unavailable.

### 3. Emergency Mode
- Open Emergency Mode with GPS allowed.
- Verify coordinates and last known location are shown.
- Save an emergency contact and confirm it is stored.
- Send/copy the generated emergency message.
- Open Emergency Mode with GPS denied and verify fallback location behavior.

### 4. Citizen Report Workflow
- Open the Report a Problem screen.
- Select a report type, set anonymous mode, and save a draft.
- Confirm the draft displays in history.
- Delete a draft and confirm removal.
- Verify report saves locally when Supabase is not configured.

### 5. Sync & Backup Validation
- Open Sync & Backup screen with no Supabase env vars configured.
- Confirm the screen shows "not configured".
- If possible, configure Supabase env vars and sign in.
- Run Sync Now and verify sync attempts do not crash when offline or signed out.
- Confirm local data is preserved when sync fails.

### 6. Permissions and Disclaimer Checks
- Confirm location permission prompts are shown on first use.
- Confirm emergency and report screens show appropriate disclaimers.
- Verify regulation-related screens clearly label sample guidance.

## Acceptance Criteria
- App launches successfully on iOS and Android.
- Offline flows work without network access.
- Supabase config absence is handled safely.
- Local draft and emergency data remain intact after restart.
- Critical screens render without crashing.
- Documentation files created and available under `docs/`.
