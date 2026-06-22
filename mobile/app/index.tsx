import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';

export default function RootIndex() {
  const { preferences, isLoading } = useAppStore();

  if (isLoading) return null; // SafeAreaProvider+StatusBar already mounted from _layout

  if (!preferences.onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/explore" />;
}
