import type { OfflineRegionPack } from '../types';

export const OFFLINE_REGION_PACKS: OfflineRegionPack[] = [
  {
    id: 'region-pack-detroit-river-corridor',
    regionId: 'detroit-river-corridor',
    name: 'Detroit River Corridor Pack',
    version: '2025.06.1',
    sizeEstimateMB: 52,
    mapDataVersion: '2025.06.1',
    regulationDataVersion: '2025.06.1',
    accessPointCount: 9,
    downloadedAt: undefined,
    status: 'available',
    downloadProgress: undefined,
    includes: [
      'Map tiles (zoom 10–16)',
      '9 access points with full metadata',
      'Boat launches (5)',
      'Shore access points (2)',
      'Emergency resource points (3)',
      'Fishing hotspots (1)',
      'Species regulation rules (10 rules, 7 species)',
      'Condition snapshots (weather + water)',
      'Waterbody details (4 waterbodies)',
      'Alert history (7 days)',
    ],
  },
];

export const getOfflineRegionPack = (id: string): OfflineRegionPack | undefined =>
  OFFLINE_REGION_PACKS.find((p) => p.id === id);

export const getMvpRegionPack = (): OfflineRegionPack =>
  OFFLINE_REGION_PACKS[0];
