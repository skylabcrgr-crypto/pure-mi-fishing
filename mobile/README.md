# Pure MI Fishing — Mobile App

> **Independent Michigan fishing field companion.** Not affiliated with the Michigan DNR, State of Michigan, or Pure Michigan campaign.

## Quick Start

```bash
# From the repo root
cd mobile
npm install
npx expo start
```

Then press **`i`** for iOS Simulator or **`a`** for Android emulator.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 56, React Native |
| Navigation | Expo Router (file-based) |
| Language | TypeScript (strict) |
| Styling | StyleSheet + design tokens |
| State | Zustand |
| Local storage | AsyncStorage + Expo SQLite |
| Maps | react-native-maps (Apple/Google) |
| Location | expo-location |
| Icons | lucide-react-native |
| Gradients | expo-linear-gradient |
| Haptics | expo-haptics |

---

## Project Structure

```
mobile/
├── app/                          Expo Router screens
│   ├── _layout.tsx               Root layout (SafeArea, StatusBar, store init)
│   ├── index.tsx                 Redirect: onboarding → tabs
│   ├── onboarding.tsx            Animated 3-card onboarding flow
│   ├── license.tsx               DNR license handoff
│   ├── offline-packs.tsx         Pack download manager
│   ├── settings.tsx              App settings
│   ├── (tabs)/
│   │   ├── _layout.tsx           Tab bar layout
│   │   ├── explore.tsx           Map + launches + offline CTA
│   │   ├── trips.tsx             Offline packs + saved spots + trip history
│   │   ├── conditions.tsx        Weather + water conditions dashboard
│   │   ├── logbook.tsx           Catch log + add-catch form
│   │   └── profile.tsx           License CTA + settings links
│   ├── waterbody/[id].tsx        Waterbody detail (Detroit River etc.)
│   ├── launch/[id].tsx           Launch site detail + navigate
│   └── trip-mode/[id].tsx        Full-screen field UI
│
├── src/
│   ├── design/tokens.ts          Color palette, typography, spacing, shadows
│   ├── types/index.ts            TypeScript interfaces
│   ├── data/                     Seeded offline data (no API required)
│   │   ├── waterbodies.ts
│   │   ├── launches.ts
│   │   ├── species.ts
│   │   ├── regulations.ts
│   │   ├── conditions.ts         Mock conditions
│   │   ├── alerts.ts
│   │   ├── offlinePacks.ts
│   │   └── mapPins.ts
│   ├── services/                 Mock API adapters (ready to swap for real)
│   │   ├── weatherService.ts     → OpenWeatherMap (free tier)
│   │   ├── noaaService.ts        → NOAA NWS API (free, no key)
│   │   ├── usgsService.ts        → USGS NWIS gauges (free, no key)
│   │   └── dnrService.ts         → Michigan DNR (future)
│   ├── store/
│   │   ├── useAppStore.ts        App prefs, offline packs, saved spots
│   │   ├── useTripsStore.ts      Trip history
│   │   └── useLogbookStore.ts    Catch log
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── GlassCard.tsx
│   │   │   └── SectionHeader.tsx
│   │   └── cards/
│   │       ├── LaunchCard.tsx
│   │       ├── TripCard.tsx
│   │       └── OfflinePackCard.tsx
│   └── utils/format.ts           Date, duration, unit helpers
│
└── docs/MVP_SCOPE.md
```

---

## Map Region

The map is centered on the **Detroit River / SE Michigan** region:

- Belle Isle Fishing Area
- Elizabeth Park Marina (Trenton Channel)
- Wyandotte Boat Ramp
- Milliken State Park Harbor
- Lake Erie Metropark Launch
- Flat Rock Community Launch
- Detroit River hotspot pins

---

## Design System

Colors defined in `src/design/tokens.ts`:

| Token | Color | Use |
|---|---|---|
| `bg.primary` | `#0A1628` | Dark navy base |
| `bg.card` | `#162540` | Card surface |
| `brand.teal` | `#00ACC1` | Freshwater teal, accents |
| `brand.orange` | `#FF6B35` | Safety orange, CTAs |
| `brand.blue` | `#1565C0` | Michigan blue, links |
| `brand.sand` | `#D4A853` | Warm sand, saved/gold |
| `text.accent` | `#4FC3F7` | Light teal text |

---

## Key Features by Screen

### Explore (Map)
- Dark-styled MapView centered on Detroit River
- 7 seeded pins (4 launches, 2 hotspots, 1 shore access)
- Floating search bar + 7 filter chips
- Bottom sheet with "Nearby right now" + offline pack CTA

### Trips
- Offline pack download simulation (progress bar)
- Detroit River Pack, Belle Isle Pack, Lake St. Clair Pack
- 3 demo trip cards with metadata

### Conditions
- Mock weather snapshot for Detroit River
- Water temperature, level, clarity, ice status
- DNR alert cards
- Pull-to-refresh

### Logbook
- Full catch entry form: species, length, weight, waterbody, method, bait, notes
- Stored locally via AsyncStorage
- Empty state CTA

### Profile
- Michigan DNR license handoff → michigan.gov/dnr
- Settings, offline packs links
- Independent app disclaimer

---

## Regulation Disclaimer

All regulation summaries are **simplified planning tools only**. The app links directly to [michigan.gov/dnr](https://www.michigan.gov/dnr) for authoritative rules. This app is **not affiliated** with the Michigan DNR.

---

## Running the Landing Page

```bash
cd landing
npm run dev          # localhost:3000
npm run build        # production build
```
