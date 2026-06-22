import type { RegulationRule } from '../types';

// ⚠️ IMPORTANT — SAMPLE DATA NOTICE
// All regulation rules in this file are simplified planning summaries compiled from
// publicly available Michigan DNR sources. They have NOT been officially verified for
// accuracy for the current fishing season.
//
// verificationStatus: 'sample_unverified' means this data MUST be verified against the
// current Michigan DNR Fishing Guide before this app is released to the public.
//
// Official source: https://www.michigan.gov/dnr/things-to-do/fishing/regulations
// Michigan Fishing Guide PDF is published annually, typically in March.
// Zone 6 Addendum covers SE Michigan including Detroit River tributaries.
//
// Every rule shown in the app must also display the standard disclaimer:
// "Rules shown are simplified planning summaries only. Always verify with official
// Michigan DNR regulations at michigan.gov/dnr before fishing."

const SOURCE_URL = 'https://www.michigan.gov/dnr/things-to-do/fishing/regulations';
const LAST_VERIFIED = '2025-03-01';
const EFFECTIVE_YEAR = 2025;
const VERIFICATION_NOTES =
  'Compiled from 2025-26 Michigan Fishing Guide. Verify at michigan.gov/dnr before relying on these rules for compliance.';

export const REGULATION_RULES: RegulationRule[] = [

  // ── Walleye ─────────────────────────────────────────────────────────

  {
    id: 'rule-walleye-detroit-river',
    regionId: 'detroit-river-corridor',
    waterbodyId: 'detroit-river',
    speciesId: 'walleye',
    speciesName: 'Walleye',
    ruleType: 'combined',
    summary:
      '5 per day · 15-inch minimum · Only 1 walleye ≥ 20 inches per day · Catch-and-release only March 15 – April 30',
    minLengthIn: 15,
    dailyBagLimit: 5,
    possessionLimit: 10,
    seasonStart: '05/01',
    seasonEnd: '03/15',
    specialNotes:
      'Detroit River special rule: only 1 walleye ≥ 20 inches may be kept per day limit. Catch-and-release only March 15 – April 30 (pre-season). Verify exact dates in current DNR guide.',
    sourceUrl: SOURCE_URL,
    lastVerifiedAt: LAST_VERIFIED,
    verificationStatus: 'sample_unverified',
    verificationNotes: VERIFICATION_NOTES,
    effectiveYear: EFFECTIVE_YEAR,
  },
  {
    id: 'rule-walleye-trenton-channel',
    regionId: 'detroit-river-corridor',
    waterbodyId: 'trenton-channel',
    speciesId: 'walleye',
    speciesName: 'Walleye',
    ruleType: 'combined',
    summary: '5 per day · 15-inch minimum · Season May 1 – March 15',
    minLengthIn: 15,
    dailyBagLimit: 5,
    possessionLimit: 10,
    seasonStart: '05/01',
    seasonEnd: '03/15',
    specialNotes:
      'Trenton Channel is part of the Detroit River system. Same walleye rules apply as the main Detroit River. Confirm Zone 6 addendum for any local variations.',
    sourceUrl: SOURCE_URL,
    lastVerifiedAt: LAST_VERIFIED,
    verificationStatus: 'sample_unverified',
    verificationNotes: VERIFICATION_NOTES,
    effectiveYear: EFFECTIVE_YEAR,
  },
  {
    id: 'rule-walleye-lake-st-clair',
    regionId: 'detroit-river-corridor',
    waterbodyId: 'lake-st-clair-edge',
    speciesId: 'walleye',
    speciesName: 'Walleye',
    ruleType: 'combined',
    summary: '5 per day · 15-inch minimum · Season May 1 – March 15',
    minLengthIn: 15,
    dailyBagLimit: 5,
    possessionLimit: 10,
    seasonStart: '05/01',
    seasonEnd: '03/15',
    sourceUrl: SOURCE_URL,
    lastVerifiedAt: LAST_VERIFIED,
    verificationStatus: 'sample_unverified',
    verificationNotes: VERIFICATION_NOTES,
    effectiveYear: EFFECTIVE_YEAR,
  },

  // ── Smallmouth Bass ─────────────────────────────────────────────────

  {
    id: 'rule-smallmouth-detroit-river',
    regionId: 'detroit-river-corridor',
    waterbodyId: 'detroit-river',
    speciesId: 'smallmouth-bass',
    speciesName: 'Smallmouth Bass',
    ruleType: 'combined',
    summary:
      '5 per day (combined with largemouth) · 14-inch minimum · Season June 1 – November 30 · Catch-and-release only before June 1',
    minLengthIn: 14,
    dailyBagLimit: 5,
    possessionLimit: 10,
    seasonStart: '06/01',
    seasonEnd: '11/30',
    specialNotes:
      'Combined bag limit with largemouth bass — total daily limit is 5 fish (combined). Catch-and-release only for both species before June 1.',
    sourceUrl: SOURCE_URL,
    lastVerifiedAt: LAST_VERIFIED,
    verificationStatus: 'sample_unverified',
    verificationNotes: VERIFICATION_NOTES,
    effectiveYear: EFFECTIVE_YEAR,
  },

  // ── Largemouth Bass ─────────────────────────────────────────────────

  {
    id: 'rule-largemouth-detroit-river',
    regionId: 'detroit-river-corridor',
    waterbodyId: 'detroit-river',
    speciesId: 'largemouth-bass',
    speciesName: 'Largemouth Bass',
    ruleType: 'combined',
    summary:
      '5 per day (combined with smallmouth) · 14-inch minimum · Season June 1 – November 30',
    minLengthIn: 14,
    dailyBagLimit: 5,
    possessionLimit: 10,
    seasonStart: '06/01',
    seasonEnd: '11/30',
    specialNotes:
      'Combined bag limit with smallmouth bass — total daily limit is 5 fish (combined). Backwater areas near Belle Isle and Elizabeth Park are productive.',
    sourceUrl: SOURCE_URL,
    lastVerifiedAt: LAST_VERIFIED,
    verificationStatus: 'sample_unverified',
    verificationNotes: VERIFICATION_NOTES,
    effectiveYear: EFFECTIVE_YEAR,
  },

  // ── Yellow Perch ────────────────────────────────────────────────────

  {
    id: 'rule-perch-detroit-river',
    regionId: 'detroit-river-corridor',
    waterbodyId: 'detroit-river',
    speciesId: 'yellow-perch',
    speciesName: 'Yellow Perch',
    ruleType: 'combined',
    summary: '50 per day · 8-inch minimum · Open all year',
    minLengthIn: 8,
    dailyBagLimit: 50,
    possessionLimit: 100,
    seasonStart: undefined,
    seasonEnd: undefined,
    specialNotes: 'Open all year. 8-inch minimum size. 50-fish daily limit makes for excellent family fishing.',
    sourceUrl: SOURCE_URL,
    lastVerifiedAt: LAST_VERIFIED,
    verificationStatus: 'sample_unverified',
    verificationNotes: VERIFICATION_NOTES,
    effectiveYear: EFFECTIVE_YEAR,
  },
  {
    id: 'rule-perch-belle-isle',
    regionId: 'detroit-river-corridor',
    waterbodyId: 'belle-isle',
    speciesId: 'yellow-perch',
    speciesName: 'Yellow Perch',
    ruleType: 'combined',
    summary: '50 per day · 8-inch minimum · Open all year',
    minLengthIn: 8,
    dailyBagLimit: 50,
    possessionLimit: 100,
    specialNotes: 'Same statewide perch rules apply at Belle Isle. Best fishing from the east and south shore.',
    sourceUrl: SOURCE_URL,
    lastVerifiedAt: LAST_VERIFIED,
    verificationStatus: 'sample_unverified',
    verificationNotes: VERIFICATION_NOTES,
    effectiveYear: EFFECTIVE_YEAR,
  },

  // ── Muskellunge ─────────────────────────────────────────────────────

  {
    id: 'rule-muskie-lake-st-clair',
    regionId: 'detroit-river-corridor',
    waterbodyId: 'lake-st-clair-edge',
    speciesId: 'muskellunge',
    speciesName: 'Muskellunge',
    ruleType: 'combined',
    summary:
      '1 per day · 54-inch minimum (Lake St. Clair / St. Clair River) · Season June 7 – December 31',
    minLengthIn: 54,
    dailyBagLimit: 1,
    possessionLimit: 1,
    seasonStart: '06/07',
    seasonEnd: '12/31',
    specialNotes:
      'Lake St. Clair and the St. Clair River have a 54-inch minimum — stricter than the 48-inch standard for other Michigan waters. One of the top muskie fisheries in the world. Handle with care and release quickly.',
    sourceUrl: SOURCE_URL,
    lastVerifiedAt: LAST_VERIFIED,
    verificationStatus: 'sample_unverified',
    verificationNotes: VERIFICATION_NOTES,
    effectiveYear: EFFECTIVE_YEAR,
  },
  {
    id: 'rule-muskie-detroit-river',
    regionId: 'detroit-river-corridor',
    waterbodyId: 'detroit-river',
    speciesId: 'muskellunge',
    speciesName: 'Muskellunge',
    ruleType: 'combined',
    summary: '1 per day · 48-inch minimum · Season June 7 – December 31',
    minLengthIn: 48,
    dailyBagLimit: 1,
    possessionLimit: 1,
    seasonStart: '06/07',
    seasonEnd: '12/31',
    specialNotes:
      'Detroit River main channel: 48-inch minimum applies. Note: if fishing near the Lake St. Clair boundary, the 54-inch rule may apply — check current zone maps.',
    sourceUrl: SOURCE_URL,
    lastVerifiedAt: LAST_VERIFIED,
    verificationStatus: 'sample_unverified',
    verificationNotes: VERIFICATION_NOTES,
    effectiveYear: EFFECTIVE_YEAR,
  },

  // ── Northern Pike ───────────────────────────────────────────────────

  {
    id: 'rule-pike-detroit-river',
    regionId: 'detroit-river-corridor',
    waterbodyId: 'detroit-river',
    speciesId: 'northern-pike',
    speciesName: 'Northern Pike',
    ruleType: 'combined',
    summary: '5 per day · 24-inch minimum · Open all year',
    minLengthIn: 24,
    dailyBagLimit: 5,
    possessionLimit: 10,
    specialNotes:
      'Northern pike are open all year in the Detroit River system. Slower backwaters and weedy edges are most productive.',
    sourceUrl: SOURCE_URL,
    lastVerifiedAt: LAST_VERIFIED,
    verificationStatus: 'sample_unverified',
    verificationNotes: VERIFICATION_NOTES,
    effectiveYear: EFFECTIVE_YEAR,
  },

  // ── Steelhead / Rainbow Trout ────────────────────────────────────────

  {
    id: 'rule-steelhead-detroit-river',
    regionId: 'detroit-river-corridor',
    waterbodyId: 'detroit-river',
    speciesId: 'steelhead',
    speciesName: 'Steelhead / Rainbow Trout',
    ruleType: 'combined',
    summary:
      '5 per day · 15-inch minimum · Lake/main river open all year · Huron River tributary: March 1 – October 31',
    minLengthIn: 15,
    dailyBagLimit: 5,
    possessionLimit: 10,
    seasonStart: undefined,
    seasonEnd: undefined,
    specialNotes:
      'Main river and lake fishing is open all year. Huron River tributary (Flat Rock area): open March 1 – October 31 for trout. Tributaries in Zone 6 are closed October 1 – December 31 for spawning protection. Verify Zone 6 addendum for current tributary-specific rules.',
    gearRestrictions:
      'Check Zone 6 addendum for fly-fishing-only sections on designated tributaries.',
    sourceUrl: SOURCE_URL,
    lastVerifiedAt: LAST_VERIFIED,
    verificationStatus: 'sample_unverified',
    verificationNotes: VERIFICATION_NOTES,
    effectiveYear: EFFECTIVE_YEAR,
  },
];

export const getRegulationRulesForWaterbody = (waterbodyId: string): RegulationRule[] =>
  REGULATION_RULES.filter(
    (r) => r.waterbodyId === waterbodyId || r.waterbodyId === undefined,
  );

export const getRegulationRuleForSpecies = (
  speciesId: string,
  waterbodyId: string,
): RegulationRule | undefined =>
  REGULATION_RULES.find(
    (r) => r.speciesId === speciesId && (r.waterbodyId === waterbodyId || r.waterbodyId === undefined),
  );

export const getAllRegulationRules = (): RegulationRule[] => REGULATION_RULES;

export const hasSampleData = (): boolean =>
  REGULATION_RULES.some((r) => r.verificationStatus !== 'official');

export const REGULATION_DISCLAIMER =
  '⚠️ Rules shown are simplified planning summaries only. Always verify with official Michigan DNR regulations at michigan.gov/dnr before fishing. Regulations change — the DNR regulation booklet is the authoritative source.';

export const SAMPLE_DATA_WARNING =
  '🚧 Sample data — these rules have not been officially verified for the current season. Do not rely on this app alone for regulatory compliance.';
