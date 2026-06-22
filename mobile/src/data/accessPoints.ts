import type { AccessPoint } from '../types';

// ⚠️ Access point data is compiled from public sources and field verification.
// Hours, fees, and amenities are subject to change — verify before visiting.

export const ACCESS_POINTS: AccessPoint[] = [
  {
    id: 'ap-elizabeth-park',
    regionId: 'detroit-river-corridor',
    name: 'Elizabeth Park Marina',
    type: 'boat_launch',
    coordinates: { latitude: 42.1539, longitude: -83.1744 },
    waterbodyId: 'trenton-channel',
    waterbodyName: 'Trenton Channel',
    address: '4802 W Jefferson Ave, Trenton, MI 48183',
    hours: 'Dawn to Dusk (seasonal)',
    fee: '$10/day launch',
    amenities: [
      'Two-lane concrete ramp',
      'Floating docks',
      'Shore fishing seawall',
      'Restrooms (Apr–Oct)',
      'Picnic facilities',
      'Paved parking (80 vehicles)',
    ],
    notes:
      'Well-maintained Downriver launch. Good staging area. Shore fishing from the seawall is productive for perch and bass.',
    isVerified: true,
    isEmergencyResource: false,
  },
  {
    id: 'ap-wyandotte-ramp',
    regionId: 'detroit-river-corridor',
    name: 'Wyandotte Boat Ramp',
    type: 'boat_launch',
    coordinates: { latitude: 42.2142, longitude: -83.1490 },
    waterbodyId: 'detroit-river',
    waterbodyName: 'Detroit River',
    address: 'Maple St, Wyandotte, MI 48192',
    hours: '24 hours',
    fee: 'Free',
    amenities: [
      'Single-lane concrete ramp',
      'City parking',
      'Access to main Detroit River current',
    ],
    notes:
      'Closest free launch to the main channel walleye structure. Limited staging space — arrive early on weekends.',
    isVerified: true,
    isEmergencyResource: false,
  },
  {
    id: 'ap-milliken-harbor',
    regionId: 'detroit-river-corridor',
    name: 'Milliken State Park Harbor',
    type: 'marina',
    coordinates: { latitude: 42.3313, longitude: -83.0373 },
    waterbodyId: 'detroit-river',
    waterbodyName: 'Detroit River',
    address: '250 W Larned St, Detroit, MI 48226',
    hours: '6am – 10pm',
    fee: '$12/day launch',
    amenities: [
      'Modern paved ramp',
      'Dock assist',
      'Shore fishing access',
      'Large paved parking (120 vehicles)',
      'Restrooms',
      'Near downtown Detroit',
    ],
    notes:
      'Best upper-Detroit River access. MI State Park pass required for vehicle entry. Excellent access to Belle Isle area.',
    isVerified: true,
    isEmergencyResource: true,
    emergencyPhone: '313-396-7304',
  },
  {
    id: 'ap-lake-erie-metropark',
    regionId: 'detroit-river-corridor',
    name: 'Lake Erie Metropark Launch',
    type: 'boat_launch',
    coordinates: { latitude: 42.0417, longitude: -83.2028 },
    waterbodyId: 'detroit-river',
    waterbodyName: 'Detroit River / Lake Erie',
    address: '32481 W Jefferson Ave, Brownstown Twp, MI 48173',
    hours: 'Dawn to Dusk',
    fee: '$10 Metro Park vehicle entry',
    amenities: [
      'Multi-lane ramp (4 lanes)',
      'Floating docks',
      'Large staging area',
      'Shore fishing from breakwall',
      'Restrooms',
      'Picnic shelters',
      'Paved parking (200+ vehicles)',
    ],
    notes:
      'Largest and best-maintained launch in the Metro area. Shore fishing for perch and bass from the breakwall. Metro park pass covers entry.',
    isVerified: true,
    isEmergencyResource: true,
    emergencyPhone: '734-379-5020',
  },
  {
    id: 'ap-flat-rock-ramp',
    regionId: 'detroit-river-corridor',
    name: 'Flat Rock Community Launch',
    type: 'boat_launch',
    coordinates: { latitude: 42.0973, longitude: -83.2761 },
    waterbodyId: 'trenton-channel',
    waterbodyName: 'Huron River / Trenton Channel',
    address: 'N Huron River Dr, Flat Rock, MI 48134',
    hours: 'Dawn to Dusk',
    fee: 'Free',
    amenities: [
      'Concrete ramp',
      'Shore access',
      'Parking (60 vehicles)',
      'Steelhead tributary access',
    ],
    notes:
      'Free city ramp. Key access point for spring and fall steelhead on the Huron River. Check Zone 6 tributary closure dates before fishing Oct–Dec.',
    isVerified: true,
    isEmergencyResource: false,
  },
  {
    id: 'ap-belle-isle-carry-in',
    regionId: 'detroit-river-corridor',
    name: 'Belle Isle Fishing Access',
    type: 'carry_in',
    coordinates: { latitude: 42.3411, longitude: -82.9726 },
    waterbodyId: 'belle-isle',
    waterbodyName: 'Belle Isle Fishing Area',
    address: 'Belle Isle State Park, Detroit, MI 48207',
    hours: '8am – 10pm (state park hours)',
    fee: '$11 vehicle (MI Resident Annual Pass accepted)',
    amenities: [
      'Shore fishing (multiple points)',
      'Carry-in kayak access',
      'Restrooms',
      'Picnic areas',
      'Paved parking near shoreline',
    ],
    notes:
      'State park pass required for vehicle entry. Multiple shore fishing spots along the east and south shorelines. Family-friendly. Bus accessible from Detroit.',
    isVerified: true,
    isEmergencyResource: false,
  },
  {
    id: 'ap-detroit-riverfront-shore',
    regionId: 'detroit-river-corridor',
    name: 'Detroit Riverfront Shoreline',
    type: 'shore_access',
    coordinates: { latitude: 42.3244, longitude: -83.0454 },
    waterbodyId: 'detroit-river',
    waterbodyName: 'Detroit River',
    address: 'Detroit Riverwalk, Detroit, MI 48226',
    hours: 'Open 24 hours',
    fee: 'Free',
    amenities: [
      'Public shore access (Riverwalk)',
      'Nearby street parking',
      'Restrooms in adjacent parks',
    ],
    notes:
      'Public Detroit Riverwalk. Shore casting for walleye and perch during spring and fall runs. Check for posted closures near marina facilities.',
    isVerified: true,
    isEmergencyResource: false,
  },
  {
    id: 'ap-trenton-walleye-hotspot',
    regionId: 'detroit-river-corridor',
    name: 'Trenton Channel Walleye Structure',
    type: 'hotspot',
    coordinates: { latitude: 42.1350, longitude: -83.1800 },
    waterbodyId: 'trenton-channel',
    waterbodyName: 'Trenton Channel',
    hours: undefined,
    fee: undefined,
    amenities: [],
    notes:
      'Productive walleye structure along the channel edge. Best fished by boat from Elizabeth Park Marina. Jigging soft plastics near the channel edge is highly productive.',
    isVerified: true,
    isEmergencyResource: false,
  },
  {
    id: 'ap-grosse-ile-north-shore',
    regionId: 'detroit-river-corridor',
    name: 'Grosse Ile North Shore Access',
    type: 'shore_access',
    coordinates: { latitude: 42.1381, longitude: -83.1450 },
    waterbodyId: 'detroit-river',
    waterbodyName: 'Detroit River',
    address: 'Grosse Ile Township, MI 48138',
    hours: 'Dawn to Dusk',
    fee: 'Free (public access)',
    amenities: [
      'Shore fishing',
      'Limited parking',
    ],
    notes:
      'Public shoreline access on the north end of Grosse Ile. Good walleye and smallmouth shore access during spring runs.',
    isVerified: false,
    isEmergencyResource: true,
    emergencyPhone: '734-675-4444',
  },
];

