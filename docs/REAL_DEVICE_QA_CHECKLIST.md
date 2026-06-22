# Real Device QA Checklist — Pure MI Fishing

> Phase 9 Reference · June 2026
> This document provides a detailed QA checklist for testing Pure MI Fishing on physical iOS and Android devices.

---

## Pre-QA Setup

- **Test devices:** One or more physical iPhone and Android phones (or emulators)
- **Network:** Test both online and offline (airplane mode)
- **User data:** Start with a clean app install or reset local storage
- **GPS:** Test with location allowed and denied
- **Build:** Use the `.ipa` (iOS) or `.apk` (Android) from EAS or local Expo build

---

## Test Environments

| Environment | Setup | Purpose |
|---|---|---|
| Online (WiFi/LTE) | Normal network connectivity | Verify app boots and syncs without errors |
| Offline (Airplane Mode) | Enable airplane mode in device settings | Verify offline-first behavior and local data saves |
| GPS Allowed | Settings → Location → Allow Pure MI Fishing | Verify location is captured in Emergency Mode and Reports |
| GPS Denied | Settings → Location → Never/Deny Pure MI Fishing | Verify fallback behavior and no crashes |

---

## App Install & Boot

### iOS Installation
- [ ] Download `.ipa` from EAS or Expo dev client
- [ ] Install via TestFlight (recommended) or manually via Xcode
- [ ] Launch the app
- [ ] App opens without crash
- [ ] Home screen (Explore tab) is visible

### Android Installation
- [ ] Download `.apk` from EAS or `npx expo start --android`
- [ ] Install via `adb install path/to/app.apk` or sideload via Android Studio
- [ ] Launch the app
- [ ] App opens without crash
- [ ] Home screen (Explore tab) is visible

---

## Core Navigation

- [ ] **Explore tab** → Map loads, access point pins visible (if online)
- [ ] **Trips tab** → Trip list is visible and empty on fresh install
- [ ] **Logbook tab** → Logbook is visible and empty on fresh install
- [ ] **Profile tab** → Profile screen is visible
- [ ] **Settings tab** → Settings menu is visible
- [ ] **Back navigation** → Tapping back button exits screen correctly

---

## Trip Mode & Offline Trip Logging

### Start a Trip
- [ ] Navigate to Trips tab → tap "Start Trip"
- [ ] Trip Mode screen appears (should show map if online)
- [ ] Tap "Fish Forecast" sub-tab → recommendation is visible
- [ ] Tap "Offline Rules" sub-tab → regulation rules display (sample guidance)

### Log a Catch
- [ ] In Trip Mode, tap "Log Catch" button
- [ ] Catch form opens (species, size, time, notes fields)
- [ ] Fill in a sample catch entry
- [ ] Tap "Save Catch"
- [ ] Catch appears in trip summary

### End Trip and Verify Persistence
- [ ] Tap "End Trip" button
- [ ] Trip is saved to local storage
- [ ] Close the app (fully background and kill process)
- [ ] Reopen the app → Navigate to Trips tab
- [ ] **Verify:** Trip and catch are still present

---

## Offline-First Behavior

### Boot in Airplane Mode
- [ ] Enable airplane mode
- [ ] Force-close the app (kill process)
- [ ] Reopen the app
- [ ] App boots successfully without network
- [ ] Offline indicator is visible (if implemented)
- [ ] Core screens render without errors

### Start Trip Offline
- [ ] In airplane mode, navigate to Trips tab → "Start Trip"
- [ ] Trip Mode screen appears
- [ ] Map may be blank (expected; tiles require network)
- [ ] Offline Rules still display (loaded from local seed data)
- [ ] Tap "Log Catch" and save a catch offline
- [ ] Catch is saved locally

### Exit Airplane Mode and Verify Data
- [ ] Disable airplane mode
- [ ] Navigate back to Trips tab
- [ ] Trip and catch are still present (no loss of data)

---

## GPS and Location Handling

### GPS Allowed
- [ ] Open Explore tab (or trigger location request)
- [ ] Device prompts for location permission
- [ ] Tap "Allow"
- [ ] Map centers on user location (if online)
- [ ] Open Emergency Mode screen
- [ ] GPS coordinates are displayed

### GPS Denied
- [ ] Settings → App permissions → Disable location for Pure MI Fishing
- [ ] Reopen app
- [ ] Open Emergency Mode
- [ ] Confirm last known location or fallback location is shown
- [ ] No crash or error displayed

---

## Emergency Mode

- [ ] Navigate to Trip Mode → tap "Emergency" button (or long-press, depending on UX)
- [ ] Emergency Mode screen appears
- [ ] GPS coordinates are visible (or last known location if GPS denied)
- [ ] Nearest access point / resource point is displayed
- [ ] Emergency contact field is visible
- [ ] Disclaimer is visible at top: "This app does not replace emergency services. Call 911 for life-threatening emergencies."
- [ ] Tap "Generate Message" or similar
- [ ] Generated SMS preview is shown
- [ ] Tap "Copy" or "Share" → message can be copied or shared
- [ ] Force close app → reopen
- [ ] **Verify:** Emergency contact is still stored

---

## Citizen Reports

