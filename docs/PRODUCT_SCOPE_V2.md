# Pure MI Fishing — Product Scope V2

> Version 2.0 · June 2026 · Skylab Creative Group
> Refocus: Offline-first Michigan fishing intelligence, Detroit River Corridor MVP first.

---

## Core Product Promise

> "Know where to fish, what to fish for, what rules apply, and what conditions matter — even with no signal."

This is a **field intelligence tool**, not a tackle store or social platform.

---

## Strategic Refocus (V1 → V2)

V1 scoped the app as a general Michigan fishing companion with live API integrations as the
critical path. V2 flips the priority: **offline-first capability ships first**, live API integration
is a hardening step, not a prerequisite.

| V1 Assumption | V2 Reality |
|---|---|
| Live APIs needed to launch | Offline data ships MVP; live APIs upgrade the experience |
| Statewide regulation coverage | Detroit River Corridor only for MVP |
| Backend sync is Day 1 | Backend sync is Sprint 3 hardening |
| Map tiles require MapLibre | react-native-maps with static pins is MVP; PMTiles are Sprint 4 |

---

## MVP Region (Locked)

**Detroit River Corridor, Southeast Michigan**

No statewide expansion until the Detroit River Corridor MVP is complete and accepted.

### Waterbodies in Scope

| ID | Name | Notes |
|---|---|---|
| `detroit-river` | Detroit River | Main corridor, 32 miles |
| `belle-isle` | Belle Isle Fishing Area | State park, Detroit |
| `trenton-channel` | Trenton Channel | Side channel, Grosse Ile area |
| `lake-st-clair-edge` | Lake St. Clair (SW Edge) | Muskie capital |

### Access Points in Scope
- Elizabeth Park Marina
- Wyandotte Boat Ramp
- Milliken State Park Harbor
- Lake Erie Metropark Launch
- Flat Rock Community Launch
- Belle Isle Carry-In Access
- Detroit River Shoreline (downtown)
- Trenton Channel Walleye Hole (hotspot)
- Grosse Ile North Shore

---

## MVP Species (Locked)

| ID | Species | Key Notes |
|---|---|---|
| `walleye` | Walleye | 5/day, 15 in, special Detroit River 20-in rule |
| `smallmouth-bass` | Smallmouth Bass | 5/day combined w/ LMB, 14 in, Jun 1 season |
| `largemouth-bass` | Largemouth Bass | 5/day combined w/ SMB, 14 in |
| `yellow-perch` | Yellow Perch | 50/day, 8 in, open all year |
| `muskellunge` | Muskellunge | 1/day, 48/54-in rule, Jun 7 season |
| `northern-pike` | Northern Pike | 5/day, 24 in, open all year |
| `steelhead` | Steelhead / Rainbow Trout | 5/day, 15 in, tributary closures Oct–Dec |

---

## Core MVP Features (V2)

### 1. Offline Regulation Engine
- Lookup rules by location, waterbody, species, date
- Season-date-aware (open/closed status based on current date)
- Size limit, bag limit, possession limit, special rules
- Source URL + last verified date on every rule
- Clear "unverified / sample data" warning until official verification
- **No statewide parsing — Detroit River Corridor only**

### 2. Smart Fishing Intelligence V1
- Rules-based recommendation engine (no paid AI)
- Inputs: species, season, time of day, weather, water temp, conditions
- Outputs: recommended species, best time window, depth, method, confidence
- Labeled as "condition-based guidance," never as guaranteed predictions

### 3. Offline GIS Map Pack
- Detroit River region pack with version tracking
- Access point layer (launches, shore, parking, restrooms, marinas, bait shops)
- Emergency access/resource points
- Saved user spots
- Pack status: available / downloaded / update available
- Uses existing react-native-maps + static pins for MVP; PMTiles deferred

### 4. Emergency Mode
- One-tap access from trip-mode screen
- Current GPS + last known location + timestamp
- Battery level (if available)
- Emergency contact storage
- Generated SMS message
- Nearest known access/resource point from local data
- Offline incident record with sync queue
- **Does not integrate with 911/dispatch APIs**
- **Does not claim to replace emergency services**

### 5. Citizen Science / Report a Problem (Beta)
- 13 report types (invasive species, dead fish, pollution, etc.)
- GPS location + waterbody + photo (if infrastructure supports) + notes
- Anonymous flag
- Draft / submitted / synced status
- Offline queue with backend sync when connection returns

### 6. Reliable Offline Sync
- Local queue for trips, catches, citizen reports, emergency incidents
- Retry handling with failure states
- Conflict-safe updates
- Backend health check
- Graceful degradation when offline

---

## What Is Currently Working (as of June 19, 2026)

| Category | Status |
|---|---|
| All 13 app routes/screens render | ✅ |
| Expo Router navigation, deep links | ✅ |
| Zustand stores (trips, logbook, prefs) | ✅ |
| AsyncStorage persistence | ✅ |
| SQLite schema defined (not yet active) | ✅ schema / ❌ not seeded |
| Static seed data (waterbodies, species, regulations) | ✅ |
| Map with react-native-maps + pins | ✅ |
| GPS location hook | ✅ |
| Offline status hook | ✅ |
| Design token system + UI components | ✅ |
| All API services | ✅ stubbed / mocked |
| Real offline map tiles | ❌ |
| Real API integrations | ❌ |
| Regulation engine service | ❌ |
| Fishing intelligence engine | ❌ |
| Emergency Mode (full) | ❌ (placeholder Alert dialog only) |
| Citizen reports | ❌ |
| Backend sync | ❌ |
| Tests | ❌ |
| App Store / Play Store submission | ❌ |

---

## Platform Targets

- **iOS 16+** — iPhone 12 and later (primary)
- **Android 12+** — API level 32+ (secondary)
- **Bundle ID:** `com.skylabcreativegroup.puremifishing`
- **Deep link scheme:** `puremi://`
- **EAS Build** for production `.ipa` / `.apk`

---

## Technical Architecture (V2)

| Decision | Status |
|---|---|
| Expo SDK 56, React Native 0.85.3 | ✅ locked |
| Expo Router file-based routing | ✅ locked |
| Zustand + AsyncStorage for state/prefs | ✅ active |
| expo-sqlite for structured offline data | ✅ installed, schema extending in Phase 1 |
| react-native-maps for map UI | ✅ active |
| expo-location for GPS | ✅ active |
| TypeScript strict mode | ✅ locked |
| Mock service adapters (clean swap pattern) | ✅ pattern established |
| PMTiles / MapLibre offline tiles | ⏳ Phase 3 |
| Supabase Auth | ⏳ Phase 7 |
| Railway backend sync | ⏳ Phase 7 |

---

## Regulatory Disclaimer Requirement

Every regulation display in the app **must** include this disclaimer:

> ⚠️ Rules shown are simplified planning summaries only. Always verify with official Michigan DNR regulations at michigan.gov/dnr before fishing. Regulations change — the DNR regulation booklet is the authoritative source.

Regulation records with `verificationStatus: 'sample_unverified'` must additionally display:

> 🚧 Sample data — not yet officially verified for current season.
