# Emergency Mode Plan — Phase 5

## Overview

Emergency Mode is a dedicated screen for anglers who need help on the water. It is **fully offline-first** — GPS coordinates, last known location, saved contacts, nearest access points, and incident logging all work without any network connection.

> ⚠️ **Pure MI Fishing does not contact emergency services automatically.**
> If you are in immediate danger, call 911.

---

## Entry Points

| Location | Action |
|---|---|
| `trip-mode/[id].tsx` | Tap "Emergency" action button → opens `/emergency-mode?tripId=[id]` |
| Direct navigation | Any screen can `router.push('/emergency-mode')` |

---

## Route

`app/emergency-mode.tsx` — registered in `app/_layout.tsx` as `presentation: 'modal'`, `animation: 'slide_from_bottom'`, no header.

Accepts optional query param: `tripId` (links incident to an active trip).

---

## Service Layer

`mobile/src/services/emergencyService.ts`

### Exported functions

| Function | Description |
|---|---|
| `saveEmergencyContact(contact)` | Persist contact to AsyncStorage |
| `getEmergencyContact()` | Read saved contact |
| `clearEmergencyContact()` | Remove saved contact |
| `saveLastKnownLocation(loc)` | Persist latest GPS fix to AsyncStorage |
| `getLastKnownLocation()` | Read last saved GPS fix |
| `findNearestEmergencyAccessPoint(lat, lon)` | Haversine search over `getEmergencyResources()` — pure offline |
| `generateEmergencyMessage(input)` | Build plaintext SMS/share message |
| `createEmergencyIncident(input)` | Write incident to SQLite, return `EmergencyIncident` |
| `getEmergencyIncidents()` | Read all incidents from SQLite, newest first |
| `getLatestEmergencyIncident()` | Read the single most recent incident |

---

## Data Storage

| Data | Storage | Key / Table |
|---|---|---|
| Emergency contact | AsyncStorage | `@puremi/emergency-contact` |
| Last known location | AsyncStorage | `@puremi/last-known-location` |
| Emergency incidents | SQLite | `emergency_incidents` table (Phase 1 schema) |

---

## Emergency Incident Schema (SQLite)

```sql
CREATE TABLE IF NOT EXISTS emergency_incidents (
  id                          TEXT PRIMARY KEY NOT NULL,
  created_at                  TEXT NOT NULL,
  latitude                    REAL,
  longitude                   REAL,
  last_known_latitude         REAL,
  last_known_longitude        REAL,
  last_known_at               TEXT,
  battery_level               REAL,
  notes                       TEXT,
  emergency_contact_name      TEXT,
  emergency_contact_phone     TEXT,
  nearest_access_point_id     TEXT,
  nearest_access_point_name   TEXT,
  nearest_access_distance_mi  REAL,
  status                      TEXT NOT NULL DEFAULT 'active',
  sync_status                 TEXT NOT NULL DEFAULT 'pending',
  sync_attempts               INTEGER NOT NULL DEFAULT 0
);
```

`sync_status = 'pending'` until Phase 7 (backend sync) is implemented.

---

## Emergency Message Format

```
🚨 EMERGENCY — I need help while fishing.

📍 Current location: 42.18000, -83.12000
🗺️  Maps: https://maps.google.com/?q=42.18000,-83.12000

🏥 Nearest help: Flat Rock State Park Boat Launch (2.3 mi away)
   Phone: 734-379-5020
   Address: 25500 Gibraltar Rd, Flat Rock, MI 48134

🕐 Time: Mon, Jun 22, 2026, 2:32:00 PM EDT
🔋 Battery: unavailable

Sent from Pure MI Fishing.
⚠️  This app does not contact emergency services automatically.
Call 911 for life-threatening emergencies.
```

---

## Offline Behavior

| Scenario | Behavior |
|---|---|
| No network | All features work — no API calls required |
| GPS denied | Shows last known location from AsyncStorage, or empty state |
| No GPS fix yet | Shows "Acquiring GPS…" while attempting, falls back to last known |
| No emergency contact | Contact section shows "Add" prompt, SMS button prompts setup |
| No access points in data | Nearest point section hidden |
| DB write fails | `createEmergencyIncident()` catches the error; incident still returned |

---

## UI Actions

| Button | Behavior |
|---|---|
| **CALL 911** | `Linking.openURL('tel:911')` — system phone dialer |
| **Text Now** | `Linking.openURL('sms:[phone]?body=[message]')` — system SMS with pre-filled message |
| **Copy / Share Message** | `Share.share({ message })` — native share sheet (includes copy option) |
| **Save Incident** | `createEmergencyIncident()` → SQLite, one-time, disables after save |
| **I'm Safe** | Alert confirmation → `router.back()` |

---

## Battery Percentage

**Deferred.** `expo-battery` is not installed. Battery level stored as `null` in incidents and shown as "unavailable" in the message.

To enable: `npx expo install expo-battery`, then import `useBatteryLevel()` in the screen and pass `batteryPercent` to `generateEmergencyMessage()`.

---

## Safety Disclaimers

Shown in three places:
1. Header banner (red, non-dismissable)
2. `disclaimerBanner` below the header
3. Bottom section "Important" card

Wording: *"Pure MI Fishing does not contact emergency services automatically. If you are in immediate danger, call 911. Location data may be inaccurate or unavailable."*
