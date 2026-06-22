import type { Launch } from '../types';

export const LAUNCHES: Launch[] = [
  {
    id: 'elizabeth-park',
    name: 'Elizabeth Park Marina',
    waterbodyId: 'trenton-channel',
    waterbodyName: 'Trenton Channel',
    coordinates: { latitude: 42.1539, longitude: -83.1744 },
    accessType: 'ramp',
    trailerFriendly: true,
    shoreAccess: true,
    parkingEstimate: 80,
    fee: '$10/day',
    hours: 'Dawn to Dusk',
    notes:
      'Well-maintained two-lane ramp with floating docks. Shore fishing available on the park seawall. Picnic facilities on site. Restrooms open April–October.',
    address: '4802 W Jefferson Ave, Trenton, MI 48183',
  },
  {
    id: 'wyandotte-ramp',
    name: 'Wyandotte Boat Ramp',
    waterbodyId: 'detroit-river',
    waterbodyName: 'Detroit River',
    coordinates: { latitude: 42.2142, longitude: -83.1490 },
    accessType: 'ramp',
    trailerFriendly: true,
    shoreAccess: false,
    parkingEstimate: 50,
    fee: 'Free',
    hours: '24 hours',
    notes:
      'City of Wyandotte public launch ramp. Single-lane concrete ramp. Access to main Detroit River current. Closest launch to downriver walleye structure.',
    address: 'Maple St, Wyandotte, MI 48192',
  },
  {
    id: 'milliken-harbor',
    name: 'Milliken State Park Harbor',
    waterbodyId: 'detroit-river',
    waterbodyName: 'Detroit River',
    coordinates: { latitude: 42.3313, longitude: -83.0373 },
    accessType: 'marina',
    trailerFriendly: true,
    shoreAccess: true,
    parkingEstimate: 120,
    fee: '$12/day launch fee',
    hours: '6am – 10pm',
    notes:
      'Modern marina facility in Detroit\'s Rivertown district. Excellent access to upper Detroit River and Belle Isle area. Paved ramp with dock assist. MI State Park pass required for entry.',
    address: '250 W Larned St, Detroit, MI 48226',
  },
  {
    id: 'lake-erie-metropark',
    name: 'Lake Erie Metropark Launch',
    waterbodyId: 'detroit-river',
    waterbodyName: 'Detroit River / Lake Erie',
    coordinates: { latitude: 42.0417, longitude: -83.2028 },
    accessType: 'ramp',
    trailerFriendly: true,
    shoreAccess: true,
    parkingEstimate: 200,
    fee: '$10 Metro Park vehicle entry',
    hours: 'Dawn to Dusk',
    notes:
      'One of the largest and best-maintained launches in the metro area. Multiple lanes, floating docks, and a large staging area. Shore fishing for perch and bass from the breakwall.',
    address: '32481 W Jefferson Ave, Brownstown Twp, MI 48173',
  },
  {
    id: 'flat-rock-ramp',
    name: 'Flat Rock Community Launch',
    waterbodyId: 'trenton-channel',
    waterbodyName: 'Huron River / Trenton Channel',
    coordinates: { latitude: 42.0973, longitude: -83.2761 },
    accessType: 'ramp',
    trailerFriendly: true,
    shoreAccess: true,
    parkingEstimate: 60,
    fee: 'Free',
    hours: 'Dawn to Dusk',
    notes:
      'Community launch on the Huron River near its confluence with Lake Erie. Good early-spring steelhead and smallmouth access.',
    address: 'Gibraltar Rd, Flat Rock, MI 48134',
  },
  {
    id: 'belle-isle-carry-in',
    name: 'Belle Isle Kayak Access',
    waterbodyId: 'belle-isle',
    waterbodyName: 'Belle Isle / Detroit River',
    coordinates: { latitude: 42.3440, longitude: -82.9780 },
    accessType: 'carry-in',
    trailerFriendly: false,
    shoreAccess: true,
    parkingEstimate: 30,
    fee: 'MI State Park Pass',
    hours: '8am – 9pm',
    notes:
      'Carry-in kayak and canoe access from the island\'s western shore. Calm water on the island\'s inland canals. Excellent for early morning perch and bass.',
    address: 'Belle Isle State Park, Detroit, MI 48207',
  },
];

export const getLaunch = (id: string): Launch | undefined =>
  LAUNCHES.find((l) => l.id === id);

export const getLaunchesForWaterbody = (waterbodyId: string): Launch[] =>
  LAUNCHES.filter((l) => l.waterbodyId === waterbodyId);
