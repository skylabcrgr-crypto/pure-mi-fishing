import type { Regulation } from '../types';

// ⚠️ IMPORTANT: These are simplified planning summaries only.
// Always verify with official Michigan DNR regulations before fishing.
// Official source: https://www.michigan.gov/dnr/things-to-do/fishing/regulations
//
// NOTE: This file contains the legacy Regulation type used by existing screens.
// New code should use regulationRules.ts which provides the full RegulationRule
// type with verificationStatus, lastVerifiedAt, sourceUrl, and notes.

export const REGULATIONS: Regulation[] = [
  {
    id: 'reg-walleye-detroit',
    waterbodyId: 'detroit-river',
    speciesId: 'walleye',
    speciesName: 'Walleye',
    summary: '5 per day · 15-inch minimum. Detroit River only: 1 fish ≥ 20 in. may be kept. Catch-and-release only March 15 – April 30.',
    minLengthIn: 15,
    dailyLimit: 5,
    seasonDates: 'May 1 – March 15',
    specialRules: 'Only 1 walleye ≥ 20 inches per day limit on the Detroit River. Possession limit is 10.',
    officialLink: 'https://www.michigan.gov/dnr/things-to-do/fishing/regulations',
    lastVerified: '2025-03-01',
  },
  {
    id: 'reg-smallmouth-detroit',
    waterbodyId: 'detroit-river',
    speciesId: 'smallmouth-bass',
    speciesName: 'Smallmouth Bass',
    summary: '5 per day (combined bass) · 14-inch minimum. Season Jun 1 – Nov 30. Catch-and-release only in pre-season.',
    minLengthIn: 14,
    dailyLimit: 5,
    seasonDates: 'Jun 1 – Nov 30',
    specialRules: 'Combined bag limit with largemouth bass. Catch-and-release only before June 1.',
    officialLink: 'https://www.michigan.gov/dnr/things-to-do/fishing/regulations',
    lastVerified: '2025-03-01',
  },
  {
    id: 'reg-perch-detroit',
    waterbodyId: 'detroit-river',
    speciesId: 'yellow-perch',
    speciesName: 'Yellow Perch',
    summary: '50 per day · 8-inch minimum · Open all year.',
    minLengthIn: 8,
    dailyLimit: 50,
    seasonDates: 'All year',
    officialLink: 'https://www.michigan.gov/dnr/things-to-do/fishing/regulations',
    lastVerified: '2025-03-01',
  },
  {
    id: 'reg-muskie-stclair',
    waterbodyId: 'lake-st-clair-edge',
    speciesId: 'muskellunge',
    speciesName: 'Muskellunge',
    summary: '1 per day · 48-inch minimum (54 in. on Lake St. Clair and St. Clair River). Season Jun 7 – Dec 31.',
    minLengthIn: 54,
    dailyLimit: 1,
    seasonDates: 'Jun 7 – Dec 31',
    specialRules: 'Lake St. Clair and St. Clair River: 54-inch minimum. Other Michigan waters: 48-inch minimum.',
    officialLink: 'https://www.michigan.gov/dnr/things-to-do/fishing/regulations',
    lastVerified: '2025-03-01',
  },
  {
    id: 'reg-steelhead-detroit',
    waterbodyId: 'detroit-river',
    speciesId: 'steelhead',
    speciesName: 'Steelhead / Rainbow Trout',
    summary: '5 per day · 15-inch minimum. Lake fishing open all year. Tributary closures Oct 1 – Dec 31 in designated streams.',
    minLengthIn: 15,
    dailyLimit: 5,
    seasonDates: 'All year (lake); tributary closures vary',
    specialRules: 'Check Zone 6 addendum for tributary-specific rules. Huron River tributary season runs Mar 1 – Oct 31.',
    officialLink: 'https://www.michigan.gov/dnr/things-to-do/fishing/regulations',
    lastVerified: '2025-03-01',
  },
];

export const getRegulationsForWaterbody = (waterbodyId: string): Regulation[] =>
  REGULATIONS.filter((r) => r.waterbodyId === waterbodyId);

export const getRegulationForSpecies = (waterbodyId: string, speciesId: string): Regulation | undefined =>
  REGULATIONS.find((r) => r.waterbodyId === waterbodyId && r.speciesId === speciesId);

export const DISCLAIMER =
  '⚠️ Rules shown are simplified planning summaries only. Always verify with official Michigan DNR regulations at michigan.gov/dnr before fishing. Regulations change — the DNR regulation booklet is the authoritative source.';
