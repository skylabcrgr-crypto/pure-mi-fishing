# Pure MI Fishing — Product Scope

> Version 1.0 · June 2026 · Skylab Creative Group

---

## Product Vision

Pure MI Fishing is an offline-first field companion for Michigan anglers.  
The product mission: **"Open the app at the river — even with poor service — and quickly see nearby fishing access, rules, target species, conditions, launches, and saved trip info."**

This is not a tackle store. Not a social platform. A field intelligence tool.

---

## MVP Targets

| Target | Status |
|---|---|
| Mobile app (iOS + Android) | ✅ Built — Expo SDK 56 |
| Marketing landing page | ✅ Built — Next.js 16 |
| App Store submission | ⏳ Sprint 2 |
| TestFlight beta | ⏳ Sprint 2 |
| Live API integrations | ⏳ Sprint 3 |

---

## Platform Targets

### Mobile App
- **iOS 16+** — iPhone 12 and later (primary)
- **Android 12+** — API level 32+ (secondary)
- **Expo Go** compatible for development testing
- **EAS Build** for production `.ipa` / `.apk`
- **Expo Router** deep links via `puremi://` scheme

### Landing Page
- Static site, deployable to Vercel / Netlify / Cloudflare Pages
- Mobile-first responsive design
- Core Web Vitals target: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## MVP Region

**Detroit River Corridor, Southeast Michigan**

| Access Point | Type | Coordinates |
|---|---|---|
| Belle Isle Fishing Area | Shore / carry-in | 42.3414° N, 82.9737° W |
| Detroit Shoreline Access | Shore / dock | 42.3314° N, 83.0457° W |
| Wyandotte Boat Ramp | Multi-lane ramp | 42.2098° N, 83.1513° W |
| Elizabeth Park Marina | Marina ramp | 42.1245° N, 83.1459° W |
| Trenton Channel | Multiple access points | 42.1400° N, 83.1800° W |
| Lake Erie Metropark Launch | Public ramp | 41.9800° N, 83.2200° W |

Target species: Walleye, Smallmouth Bass, Largemouth Bass, Yellow Perch, Muskellunge, Northern Pike, Steelhead

---

## Screen Inventory

### App Router Structure

| Route | Screen | Status |
|---|---|---|
| `/` | Redirect (onboarding gate) | ✅ |
| `/onboarding` | Onboarding carousel | ✅ |
| `/(tabs)/explore` | Map + launches + offline CTA | ✅ |
| `/(tabs)/trips` | Offline packs + saved spots + trip history | ✅ |
| `/(tabs)/conditions` | Weather + water dashboard | ✅ |
| `/(tabs)/logbook` | Catch log + add-catch modal | ✅ |
| `/(tabs)/profile` | License CTA + season stats + settings nav | ✅ |
| `/waterbody/[id]` | Waterbody detail — rules, launches, conditions | ✅ |
| `/launch/[id]` | Launch site detail + navigate + save | ✅ |
| `/trip-mode/[id]` | Full-screen field UI (glove-friendly) | ✅ |
| `/license` | License fee table + DNR handoff | ✅ |
| `/offline-packs` | Pack download manager | ✅ |
| `/settings` | Text size, contrast, units, data clear | ✅ |

---

## What Is Real (Ships in MVP)

### Navigation & Architecture
- Expo Router file-based navigation — all routes resolve
- Deep-link scheme `puremi://`
- Stack + Tab navigator, transitions working
- Onboarding gate — reads `AsyncStorage` on cold start
- TypeScript strict mode — zero `tsc --noEmit` errors

### Local-First Data
- 4 waterbodies: Detroit River, Belle Isle, Trenton Channel, Lake St. Clair edge
- 6 launch sites with coordinates, hours, amenities, fee data
- 7 species with 2025–26 regulation summaries
- 5 regulation rules with official disclaimer
- 3 offline pack definitions (sizes, coverage, metadata)
- 7 map pins for Explore map

### State Management
- `useAppStore` — preferences, onboarding, saved waterbodies/launches, offline packs
- `useTripsStore` — trip history (start/end/delete), 3 seeded demo trips
- `useLogbookStore` — catch entries (add/delete), persisted via AsyncStorage
- Offline pack download simulation — `setInterval` progress, stored to Zustand

### UI
- Design token system (`tokens.ts`) — colors, typography, spacing, shadows, gradients
- Badge (7 variants), Button (5 variants, 4 sizes), GlassCard, SectionHeader
- LaunchCard, TripCard, OfflinePackCard (with progress bar)
- Haptic feedback on all primary CTAs (expo-haptics)
- MapPinMarker component with type-based color coding

### Hooks & Utilities
- `useLocation` — Expo Location GPS wrapper with permission handling
- `useOfflineStatus` — fetch-ping connectivity detector, re-checks on app foreground
- `storageGet/Set/Remove/UpdateArray` — typed AsyncStorage helpers
- `totalStorageKB()` — storage usage calculation for Profile tab
- SQLite schema via `src/lib/db.ts` — tables defined, migration path to Sprint 2 documented

---

## What Is Mocked / Simulated

