/**
 * useLocation.ts
 * Expo Location wrapper hook for Pure MI Fishing.
 * Requests foreground permission, watches GPS position,
 * and exposes a simple API to the rest of the app.
 *
 * TODO: Add background location for active trip tracking in a future update.
 */

import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface LocationState {
  /** Current device position, or null while loading / if permission denied. */
  position: LatLng | null;
  /** Accuracy in meters, or null when unavailable. */
  accuracyMeters: number | null;
  /** True while the initial location fix is being acquired. */
  loading: boolean;
  /** Human-readable error message, or null if no error. */
  error: string | null;
  /** Whether foreground location permission has been granted. */
  hasPermission: boolean;
  /** Re-request permission and restart watching. */
  refresh: () => void;
}

/** Detroit River center — used as fallback when GPS is unavailable. */
export const DETROIT_RIVER_FALLBACK: LatLng = {
  latitude: 42.18,
  longitude: -83.12,
};

export function useLocation(): LocationState {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [accuracyMeters, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [watchId, setWatchId] = useState<Location.LocationSubscription | null>(null);

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasPermission(false);
        setError('Location permission denied. Using Detroit River region as default.');
        setLoading(false);
        return;
      }
      setHasPermission(true);

      // Get an immediate fix first
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setPosition({
        latitude: initial.coords.latitude,
        longitude: initial.coords.longitude,
      });
      setAccuracy(initial.coords.accuracy ?? null);
      setLoading(false);

      // Then watch for updates
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          distanceInterval: 15,   // update every 15 m
          timeInterval: 10_000,   // or every 10 s
        },
        (loc) => {
          setPosition({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
          setAccuracy(loc.coords.accuracy ?? null);
        },
      );
      setWatchId(sub);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown location error';
      setError(msg);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    start();
    return () => {
      watchId?.remove();
    };
    // watchId intentionally excluded — we only want cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(() => {
    watchId?.remove();
    setWatchId(null);
    start();
  }, [watchId, start]);

  return { position, accuracyMeters, loading, error, hasPermission, refresh };
}
