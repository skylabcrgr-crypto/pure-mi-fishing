# EAS Build Checklist — Pure MI Fishing

> Phase 9 Reference · June 2026
> This document provides step-by-step instructions for building Pure MI Fishing for TestFlight (iOS) and Google Play internal track (Android).

---

## Pre-Build Validation

Before running any EAS builds, confirm the app is ready:

```bash
cd mobile

# 1. TypeScript compilation check
npm run typecheck

# 2. Smoke-check for required files and routes
npm run smoke-check

# 3. Expo config validation
npx expo config --type public
```

**Expected Results:**
- ✅ `npm run typecheck` → exits with code 0 (no errors)
- ✅ `npm run smoke-check` → "Smoke check passed. Required files and routes are present."
- ✅ `npx expo config --type public` → outputs full config with no errors

---

## Build Configuration Status

### iOS Build
- **Bundle identifier:** `com.skylabcreativegroup.puremifishing`
- **Build number:** `1` (will auto-increment in production profile)
- **Profile for beta:** `preview` (internal distribution)
- **Profile for production:** `production` (App Store)

### Android Build
- **Package name:** `com.skylabcreativegroup.puremifishing`
- **Version code:** `1` (will auto-increment if configured)
- **Build type for preview:** `apk` (internal/TestFlight)
- **Build type for production:** `app-bundle` (Google Play)

---

## First iOS Build (Preview for Internal Distribution)

### Command
```bash
cd mobile
eas build --platform ios --profile preview
```

### What happens:
1. EAS validates the Expo config (`app.json`)
2. EAS runs Expo prebuild (generates native iOS project)
3. EAS compiles and signs for internal distribution
4. Build is stored in EAS dashboard
5. You can download the `.ipa` or send to TestFlight directly

### After first build:
- Note the build ID (available in EAS dashboard)
- Download the `.ipa` to test on physical iPhone or use TestFlight URL
- Confirm app boots and core screens render

---

## First Android Build (APK for Internal Distribution)

### Command
```bash
cd mobile
eas build --platform android --profile preview
```

### What happens:
1. EAS validates Expo config
2. EAS runs Expo prebuild (generates native Android project)
3. EAS compiles and signs with internal key
4. Build is stored as `.apk` in EAS dashboard
5. You can download the `.apk` and install on device or emulator

### After first build:
- Download the `.apk` from EAS dashboard
- Install on physical Android device or emulator
- Confirm app boots and core screens render

---

## iOS to TestFlight (After Internal Build Succeeds)

### Setup (one-time):
- Create an Apple Developer account and join Apple Developer Program
- Create an app bundle ID on App Store Connect matching `com.skylabcreativegroup.puremifishing`
- In EAS dashboard, link your Apple Developer account

### EAS command:
```bash
cd mobile
eas build --platform ios --profile production --submit
```

**Note:** The `--submit` flag automatically submits to TestFlight. You can also build without submitting and submit manually later.

---

## Android to Google Play Internal Testing (After Internal Build Succeeds)

### Setup (one-time):
- Create a Google Play Developer account
- Create an app entry on Google Play Console matching `com.skylabcreativegroup.puremifishing`
- Generate a Google Service Account key
- Link the key to EAS

### EAS command:
```bash
cd mobile
eas build --platform android --profile production --submit
```

**Note:** This submits to Google Play internal testing track. The app will not be published to public until submitted to production track.

---

## Build Troubleshooting

### "Build failed during Expo prebuild"
- Usually a missing dependency or incompatible plugin
- Run `npm run typecheck` and `npm run smoke-check` locally first
- Check `app.json` plugins list

### "Build failed during compilation"
- Check for TypeScript errors: `npm run typecheck`
- Check that all native modules are properly linked
- Review build logs in EAS dashboard

### "Signing failed"
- Ensure Apple Developer certificate is uploaded to EAS (iOS)
- Ensure Google Service Account is linked (Android)
- Check EAS dashboard credentials

---

## Version Management

### Incrementing versions between builds:
- **iOS:** Edit `mobile/app.json` `ios.buildNumber` (e.g., "1" → "2")
- **Android:** Edit `mobile/app.json` `android.versionCode` (e.g., 1 → 2)
- **Both:** Edit `mobile/app.json` `version` for user-visible version (e.g., "1.0.0" → "1.0.1")

### Auto-increment in production:
- The `production` profile in `eas.json` has `autoIncrement: true`
- Build numbers will increment automatically for subsequent production builds

---

## Monitoring & Logs

### View build status:
```bash
eas build:list
```

### View build logs:
```bash
eas build:logs <BUILD_ID>
```

### Download build artifact:
```bash
eas build:download <BUILD_ID>
```

---

## Next Steps After First Build

1. **Run device QA** using [REAL_DEVICE_QA_CHECKLIST.md](REAL_DEVICE_QA_CHECKLIST.md)
2. **Document any regressions** found during testing
3. **Fix critical bugs** if they block core functionality
4. **Re-run validations** before subsequent builds
5. **Plan TestFlight and Play Store metadata** (screenshots, keywords, description, privacy policy)