export const getAccessPoint = (id: string): AccessPoint | undefined =>
  ACCESS_POINTS.find((ap) => ap.id === id);

export const getAccessPointsForWaterbody = (waterbodyId: string): AccessPoint[] =>
  ACCESS_POINTS.filter((ap) => ap.waterbodyId === waterbodyId);

export const getAccessPointsForRegion = (regionId: string): AccessPoint[] =>
  ACCESS_POINTS.filter((ap) => ap.regionId === regionId);

export const getEmergencyResources = (): AccessPoint[] =>
  ACCESS_POINTS.filter((ap) => ap.isEmergencyResource);

/**
 * Find the nearest access point to a given coordinate.
 * Uses simple Haversine distance approximation.
 */
export function getNearestAccessPoint(
  latitude: number,
  longitude: number,
): { accessPoint: AccessPoint; distanceMi: number } | undefined {
  if (ACCESS_POINTS.length === 0) return undefined;

  let nearest: AccessPoint = ACCESS_POINTS[0];
  let nearestDist = haversineMi(latitude, longitude, nearest.coordinates.latitude, nearest.coordinates.longitude);

  for (const ap of ACCESS_POINTS.slice(1)) {
    const dist = haversineMi(latitude, longitude, ap.coordinates.latitude, ap.coordinates.longitude);
    if (dist < nearestDist) {
      nearest = ap;
      nearestDist = dist;
    }
  }

  return { accessPoint: nearest, distanceMi: Math.round(nearestDist * 10) / 10 };
}

/**
 * Get the straight-line distance in miles from a user location to an access point.
 * Returns a rounded value (1 decimal place).
 */
export function getAccessPointDistanceMi(
  userLat: number,
  userLon: number,
  ap: AccessPoint,
): number {
  return Math.round(haversineMi(userLat, userLon, ap.coordinates.latitude, ap.coordinates.longitude) * 10) / 10;
}

/** Haversine distance in miles between two lat/lon points. */
function haversineMi(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}
