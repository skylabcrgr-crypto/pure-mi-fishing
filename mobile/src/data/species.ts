import type { Species } from '../types';

export const SPECIES: Species[] = [
  {
    id: 'walleye',
    name: 'Walleye',
    emoji: '🐟',
    seasonOpen: 'May 1',
    seasonClose: 'Mar 15',
    minSizeIn: 15,
    dailyLimit: 5,
    possessionLimit: 10,
    bestMonths: ['Apr', 'May', 'Oct', 'Nov'],
    notes:
      'Detroit River walleye are world-famous. The spring run in April–May brings fish up from Lake Erie. Fall fishing can be exceptional. Jigging with soft plastics or live crawlers near current edges produces consistently.',
    isTrophyFish: false,
  },
  {
    id: 'smallmouth-bass',
    name: 'Smallmouth Bass',
    emoji: '🐠',
    seasonOpen: 'Jun 1',
    seasonClose: 'Nov 30',
    minSizeIn: 14,
    dailyLimit: 5,
    possessionLimit: 10,
    bestMonths: ['Jun', 'Jul', 'Aug', 'Sep'],
    notes:
      'Smallmouth bass thrive in the rocky and rubble bottom of the Detroit River and Lake St. Clair. Drop-shot rigs, tube jigs, and crankbaits near rip-rap are top producers. The 14-inch minimum protects quality fish.',
    isTrophyFish: false,
  },
  {
    id: 'largemouth-bass',
    name: 'Largemouth Bass',
    emoji: '🎣',
    seasonOpen: 'Jun 1',
    seasonClose: 'Nov 30',
    minSizeIn: 14,
    dailyLimit: 5,
    possessionLimit: 10,
    bestMonths: ['May', 'Jun', 'Jul', 'Sep'],
    notes:
      'Largemouth bass prefer the slower, weedier backwater areas. Belle Isle and Elizabeth Park weedy edges are productive. Combined bag limit with smallmouth bass applies.',
    isTrophyFish: false,
  },
  {
    id: 'yellow-perch',
    name: 'Yellow Perch',
    emoji: '🐡',
    seasonOpen: 'All year',
    seasonClose: 'All year',
    minSizeIn: 8,
    dailyLimit: 50,
    possessionLimit: 100,
    bestMonths: ['Apr', 'May', 'Oct', 'Nov'],
    notes:
      'Yellow perch are abundant in the Detroit River and Lake Erie. Small jigs tipped with wax worms or minnows work great. The 50-fish daily limit makes for exciting family fishing.',
    isTrophyFish: false,
  },
  {
    id: 'muskellunge',
    name: 'Muskellunge',
    emoji: '🦈',
    seasonOpen: 'Jun 7',
    seasonClose: 'Dec 31',
    minSizeIn: 48,
    dailyLimit: 1,
    possessionLimit: 1,
    bestMonths: ['Sep', 'Oct', 'Nov'],
    notes:
      'Lake St. Clair is one of the top muskellunge fisheries in the world. The 48-inch minimum (54 inches in some zones) protects the trophy fishery. Large bucktails, glide baits, and rubber lures near weedlines produce strikes.',
    isTrophyFish: true,
  },
  {
    id: 'northern-pike',
    name: 'Northern Pike',
    emoji: '🐊',
    seasonOpen: 'All year',
    seasonClose: 'All year',
    minSizeIn: 24,
    dailyLimit: 5,
    possessionLimit: 10,
    bestMonths: ['Mar', 'Apr', 'Oct', 'Nov'],
    notes:
      'Northern pike are found throughout the Detroit River system, especially in slower backwaters. Spoons, large jerkbaits, and live sucker minnows are effective.',
    isTrophyFish: false,
  },
  {
    id: 'steelhead',
    name: 'Steelhead / Rainbow Trout',
    emoji: '💠',
    seasonOpen: 'All year (river closures Oct 1–Dec 31)',
    seasonClose: 'Varies',
    minSizeIn: 15,
    dailyLimit: 5,
    possessionLimit: 10,
    bestMonths: ['Mar', 'Apr', 'Nov'],
    notes:
      'Steelhead enter Detroit-area tributaries in spring and fall. The Huron River near Flat Rock is a prime destination. Spawn bags, beads, and nymphs under a float are top producers.',
    isTrophyFish: true,
  },
];

export const getSpecies = (id: string): Species | undefined =>
  SPECIES.find((s) => s.id === id);
