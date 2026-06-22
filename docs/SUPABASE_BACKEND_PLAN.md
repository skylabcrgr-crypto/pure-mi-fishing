# Supabase Backend Plan (Phase 7)

> Lowest-cost MVP backend for Pure MI Fishing. **Offline-first is non-negotiable** — the app must work with no backend, no account, no network. Supabase adds *optional* cloud backup on top.

## 1. Why Supabase Free

| Need | Choice | Why |
| --- | --- | --- |
| Auth | Supabase Auth (email/password) | Free, batteries-included, RN SDK |
| Database | Supabase Postgres | Free tier sufficient for MVP volume |
| Authorization | Row Level Security | Per-user isolation enforced in DB |
| File storage | Supabase Storage | Deferred — enable later for photos |

**Explicitly rejected for MVP:** Railway / custom Node/Express API, paid weather/AI APIs, server-side map tile hosting, push notifications.

## 2. Architecture

```
On-device (source of truth)            Supabase (optional mirror)
┌──────────────────────────┐           ┌──────────────────────────┐
│ SQLite                   │  push →    │ Postgres (RLS per user)  │
│  • catch_log             │  upsert    │  • catch_logs            │
│  • citizen_reports       │  on        │  • citizen_reports       │
│  • emergency_incidents   │  syncNow() │  • emergency_incidents   │
│ AsyncStorage             │            │  • trips                 │
│  • trips, logbook        │            │  • profiles, sync_events │
└──────────────────────────┘           └──────────────────────────┘
```

- **One-way (push) sync** for MVP. Pull/merge is deferred.
- Records carry a client-generated `id` stored as `client_id`. Re-syncs are **idempotent** via `ON CONFLICT (user_id, client_id)`.
- Sync runs **only** when: backend configured **and** user signed in **and** the network call succeeds.

## 3. Environment Variables (mobile)

Defined in `mobile/.env.example`. All optional.

| Var | Required for backup | Notes |
| --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | yes | Project API URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | yes | Public anon key — safe in client (RLS enforces) |
| `EXPO_PUBLIC_APP_ENV` | no | `development` \| `preview` \| `production` |
| `EXPO_PUBLIC_DATA_PACK_BASE_URL` | no | Static offline pack host (see §6) |

> **Never** put a Supabase service-role key in the mobile app or `.env`. The app uses the anon key + a signed-in session only.

## 4. Schema & RLS

Full SQL lives in [`supabase/schema.sql`](../supabase/schema.sql). Apply via Supabase Studio → SQL Editor → Run.

Tables: `profiles`, `trips`, `catch_logs`, `citizen_reports`, `emergency_incidents`, `sync_events`.

RLS summary (every table, default deny):
- `profiles`: user reads/updates only their own row; auto-created on sign-up via `handle_new_user` trigger.
- `trips`, `catch_logs`, `citizen_reports`, `emergency_incidents`, `sync_events`: `auth.uid() = user_id` for all operations.
- **No anonymous/public read access.** Admin/agency review is out of scope.

## 5. Client Modules

| File | Responsibility |
| --- | --- |
| `mobile/src/lib/supabase.ts` | Lazy client. `isSupabaseConfigured()`, `getSupabase()` (null when unconfigured — never throws), `getSupabaseConfigSummary()`. Session persisted to AsyncStorage. |
| `mobile/src/services/authService.ts` | `signUpWithEmail`, `signInWithEmail`, `signOut`, `getCurrentUser`, `getSession`, `resetPassword`, `isAuthConfigured`. All return structured results; never throw. |
| `mobile/src/services/syncService.ts` | `syncNow()` (push all pending), `getPendingCounts()`. Marks synced on success; increments attempts + preserves local on failure; never deletes local data. |
| `mobile/app/sync-status.tsx` | Diagnostics + manual "Sync Now" UI. Reachable from Settings → Sync & Backup. |

## 6. Static Data Packs (documented, not built)

Offline reference data (access points, regulations) can be hosted as **static JSON** on a free CDN (e.g. Cloudflare Pages) — no server required:

```
{EXPO_PUBLIC_DATA_PACK_BASE_URL}/packs/detroit-river/v1/pack_manifest.json
{EXPO_PUBLIC_DATA_PACK_BASE_URL}/packs/detroit-river/v1/access_points.json
{EXPO_PUBLIC_DATA_PACK_BASE_URL}/packs/detroit-river/v1/regulations.json
```

The app ships these bundled today; remote refresh is a later enhancement.

## 7. Deferred (NOT this phase)

- Two-way sync (pull + conflict resolution)
- Photo upload to Supabase Storage (private per-user bucket)
- Real weather/USGS/NOAA API integration (still offline mocks)
- Auth UI (sign-up/sign-in screens) — service layer only for now
- Push notifications, agency dashboard, store submission, production marketing

## 8. Manual Acceptance

1. App boots offline with **no** env vars → works, Settings → Sync & Backup shows "not configured".
2. Create a trip/catch/report offline → still saves locally.
3. Tap "Sync Now" offline / signed out → friendly message, **no crash**, local data intact.
4. With env vars + signed-in user → pending records upload; failures retry next run.
5. `npx tsc --noEmit` → exit 0.
