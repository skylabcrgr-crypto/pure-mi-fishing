import type { Conditions } from '../types';

// Mock conditions data — will be replaced by live API adapters in production.
// See /src/services/ for API adapter stubs.

export const MOCK_CONDITIONS: Conditions[] = [
  {
    waterbodyId: 'detroit-river',
    timestamp: new Date().toISOString(),
    weather: {
      tempF: 72,
      feelsLikeF: 70,
      description: 'Partly Cloudy',
      windSpeedMph: 12,
      windDirection: 'SW',
      humidityPct: 58,
      iconCode: 'partly-cloudy',
    },
    water: {
      tempF: 65,
      levelFt: 2.3,
      clarityFt: 3.5,
      flowCfs: 'moderate',
      trend: 'stable',
    },
    iceStatus: 'open',
    fishingRating: 4,
    fishingRatingLabel: 'Good',
    source: 'mock',
  },
  {
    waterbodyId: 'belle-isle',
    timestamp: new Date().toISOString(),
    weather: {
      tempF: 72,
      feelsLikeF: 70,
      description: 'Partly Cloudy',
      windSpeedMph: 8,
      windDirection: 'SW',
      humidityPct: 58,
      iconCode: 'partly-cloudy',
    },
    water: {
      tempF: 64,
      clarityFt: 2.8,
      trend: 'stable',
    },
    iceStatus: 'open',
    fishingRating: 3,
    fishingRatingLabel: 'Fair',
    source: 'mock',
  },
  {
    waterbodyId: 'trenton-channel',
    timestamp: new Date().toISOString(),
    weather: {
      tempF: 71,
      feelsLikeF: 69,
      description: 'Clear',
      windSpeedMph: 6,
      windDirection: 'W',
      humidityPct: 52,
      iconCode: 'clear',
    },
    water: {
      tempF: 66,
      levelFt: 1.8,
      clarityFt: 4.0,
      flowCfs: 'light',
      trend: 'falling',
    },
    iceStatus: 'open',
    fishingRating: 5,
    fishingRatingLabel: 'Excellent',
    source: 'mock',
  },
];

export const getConditionsForWaterbody = (waterbodyId: string): Conditions | undefined =>
  MOCK_CONDITIONS.find((c) => c.waterbodyId === waterbodyId);

export const FISHING_RATING_COLORS: Record<number, string> = {
  1: '#F44336',
  2: '#FF9800',
  3: '#FFC107',
  4: '#8BC34A',
  5: '#4CAF50',
};
