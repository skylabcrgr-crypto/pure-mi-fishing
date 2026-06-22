# Offline GIS Map Pack — Phase 3 Plan

**Status:** Complete (Phase 3 implementation done — June 19, 2026)

---

## Goals

Make the Detroit River Corridor map/access experience work as an offline-first field tool.

---

## What was built

### New files

| File | Purpose |
|------|---------|
| `src/store/useOfflinePackStore.ts` | Manages `OfflineRegionPack[]` status (AsyncStorage-persisted) + `savedAccessPointIds` |

### Updated files

| File | Change |
|------|--------|
| `app/(tabs)/explore.tsx` | Replaced MAP_PINS with ACCESS_POINTS; added type filter chips, access point detail card, save spot button, pack status row |
| `app/offline-packs.tsx` | Migrated from `OfflinePack` to `OfflineRegionPack`; shows Detroit River Corridor pack with version metadata |
| `src/data/accessPoints.ts` | Added `getAccessPointDistanceMi()` exported helper |
| `app/_layout.tsx` | Added `useOfflinePackStore.loadFromStorage()` on boot |

---

## Access Point Filter Chips

| Chip ID | Matches |
|---------|---------|
| `all` | All 9 access points |
| `launches` | `type === 'boat_launch'` |
| `shore` | `type === 'shore_access' \| 'carry_in'` |
| `marina` | `type === 'marina' \| 'bait_shop'` |
| `emergency` | `type === 'emergency_resource' \| isEmergencyResource === true` |
| `saved` | `savedAccessPointIds.includes(ap.id)` |

---

## Pack Status States

| Status | Displayed as |
|--------|--------------|
| `available` | Blue gradient "Download Detroit River Pack" button |
| `downloading` | Progress bar with percentage |
| `downloaded` | Green "Pack Ready" row with version + relative time |
| `update_available` | (Persisted, shown as downloaded until manual refresh — Phase 7) |
| `error` | Falls through to "available" display (Phase 7 adds error UI) |

---

## Pack Status Storage

- **Store**: `useOfflinePackStore` (Zustand)
- **Persistence**: AsyncStorage key `@puremi/region-pack-status`
- **Only persisted fields**: `status` + `downloadedAt` (not the full pack definition)
- **Saved access points**: AsyncStorage key `@puremi/saved-access-points` (array of string IDs)
- **Boot flow**: `loadFromStorage()` called in `_layout.tsx` `useEffect`

---

## OfflinePack vs OfflineRegionPack

### Decision: Migrate

`offline-packs.tsx` has been migrated to use `OfflineRegionPack` exclusively.

| Aspect | Legacy `OfflinePack` | New `OfflineRegionPack` |
|--------|---------------------|------------------------|
| Source | `offlinePacks.ts` | `offlineRegionPacks.ts` |
| Store | `useAppStore.offlinePacks` | `useOfflinePackStore.regionPacks` |
| UI screen | ~~offline-packs.tsx~~ (replaced) | `offline-packs.tsx` ✅ |
| Explore screen | ~~MAP_PINS~~ (replaced) | `ACCESS_POINTS` ✅ |
| Packs defined | 3 (detroit-river, belle-isle, lake-st-clair) | 1 (detroit-river-corridor) |
| Status | Legacy data, no UI | Active, Phase 3 UI |

`offlinePacks.ts`, `OfflinePackCard.tsx`, and the `useAppStore` pack management methods are retained for backward compatibility but are no longer used by any screen.

---

## Access Point Data Backing

| Source | Role |
|--------|------|
| `src/data/accessPoints.ts` | **Canonical Phase 3 source** — 9 access points, static TypeScript, always available offline |
| `mapPins.ts` | **Legacy** — 7 pins, no longer used by Explore screen. Retained as reference data |
| SQLite `saved_spots` table | Not used for access points in Phase 3 (saved spot IDs are AsyncStorage-backed for simplicity) |

---

## Map Tile Limitation

True offline raster tile downloads require a tile server (PMTiles or similar). This is deferred to **Phase 5**. Current behavior:
- `MapView` uses the system tile provider
- When device is offline, the system tile cache is used (varies by device/OS)
- Access points, regulation rules, and condition snapshots are fully available offline
- The UI does not crash if map tiles are unavailable

---

## Acceptance Criteria — Phase 3

| Criterion | Status |
|-----------|--------|
| App boots with no network | ✅ All static data + AsyncStorage |
| Detroit River Pack status visible | ✅ Pack status row in Explore bottom sheet |
| User can mark Detroit River Pack as downloaded | ✅ Download flow with fake progress |
| Pack status persists across app restarts | ✅ AsyncStorage-backed |
| User can view local access points | ✅ ACCESS_POINTS shown in map + list |
| User can filter access points by type | ✅ 6 filter chips (All, Launches, Shore, Marina, Emergency, Saved) |
| User can open access point detail card | ✅ Full card with name, type, distance, hours, fee, notes, amenities, emergency phone |
| User can save/remove a spot | ✅ Bookmark button in detail card, persisted to AsyncStorage |
| User can open rules offline | ✅ "Check Rules" → waterbody screen (Phase 2 regulation engine) |
| Unknown/missing location does not crash | ✅ `position` is null-guarded throughout |
| `npx tsc --noEmit` passes | ✅ Exit 0 |

---

## Remaining Blockers Before Phase 4

1. **Map tiles**: Offline map tile display requires PMTiles + tile server. Phase 5.
2. **Access point sync**: `accessPoints.ts` is static data — no refresh mechanism. Phase 7.
3. **Regulation verification**: All rules are `sample_unverified`. Phase 7 (DNR scrape).
4. **Saved spots distance sort**: When location is available, saved spots could be sorted by distance. Low priority.
5. **Region pack update detection**: `update_available` status is never triggered (Phase 7 version check).
