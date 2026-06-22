# Exact Supabase Backend Setup — Pure MI Fishing

> Phase 9+ Reference · June 2026  
> Step-by-step instructions to set up the Supabase backend for Pure MI Fishing. Supabase is **optional** — the app is fully functional offline without it.

---

## Overview

Pure MI Fishing uses **Supabase Free** (Auth + Postgres + RLS) as an optional backend. This setup guide takes you from zero to a fully configured Supabase project ready for the mobile app.

### Key Principles
- **Offline-first:** App works without Supabase. Backend is cloud backup only.
- **Push-only sync:** App uploads (upserts) data when online + signed in. No pull/merge.
- **Row-level security:** Each user can only access their own data. Default deny.
- **Anon key only:** Mobile app never uses service-role key. Security via RLS + auth session.

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **Sign Up** or **Sign In**
3. Choose **Create New Project**
4. Fill in:
   - **Project name:** `pure-mi-fishing` (or similar)
   - **Database password:** Generate a strong password (store securely)
   - **Region:** Choose closest to your users (e.g., `us-east-1` for Michigan)
   - **Pricing plan:** Free tier (sufficient for MVP)
5. Click **Create New Project**
6. Wait 2–3 minutes for provisioning to complete

**Note:** You'll receive email with database credentials. Keep these secure.

---

## Step 2: Get Your API Credentials

1. In Supabase Studio, go to **Settings** (gear icon) → **API**
2. Copy these two values:
   - **Project URL** (labeled "URL") → This is `EXPO_PUBLIC_SUPABASE_URL`
   - **Anon key** (labeled "anon, public") → This is `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Example:
```
EXPO_PUBLIC_SUPABASE_URL=https://abc123def456.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT:** Keep these credentials in a secure location. The anon key is safe to ship in the mobile app (RLS enforces permissions), but the service-role key must NEVER be in the app.

---

## Step 3: Create the Database Schema

The app requires 6 tables with RLS policies. Apply the schema:

### Option A: Using Supabase Studio (Easiest)

1. In Supabase Studio, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql` from this repository
4. Paste into the SQL editor
5. Click **Run**
6. Wait for confirmation (should take ~10 seconds)
7. Go to **Table Editor** → Verify you see: `profiles`, `trips`, `catch_logs`, `citizen_reports`, `emergency_incidents`, `sync_events`

### Option B: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# From the project root:
cd supabase
supabase link --project-id YOUR_SUPABASE_PROJECT_ID
supabase db push
```

(Get your project ID from Supabase Studio → Settings → General)

---

## Step 4: Verify the Schema

1. Go to **Table Editor** in Supabase Studio
2. Confirm these tables exist:
   - `profiles` — user profiles (auto-created on sign-up)
   - `trips` — fishing trips
   - `catch_logs` — caught fish entries
   - `citizen_reports` — environmental reports
   - `emergency_incidents` — emergency mode records
   - `sync_events` — sync audit logs (optional)

3. Click each table and confirm columns match the schema (e.g., `trips` should have `user_id`, `client_id`, `title`, `start_time`, etc.)

4. Verify RLS is enabled on each table:
   - Go to **Authentication** → **Policies**
   - You should see policies like `trips_rw_own`, `catch_logs_rw_own`, etc.
   - Each policy should restrict data to `auth.uid() = user_id`

---

## Step 5: Test Authentication

1. In Supabase Studio, go to **Authentication** → **Users**
2. Click **Create New User**
3. Enter:
   - **Email:** `test@example.com`
   - **Password:** Any password
4. Click **Create User**
5. Note the **User ID** (a UUID like `abc123def456...`)

**Why:** This creates a test account you can use to verify the app works with authentication.

---

## Step 6: Configure the Mobile App

### Local Development (.env)

