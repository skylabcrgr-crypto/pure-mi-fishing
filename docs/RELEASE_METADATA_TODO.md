# Release Metadata TODO — Pure MI Fishing

> Phase 9 Reference · June 2026
> This document tracks placeholder and pending metadata that must be finalized before TestFlight and Google Play submission.

---

## Placeholder Values Currently in Use

### `mobile/app.json` `extra` section

Currently:
```json
{
  "privacyPolicyUrl": "https://example.com/privacy-policy",
  "termsOfServiceUrl": "https://example.com/terms",
  "supportEmail": "support@puremifishing.app"
}
```

**TODO:**
- [ ] **Privacy Policy URL** → Replace `https://example.com/privacy-policy` with real URL (must be published, accessible, and compliant with app store requirements)
- [ ] **Terms of Service URL** → Replace `https://example.com/terms` with real URL (optional but recommended)
- [ ] **Support Email** → Replace `support@puremifishing.app` with real, monitored inbox (must be able to receive user support requests)

---

## Verified Release Metadata (No Changes Needed)

| Field | Value | Status |
|-------|-------|--------|
| App Name | `Pure MI Fishing` | ✅ Final |
| iOS Bundle ID | `com.skylabcreativegroup.puremifishing` | ✅ Final |
| Android Package Name | `com.skylabcreativegroup.puremifishing` | ✅ Final |
| Initial Version | `1.0.0` | ✅ Final |
| iOS Build Number | `1` | ✅ Final |
| Android Version Code | `1` | ✅ Final |
| Scheme | `puremi` | ✅ Final |
| Deep Link Support | Yes | ✅ Configured |
| Location Permission String | (iOS) "Pure MI Fishing uses your location to center maps, suggest nearby waterbodies, and record location for emergency mode." | ✅ Final |
| Android Permissions | `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` | ✅ Final |
| App Icon | Configured | ✅ Asset present |
| Splash Screen | Configured | ✅ Asset present |

---

## EAS & Build Configuration (No Changes Needed)

| Config | Value | Status |
|--------|-------|--------|
| EAS CLI version required | `>= 12.0.0` | ✅ Ready |
| Development profile | `development` (simulator, internal) | ✅ Ready |
| Preview profile | `preview` (internal, device) | ✅ Ready |
| Production profile | `production` (autoIncrement enabled) | ✅ Ready |
| iOS simulator | `false` for preview/production | ✅ Ready |
| Android build type (preview) | `apk` | ✅ Ready |
| Android build type (production) | `app-bundle` | ✅ Ready |
| Supabase env vars | Optional, all documented | ✅ Ready |
| Service-role key in app | None (anon key only) | ✅ Ready |

---

## TestFlight & Play Store Metadata (Needed Before Submission)

The following metadata is **not yet required** for the first internal build but **will be required** before public TestFlight or Play Store submission. Prepare these in advance:

### Screenshots (prepare 3-5 per platform)
- [ ] Explore map and access points
- [ ] Trip mode or logbook
- [ ] Emergency Mode with location
- [ ] Citizen report draft
- [ ] Offline status or settings screen

**Size requirements:**
- **iOS:** 1170×2532px (various iPhone sizes)
- **Android:** 1440×3120px (various Android sizes)

### Keywords & Description (for App Store / Play Store)
- [ ] App keywords (5-10 relevant search terms)
- [ ] Short description (80 characters max for App Store)
- [ ] Full description (up to 4000 characters)
- [ ] Category (Sports, Outdoor, Utilities)

### Release Notes
- [ ] Beta release notes describing the app and inviting feedback
- [ ] Known limitations section
- [ ] Version history (starting with "1.0.0 - Beta")

### Privacy & Legal
- [ ] Privacy Policy (published at `privacyPolicyUrl`)
- [ ] Terms of Service (published at `termsOfServiceUrl`, if applicable)
- [ ] Support email monitored and responsive
- [ ] Compliance notes (location data usage, no paid features in beta)

---

## Action Items by Priority

### Must Complete Before First EAS Build
- [ ] Run `npm run typecheck` ✅ (already passed in Phase 8)
- [ ] Run `npm run smoke-check` ✅ (already passed in Phase 8)
- [ ] Run `npx expo config --type public` ✅ (already passed in Phase 8)

### Must Complete Before TestFlight/Play Store Submission (Internal Build OK without these)
- [ ] Replace `privacyPolicyUrl` with real URL
- [ ] Replace `supportEmail` with monitored email
- [ ] Optionally replace `termsOfServiceUrl` with real URL

### Must Complete After Device QA, Before Public Release
- [ ] Prepare app store screenshots
- [ ] Write app description and keywords
- [ ] Write beta release notes
- [ ] Publish privacy policy and terms

---

## Notes

- **First EAS build can proceed** with placeholder URLs (internal testing only)
- **TestFlight submission can proceed** with placeholder URLs if you don't plan to add external beta testers yet
- **Public App Store submission will be rejected** if URLs are still placeholders
- **Google Play submission** may be more lenient with placeholders initially, but should be replaced before inviting external testers

---

## Sign-Off

- [ ] All verified metadata is correct
- [ ] TODO list assigned to appropriate teams/individuals
- [ ] Target dates for metadata completion: [Insert planned dates]

**Assigned to:** ________________  
**Target completion date:** ________________
