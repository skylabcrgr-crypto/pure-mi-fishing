import type { WeatherSnapshot } from '../types';

// Seed weather snapshots for offline fallback.
// These are mock values representative of a typical Detroit River summer day.
// Real values will replace these once the weather service is live.

export const SEED_WEATHER_SNAPSHOTS: WeatherSnapshot[] = [
  {
    id: 'weather-snap-detroit-river-seed',
    waterbodyId: 'detroit-river',
    capturedAt: new Date(0).toISOString(), // epoch — signals "never refreshed"
    source: 'mock',
    tempF: 72,
    feelsLikeF: 70,
    description: 'Partly Cloudy',
    windSpeedMph: 12,
    windDirection: 'SW',
    humidityPct: 58,
    iconCode: 'partly-cloudy',
    forecastSummary: 'Mostly sunny with afternoon clouds. Good fishing conditions.',
  },
  {
    id: 'weather-snap-belle-isle-seed',
    waterbodyId: 'belle-isle',
    capturedAt: new Date(0).toISOString(),
    source: 'mock',
    tempF: 71,
    feelsLikeF: 69,
    description: 'Partly Cloudy',
    windSpeedMph: 8,
    windDirection: 'SW',
    humidityPct: 60,
    iconCode: 'partly-cloudy',
  },
  {
    id: 'weather-snap-trenton-channel-seed',
    waterbodyId: 'trenton-channel',
    capturedAt: new Date(0).toISOString(),
    source: 'mock',
    tempF: 72,
    feelsLikeF: 70,
    description: 'Partly Cloudy',
    windSpeedMph: 10,
    windDirection: 'SW',
    humidityPct: 58,
    iconCode: 'partly-cloudy',
  },
];

export const getWeatherSnapshotForWaterbody = (waterbodyId: string): WeatherSnapshot | undefined =>
  SEED_WEATHER_SNAPSHOTS.find((s) => s.waterbodyId === waterbodyId);
