import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CatchEntry } from '../types';

const LOGBOOK_KEY = '@puremi/logbook';

interface LogbookState {
  catches: CatchEntry[];
  loadCatches: () => Promise<void>;
  addCatch: (entry: Omit<CatchEntry, 'id' | 'timestamp'>) => Promise<void>;
  deleteCatch: (id: string) => Promise<void>;
}

export const useLogbookStore = create<LogbookState>((set, get) => ({
  catches: [],

  loadCatches: async () => {
    try {
      const raw = await AsyncStorage.getItem(LOGBOOK_KEY);
      if (raw) {
        set({ catches: JSON.parse(raw) });
      }
    } catch {
      // use empty
    }
  },

  addCatch: async (entryData) => {
    const entry: CatchEntry = {
      ...entryData,
      id: `catch-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...get().catches];
    set({ catches: updated });
    await AsyncStorage.setItem(LOGBOOK_KEY, JSON.stringify(updated));
  },

  deleteCatch: async (id) => {
    const updated = get().catches.filter((c) => c.id !== id);
    set({ catches: updated });
    await AsyncStorage.setItem(LOGBOOK_KEY, JSON.stringify(updated));
  },
}));