1. From the project root, go to `mobile/`
2. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
3. Edit `mobile/.env` and fill in:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://abc123def456.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   EXPO_PUBLIC_APP_ENV=development
   EXPO_PUBLIC_DATA_PACK_BASE_URL=
   ```
   (Leave `EXPO_PUBLIC_DATA_PACK_BASE_URL` empty for now — it's for static offline packs)

4. Save the file

### Test Locally

1. From `mobile/`, run:
   ```bash
   npm start
   ```
2. Launch on iOS or Android
3. Open Settings → Sync & Backup
4. Verify it shows "Configured" and your email (if available from session)
5. Create a trip and log a catch offline
6. Tap "Sync Now" — should succeed or show a friendly error
7. Go to Supabase Studio → **Table Editor** → `trips` → Verify the trip appears

---

## Step 7: Configure EAS Secrets (for EAS Preview/Production Builds)

When you build with `eas build`, the `.env` file is NOT automatically included. You must set secrets in EAS:

### Set Secrets in EAS

1. Install EAS CLI (if not already):
   ```bash
   npm install -g eas-cli
   ```

2. Log in:
   ```bash
   eas login
   ```

3. From the `mobile/` directory, set secrets:
   ```bash
   eas secret:create
   ```

4. When prompted, enter:
   - **Name:** `EXPO_PUBLIC_SUPABASE_URL`
   - **Value:** `https://abc123def456.supabase.co`

5. Repeat for the anon key:
   ```bash
   eas secret:create
   ```
   - **Name:** `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

6. Optional: Set app environment
   ```bash
   eas secret:create
   ```
   - **Name:** `EXPO_PUBLIC_APP_ENV`
   - **Value:** `preview` (or `production`)

### Verify Secrets

```bash
eas secret:list
```

You should see all three secrets listed (values hidden for security).

---

## Step 8: Build with EAS (Using Secrets)

From `mobile/`:

### First Preview Build (Internal Testing)

```bash
eas build --platform ios --profile preview
```

The build will automatically inject your EAS secrets into the environment. The app will connect to Supabase.

### Or Android

```bash
eas build --platform android --profile preview
```

### Or Both

```bash
eas build --platform all --profile preview
```

---

## Step 9: Test on Real Device

1. Install the app from TestFlight (iOS) or Google Play Internal Testing (Android)
2. Launch the app
3. Go to Settings → Sync & Backup
4. Verify it shows:
   - "Configured: Yes"
   - "Signed in: No" (because you haven't signed up/in yet)
5. Tap "Sign In" or "Sign Up" (if UI is available)
   - For now, this is a limitation — no auth screens in Phase 9
   - **Workaround:** Use Firebase Console or Supabase CLI to create a user, then the app can authenticate

### Workaround: Create User via Supabase CLI

```bash
supabase auth admin create-user \
  --email test@puremifishing.app \
  --password YourSecurePassword123 \
  --project-id YOUR_PROJECT_ID
