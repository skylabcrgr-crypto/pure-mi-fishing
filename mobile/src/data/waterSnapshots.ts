import type { WaterConditionSnapshot } from '../types';

// Seed water condition snapshots for offline fallback.
// Detroit River USGS gauge: Site 04165500 (Detroit River at Detroit, MI)
// Real values will replace these once the USGS service is live.

export const SEED_WATER_SNAPSHOTS: WaterConditionSnapshot[] = [
  {
    id: 'water-snap-detroit-river-seed',
    waterbodyId: 'detroit-river',
    capturedAt: new Date(0).toISOString(), // epoch — signals "never refreshed"
    source: 'mock',
    gaugeId: '04165500',
    tempF: 65,
    levelFt: 2.3,
    clarityFt: 3.5,
    flowCfs: 186000,
    trend: 'stable',
    iceStatus: 'open',
  },
  {
    id: 'water-snap-belle-isle-seed',
    waterbodyId: 'belle-isle',
    capturedAt: new Date(0).toISOString(),
    source: 'mock',
    tempF: 64,
    clarityFt: 2.8,
    trend: 'stable',
    iceStatus: 'open',
  },
  {
    id: 'water-snap-trenton-channel-seed',
    waterbodyId: 'trenton-channel',
    capturedAt: new Date(0).toISOString(),
    source: 'mock',
    gaugeId: '04165500',
    tempF: 65,
    levelFt: 2.1,
    trend: 'stable',
    iceStatus: 'open',
  },
  {
    id: 'water-snap-lake-st-clair-seed',
    waterbodyId: 'lake-st-clair-edge',
    capturedAt: new Date(0).toISOString(),
    source: 'mock',
    tempF: 66,
    clarityFt: 4.0,
    trend: 'stable',
    iceStatus: 'open',
  },
];

export const getWaterSnapshotForWaterbody = (waterbodyId: string): WaterConditionSnapshot | undefined =>
  SEED_WATER_SNAPSHOTS.find((s) => s.waterbodyId === waterbodyId);
