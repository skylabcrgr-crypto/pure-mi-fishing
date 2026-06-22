import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { useAppStore } from '../src/store/useAppStore';
import { useLogbookStore } from '../src/store/useLogbookStore';
import { useTripsStore } from '../src/store/useTripsStore';
import { useOfflinePackStore } from '../src/store/useOfflinePackStore';
import { initDatabase, seedDatabase } from '../src/lib/db';
import { REGULATION_RULES } from '../src/data/regulationRules';
import { SEED_WEATHER_SNAPSHOTS } from '../src/data/weatherSnapshots';
import { SEED_WATER_SNAPSHOTS } from '../src/data/waterSnapshots';

export default function RootLayout() {
  const loadPreferences = useAppStore((s) => s.loadPreferences);
  const loadCatches = useLogbookStore((s) => s.loadCatches);
  const loadTrips = useTripsStore((s) => s.loadTrips);
  const loadOfflinePacks = useOfflinePackStore((s) => s.loadFromStorage);

  useEffect(() => {
    // Initialize SQLite schema (creates tables + runs migrations)
    initDatabase();
    // Populate seed data on first install (no-op if tables already have rows)
    seedDatabase({
      regulationRules: REGULATION_RULES,
      weatherSnapshots: SEED_WEATHER_SNAPSHOTS,
      waterSnapshots: SEED_WATER_SNAPSHOTS,
    });
    // Hydrate Zustand stores from AsyncStorage
    loadPreferences();
    loadCatches();
    loadTrips();
    loadOfflinePacks();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A1628' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="waterbody/[id]"
          options={{ headerShown: true, title: '', headerStyle: { backgroundColor: '#0A1628' }, headerTintColor: '#F5F5F0' }}
        />
        <Stack.Screen
          name="launch/[id]"
          options={{ headerShown: true, title: '', headerStyle: { backgroundColor: '#0A1628' }, headerTintColor: '#F5F5F0' }}
        />
        <Stack.Screen
          name="trip-mode/[id]"
          options={{ headerShown: false, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="license"
          options={{ headerShown: true, title: 'Fishing License', headerStyle: { backgroundColor: '#0A1628' }, headerTintColor: '#F5F5F0' }}
        />
        <Stack.Screen
          name="offline-packs"
          options={{ headerShown: true, title: 'Offline Packs', headerStyle: { backgroundColor: '#0A1628' }, headerTintColor: '#F5F5F0' }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: true, title: 'Settings', headerStyle: { backgroundColor: '#0A1628' }, headerTintColor: '#F5F5F0' }}
        />
        <Stack.Screen
          name="emergency-mode"
          options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="report-problem"
          options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="sync-status"
          options={{ headerShown: true, title: 'Sync & Backup', headerStyle: { backgroundColor: '#0A1628' }, headerTintColor: '#F5F5F0' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
