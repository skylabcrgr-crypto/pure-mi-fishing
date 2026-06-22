# Backend Setup Checklist — Pure MI Fishing

Quick reference checklist for setting up Supabase backend.

## Pre-Setup
- [ ] Supabase account created at [https://supabase.com](https://supabase.com)
- [ ] GitHub/Google login ready (for Supabase sign-in)

## Supabase Project Creation
- [ ] New Supabase project created
- [ ] Project name: `pure-mi-fishing`
- [ ] Region selected (closest to users)
- [ ] Database password saved securely
- [ ] Project provisioning complete (2–3 minutes)

## API Credentials (Copied & Stored)
- [ ] `EXPO_PUBLIC_SUPABASE_URL` copied from Settings → API → "URL"
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` copied from Settings → API → "anon, public"
- [ ] Service-role key **NOT** shared or used in mobile app
- [ ] Both credentials stored in secure password manager (not Git)

## Database Schema Applied
- [ ] `supabase/schema.sql` copied into Supabase Studio → SQL Editor
- [ ] SQL executed successfully (no errors)
- [ ] All 6 tables created:
  - [ ] `profiles`
  - [ ] `trips`
  - [ ] `catch_logs`
  - [ ] `citizen_reports`
  - [ ] `emergency_incidents`
  - [ ] `sync_events`

## RLS (Row Level Security) Verified
- [ ] Authentication → Policies shows policies for each table
- [ ] Each policy restricts data to `auth.uid() = user_id`
- [ ] Default deny is enforced (users can only access their own data)

## Test User Created
- [ ] Test user created in Supabase Studio → Authentication → Users
- [ ] Test email: `test@example.com` (or similar)
- [ ] Test password saved for testing
- [ ] User ID copied and noted

## Mobile App Configuration (Local Development)
- [ ] `mobile/.env` created (copy of `.env.example`)
- [ ] `EXPO_PUBLIC_SUPABASE_URL` filled in
- [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY` filled in
- [ ] `EXPO_PUBLIC_APP_ENV` set to `development`
- [ ] `.env` file is in `.gitignore` (never commit credentials)

## Local Development Test
- [ ] `npm start` runs without errors from `mobile/`
- [ ] App launches on iOS or Android simulator
- [ ] Settings → Sync & Backup shows "Configured: Yes"
- [ ] Trip/catch can be created offline
- [ ] "Sync Now" attempts sync (may fail if not signed in, but no crash)

## EAS Secrets Configured (for Builds)
- [ ] `eas login` successful
- [ ] `eas secret:create` executed for `EXPO_PUBLIC_SUPABASE_URL`
- [ ] `eas secret:create` executed for `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `eas secret:create` executed for `EXPO_PUBLIC_APP_ENV` (optional)
- [ ] `eas secret:list` confirms all secrets present (values hidden)

## First EAS Build Prepared
- [ ] `mobile/app.json` version is `1.0.0`
- [ ] `mobile/app.json` iOS buildNumber is `1`
- [ ] `mobile/app.json` Android versionCode is `1`
- [ ] `npm run typecheck` passes (no TS errors)
- [ ] `npm run smoke-check` passes (all files present)

## First EAS Build Executed (Optional — Not Required Yet)
- [ ] `eas build --platform ios --profile preview` succeeded (or queued)
- [ ] `eas build --platform android --profile preview` succeeded (or queued)
- [ ] Build URLs received and ready for TestFlight/internal track
- [ ] `.ipa` and `.aab` ready for device testing

## Real Device Testing (Post-Build)
- [ ] App installed on real iOS device from TestFlight
- [ ] App installed on real Android device from internal track
- [ ] App launches without crash on both devices
- [ ] Settings → Sync & Backup shows "Configured: Yes"
- [ ] Offline functionality works (trip/catch creation)
- [ ] Sync works (if user is signed in)
- [ ] No data loss after app restart

## Sync Validation (Post-Launch)
- [ ] Trip created and synced → appears in Supabase `trips` table
- [ ] Catch logged and synced → appears in Supabase `catch_logs` table
- [ ] Report created and synced → appears in Supabase `citizen_reports` table
- [ ] Emergency incident triggered and synced → appears in Supabase `emergency_incidents` table
- [ ] Sync events logged → appears in Supabase `sync_events` table (optional)

## Future Work (Beyond Phase 9)
- [ ] Auth screens added (sign-up/sign-in UI)
- [ ] Users can authenticate and stay signed in
- [ ] Photo upload enabled (requires Supabase Storage)
- [ ] Real weather/USGS/NOAA APIs integrated (currently mocked)
- [ ] Two-way sync implemented (pull + merge, currently push-only)

---

## Quick Reference: Key Credentials

Keep these in a secure location (password manager, not Git):

```
Project Name: pure-mi-fishing
Project URL: https://YOUR_PROJECT_ID.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service-Role Key: (DO NOT USE IN MOBILE APP)
Test User Email: test@example.com
Test User Password: (stored securely)
Test User ID: (UUID from Supabase)
```

---

## Quick Reference: Env Vars for EAS Build

Before running `eas build`, ensure these secrets are set:

```bash
eas secret:list
```

Should show:
- `EXPO_PUBLIC_SUPABASE_URL` ✓
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` ✓
- `EXPO_PUBLIC_APP_ENV` ✓ (optional but recommended)

---

## Troubleshooting Quick Links

- Can't access Supabase Studio? Check browser cookies/logout & re-login
- Schema not applying? Run in SQL Editor, confirm "Run" button, check for syntax errors
- Sync failing? Check user is signed in, check network is online, check RLS policies exist
- Build failing? Check `eas secret:list`, confirm secrets are set, re-run `npm run typecheck`