```

Then in the app, sign in with these credentials (once auth UI is added).

---

## Step 10: Verify Sync Works

1. With the app installed and signed in:
2. Create a trip:
   - Trip Mode → Start Trip → Enter details → Save
3. Log a catch:
   - Same trip → Log Catch → Enter details → Save
4. Go to Sync & Backup
5. Tap "Sync Now"
6. Go to Supabase Studio → **Table Editor**:
   - Click `trips` → Verify your trip appears
   - Click `catch_logs` → Verify your catch appears

**If sync succeeds:** ✅ Backend is working!  
**If sync fails:** Check the app's Sync & Backup screen for error details. Common issues:
- User not authenticated (sign in first)
- Network offline (enable WiFi)
- Schema not applied (re-run step 3)
- Wrong credentials in `.env` (double-check step 6)

---

## Step 11: Optional — Enable Auth Screens (Future)

For now, the app has no sign-up/sign-in UI. To add:

1. Create `mobile/app/auth/sign-in.tsx` and `mobile/app/auth/sign-up.tsx`
2. Use `authService.signUpWithEmail()` and `authService.signInWithEmail()`
3. Add auth routes to `mobile/app/_layout.tsx`
4. Reference: `mobile/src/services/authService.ts` has all the methods ready

This is deferred to a future sprint but the backend is ready.

---

## Reference: Environment Variables

| Variable | Required | Value | Where Set |
|----------|----------|-------|-----------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes (for sync) | Project URL from step 2 | `.env` (local) or `eas secret:create` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes (for sync) | Anon key from step 2 | `.env` (local) or `eas secret:create` |
| `EXPO_PUBLIC_APP_ENV` | No | `development`, `preview`, or `production` | `.env` or `eas secret:create` |
| `EXPO_PUBLIC_DATA_PACK_BASE_URL` | No | Base URL for offline data packs (future) | `.env` or `eas secret:create` |

---

## Reference: Database Tables

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| `profiles` | User profiles (auto-created on sign-up) | `id` (UUID), `display_name`, `units` |
| `trips` | Fishing trips | `id`, `user_id`, `client_id`, `title`, `start_time`, `end_time` |
| `catch_logs` | Individual catches | `id`, `user_id`, `client_id`, `species_id`, `weight_lb`, `length_in`, `caught_at` |
| `citizen_reports` | Environmental reports | `id`, `user_id`, `client_id`, `report_type`, `latitude`, `longitude`, `is_anonymous` |
| `emergency_incidents` | Emergency mode records | `id`, `user_id`, `client_id`, `latitude`, `longitude`, `emergency_contact_name`, `emergency_contact_phone` |
| `sync_events` | Audit log of sync runs (optional) | `id`, `user_id`, `entity`, `pushed_count`, `failed_count`, `ran_at` |

All tables have **Row Level Security** enabled. Default: deny. Policies enforce `auth.uid() = user_id`.

---

## Reference: RLS Policies

Every user-owned table (trips, catch_logs, citizen_reports, emergency_incidents) has one RLS policy:

```sql
create policy "TABLE_rw_own"
  on public.TABLE for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

This means:
- ✅ User can SELECT, INSERT, UPDATE, DELETE only their own rows
- ❌ User cannot see other users' data
- ❌ Anonymous users cannot access any data

---

## Troubleshooting

### App says "Supabase not configured"
- Check `mobile/.env` exists and has `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Restart the dev server: `npm start`
- Or if using EAS build, verify secrets were set: `eas secret:list`

### Sync fails with "401 Unauthorized"
- User is not signed in. Auth screens are deferred.
- Workaround: Create a test user via Supabase Studio → Authentication → Users

### Sync fails with "permission denied" or data doesn't appear
- Schema might not be applied. Go to Supabase Studio → SQL Editor → Verify tables exist
- RLS policies might be misconfigured. Go to Authentication → Policies → Verify policies exist

### App crashes when opening Sync & Backup screen
- Schema might not be fully applied. Re-run `supabase/schema.sql` in SQL Editor.
- Or check `mobile/app/sync-status.tsx` for errors (run `npm run typecheck`)

### How do I know if my project is working?
- ✅ Supabase Studio loads without errors
- ✅ Table Editor shows 6 tables (profiles, trips, catch_logs, citizen_reports, emergency_incidents, sync_events)
- ✅ Authentication → Policies shows RLS policies for each table
- ✅ App opens Settings → Sync & Backup without crash
- ✅ Creating a trip/catch offline saves locally
- ✅ "Sync Now" attempts to sync (may fail if user not signed in, but should not crash)

---

## Next Steps After Setup

1. **Test on Real Devices** (see [docs/REAL_DEVICE_QA_CHECKLIST.md](REAL_DEVICE_QA_CHECKLIST.md))
2. **Add Auth Screens** (future sprint)
3. **Enable Photo Upload** (future sprint — requires Supabase Storage)
4. **Monitor Usage** (Supabase Studio → Analytics)

---

## Support

- Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase community: [https://discord.supabase.io](https://discord.supabase.io)
- Pure MI Fishing codebase:
  - Backend plan: `docs/SUPABASE_BACKEND_PLAN.md`
  - Schema: `supabase/schema.sql`
  - Mobile client: `mobile/src/lib/supabase.ts`, `mobile/src/services/authService.ts`, `mobile/src/services/syncService.ts`
