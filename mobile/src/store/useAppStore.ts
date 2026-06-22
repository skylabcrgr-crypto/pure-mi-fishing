import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserPreferences, OfflinePack } from '../types';
import { OFFLINE_PACKS } from '../data/offlinePacks';

const PREFS_KEY = '@puremi/preferences';
const SAVED_SPOTS_KEY = '@puremi/savedSpots';

interface AppState {
  preferences: UserPreferences;
  offlinePacks: OfflinePack[];
  isLoading: boolean;

  // Actions
  loadPreferences: () => Promise<void>;
  savePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  toggleSavedWaterbody: (id: string) => Promise<void>;
  toggleSavedLaunch: (id: string) => Promise<void>;
  startPackDownload: (packId: string) => void;
  cancelPackDownload: (packId: string) => void;
  updatePackProgress: (packId: string, progress: number) => void;
  markPackDownloaded: (packId: string) => void;
  deletePackDownload: (packId: string) => void;
}

const DEFAULT_PREFS: UserPreferences = {
  units: 'imperial',
  textSize: 'md',
  highContrast: false,
  reducedMotion: false,
  onboardingComplete: false,
  savedWaterbodyIds: [],
  savedLaunchIds: [],
};

export const useAppStore = create<AppState>((set, get) => ({
  preferences: DEFAULT_PREFS,
  offlinePacks: OFFLINE_PACKS.map((p) => ({ ...p })),
  isLoading: true,

  loadPreferences: async () => {
    try {
      const raw = await AsyncStorage.getItem(PREFS_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<UserPreferences>;
        set({ preferences: { ...DEFAULT_PREFS, ...stored }, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  savePreferences: async (prefs) => {
    const updated = { ...get().preferences, ...prefs };
    set({ preferences: updated });
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  },

  completeOnboarding: async () => {
    await get().savePreferences({ onboardingComplete: true });
  },

  toggleSavedWaterbody: async (id) => {
    const { savedWaterbodyIds } = get().preferences;
    const updated = savedWaterbodyIds.includes(id)
      ? savedWaterbodyIds.filter((w) => w !== id)
      : [...savedWaterbodyIds, id];
    await get().savePreferences({ savedWaterbodyIds: updated });
  },

  toggleSavedLaunch: async (id) => {
    const { savedLaunchIds } = get().preferences;
    const updated = savedLaunchIds.includes(id)
      ? savedLaunchIds.filter((l) => l !== id)
      : [...savedLaunchIds, id];
    await get().savePreferences({ savedLaunchIds: updated });
  },

  startPackDownload: (packId) => {
    set((state) => ({
      offlinePacks: state.offlinePacks.map((p) =>
        p.id === packId ? { ...p, status: 'downloading', downloadProgress: 0 } : p,
      ),
    }));
  },

  cancelPackDownload: (packId) => {
    set((state) => ({
      offlinePacks: state.offlinePacks.map((p) =>
        p.id === packId ? { ...p, status: 'available', downloadProgress: undefined } : p,
      ),
    }));
  },

  updatePackProgress: (packId, progress) => {
    set((state) => ({
      offlinePacks: state.offlinePacks.map((p) =>
        p.id === packId ? { ...p, downloadProgress: progress } : p,
      ),
    }));
  },

  markPackDownloaded: (packId) => {
    set((state) => ({
      offlinePacks: state.offlinePacks.map((p) =>
        p.id === packId
          ? { ...p, status: 'downloaded', downloadProgress: 1, downloadedAt: new Date().toISOString() }
          : p,
      ),
    }));
    AsyncStorage.setItem(SAVED_SPOTS_KEY, JSON.stringify(get().offlinePacks));
  },

  deletePackDownload: (packId) => {
    set((state) => ({
      offlinePacks: state.offlinePacks.map((p) =>
        p.id === packId ? { ...p, status: 'available', downloadProgress: undefined, downloadedAt: undefined } : p,
      ),
    }));
  },
}));
