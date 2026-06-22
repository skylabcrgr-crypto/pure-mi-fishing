# Pure MI Fishing — Data Sources

> Version 1.0 · June 2026 · Skylab Creative Group

---

## Architecture Principle

**MVP ships with local seed data. Real API integrations are added in Sprint 3 by swapping the mock service adapter return values.**

Each service adapter lives in `mobile/src/services/`:

```
weatherService.ts   → OpenWeatherMap
noaaService.ts      → NOAA NWS + CO-OPS + NDBC
usgsService.ts      → USGS NWIS Water Data
dnrService.ts       → Michigan DNR (Open Data)
```

Every function has a `// TODO: replace with real API` comment at the mock return.

---

## 1. Michigan DNR — Fishing Regulations

| Field | Value |
|---|---|
| **Authority** | Michigan Department of Natural Resources |
| **URL** | https://www.michigan.gov/dnr/things-to-do/fishing/regulations |
| **License info** | https://www.michigan.gov/dnr/licenses-and-permits/fishing-licenses |
| **Weekly fishing report** | https://www.michigan.gov/dnr/things-to-do/fishing/fishing-reports |
| **Format** | HTML pages, annual PDF digest |
| **Key** | None required |
| **Rate limit** | N/A (public pages) |
| **MVP status** | Seeded in `src/data/regulations.ts` with simplified summaries |

### Regulation Data Integration Plan

1. **Sprint 3 (manual process):** Parse the annual PDF fishing guide; store structured JSON in `src/data/regulations.ts`; date-stamp entries.
2. **Sprint 4 (automation):** Evaluate Michigan Open Data SODA API (`data.michigan.gov`) for structured regulation datasets. Currently limited coverage.
3. **Sprint 5 (production):** Host regulation JSON on Cloudflare R2 with versioned releases; app checks for updates on launch when online.

### ⚠️ Important

Regulation text in the app **must always**:
- Be labeled as a simplified planning summary
- Include a last-verified date
- Link to the official `michigan.gov/dnr` source
- Show stale-data warnings when the app has not refreshed in >30 days

---

## 2. Michigan DNR — License Information

| Field | Value |
|---|---|
| **Authority** | Michigan Department of Natural Resources |
| **License purchase** | https://www.michigan.gov/dnr/licenses-and-permits/fishing-licenses |
| **License info page** | https://www.michigan.gov/dnr/things-to-do/fishing/license-info |
| **Integration** | One-tap deep link using `Linking.openURL()` in React Native |
| **In-app payment** | Never. Pure MI Fishing does NOT process license payments. |
| **MVP status** | ✅ Implemented — `profile.tsx` and `license.tsx` |

---

## 3. Michigan DNR — Weekly Fishing Report

| Field | Value |
|---|---|
| **URL** | https://www.michigan.gov/dnr/things-to-do/fishing/fishing-reports |
| **Format** | HTML page, updated weekly |
| **Key** | None required |
| **MVP status** | Not integrated. Future: parse + cache via Edge Function |
| **Integration path** | Cloudflare Worker scrapes/parses weekly; stores JSON to R2; app fetches on conditions refresh |

---

## 4. Michigan GIS Open Data

| Field | Value |
|---|---|
| **Portal** | https://gis-michigan.opendata.arcgis.com |
| **Relevant datasets** | Public boat launches, fishing access sites, waterbody boundaries, DNR unit boundaries |
| **Format** | GeoJSON, Shapefile, REST API |
| **Key** | None for public datasets |
| **MVP status** | Not integrated. Launch coordinates manually seeded. |
| **Integration path** | Query `Public Boat Launches` layer for coordinates, amenities, and capacity data; replace manual seed |

### Useful Layer IDs

| Dataset | Layer |
|---|---|
| Public Boat Launch Sites | `https://gis-michigan.opendata.arcgis.com/datasets/public-boat-launches` |
| Inland Lakes Shoreline | ArcGIS feature service |
| Great Lakes Shoreline Access | ArcGIS feature service |
| DNR Forest Road System | ArcGIS feature service |

