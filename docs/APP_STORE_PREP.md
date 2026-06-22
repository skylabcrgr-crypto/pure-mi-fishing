# App Store & TestFlight Prep — Pure MI Fishing

## App Identity
- App name: `Pure MI Fishing`
- iOS bundle identifier: `com.skylabcreativegroup.puremifishing`
- Android package name: `com.skylabcreativegroup.puremifishing`
- Current version: `1.0.0`
- iOS build number: `1`
- Android version code: `1`
- Deep link scheme: `puremi`

## Required Metadata
- Privacy Policy URL: `https://example.com/privacy-policy`
- Terms of Service URL: `https://example.com/terms`
- Support email: `support@puremifishing.app`

## Permissions and Usage Strings
- iOS location usage string: `Pure MI Fishing uses your location to center maps, suggest nearby waterbodies, and record location for emergency mode.`
- Android location permissions:
  - `ACCESS_FINE_LOCATION`
  - `ACCESS_COARSE_LOCATION`

## Screenshots and Assets
- Prepare screenshots for:
  - Explore map and access points
  - Trip mode or logbook screen
  - Emergency Mode with location message
  - Report a Problem screen
  - Sync & Backup status screen
- Confirm app icon and splash assets are present in `mobile/assets/`

## TestFlight Checklist
- [ ] Run `yarn typecheck` or `npx tsc --noEmit` in `mobile/`
- [ ] Run `yarn smoke-check` or `node mobile/scripts/smoke-check.mjs`
- [ ] Verify the app launches offline and with no Supabase env vars
- [ ] Confirm critical screens render and navigation works
- [ ] Confirm the app can be installed on a physical device
- [ ] Document review notes for TestFlight submission

## Android Internal Testing Checklist
- [ ] Confirm `eas.json` production profile exists
- [ ] Verify Android build settings include required package and permissions
- [ ] Prepare internal track release notes describing beta scope
- [ ] Verify app icon and splash appear correctly on Android
- [ ] Confirm location permission request appears when needed
