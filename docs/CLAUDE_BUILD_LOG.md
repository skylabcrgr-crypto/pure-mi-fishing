# Pure MI Fishing — Build Log

> Skylab Creative Group · Built with GitHub Copilot (Claude Sonnet 4.6)
> Session started: June 2026

---

## How to Run Everything

### Mobile App

```bash
cd mobile
npm install --legacy-peer-deps   # --legacy-peer-deps required (react-dom peer conflict in Expo SDK 56)
npx expo start
```

Press `i` for iOS Simulator, `a` for Android Emulator.

**TypeScript check:**
```bash
cd mobile
npx tsc --noEmit                 # Currently: 0 errors
```

### Landing Page

```bash
cd landing
npm install
npm run dev                      # http://localhost:3000
npm run build                    # Production build (currently: ✓ Compiled successfully)
```

### From Repo Root

```bash
npm run mobile          # Expo start
npm run landing         # Next.js dev server
npm run landing:build   # Next.js production build
```

---

## Sprint 1 — Initial Bootstrap

**Date:** June 2026

### What Was Built

#### Repository Structure
- Monorepo at `/PureMIFishing/` with `mobile/`, `landing/`, root `package.json`
- Root scripts: `mobile`, `mobile:ios`, `mobile:android`, `landing`, `landing:build`

#### Mobile App Bootstrap
- Expo SDK 56, blank TypeScript template
- App scheme: `puremi`
- Configured: `app.json`, `tsconfig.json`, `babel.config.js`, `metro.config.js`
- Installed (all with `--legacy-peer-deps`):
  - `expo-router`, `react-native-safe-area-context`, `react-native-screens`
  - `react-native-maps`, `expo-location`, `expo-haptics`
  - `expo-linear-gradient`, `expo-blur`, `expo-sqlite`, `expo-file-system`
  - `zustand`, `@react-native-async-storage/async-storage`
  - `lucide-react-native`, `react-native-svg`
  - `nativewind@4`, `tailwindcss@3`

---

## Sprint 2 — Full Production Build

**Date:** June 2026

### Design System
- `src/design/tokens.ts` — Colors, Spacing, Typography, Radius, Shadows, Gradients (all tuple-typed for LinearGradient)

### TypeScript Types
- `src/types/index.ts` — Waterbody, Launch, Species, Regulation, Conditions, WeatherData, WaterData, Alert, OfflinePack, Trip, CatchEntry, MapPin, UserPreferences

### Seed Data (7 files)
| File | Content |
|---|---|
| `waterbodies.ts` | 4 waterbodies: Detroit River, Belle Isle, Trenton Channel, Lake St. Clair edge |
| `launches.ts` | 6 launch sites with coordinates, hours, fees, amenities |
| `species.ts` | 7 species with 2025–26 regulation summaries |
| `regulations.ts` | 5 rules + `DISCLAIMER` constant |
| `conditions.ts` | Mock conditions + `FISHING_RATING_COLORS` map |
| `alerts.ts` | 3 mock DNR alerts |
| `offlinePacks.ts` | 3 packs: Detroit River (48MB), Belle Isle (18MB), Lake St. Clair (76MB) |
| `mapPins.ts` | 7 Explore map pins (4 launches, 2 hotspots, 1 shore access) |

### Mock Service Adapters (4 files)
| File | Target API | TODO Comment |
|---|---|---|
| `weatherService.ts` | OpenWeatherMap | `api.openweathermap.org/data/2.5/weather` |
| `noaaService.ts` | NOAA NWS | `api.weather.gov/alerts/active?point={lat},{lon}` |
| `usgsService.ts` | USGS NWIS | `waterservices.usgs.gov/nwis/iv/?sites=04165500` |
| `dnrService.ts` | Michigan DNR | Michigan Open Data SODA |

### Zustand Stores (3 files)
| Store | Persists | Key |
|---|---|---|
| `useAppStore` | Preferences, offline packs, saved spots | `@puremi/preferences` |
| `useTripsStore` | Trip history (3 demo trips seeded) | `@puremi/trips` |
| `useLogbookStore` | Catch log entries | `@puremi/logbook` |

### UI Components
- `Badge` — 7 variants (default/teal/orange/forest/sand/danger/warning), accepts `style?: ViewStyle`
- `Button` — 5 variants (primary/secondary/ghost/danger/outline), 4 sizes, haptic on press
- `GlassCard` — glassmorphism card wrapper
- `SectionHeader` — section title with optional action button
- `LaunchCard` — launch site card with access type, coordinates, save button
- `TripCard` — trip history card with duration, waterbody, notes
- `OfflinePackCard` — download progress bar, downloaded state, delete button

### App Screens (13 routes)
All screens implemented and navigable:

