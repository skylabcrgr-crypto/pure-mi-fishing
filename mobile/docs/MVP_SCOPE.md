# Pure MI Fishing — MVP Scope

> What is real, what is mocked, and what comes next.

---

## Status Key

| Symbol | Meaning |
|---|---|
| ✅ Real | Works today. Real data, real logic, real storage. |
| 🟡 Simulated | Logic is real; data is seeded/mock. Ready for real API swap. |
| 🔴 Stub | Placeholder only. Future implementation. |

---

## What Is Real (ships in MVP)

### Navigation & Architecture
- ✅ Expo Router file-based navigation — all routes resolve
- ✅ Deep-link scheme `puremi://` (app.json)
- ✅ Stack + Tab navigator wired, transitions working
- ✅ Onboarding gate — checks `AsyncStorage` on cold start
- ✅ TypeScript strict mode — zero `tsc --noEmit` errors

### Local-First Data
- ✅ 4 seeded waterbodies (Detroit River, Belle Isle, Trenton Channel, Lake St. Clair edge)
- ✅ 6 seeded launch sites with coordinates, amenities, hours, fee data
- ✅ 7 species records with 2025–26 regulation summaries
- ✅ 5 regulation rules with DISCLAIMER constant
- ✅ 3 offline pack records (sizes, coverage, region metadata)
- ✅ 7 map pins (4 launches, 2 hotspots, 1 shore access) with coordinates

### State Management (Zustand + AsyncStorage)
- ✅ `useAppStore` — preferences, onboarding, saved waterbodies/launches
- ✅ `useTripsStore` — trip history (start/end/delete), persisted
- ✅ `useLogbookStore` — catch entries (add/delete), persisted with `@puremi/logbook` key
- ✅ Offline pack download **simulation** — `setInterval` progress updates, stored to Zustand

### UI
- ✅ Design token system (`tokens.ts`) — 10+ color groups, typography, spacing, shadow, gradient
- ✅ Badge, Button (5 variants), GlassCard, SectionHeader
- ✅ LaunchCard, TripCard, OfflinePackCard (with progress bar)
- ✅ All haptic feedback on button press (expo-haptics)
- ✅ All LinearGradients correctly typed as tuples (TS4 compatible)

### Screens
- ✅ Onboarding — 3-card horizontal FlatList, CTA to tabs
- ✅ Explore — dark MapView, 7 pins, bottom sheet, filter chips, offline CTA
- ✅ Conditions — weather/water grid, alert cards, pull-to-refresh
- ✅ Logbook — add-catch form (modal), stored locally
- ✅ Profile — license CTA → michigan.gov/dnr
- ✅ Waterbody detail — hero gradient, regulations, launches, conditions
- ✅ Launch detail — teal hero, 3-stat cards, Apple Maps deep link
- ✅ Trip Mode — full-screen dark UI, emergency DNR RAP line
- ✅ License screen — 2025 fee table, DNR handoff
- ✅ Offline Packs screen — download simulation with progress
- ✅ Settings screen — text size, contrast, units, data clear

---

## What Is Mocked / Simulated

### Weather & Water Conditions
- 🟡 **Weather data** (`weatherService.ts`) — returns hardcoded snapshot: 68°F, WSW 12 mph, 55% humidity, cloudy
  - TODO: `https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}`
  - Free tier: 60 calls/min, no credit card required

- 🟡 **Water conditions** (`usgsService.ts`) — returns hardcoded gauge data: 74.8°F, 8.2 ft, clear
  - TODO: `https://waterservices.usgs.gov/nwis/iv/?sites=04165500&parameterCd=00060,00065,00010&format=json`
  - USGS NWIS is free, no API key required
  - Detroit River gauge: `04165500`

- 🟡 **NOAA alerts** (`noaaService.ts`) — returns 3 hardcoded alerts: water quality advisory, emergency closure, steelhead note
  - TODO: `https://api.weather.gov/alerts/active?point={lat},{lon}` (no key)
  - TODO: `https://api.weather.gov/points/{lat},{lon}` for zone lookup