- [ ] Navigate to Settings → "Report a Problem" (or from main menu)
- [ ] Report form appears
- [ ] Select a report type from dropdown (e.g., "Pollution")
- [ ] GPS coordinates are auto-filled
- [ ] Toggle "Anonymous" switch
- [ ] Add notes in the text field
- [ ] Tap "Save Report"
- [ ] Report is saved as draft
- [ ] Navigate to Settings → "My Reports" (or Reports History)
- [ ] Draft report is visible in list
- [ ] Tap on report → report details are shown
- [ ] Tap "Delete" → report is removed from list
- [ ] Force close app → reopen
- [ ] **Verify:** Remaining reports still exist

---

## Fish Forecast (Conditions Tab)

- [ ] Navigate to Trip Mode → "Fish Forecast" tab
- [ ] Recommendation section is visible
- [ ] Species name is shown (e.g., "Walleye")
- [ ] Confidence level (Low / Medium / High) is displayed
- [ ] Factors considered are listed (e.g., water temp, time of day)
- [ ] Sample guidance disclaimer is visible
- [ ] No crashes or loading states stuck

---

## Offline Packs & Data

- [ ] Navigate to Settings → "Offline Packs"
- [ ] Detroit River pack is listed with status, version, and download date
- [ ] Tap on pack → pack details are displayed (layers, size, etc.)
- [ ] Force close app
- [ ] **Verify:** Offline pack state persists

---

## Explore Tab & Access Points

- [ ] Explore tab is visible
- [ ] If online: map loads with access point pins
- [ ] If offline: map is blank but pins are still clickable (if local data available)
- [ ] Tap on a pin → access point detail card appears
- [ ] Detail shows name, type, hours, notes
- [ ] Tap "Save" (or heart icon) → access point is saved to favorites
- [ ] Navigate away and back → saved access point is still marked

---

## Sync & Backup Status

- [ ] Navigate to Settings → "Sync & Backup"
- [ ] Screen shows current status: "Configured" or "Not configured"
- [ ] If not configured: message shows "Backend not configured"
- [ ] If configured + signed in: "Pending: X trips, Y catches, Z reports"
- [ ] Tap "Sync Now" → sync runs without crash
- [ ] If offline or backend down: sync fails gracefully (no crash, message shown)
- [ ] Local data is preserved after failed sync attempt

---

## App Restart & Data Persistence

### After each major flow, verify:
- [ ] Force close app (kill process)
- [ ] Reopen app
- [ ] **All previous test data is still present:**
  - Trip and catches
  - Citizen reports
  - Emergency contact
  - Saved access points
  - Offline pack state

---

## Performance & Stability

- [ ] App does not crash on any screen
- [ ] Transitions between tabs are smooth
- [ ] No hanging states or infinite spinners
- [ ] App does not use excessive CPU/battery during normal use
- [ ] App resumes correctly after backgrounding for 5+ minutes
- [ ] App survives a device restart

---

## Permissions & Disclaimers

### iOS
- [ ] First launch shows location permission prompt (or accessible in Settings)
- [ ] Privacy and terms links are available in Settings or app info
- [ ] Emergency Mode disclaimer is non-dismissible and always visible

### Android
- [ ] First launch shows location permission prompt
- [ ] Privacy and terms links are available
- [ ] Emergency Mode disclaimer is visible

---

## Known Acceptable Limitations to Document

During testing, if the following are observed, they are **acceptable for beta** (do not block release):

- [ ] Map tiles require network (offline tiles deferred to Sprint 3)
- [ ] Photo attachment not available in report form (deferred)
- [ ] Auth sign-in/sign-up screens not yet implemented (backend optional)
- [ ] Real weather/USGS/NOAA data is mocked (live APIs deferred)
- [ ] Regulation data is sample guidance (not verified with DNR)

---

## Issues Found During Testing

### Critical (Blocks Release)
If any of the following occur, document and block release:
- App crashes on launch or during boot
- Offline data is lost after app restart
- Core screens don't render
- Location permission crashes the app
- Sync crashes the app when offline

### Non-Critical (For Next Build)
If any of the following occur, document but do not block:
- Typos or UI text issues
- Minor performance issues (not related to battery drain)
- Missing placeholder data (e.g., empty catch list initially)

---

## Test Sign-Off

| Device | OS Version | Tester | Date | Pass/Fail | Notes |
|---|---|---|---|---|---|
| iPhone 14 | iOS 17.x | [Name] | [Date] | [ ] | |
| iPhone 12+ | iOS 16.x | [Name] | [Date] | [ ] | |
| Android 13+ | Android 13+ | [Name] | [Date] | [ ] | |
| Android 11+ | Android 11+ | [Name] | [Date] | [ ] | |

---

## Final QA Sign-Off

- [ ] All critical test cases passed
- [ ] No crashes or data loss on any device
- [ ] App meets beta acceptance criteria (see [BETA_ACCEPTANCE_CRITERIA.md](BETA_ACCEPTANCE_CRITERIA.md))
- [ ] Ready to submit to TestFlight and Google Play internal track

**Signed off by:** ________________  
**Date:** ________________  
**Issues logged for next sprint:** [List any non-critical issues]
