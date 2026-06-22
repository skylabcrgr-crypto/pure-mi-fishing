// Pure MI Fishing — Supabase Client (Phase 7)
// ----------------------------------------------------------------------------
// Offline-first contract:
//   * The client is OPTIONAL. If env vars are missing, this module never
//     throws — `getSupabase()` returns null and `isSupabaseConfigured()`
//     returns false. The rest of the app keeps working fully offline.
//   * Uses the Expo PUBLIC anon key only. NEVER embed a service-role key.
//   * Session persistence is backed by AsyncStorage so a signed-in user
//     stays signed in across launches.
// ----------------------------------------------------------------------------

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

/** True when both required public env vars are present. */
export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let client: SupabaseClient | null = null;

/**
 * Returns a lazily-initialized Supabase client, or null when the backend is
 * not configured. Safe to call anywhere — never throws.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (client) return client;

  try {
    client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        // React Native has no URL-based session detection.
        detectSessionInUrl: false,
      },
    });
    return client;
  } catch {
    // Defensive: misconfigured env should degrade to offline, not crash.
    client = null;
    return null;
  }
}

/** Human-readable summary of backend configuration for diagnostics UI. */
export function getSupabaseConfigSummary(): {
  configured: boolean;
  url: string | null;
  appEnv: string;
} {
  return {
    configured: isSupabaseConfigured(),
    url: SUPABASE_URL ?? null,
    appEnv: process.env.EXPO_PUBLIC_APP_ENV?.trim() || 'development',
  };
}
