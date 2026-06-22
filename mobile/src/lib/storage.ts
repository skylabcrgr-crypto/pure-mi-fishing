/**
 * storage.ts
 * Typed AsyncStorage helpers for Pure MI Fishing.
 *
 * All keys are namespaced under "@puremi/" to avoid collisions.
 * Functions are typed generics so TypeScript catches key/value
 * mismatches at call sites.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Key registry ─────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  preferences:          '@puremi/preferences',
  offlinePacks:         '@puremi/offline-packs',
  offlineRegionPacks:   '@puremi/offline-region-packs',
  trips:                '@puremi/trips',
  logbook:              '@puremi/logbook',
  catchSequence:        '@puremi/catch-sequence',
  onboardingDone:       '@puremi/onboarding-done',
  emergencyContact:     '@puremi/emergency-contact',
  lastKnownLocation:    '@puremi/last-known-location',
  citizenReports:       '@puremi/citizen-reports',
  emergencyIncidents:   '@puremi/emergency-incidents',
  weatherSnapshots:     '@puremi/weather-snapshots',
  waterSnapshots:       '@puremi/water-snapshots',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

// ── Generic helpers ──────────────────────────────────────────────────

/**
 * Read and JSON-parse a stored value.
 * Returns `null` if the key does not exist or parsing fails.
 */
export async function storageGet<T>(key: StorageKey): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * JSON-serialize and store a value under the given key.
 */
export async function storageSet<T>(key: StorageKey, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

/**
 * Remove a single key from storage.
 */
export async function storageRemove(key: StorageKey): Promise<void> {
  await AsyncStorage.removeItem(key);
}

/**
 * Atomically read-modify-write a stored array.
 * The updater receives the current array (defaulting to []) and
 * must return the new array. Useful for appending to logbook / trips.
 */
export async function storageUpdateArray<T>(
  key: StorageKey,
  updater: (current: T[]) => T[],
): Promise<T[]> {
  const current = (await storageGet<T[]>(key)) ?? [];
  const next = updater(current);
  await storageSet<T[]>(key, next);
  return next;
}

/**
 * Return the approximate number of bytes used by a storage key.
 * Used for the "Storage Usage" display in the Profile tab.
 */
export async function storageSizeBytes(key: StorageKey): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return 0;
    return new Blob([raw]).size;
  } catch {
    return 0;
  }
}

/**
 * Return total storage usage in KB across all Pure MI keys.
 */
export async function totalStorageKB(): Promise<number> {
  const sizes = await Promise.all(
    Object.values(STORAGE_KEYS).map((k) => storageSizeBytes(k as StorageKey)),
  );
  return Math.round(sizes.reduce((a, b) => a + b, 0) / 1024);
}

/**
 * Clear all Pure MI Fishing data from AsyncStorage.
 * Called from Settings → "Clear All Local Data".
 */
export async function clearAllStorage(): Promise<void> {
  const keys = Object.values(STORAGE_KEYS) as string[];
  await Promise.all(keys.map((k) => AsyncStorage.removeItem(k)));
}
