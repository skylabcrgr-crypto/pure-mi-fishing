import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Trip } from '../types';

const TRIPS_KEY = '@puremi/trips';

// Seed demo trips
const DEMO_TRIPS: Trip[] = [
  {
    id: 'trip-demo-1',
    title: 'Detroit River Evening Walleye',
    waterbodyId: 'detroit-river',
    waterbodyName: 'Detroit River',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    launchId: 'wyandotte-ramp',
    launchName: 'Wyandotte Boat Ramp',
    notes: 'Good bite on jigs in the Trenton Channel. Released 3, kept 2.',
    isActive: false,
  },
  {
    id: 'trip-demo-2',
    title: 'Belle Isle Shore Session',
    waterbodyId: 'belle-isle',
    waterbodyName: 'Belle Isle',
    startTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    launchId: 'belle-isle-carry-in',
    launchName: 'Belle Isle Kayak Access',
    notes: 'Early morning perch run. About 20 keeper perch.',
    isActive: false,
  },
  {
    id: 'trip-demo-3',
    title: 'Trenton Channel Boat Trip',
    waterbodyId: 'trenton-channel',
    waterbodyName: 'Trenton Channel',
    startTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000).toISOString(),
    launchId: 'elizabeth-park',
    launchName: 'Elizabeth Park Marina',
    isActive: false,
  },
];

interface TripsState {
  trips: Trip[];
  activeTrip: Trip | null;

  loadTrips: () => Promise<void>;
  startTrip: (trip: Omit<Trip, 'id' | 'isActive'>) => Promise<void>;
  endTrip: (tripId: string) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
}

export const useTripsStore = create<TripsState>((set, get) => ({
  trips: DEMO_TRIPS,
  activeTrip: null,

  loadTrips: async () => {
    try {
      const raw = await AsyncStorage.getItem(TRIPS_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Trip[];
        const all = [...DEMO_TRIPS, ...stored.filter((t) => !t.id.startsWith('trip-demo'))];
        const active = all.find((t) => t.isActive) ?? null;
        set({ trips: all, activeTrip: active });
      }
    } catch {
      // use defaults
    }
  },

  startTrip: async (tripData) => {
    const trip: Trip = {
      ...tripData,
      id: `trip-${Date.now()}`,
      isActive: true,
    };
    const updated = [trip, ...get().trips];
    set({ trips: updated, activeTrip: trip });
    const toStore = updated.filter((t) => !t.id.startsWith('trip-demo'));
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(toStore));
  },

  endTrip: async (tripId) => {
    const updated = get().trips.map((t) =>
      t.id === tripId ? { ...t, isActive: false, endTime: new Date().toISOString() } : t,
    );
    set({ trips: updated, activeTrip: null });
    const toStore = updated.filter((t) => !t.id.startsWith('trip-demo'));
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(toStore));
  },

  deleteTrip: async (tripId) => {
    const updated = get().trips.filter((t) => t.id !== tripId);
    set({ trips: updated });
    const toStore = updated.filter((t) => !t.id.startsWith('trip-demo'));
    await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(toStore));
  },
}));
