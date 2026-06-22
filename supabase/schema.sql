-- ============================================================================
-- Pure MI Fishing — Supabase Schema (Phase 7)
-- ============================================================================
-- Lowest-cost MVP backend. Supabase Free tier: Auth + Postgres + RLS.
--
-- DESIGN PRINCIPLES
--   * SQLite on-device remains the source of truth. This schema mirrors
--     local tables so records can be pushed (upserted) when online.
--   * Every user-owned row carries a `user_id` referencing auth.users.
--   * Row Level Security is enabled on every table. Default = deny.
--   * No anonymous/public access. No service-role logic in the mobile app.
--   * Client-generated UUID-like text ids are preserved as `client_id`
--     so re-syncs are idempotent (ON CONFLICT upsert).
--
-- TO APPLY
--   Paste into Supabase Studio → SQL Editor → Run, OR use the Supabase CLI:
--     supabase db push   (if using local migrations)
-- ============================================================================

-- ── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ============================================================================
-- profiles
-- ============================================================================
-- One row per authenticated user. Created on sign-up via trigger.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  units        text not null default 'imperial',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', null))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- trips
-- ============================================================================
create table if not exists public.trips (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  client_id      text not null,              -- on-device id (idempotent upsert key)
  title          text not null,
  waterbody_id   text,
  waterbody_name text,
  start_time     timestamptz not null,
  end_time       timestamptz,
  launch_id      text,
  launch_name    text,
  notes          text,
  is_active      boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.trips enable row level security;

drop policy if exists "trips_rw_own" on public.trips;
create policy "trips_rw_own"
  on public.trips for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- catch_logs
-- ============================================================================
create table if not exists public.catch_logs (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  client_id      text not null,
  trip_client_id text,                        -- links to trips.client_id
  species_id     text not null,
  species_name   text not null,
  length_in      real,
  weight_lb      real,
  method         text,
  bait           text,
  notes          text,
  waterbody_id   text,
  waterbody_name text,
  is_public      boolean not null default false,
  caught_at      timestamptz not null,
  created_at     timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.catch_logs enable row level security;

drop policy if exists "catch_logs_rw_own" on public.catch_logs;
create policy "catch_logs_rw_own"
  on public.catch_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- citizen_reports
-- ============================================================================
create table if not exists public.citizen_reports (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  client_id      text not null,
  report_type    text not null,
  latitude       double precision,
  longitude      double precision,
  waterbody_id   text,
  waterbody_name text,
  photo_uri      text,                        -- storage path (deferred)
  notes          text,
  is_anonymous   boolean not null default true,
  status         text not null default 'submitted',
  reported_at    timestamptz not null,
  created_at     timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.citizen_reports enable row level security;

drop policy if exists "citizen_reports_rw_own" on public.citizen_reports;
create policy "citizen_reports_rw_own"
  on public.citizen_reports for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- emergency_incidents
-- ============================================================================
create table if not exists public.emergency_incidents (
  id                          uuid primary key default gen_random_uuid(),
  user_id                     uuid not null references auth.users(id) on delete cascade,
  client_id                   text not null,
  latitude                    double precision,
  longitude                   double precision,
  last_known_latitude         double precision,
  last_known_longitude        double precision,
  last_known_at               timestamptz,
  battery_level               real,
  notes                       text,
  emergency_contact_name      text,
  emergency_contact_phone     text,
  nearest_access_point_id     text,
  nearest_access_point_name   text,
  nearest_access_distance_mi  real,
  status                      text not null default 'active',
  occurred_at                 timestamptz not null,
  created_at                  timestamptz not null default now(),
  unique (user_id, client_id)
);

alter table public.emergency_incidents enable row level security;

drop policy if exists "emergency_incidents_rw_own" on public.emergency_incidents;
create policy "emergency_incidents_rw_own"
  on public.emergency_incidents for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- sync_events  (optional — lightweight audit of sync runs)
-- ============================================================================
create table if not exists public.sync_events (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  entity        text not null,                -- 'trips' | 'catch_logs' | ...
  pushed_count  integer not null default 0,
  failed_count  integer not null default 0,
  ran_at        timestamptz not null default now()
);

alter table public.sync_events enable row level security;

drop policy if exists "sync_events_rw_own" on public.sync_events;
create policy "sync_events_rw_own"
  on public.sync_events for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================================
-- Indexes
-- ============================================================================
create index if not exists idx_trips_user            on public.trips(user_id);
create index if not exists idx_catch_logs_user       on public.catch_logs(user_id);
create index if not exists idx_citizen_reports_user  on public.citizen_reports(user_id);
create index if not exists idx_emergency_user        on public.emergency_incidents(user_id);

-- ============================================================================
-- NOTES
-- ============================================================================
-- * The mobile app only ever uses the ANON key + a signed-in session.
--   RLS guarantees a user can only touch their own rows.
-- * Photos (citizen_reports.photo_uri, future catch photos) are DEFERRED.
--   When enabled, create a private Storage bucket with per-user folder RLS.
-- * Admin / agency review dashboards are out of scope for this phase.
