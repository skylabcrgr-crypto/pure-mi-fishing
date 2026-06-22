# Pure MI Fishing — Launch & Testing Checklist

> **Status:** Backend = **Supabase Free only** (Auth + Postgres + RLS). No Railway / custom API. Offline-first; backend is optional cloud backup. Phase: **Pre-Launch Integration Testing**.
> See [`SUPABASE_BACKEND_PLAN.md`](./SUPABASE_BACKEND_PLAN.md) and [`../supabase/schema.sql`](../supabase/schema.sql).

## Phase 7 Backend Readiness (complete)
- [x] `supabase/schema.sql` written (tables + per-user RLS, default deny)
- [x] `mobile/.env.example` documents `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_APP_ENV`, `EXPO_PUBLIC_DATA_PACK_BASE_URL`
- [x] `supabase.ts` / `authService.ts` / `syncService.ts` / `sync-status.tsx` created
- [x] App verified to boot + save data with NO env vars (offline-first)
- [x] No service-role key in mobile app
- [ ] Apply `schema.sql` to a Supabase project (run in Studio SQL editor)
- [ ] Add real env vars to EAS build profiles before store submission

[Document content - see details in workspace folder]

This comprehensive 6-phase checklist covers:
- Phase 1: Backend Integration & Configuration
- Phase 2: Mobile App Testing
- Phase 3: Web & Deployment
- Phase 4: Pre-Launch Testing
- Phase 5: App Store / Play Store Release
- Phase 6: Post-Launch Monitoring

For the full document, open: docs/LAUNCH_CHECKLIST.md