---

## 5. USGS Water Data (NWIS) — River Levels & Temperature

| Field | Value |
|---|---|
| **Agency** | U.S. Geological Survey (USGS) |
| **API base** | https://waterservices.usgs.gov/nwis/iv/ |
| **Key** | None required (federal public data) |
| **Rate limit** | None documented; be respectful — cache aggressively |
| **MVP status** | Mock return in `src/services/usgsService.ts` |

### Detroit River Gauge

| Parameter | Value |
|---|---|
| **Site number** | `04165500` (Detroit River at Detroit, MI) |
| **Parameters** | `00060` (discharge, cfs), `00065` (stage, ft), `00010` (water temp, °C) |

### Example API Call

```
GET https://waterservices.usgs.gov/nwis/iv/
  ?sites=04165500
  &parameterCd=00060,00065,00010
  &format=json
  &period=PT2H
```

### Integration Notes

- Poll at most every 15 minutes; cache result in app state
- Convert temperature: `°C × 9/5 + 32 = °F`
- Stage (water level) in feet; discharge in cubic feet per second
- Show "last synced" timestamp on all cached data
- Surface as stale-data warning if >4 hours old

---

## 6. NOAA / National Weather Service API

| Field | Value |
|---|---|
| **Agency** | National Oceanic and Atmospheric Administration |
| **API base** | https://api.weather.gov |
| **Key** | None required (federal public data) |
| **Rate limit** | Aggressive caching required; NWS recommends no more than 1 req/min per endpoint |
| **User-Agent header** | Required: `User-Agent: PureMIFishing/1.0 (contact@example.com)` |
| **MVP status** | Mock return in `src/services/noaaService.ts` |

### Workflow for Detroit River Weather

```
Step 1: Get grid point
  GET https://api.weather.gov/points/{lat},{lon}
  → Returns { properties.gridId, properties.gridX, properties.gridY }

Step 2: Get hourly forecast
  GET https://api.weather.gov/gridpoints/{gridId}/{gridX},{gridY}/forecast/hourly
  → Returns hourly temperature, wind, sky cover, precipitation probability

Step 3: Get active alerts
  GET https://api.weather.gov/alerts/active?point={lat},{lon}
  → Returns array of active NWS alerts (storms, wind advisories, etc.)
```

### Detroit River Grid Point

Approximate: `NOAA gridpoint KDTX` (Detroit NWS office)
- `lat: 42.18, lon: -83.12`
- Request the `/points/` endpoint to get the exact grid coordinates

### Integration Notes

- Cache hourly forecast for 30 minutes; cache alerts for 10 minutes
- Display alert severity (Extreme / Severe / Moderate / Minor) with appropriate color
- Stale-data warning if forecast >1 hour old during active fishing session
- Parse `properties.temperature.value` (Fahrenheit) and `properties.windSpeed.value`

---

## 7. NOAA CO-OPS API — Tide / Water Level Data

| Field | Value |
|---|---|
| **Agency** | NOAA Center for Operational Oceanographic Products and Services |
| **API base** | https://api.tidesandcurrents.noaa.gov/api/prod/datagetter |
| **Key** | None required |
| **Rate limit** | Standard federal; cache aggressively |
| **MVP status** | Not integrated. Future: water level for Lake Erie access |

### Relevant Station

| Station | ID | Location |
|---|---|---|
| Toledo, OH (Lake Erie) | `9063053` | Proxy for Lake Erie levels near Monroe/Erie Metropark access |

### Example Call

```
GET https://api.tidesandcurrents.noaa.gov/api/prod/datagetter
  ?station=9063053
  &product=water_level
  &datum=MLLW
  &time_zone=LST/LDT
  &units=english
  &format=json
  &range=24
```

### Integration Notes

- Lake Erie is not tidal but lake levels vary with wind seiches and seasonal cycles
- Relevant for: "Is the launch usable?" ramp depth indicator
- Display as "Lake Erie level: X ft (normal range 573–574 ft IGLD 1985)"