| Screen | Key Features |
|---|---|
| `index.tsx` | Onboarding gate, redirects based on preferences |
| `onboarding.tsx` | 3-card FlatList carousel, "Explore Detroit River" CTA, "Set up later" secondary |
| `(tabs)/explore.tsx` | Dark MapView, 7 pins, search bar, 7 filter chips, bottom sheet, offline CTA |
| `(tabs)/trips.tsx` | Offline pack manager, saved spots, 3 demo trip cards |
| `(tabs)/conditions.tsx` | Weather hero, weather/water grids, alert cards, pull-to-refresh |
| `(tabs)/logbook.tsx` | Add-catch modal (species/length/weight/method/bait/notes), empty state |
| `(tabs)/profile.tsx` | License hero gradient, season stats, settings/offline packs navigation |
| `waterbody/[id].tsx` | Hero gradient, description, badges, rules (expandable), launches, conditions |
| `launch/[id].tsx` | Teal hero, stat cards (parking/hours/fee), Navigate/Save/Start Trip buttons |
| `trip-mode/[id].tsx` | Full-screen dark UI, 6 large action buttons, emergency alert with DNR RAP Line |
| `license.tsx` | 2025 fee table, official DNR handoff |
| `offline-packs.tsx` | Download simulation with `setInterval` progress |
| `settings.tsx` | Text size, contrast, reduced motion, units, data clear |

### TypeScript Result
```
npx tsc --noEmit → 0 errors
```

**TypeScript bugs fixed during session:**
1. `LinearGradient` expects `readonly [ColorValue, ColorValue, ...ColorValue[]]` — changed all `Gradients` in `tokens.ts` to tuple types (`as [string, string, string]`)
2. Duplicate `style` prop on `<Text>` in `profile.tsx` — merged to array
3. `Badge` component missing `style?: ViewStyle` prop — added to interface and spread

---

## Sprint 3 — Hooks, Lib, Map Components

**Date:** June 2026

### New Files Added

#### `/src/hooks/`
| File | Purpose |
|---|---|
| `useLocation.ts` | Expo Location GPS hook: foreground permission → `getCurrentPositionAsync` → `watchPositionAsync`. Detroit River fallback when denied. |
| `useOfflineStatus.ts` | Fetch-ping connectivity detector (HEAD to google.com/generate_204, 4s timeout). Re-checks when app comes to foreground via `AppState` listener. |

#### `/src/lib/`
| File | Purpose |
|---|---|
| `storage.ts` | Typed AsyncStorage helpers: `storageGet/Set/Remove/UpdateArray`, `storageSizeBytes`, `totalStorageKB`, `clearAllStorage`. All keys namespaced `@puremi/`. |
| `db.ts` | **Expo SQLite** schema and query helpers. Tables: `catch_log`, `offline_pack_meta`, `saved_spots`. Functions: `initDatabase`, `insertCatch`, `queryCatches`, `deleteCatchById`, `catchCount`. Migration path from AsyncStorage documented. |

#### `/src/components/map/`
| File | Purpose |
|---|---|
| `DarkMapStyle.ts` | 18-rule Google Maps dark style, typed as `MapStyleElement[]`. Extracted from inline definition in `explore.tsx`. |
| `MapPinMarker.tsx` | `memo`-wrapped custom pin: outer ring + inner dot, type-colored (`launch/hotspot/access/hazard`), optional label. |

#### `explore.tsx` updated
- Imports `DARK_MAP_STYLE` from `src/components/map/DarkMapStyle.ts`
- Removed 8-line inline style definition

### TypeScript Result
```
npx tsc --noEmit → 0 errors
```

**Bugs fixed:**
1. `expo-network` not installed → replaced with `fetch`-based HEAD ping in `useOfflineStatus.ts`
2. `AsyncStorage.multiRemove` type mismatch → replaced with `Promise.all(removeItem)` pattern

---

## Sprint 4 — Landing Page

**Date:** June 2026

### Tech Stack
- Next.js 16 App Router (Turbopack)
- TypeScript — 0 errors
- Tailwind CSS v4 (`@import "tailwindcss"`, `@tailwindcss/postcss`)
- Framer Motion v12
- lucide-react v1.18
- Geist font (next/font/google)
- Static output (SSG)

### Files Created

