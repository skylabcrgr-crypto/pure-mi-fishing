/**
 * useOfflinePackStore.ts
 * Manages OfflineRegionPack status and saved access point IDs.
 * - Pack status is persisted to AsyncStorage (only downloaded/update_available packs are stored).
 * - Saved access point IDs are persisted to AsyncStorage.
 * - On boot, call loadFromStorage() from _layout.tsx.
 *
 * Replaces the OfflinePack management in useAppStore for the new OfflineRegionPack type.
 * Legacy OfflinePack management remains in useAppStore for backward compatibility.
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { OfflineRegionPack } from '../types';
import { OFFLINE_REGION_PACKS } from '../data/offlineRegionPacks';

const REGION_PACK_STATUS_KEY = '@puremi/region-pack-status';
const SAVED_ACCESS_POINTS_KEY = '@puremi/saved-access-points';

type PersistedPackStatus = {
  status: OfflineRegionPack['status'];
  downloadedAt?: string;
};

interface OfflinePackState {
  /** All region packs, with status merged from storage on boot. */
  regionPacks: OfflineRegionPack[];
  /** IDs of access points the user has saved as favorite spots. */
  savedAccessPointIds: string[];
  /** True once loadFromStorage() has completed. */
  isLoaded: boolean;

  // Actions
  loadFromStorage: () => Promise<void>;
  startPackDownload: (packId: string) => void;
  updatePackProgress: (packId: string, progress: number) => void;
  markPackDownloaded: (packId: string) => void;
  deletePackDownload: (packId: string) => void;
  toggleSavedAccessPoint: (accessPointId: string) => Promise<void>;
}

export const useOfflinePackStore = create<OfflinePackState>((set, get) => ({
  regionPacks: OFFLINE_REGION_PACKS.map((p) => ({ ...p })),
  savedAccessPointIds: [],
  isLoaded: false,

  loadFromStorage: async () => {
    try {
      const [packsRaw, spotsRaw] = await Promise.all([
        AsyncStorage.getItem(REGION_PACK_STATUS_KEY),
        AsyncStorage.getItem(SAVED_ACCESS_POINTS_KEY),
      ]);

      const packStatuses: Record<string, PersistedPackStatus> = packsRaw
        ? (JSON.parse(packsRaw) as Record<string, PersistedPackStatus>)
        : {};
      const savedAccessPointIds: string[] = spotsRaw
        ? (JSON.parse(spotsRaw) as string[])
        : [];

      set((state) => ({
        regionPacks: state.regionPacks.map((p) => ({
          ...p,
          ...(packStatuses[p.id] ?? {}),
        })),
        savedAccessPointIds,
        isLoaded: true,
      }));
    } catch {
      set({ isLoaded: true });
    }
  },

  startPackDownload: (packId) => {
    set((state) => ({
      regionPacks: state.regionPacks.map((p) =>
        p.id === packId ? { ...p, status: 'downloading', downloadProgress: 0 } : p,
      ),
    }));
  },

  updatePackProgress: (packId, progress) => {
    set((state) => ({
      regionPacks: state.regionPacks.map((p) =>
        p.id === packId ? { ...p, downloadProgress: progress } : p,
      ),
    }));
  },

  markPackDownloaded: (packId) => {
    const downloadedAt = new Date().toISOString();
    set((state) => ({
      regionPacks: state.regionPacks.map((p) =>
        p.id === packId
          ? { ...p, status: 'downloaded', downloadProgress: 1, downloadedAt }
          : p,
      ),
    }));
    _persistPackStatuses(get().regionPacks);
  },

  deletePackDownload: (packId) => {
    set((state) => ({
      regionPacks: state.regionPacks.map((p) =>
        p.id === packId
          ? { ...p, status: 'available', downloadProgress: undefined, downloadedAt: undefined }
          : p,
      ),
    }));
    _persistPackStatuses(get().regionPacks);
  },

  toggleSavedAccessPoint: async (accessPointId) => {
    const current = get().savedAccessPointIds;
    const updated = current.includes(accessPointId)
      ? current.filter((id) => id !== accessPointId)
      : [...current, accessPointId];
    set({ savedAccessPointIds: updated });
    await AsyncStorage.setItem(SAVED_ACCESS_POINTS_KEY, JSON.stringify(updated));
  },
}));

/** Persist only the status fields we need (not the full pack definition). */
function _persistPackStatuses(packs: OfflineRegionPack[]): void {
  const statuses: Record<string, PersistedPackStatus> = {};
  packs.forEach((p) => {
    if (p.status === 'downloaded' || p.status === 'update_available') {
      statuses[p.id] = { status: p.status, downloadedAt: p.downloadedAt };
    }
  });
  AsyncStorage.setItem(REGION_PACK_STATUS_KEY, JSON.stringify(statuses));
}
