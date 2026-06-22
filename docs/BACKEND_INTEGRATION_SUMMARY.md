> ## ⚠️ SUPERSEDED BY PHASE 7 (Supabase-only)
>
> The MVP backend is **Supabase Free** (Auth + Postgres + RLS) — **no Railway / custom Node API**.
> See the current plan: [`SUPABASE_BACKEND_PLAN.md`](./SUPABASE_BACKEND_PLAN.md) and schema [`../supabase/schema.sql`](../supabase/schema.sql).
>
> **Implemented in Phase 7:**
> - `mobile/src/lib/supabase.ts` (graceful client) · `mobile/src/services/authService.ts` · `mobile/src/services/syncService.ts` · `mobile/app/sync-status.tsx`
> - Env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_APP_ENV`, `EXPO_PUBLIC_DATA_PACK_BASE_URL` (see `mobile/.env.example`).
> - **Offline-first:** app runs with no backend/account/network. Sync is push-only and optional. Service-role keys are **never** in the mobile app.
> - **Deferred:** pull/merge sync, photo upload, real weather/USGS/NOAA calls, auth UI.
>
> The Railway-based notes below are historical and retained for reference only.

---

# Backend Integration — Quick Start (72 Hours)

## Critical Path Summary

### Hour 0–8: Environment Setup
1. Create `.env.production` with Railway, Supabase, API keys
2. Add `EXPO_PUBLIC_*` variables to mobile/.env  
3. Test backend health: `curl $BACKEND_URL/api/health`

### Hour 8–24: Service Integration
1. **Supabase Client** → mobile/src/services/supabaseClient.ts
2. **Auth Service** → Real sign up/sign in with Supabase
3. **Weather API** → Replace mock with OpenWeatherMap
4. **Trip Sync** → Upload trips to backend, sync on reconnect

### Hour 24–72: Testing & Validation
- Auth flow: sign up → verify email → sign in ✓
- Weather: fetch real data from OpenWeatherMap ✓
- Trips: create offline, sync online ✓
- Error handling: test fallbacks

## Database Schema (SQL)
```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  waterbody_id TEXT,
  start_time TIMESTAMP,
  cr  cr  cr  cr  cr  cr  cr  cr  cr  cr  cr  cr  cr  ca  cr  cr  cr  cr  cr  cr  cr  cr  cr  cr  cr  crat  cr  cr  cr  cr  UUID REF  cr  cr  cr  cr  cr  cr  cr  EXT,
  weight_lbs FLOAT
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only read own triCREATE POLICY "Users can only read own triCREATE POLI);
CREATE POLICY "Users can only read [ CREATE POLICY "Users can only read [ CREATE POLICY "Users can oasCREATE POLICY "Users can only read [ CREATE POLICY "UsersinCREATE POLICY "Users can only read [ CREATE POLICY "Usync tested
- [ ] Error tracking (Sentry) set up
- [ ] CI/CD trigger- [ ] CI/CD trigger- [ ] CI/CD tri Follow BACKEND_INTEGRATION.md for full step-by-step
2. Tes2. Tes2. Tes2. Tes2. Tes2. Tes2. Tes2. Tes2. Tes2tHub (triggers auto-deploy)
4. Proceed to Phase 2: Mobile Testing

**Estimated Time:** 26 hours → Ready by June 21, 2026
