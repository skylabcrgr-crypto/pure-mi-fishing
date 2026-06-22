/**
 * useOfflineStatus.ts
 * Detects network reachability for the Pure MI Fishing offline-first UX.
 * Uses a lightweight fetch HEAD request to check connectivity on mount
 * and when the app returns to the foreground.
 *
 * Returns a stable boolean so components can show the "Offline Ready"
 * badge in trip mode and stale-data warnings in conditions/logbook.
 *
 * TODO: Install @react-native-community/netinfo for more granular
 * network type info (wifi vs. cellular vs. none) when needed.
 */

import { useState, useEffect, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export interface OfflineStatus {
  /** True when the device has no internet connectivity. */
  isOffline: boolean;
  /** True while the initial network check is running. */
  checking: boolean;
  /** Force a re-check (e.g. user taps a refresh button). */
  recheck: () => void;
}

/** Lightweight HEAD ping — resolves false on any network error. */
async function checkOnline(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return res.ok || res.status === 204;
  } catch {
    // Any network error (abort, timeout, DNS, CORS) → offline
    return false;
  }
}

export function useOfflineStatus(): OfflineStatus {
  const [isOffline, setIsOffline] = useState(false);
  const [checking, setChecking] = useState(true);

  const run = useCallback(async () => {
    setChecking(true);
    const online = await checkOnline();
    setIsOffline(!online);
    setChecking(false);
  }, []);

  useEffect(() => {
    run();

    // Re-check when the app comes to the foreground
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') run();
    });

    return () => sub.remove();
  }, [run]);

  return { isOffline, checking, recheck: run };
}