- 🟡 **DNR service** (`dnrService.ts`) — returns same seeded data as `src/data/`
  - TODO: Michigan Open Data portal SODA APIs (experimental, no key)
  - More practical: scrape `michigan.gov/dnr/fishing-guide` + cache in Supabase

### Offline Pack Downloads
- 🟡 Simulated `setInterval` progress animation in `useAppStore.startPackDownload()`
  - Marks pack as `downloaded: true` after ~5s with `lastUpdated` timestamp
  - **Real implementation**: MapLibre GL JS + `expo-file-system` tile cache, or Mapbox Offline SDK

---

## What Is Stubbed / Not Yet Built

### Community Features
- 🔴 **Community Reports** — "Coming later" UI label in Logbook tab
  - Design: users opt-in to share catches as anonymous pins on Explore map
  - Tech path: Supabase real-time table + Row-Level Security

### Social / Leaderboard
- 🔴 Season leaderboard (species, count, size)
- 🔴 "Top catcher" badges per waterbody

### Real Offline Map Tiles
- 🔴 MapLibre `offline-regions` / Mapbox offline SDK
  - Current: MapView connected to Apple Maps online (data-hungry)
  - Production path: vector tile server (e.g., Protomaps PMTiles hosted on Cloudflare R2)

### Push Notifications
- 🔴 DNR emergency closure alerts
  - Stack: Expo Push Notifications + Supabase Edge Function cron → Expo push token

### Auth
- 🔴 No accounts yet — everything is anonymous device-local
  - If needed: Supabase Auth (email magic link or Apple Sign-In)

### Fish ID
- 🔴 Camera → species identification
  - Option: Google ML Kit on-device classification or custom CoreML model

---

## Architecture Decisions

| Decision | Rationale |
|---|---|
| StyleSheet over NativeWind | More predictable on SDK 56; NativeWind v4 configured but StyleSheet is primary |
| Zustand over Redux | Minimal boilerplate, AsyncStorage middleware fits naturally |
| AsyncStorage over SQLite | SQLite scope creep; AsyncStorage is fine for MVP catch volume |
| Mock services as separate files | Clean swap path — real API replaces only the return value |
| Expo Router over React Navigation | File-based is simpler for a single-dev MVP; deep links built-in |
| `--legacy-peer-deps` | React DOM version mismatch from Expo SDK 56 ecosystem |

---

## Real API Endpoints Ready to Wire

Once you're ready to go live, swap these service files:

```
src/services/weatherService.ts  → OpenWeatherMap free tier
src/services/noaaService.ts     → api.weather.gov (no key)
src/services/usgsService.ts     → waterservices.usgs.gov (no key)
src/services/dnrService.ts      → Michigan Open Data SODA
```

Each file has a `// TODO: replace with real API` comment at the mock return statement.

---

## Cost Estimate (MVP Live)

| Service | Cost |
|---|---|
| OpenWeatherMap | Free (60 req/min) |
| NOAA NWS API | Free (federal) |
| USGS NWIS | Free (federal) |
| Expo push notifications | Free up to 1M/mo |
| Apple Developer (iOS) | $99/yr |
| Cloudflare R2 (tiles) | ~$0.01/GB storage |
| Supabase (if community features) | Free up to 500MB DB |
| **Total launch cost** | **~$99/yr** |

---

## Next Sprint Candidates

1. **Wire NOAA + USGS** — replace mock data with live calls (free, no key, 2–3 hours)
2. **Wire OpenWeatherMap** — sign up, add key to `.env`, 30 min
3. **Offline tiles** — Protomaps PMTiles + MapLibre, ~1 day
4. **Community catches** — Supabase schema + opt-in toggle in Logbook, ~2 days
5. **Apple App Store submission** — EAS Build + TestFlight, ~4 hours