```
landing/app/
  globals.css                 Tailwind v4 + .glass, .glass-dark, .text-gradient-teal,
                              .text-gradient-orange, .grid-pattern, .map-dot-pattern,
                              .section-divider utilities
  layout.tsx                  Full SEO: title, description, keywords[], openGraph,
                              twitter card, robots, canonical
  page.tsx                    Server component composing all 10 sections
  _components/
    Nav.tsx                   Sticky scroll-aware, AnimatePresence mobile drawer,
                              active scroll state via useEffect
    Hero.tsx                  Full-viewport, 5 animated water rings, 2 glowing orbs,
                              grid pattern, stagger container animation
    ProblemSection.tsx        5 problem cards + "the solution" dark card (light bg)
    ProductSection.tsx        8 feature cards, 4-col grid, per-card hover glow (dark bg)
    DetroitSection.tsx        4 stats + 6 region cards with GPS coords, map dot pattern
    AppPreviewSection.tsx     5 interactive CSS phone mockups with screen switching,
                              motion scale/opacity on active phone
    OfflineSection.tsx        6 offline features + 3 pack cards with progress bars
    LicenseSection.tsx        4 license price cards + official DNR CTA button
    TrustSection.tsx          6 trust cards + left-bordered disclaimer panel
    CtaSection.tsx            Animated water rings, perks list, static email input
    Footer.tsx                4-column link grid, section-divider, year-aware copyright
```

### SEO Metadata (layout.tsx)
```
title.default: "Pure MI Fishing — Michigan Fishing App | Detroit River Offline Maps & Regulations"
description: "Independent field companion for Michigan anglers. Offline Detroit River fishing maps, boat launch finder, simplified DNR regulation summaries..."
keywords: [10 target phrases]
openGraph: { title, description, url: "https://puremi.fishing", siteName, type, locale }
twitter: { card: "summary_large_image", title, description }
robots: { index: true, follow: true }
alternates: { canonical: "https://puremi.fishing" }
```

### Build Result
```
npm run build → ✓ Compiled successfully
GET / → 200 OK
Static route: / (SSG)
```

---

## Sprint 5 — Documentation & Brand

**Date:** June 2026

### Files Created

| File | Description |
|---|---|
| `README.md` (root) | Monorepo overview, quick start for both apps, docs index |
| `landing/README.md` | Updated from Next.js boilerplate to full project README |
| `mobile/README.md` | Already complete from Sprint 2; unchanged |
| `docs/BRAND_GUIDE.md` | Color palette, typography, voice, forbidden assets, accessibility |
| `docs/PRODUCT_SCOPE.md` | MVP scope, feature tables, risks, App Store checklist |
| `docs/DATA_SOURCES.md` | All 9 data APIs with endpoints, keys, rate limits, integration notes |
| `docs/CLAUDE_BUILD_LOG.md` | This file |

---

## Current File Count

```
mobile/app/      16 files (13 screens + 2 layouts + 1 gate)
mobile/src/      33 files across 8 directories
landing/app/     14 files (page + layout + 11 components + globals)
docs/            5 files (this file + 4 guides)
root/            3 files (README + package.json + monorepo config)
```

---

## What Remains

### High Priority (Sprint 6)

- [ ] EAS Build setup (`eas.json`) and TestFlight submission
- [ ] App icons + splash screen (`assets/` + `app.json` update)
- [ ] Wire USGS NWIS to `usgsService.ts` (free, no key, ~2 hours)
- [ ] Wire NOAA NWS to `noaaService.ts` (free, no key, ~2 hours)
- [ ] Wire OpenWeatherMap to `weatherService.ts` (free tier, requires key)
- [ ] Privacy Policy page (required for App Store)

### Medium Priority (Sprint 7)

- [ ] Real offline map tiles (MapLibre + PMTiles + Cloudflare R2)
- [ ] `migrate logbook from AsyncStorage to SQLite` (db.ts is ready)
- [ ] Saved spots stored to SQLite `saved_spots` table
- [ ] Species filter logic on Explore map filter chips

### Low Priority (Sprint 8+)

- [ ] Community catch reports (Supabase opt-in)
- [ ] Push notifications for DNR closure alerts
- [ ] Trip GPS tracking (background location)
- [ ] Fish identification (ML Kit)
- [ ] Account / auth (only needed for community features)
- [ ] Additional regions: St. Clair River, Pere Marquette, Muskegon River

---

## Key Technical Decisions Log

| Decision | Sprint | Rationale |
|---|---|---|
| `--legacy-peer-deps` required | 1 | Expo SDK 56 react-dom peer conflict |
| StyleSheet primary over NativeWind | 2 | Predictable layout on SDK 56 |
| Tuple types for LinearGradient colors | 2 | TS4 strict type: `readonly [ColorValue, ColorValue, ...ColorValue[]]` |
| AsyncStorage for MVP, SQLite schema ready | 2/3 | Appropriate for MVP catch volume; migration path in db.ts |
| DARK_MAP_STYLE extracted to components/map | 3 | Architectural separation; reusable across screens |
| Fetch-ping over expo-network | 3 | expo-network not installed; HEAD ping is lighter |
| Tailwind v4 arbitrary values | 4 | No tailwind.config.js in v4; `bg-[#hex]` pattern throughout |
| All components as `"use client"` | 4 | Framer Motion requires client components |
| Static input for email form | 4 | No backend in MVP; no-op with `alert()` placeholder |