| Feature | Mock Implementation | Real Integration Path |
|---|---|---|
| Weather data | Hardcoded snapshot: 68°F, WSW 12 mph | OpenWeatherMap free tier |
| Water conditions | Hardcoded gauge: 74.8°F, 8.2 ft, clear | USGS NWIS gauge 04165500 |
| NOAA alerts | 3 hardcoded alerts | api.weather.gov (no key) |
| DNR regulations | Seeded TypeScript data | Michigan Open Data SODA / scraped + cached |
| Offline map tiles | Apple/Google online tiles | PMTiles on Cloudflare R2 + MapLibre offline SDK |
| Offline pack download | `setInterval` progress simulation | Expo FileSystem + real tile download |
| Community reports | "Coming later" UI label | Supabase real-time + RLS |

---

## What Is Not Yet Built

| Feature | Priority | Notes |
|---|---|---|
| Live weather API | High | OpenWeatherMap free tier, 60 req/min |
| Live water level API | High | USGS NWIS, free, no key |
| NOAA alerts feed | High | api.weather.gov, free, no key |
| Real offline map tiles | High | MapLibre + PMTiles — biggest technical lift |
| EAS Build / App Store | High | Expo Application Services, $99/yr Apple |
| Push notifications | Medium | Expo Push + Edge Function cron |
| Community catch reports | Medium | Supabase (opt-in only) |
| Fish identification | Low | ML Kit or custom CoreML |
| Trip GPS track | Low | Background location (needs iOS entitlement) |
| Account / auth | Low | Not needed until community features |

---

## Technical Architecture

| Decision | Rationale |
|---|---|
| StyleSheet over NativeWind (primary) | Predictable layout on SDK 56; NativeWind v4 configured but StyleSheet is primary |
| Zustand over Redux | Minimal boilerplate; AsyncStorage middleware fits naturally |
| AsyncStorage for MVP persistence | Appropriate for catch volume; SQLite schema ready for Sprint 2 |
| Mock services as separate files | Clean swap — real API replaces only the return value |
| Expo Router over React Navigation | File-based routing simpler for single-dev MVP; deep links built-in |

---

## App Store Submission Checklist

### Before TestFlight

- [ ] Add app icons (1024×1024 + all required sizes) via `assets/` + `app.json`
- [ ] Add splash screen
- [ ] Set `bundleIdentifier` in `app.json` (e.g. `com.puremi.fishing`)
- [ ] Set production `scheme` in `app.json` (`puremi`)
- [ ] Configure `eas.json` with `production` profile
- [ ] Run `eas build --platform ios --profile production`
- [ ] Test on physical device (not simulator) before submission

### Required App Store Metadata

- [ ] App name: "Pure MI Fishing"
- [ ] Short description (≤30 chars): "Michigan fishing companion"
- [ ] Description: use landing page copy, SEO-optimized
- [ ] Keywords: michigan fishing app, detroit river, walleye, offline maps, regulations
- [ ] Privacy Policy URL (required — even for local-only apps)
- [ ] App review notes: "All catch data is stored locally on device. No account required. No network calls in MVP."
- [ ] Age rating: 4+ (no objectionable content)
- [ ] Category: Navigation or Sports
- [ ] Screenshots: 6.7" Pro Max + 6.1" + 5.5" sizes minimum

### App Review Notes (ready to paste)

> This app is an independent Michigan fishing field companion. It does not require an account, does not collect personal data, and does not connect to paid third-party APIs. All regulation summaries are simplified planning aids with links to official michigan.gov/dnr sources. Map data is provided by Apple Maps (iOS default). Catch log entries are stored exclusively on-device using AsyncStorage.

### Android (Google Play)

- [ ] Configure `eas.json` with Android production profile
- [ ] Run `eas build --platform android --profile production`
- [ ] Create Google Play developer account ($25 one-time)
- [ ] Comply with Google Play target API level requirements (API 34 as of 2025)

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Michigan DNR regulations change mid-season | High | High | Always link to official source; show last-synced timestamp; stale-data warnings |
| Apple App Review rejects regulation content | Medium | High | Clear disclaimer on every regulation screen; review notes prepared above |
| react-native-maps breaks on SDK upgrade | Medium | Medium | Pin expo-sdk and maps version; test before any upgrade |
| Offline tile approach (MapLibre) complexity | High | High | MVP ships with online tiles; offline tiles are Sprint 3 |
| Competitive app launches (e.g. Michigan DNR official app) | Low | High | Differentiate on UX quality and offline-first capability |
| Apple changes background location policy | Low | Medium | Trip mode timer doesn't use background location in MVP |

---

## Estimated MVP Cost to Launch (Live APIs + App Store)

| Item | Cost |
|---|---|
| Apple Developer Program | $99/yr |
| OpenWeatherMap (free tier) | $0 |
| NOAA / USGS APIs | $0 (federal) |
| Cloudflare R2 (offline tiles) | ~$0.01/GB |
| Vercel (landing page) | $0 (hobby) |
| Supabase (community features, future) | $0 (free tier, 500MB) |
| **Total Year 1** | **~$99** |