---

## 8. NOAA NDBC — Buoy Data

| Field | Value |
|---|---|
| **Agency** | NOAA National Data Buoy Center |
| **URL** | https://www.ndbc.noaa.gov |
| **API** | `https://www.ndbc.noaa.gov/data/realtime2/{station_id}.txt` |
| **Key** | None required |
| **MVP status** | Not integrated. Future: Lake Erie wave height / surface temp |

### Relevant Buoys

| Buoy | ID | Location | Data |
|---|---|---|---|
| Lake Erie W | `45005` | Western Lake Erie | Wave height, water temp, wind |
| Lake Erie C | `45132` | Central Lake Erie | Wave height, water temp |

### Integration Notes

- Text format requires parsing — use fixed-width column mapping
- Relevant data: `WVHT` (wave height, m), `WTMP` (water temp, °C), `WSPD` (wind speed, m/s)
- Cache for 30 minutes; show "buoy data X hours old" warning
- Primary use case: "Is Lake Erie rough today?" safety indicator before launching

---

## 9. GLOS / Seagull — Great Lakes Observing System

| Field | Value |
|---|---|
| **Organization** | Great Lakes Observing System (GLOS) |
| **Portal** | https://seagull.glos.org |
| **Data** | Real-time water quality, temperature, ice extent, harmful algal bloom alerts |
| **API** | ERDDAP at `https://data.glos.org/erddap` |
| **Key** | None required (NOAA-affiliated public data) |
| **MVP status** | Not integrated. Future: HAB (harmful algal bloom) alerts for Lake Erie |

### Relevant Datasets

| Dataset | Use Case |
|---|---|
| Water temperature (GLOS network) | "Is it too cold to wade?" |
| Ice extent (seasonal) | Ice Mode — safe ice thickness indicator |
| HAB (algal bloom) alerts | "Is it safe to keep fish from this area?" |
| Buoy network | Supplement NDBC for Great Lakes coverage |

### Integration Notes

- Ice data is seasonal (November–April); can activate "Ice Mode" UI based on ice extent data
- HAB alerts critical for Lake Erie — display prominent warning in Conditions tab
- ERDDAP supports GeoJSON output for map overlay potential

---

## MVP Service Adapter Summary

| Service | File | Current | Target |
|---|---|---|---|
| Weather | `weatherService.ts` | Hardcoded mock | OpenWeatherMap free tier |
| Water conditions | `usgsService.ts` | Hardcoded mock | USGS NWIS gauge 04165500 |
| NOAA alerts | `noaaService.ts` | Hardcoded mock array | api.weather.gov/alerts |
| DNR data | `dnrService.ts` | Returns seed data | Michigan Open Data / manual JSON |

### How to Wire a Real Service (Example: USGS)

```typescript
// src/services/usgsService.ts

export async function getWaterConditions(siteNumber: string): Promise<WaterData> {
  // TODO: Replace with real API call below:
  // const url = `https://waterservices.usgs.gov/nwis/iv/?sites=${siteNumber}&parameterCd=00065,00010&format=json&period=PT1H`;
  // const res = await fetch(url, { headers: { 'User-Agent': 'PureMIFishing/1.0' }});
  // const json = await res.json();
  // return parseUSGSResponse(json);

  // MOCK — remove this block when wiring real API:
  return MOCK_WATER_DATA;
}
```

---

## Caching Strategy (Sprint 3)

| Data type | Cache duration | Storage |
|---|---|---|
| Weather forecast | 30 min | Zustand + AsyncStorage |
| Water level / temp | 15 min | Zustand + AsyncStorage |
| NOAA alerts | 10 min | Zustand + AsyncStorage |
| Regulations | 30 days | AsyncStorage (manual update) |
| Map tiles | Permanent (until pack deleted) | `expo-file-system` |
| Species data | App version | Bundled in source |
| Launch site data | App version | Bundled in source |

All cached data must show a `lastSynced` timestamp in the UI. Items older than their stale threshold must display a visible warning.
