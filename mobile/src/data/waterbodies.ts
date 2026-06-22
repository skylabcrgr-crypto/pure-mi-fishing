import type { Waterbody } from '../types';

export const WATERBODIES: Waterbody[] = [
  {
    id: 'detroit-river',
    name: 'Detroit River',
    region: 'Southeast Michigan',
    description:
      'The Detroit River connects Lake St. Clair to Lake Erie, forming 32 miles of world-class freshwater fishing. Renowned for walleye, smallmouth bass, and yellow perch, it is one of the most productive fisheries in the Great Lakes basin.',
    coordinates: { latitude: 42.1, longitude: -83.12 },
    zoomLevel: 11,
    badges: ['Great Lakes Connector', 'Walleye', 'Smallmouth Bass', 'Perch', 'Shore + Boat'],
    species: ['walleye', 'smallmouth-bass', 'largemouth-bass', 'yellow-perch', 'northern-pike', 'muskellunge', 'steelhead'],
    accessTypes: ['shore', 'boat', 'kayak'],
    rulesNote:
      'Rules shown here are simplified summaries for planning only. Always verify with official Michigan DNR regulations before fishing. Regulations change — check michigan.gov/dnr.',
    fishingNotes:
      'Spring walleye runs through the river are legendary. The Trenton Channel holds fish year-round. Belle Isle offers productive shore fishing from May through October. Water clarity and current vary significantly by season.',
    isSaved: false,
  },
  {
    id: 'belle-isle',
    name: 'Belle Isle Fishing Area',
    region: 'Detroit, MI',
    description:
      'Belle Isle State Park sits in the Detroit River and offers several productive shore fishing locations. The island is accessible by bridge and provides parking near the waterfront.',
    coordinates: { latitude: 42.3411, longitude: -82.9726 },
    zoomLevel: 14,
    badges: ['State Park', 'Shore Access', 'Perch', 'Bass', 'Family Friendly'],
    species: ['yellow-perch', 'smallmouth-bass', 'largemouth-bass', 'northern-pike'],
    accessTypes: ['shore', 'kayak'],
    rulesNote:
      'Rules shown here are simplified summaries for planning only. Always verify with official Michigan DNR regulations before fishing.',
    fishingNotes:
      'Perch fishing is best in spring and fall near the eastern shoreline. Bass hold near structure and rip-rap throughout summer. State park pass required for vehicle entry.',
    isSaved: false,
  },
  {
    id: 'trenton-channel',
    name: 'Trenton Channel',
    region: 'Trenton / Gibraltar, MI',
    description:
      'The Trenton Channel is a side channel of the Detroit River between Grosse Ile and the Michigan mainland. It provides slower current, good structure, and productive year-round fishing.',
    coordinates: { latitude: 42.1339, longitude: -83.1834 },
    zoomLevel: 13,
    badges: ['Channel Water', 'Walleye', 'Smallmouth', 'Boat + Shore'],
    species: ['walleye', 'smallmouth-bass', 'yellow-perch', 'northern-pike'],
    accessTypes: ['shore', 'boat'],
    rulesNote:
      'Rules shown here are simplified summaries for planning only. Always verify with official Michigan DNR regulations before fishing.',
    fishingNotes:
      'The Trenton Channel is a local favorite for walleye through the entire open-water season. Shore access is available at Elizabeth Park Marina.',
    isSaved: false,
  },
  {
    id: 'lake-st-clair-edge',
    name: 'Lake St. Clair (SW Edge)',
    region: 'Southeast Michigan',
    description:
      'The southwestern edge of Lake St. Clair, near the St. Clair River outlet, provides excellent access to some of the best muskellunge and smallmouth bass fishing in North America.',
    coordinates: { latitude: 42.4800, longitude: -82.8600 },
    zoomLevel: 12,
    badges: ['Muskie Capital', 'Smallmouth', 'Walleye', 'Great Lakes'],
    species: ['muskellunge', 'smallmouth-bass', 'walleye', 'yellow-perch', 'steelhead'],
    accessTypes: ['boat', 'shore'],
    rulesNote:
      'Rules shown here are simplified summaries for planning only. Always verify with official Michigan DNR regulations before fishing.',
    fishingNotes:
      'Lake St. Clair is one of the top muskellunge destinations in the world. Smallmouth bass fishing is world-class. Spring walleye runs are excellent near the river mouths.',
    isSaved: false,
  },
];

export const getWaterbody = (id: string): Waterbody | undefined =>
  WATERBODIES.find((w) => w.id === id);
