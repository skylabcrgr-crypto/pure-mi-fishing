# Privacy and Safety Notes — Pure MI Fishing

## Privacy Principles
- The app is designed for offline-first use. User data is stored locally in SQLite / AsyncStorage by default.
- Supabase backup is optional and only active when Supabase env vars are configured and a user is signed in.
- No service-role key is included in the mobile app.
- Row Level Security is expected to enforce user isolation for synced rows.

## Data Stored Locally
- Trip and catch logs
- Emergency incident records
- Citizen report drafts
- Emergency contacts
- Offline pack download state

## Sync Behavior
- Sync is push-only: local records may be uploaded to Supabase, but the app does not pull or merge remote data.
- Failed sync attempts do not delete local records.
- Supabase is optional; the app functions without network access or backend configuration.

## Safety Disclaimers
- Emergency Mode is not a replacement for professional emergency services.
- The app should never be used as a substitute for dialing 911 for life-threatening emergencies.
- Regulation and fishing guidance are sample/advisory only and must be verified against official Michigan DNR sources.

## User Consent
- Location data is used to improve map centering, emergency location reporting, and waterbody resolution.
- The app does not share location data unless the user explicitly saves and syncs records while signed in.
- Report anonymity is allowed, but anonymous reports may still contain location context.

## Known Beta Limitations
- There is no sign-in or auth UI in the current beta.
- Photo attachment is not implemented.
- Regulation data is sample/advisory only.
- Offline map tiles are not fully cached; map background may still require network connectivity.
