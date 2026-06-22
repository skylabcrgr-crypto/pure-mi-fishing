import type { OfflinePack } from '../types';

export const OFFLINE_PACKS: OfflinePack[] = [
  {
    id: 'pack-detroit-river',
    name: 'Detroit River Pack',
    waterbodyId: 'detroit-river',
    sizeEstimateMB: 48,
    includes: [
      'Map tiles (zoom 10–16)',
      'All 6 launch sites',
      'Species regulations summary',
      'Walleye, bass, perch notes',
      'Alert history (7 days)',
      'Conditions snapshot',
    ],
    status: 'available',
    version: '2025.06',
    downloadedAt: undefined,
  },
  {
    id: 'pack-belle-isle',
    name: 'Belle Isle Pack',
    waterbodyId: 'belle-isle',
    sizeEstimateMB: 18,
    includes: [
      'Map tiles (zoom 13–17)',
      'Shore access points',
      'Parking areas',
      'Bass & perch notes',
      'State park info',
    ],
    status: 'available',
    version: '2025.06',
    downloadedAt: undefined,
  },
  {
    id: 'pack-lake-st-clair',
    name: 'Lake St. Clair SW Pack',
    waterbodyId: 'lake-st-clair-edge',
    sizeEstimateMB: 76,
    includes: [
      'Map tiles (zoom 10–15)',
      'Marina and launch locations',
      'Muskie regulations',
      'Smallmouth structure notes',
      'Conditions snapshot',
    ],
    status: 'available',
    version: '2025.06',
    downloadedAt: undefined,
  },
];

export const getOfflinePack = (id: string): OfflinePack | undefined =>
  OFFLINE_PACKS.find((p) => p.id === id);

export const getPackForWaterbody = (waterbodyId: string): OfflinePack | undefined =>
  OFFLINE_PACKS.find((p) => p.waterbodyId === waterbodyId);
