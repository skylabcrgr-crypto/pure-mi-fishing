# QA Test Matrix — Pure MI Fishing

| Test Case | iOS Device | iOS Simulator | Android Device | Android Emulator | Expected Result |
|---|---|---|---|---|---|
| App launches online | ✓ | ✓ | ✓ | ✓ | Home screen loads without crash |
| App launches offline | ✓ | ✓ | ✓ | ✓ | App opens and offline status is visible |
| GPS allowed | ✓ | ✓ | ✓ | ✓ | Location displayed in Emergency Mode |
| GPS denied | ✓ | ✓ | ✓ | ✓ | App falls back to last known or default location |
| No Supabase env vars | ✓ | ✓ | ✓ | ✓ | Sync screen shows not configured |
| Supabase configured signed out | ✓ | ✓ | ✓ | ✓ | Sync does not crash and shows signed-out state |
| Supabase configured signed in | ✓ | ✓ | ✓ | ✓ | Sync uploads when online and user is authenticated |
| Start trip offline | ✓ | ✓ | ✓ | ✓ | Trip is saved locally and persists after restart |
| Log catch offline | ✓ | ✓ | ✓ | ✓ | Catch entry persists after restart |
| Report a Problem draft | ✓ | ✓ | ✓ | ✓ | Draft saves and is visible in history |
| Delete report draft | ✓ | ✓ | ✓ | ✓ | Draft is removed from history |
| Emergency contact saved | ✓ | ✓ | ✓ | ✓ | Contact persists in Emergency Mode |
| Emergency message copy/share | ✓ | ✓ | ✓ | ✓ | Generated message is visible and shareable |
| Sync Now offline | ✓ | ✓ | ✓ | ✓ | No crash, local data preserved |
| Offline pack status visible | ✓ | ✓ | ✓ | ✓ | Downloaded pack state is displayed |
| Regulation disclaimer shown | ✓ | ✓ | ✓ | ✓ | Sample guidance warning is visible |
| Settings render | ✓ | ✓ | ✓ | ✓ | Settings and sync status render correctly |
| Navigation stability | ✓ | ✓ | ✓ | ✓ | No broken routes and back navigation works |
| App icon and splash load | ✓ | ✓ | ✓ | ✓ | App icon and splash screen display |
| iOS build config valid | N/A | N/A | N/A | N/A | `app.json` includes location usage strings |
| Android permissions valid | N/A | N/A | N/A | N/A | Android permissions include location |

> Use this matrix to mark status for each device and track regressions during beta testing.
