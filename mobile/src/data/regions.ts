import type { Region } from '../types';

export const REGIONS: Region[] = [
  {
    id: 'detroit-river-corridor',
    name: 'Detroit River Corridor',
    state: 'MI',
    description:
      'The Detroit River Corridor encompasses the Detroit River, Belle Isle State Park, Trenton Channel, and the southwestern edge of Lake St. Clair. This 32-mile stretch of the Great Lakes basin is one of the most productive freshwater fisheries in North America, with world-class walleye, muskie, and smallmouth bass fishing.',
    bounds: {
      northeast: { latitude: 42.42, longitude: -82.85 },
      southwest: { latitude: 41.96, longitude: -83.32 },
    },
    centerCoordinates: { latitude: 42.18, longitude: -83.12 },
    defaultZoom: 11,
    waterbodyIds: [
      'detroit-river',
      'belle-isle',
      'trenton-channel',
      'lake-st-clair-edge',
    ],
    isMvpRegion: true,
  },
];

export const getRegion = (id: string): Region | undefined =>
  REGIONS.find((r) => r.id === id);

export const MVP_REGION = REGIONS[0];
