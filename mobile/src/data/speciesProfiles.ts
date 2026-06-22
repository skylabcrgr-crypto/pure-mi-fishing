/**
 * speciesProfiles.ts — Phase 4 Fishing Intelligence
 *
 * Species preference profiles for the 7 MVP Detroit River Corridor species.
 * These profiles drive the scoring engine in fishingIntelligenceService.ts.
 *
 * ⚠️ Sample guidance. Water temperature preferences and seasonal notes are based on
 * publicly available fisheries literature and community knowledge.
 * Always verify with michigan.gov/dnr before fishing.
 */

export interface TimeWindow {
  label: string;
  /** Hours of day (24h). Inclusive. */
  hoursStart: number;
  hoursEnd: number;
  quality: 'excellent' | 'good' | 'fair';
}

export interface SpeciesProfile {
  speciesId: string;
  speciesName: string;
  emoji: string;
  /** Optimal water temp range in °F. Score peaks at midpoint. */
  optimalWaterTempMin: number;
  optimalWaterTempMax: number;
  /** Fish become sluggish/inactive below this temp. */
  coldThresholdF: number;
  /** Fish go deep / inactive above this temp. */
  heatThresholdF: number;
  /** Typical depth ranges by season (feet). */
  shallowDepthFt: string;
  deepDepthFt: string;
  /** Best time windows in order of preference. */
  timeWindows: TimeWindow[];
  /** Recommended methods with brief detail. */
  methods: { method: string; detail: string }[];
  /** Month numbers (1–12) where this species is most active. */
  peakMonths: number[];
  /** Max wind speed (mph) before fishing quality degrades. */
  maxWindMph: number;
  /** Preferred water clarity (ft). Below this clarity = poor conditions. */
  minClarityFt: number;
  /** Detroit River corridor-specific notes. */
  detroitNotes: string;
  /** If true, the notes are sample-only — not DNR official. */
  isSampleGuidance: boolean;
}

export const SPECIES_PROFILES: SpeciesProfile[] = [
  {
    speciesId: 'walleye',
    speciesName: 'Walleye',
    emoji: '🐟',
    optimalWaterTempMin: 55,
    optimalWaterTempMax: 72,
    coldThresholdF: 40,
    heatThresholdF: 80,
    shallowDepthFt: '8–18 ft',
    deepDepthFt: '18–35 ft',
    timeWindows: [
      { label: 'Dawn (5–8am)', hoursStart: 5, hoursEnd: 8, quality: 'excellent' },
      { label: 'Dusk (7–10pm)', hoursStart: 19, hoursEnd: 22, quality: 'excellent' },
      { label: 'Night (10pm–2am)', hoursStart: 22, hoursEnd: 2, quality: 'good' },
      { label: 'Overcast midday', hoursStart: 10, hoursEnd: 15, quality: 'fair' },
    ],
    methods: [
      { method: 'Jigging (soft plastics)', detail: 'Twister tails, 1/4–1/2 oz jig near current edges and channel breaks' },
      { method: 'Live crawler harness', detail: 'Drift or slow-troll along bottom structure; highly effective in spring' },
      { method: 'Bottom bouncer + spinner', detail: 'Effective in faster current zones; vary weight to maintain bottom contact' },
    ],
    peakMonths: [4, 5, 10, 11],
    maxWindMph: 18,
    minClarityFt: 1.5,
    detroitNotes:
      'Detroit River walleye are world-class. Spring run (Apr–May) fish staging from Lake Erie. Focus on current edges near Trenton Channel and Wyandotte. Walleye feed aggressively at low light — dawn/dusk/overcast days are most productive.',
    isSampleGuidance: true,
  },
  {
    speciesId: 'smallmouth-bass',
    speciesName: 'Smallmouth Bass',
    emoji: '🐠',
    optimalWaterTempMin: 62,
    optimalWaterTempMax: 72,
    coldThresholdF: 50,
    heatThresholdF: 82,
    shallowDepthFt: '4–12 ft',
    deepDepthFt: '12–25 ft',
    timeWindows: [
      { label: 'Morning (6–10am)', hoursStart: 6, hoursEnd: 10, quality: 'excellent' },
      { label: 'Evening (6–9pm)', hoursStart: 18, hoursEnd: 21, quality: 'good' },
      { label: 'Midday (10am–4pm)', hoursStart: 10, hoursEnd: 16, quality: 'fair' },
    ],
    methods: [
      { method: 'Drop-shot (finesse)', detail: 'Ned rig or shaky head on rocky bottom and rip-rap; 6–10 lb fluorocarbon' },
      { method: 'Tube jig', detail: 'Classic smallmouth bait; drag and hop along cobble/gravel bottom' },
      { method: 'Crankbait (medium diving)', detail: 'Fan-cast rip-rap banks; chartreuse or natural shad patterns' },
    ],
    peakMonths: [6, 7, 8, 9],
    maxWindMph: 20,
    minClarityFt: 2.0,
    detroitNotes:
      'Detroit River smallmouth love the rocky rip-rap banks. Focus on Wyandotte shoreline and grosse ile rocky structure. Post-spawn (late June–July) fish are aggressive and shallow. Hot summers push fish deeper and into early/late feeding windows.',
    isSampleGuidance: true,
  },
  {
    speciesId: 'largemouth-bass',
    speciesName: 'Largemouth Bass',
    emoji: '🎣',
    optimalWaterTempMin: 65,
    optimalWaterTempMax: 78,
    coldThresholdF: 50,
    heatThresholdF: 86,
    shallowDepthFt: '3–8 ft',
    deepDepthFt: '8–18 ft',
    timeWindows: [
      { label: 'Morning (6–10am)', hoursStart: 6, hoursEnd: 10, quality: 'excellent' },
      { label: 'Evening (6–9pm)', hoursStart: 18, hoursEnd: 21, quality: 'excellent' },
      { label: 'Midday', hoursStart: 10, hoursEnd: 17, quality: 'fair' },
    ],
    methods: [
      { method: 'Topwater (early/late)', detail: 'Poppers and walking baits near weedy edges; most effective during low-light periods' },
      { method: 'Texas-rig (soft plastic)', detail: 'Punch through vegetation or work weed edges; 1/4–3/8 oz sinker' },
      { method: 'Spinnerbait', detail: 'Slow-roll through emerging weeds and along transition edges' },
    ],
    peakMonths: [5, 6, 7, 8, 9],
    maxWindMph: 18,
    minClarityFt: 1.0,
    detroitNotes:
      'Largemouth prefer slower, weedier backwaters. Belle Isle lagoons and Elizabeth Park weedy margins are key spots. Combined bag limit with smallmouth (5 fish total). Spawn period (May–June) can produce large fish shallow.',
    isSampleGuidance: true,
  },
  {
    speciesId: 'yellow-perch',
    speciesName: 'Yellow Perch',
    emoji: '🐡',
    optimalWaterTempMin: 55,
    optimalWaterTempMax: 72,
    coldThresholdF: 35,
    heatThresholdF: 78,
    shallowDepthFt: '8–15 ft',
    deepDepthFt: '15–30 ft',
    timeWindows: [
      { label: 'Midmorning (8am–12pm)', hoursStart: 8, hoursEnd: 12, quality: 'excellent' },
      { label: 'Afternoon (12–4pm)', hoursStart: 12, hoursEnd: 16, quality: 'good' },
      { label: 'Late afternoon (4–7pm)', hoursStart: 16, hoursEnd: 19, quality: 'good' },
    ],
    methods: [
      { method: 'Small jig + wax worm', detail: '1/16–1/8 oz jig, vertical presentation; 4 lb monofilament or fluorocarbon' },
      { method: 'Slip-bobber + minnow', detail: 'Fathead minnow under float; excellent from shore and breakwalls' },
      { method: 'Bottom rig (spreader)', detail: 'Two-hook bottom spreader with minnow or crawler; effective in current' },
    ],
    peakMonths: [4, 5, 10, 11],
    maxWindMph: 22,
    minClarityFt: 1.0,
    detroitNotes:
      'Year-round open season with 50-fish daily limit. Lake Erie Metropark breakwall is legendary for perch. Spring and fall runs produce best numbers. Schools move frequently — fish move with them.',
    isSampleGuidance: true,
  },
  {
    speciesId: 'muskellunge',
    speciesName: 'Muskellunge',
    emoji: '🦈',
    optimalWaterTempMin: 60,
    optimalWaterTempMax: 72,
    coldThresholdF: 45,
    heatThresholdF: 78,
    shallowDepthFt: '8–15 ft',
    deepDepthFt: '15–35 ft',
    timeWindows: [
      { label: 'Late morning (9am–12pm)', hoursStart: 9, hoursEnd: 12, quality: 'good' },
      { label: 'Late afternoon (3–7pm)', hoursStart: 15, hoursEnd: 19, quality: 'excellent' },
      { label: 'Early evening (7–9pm)', hoursStart: 19, hoursEnd: 21, quality: 'good' },
    ],
    methods: [
      { method: 'Large bucktail', detail: 'Figure-8 retrieve near weed edges; use rod tip in figure-8 at boat side to trigger follows into strikes' },
      { method: 'Glide bait / jerk bait', detail: 'Erratic retrieves trigger reaction strikes; work along weed lines and structure' },
      { method: 'Large rubber lure (musky grub)', detail: 'Slow-roll near bottom on weed transitions; most effective in fall' },
    ],
    peakMonths: [9, 10, 11],
    maxWindMph: 20,
    minClarityFt: 2.0,
    detroitNotes:
      'Lake St. Clair is a world-class muskie fishery. Detroit River muskie are a bonus. 48" minimum in Detroit River (54" in some Lake St. Clair zones). Fall is prime — fish feed aggressively before winter. Always release quickly and carefully.',
    isSampleGuidance: true,
  },
  {
    speciesId: 'northern-pike',
    speciesName: 'Northern Pike',
    emoji: '🐊',
    optimalWaterTempMin: 50,
    optimalWaterTempMax: 68,
    coldThresholdF: 35,
    heatThresholdF: 76,
    shallowDepthFt: '4–12 ft',
    deepDepthFt: '10–22 ft',
    timeWindows: [
      { label: 'Dawn (5–9am)', hoursStart: 5, hoursEnd: 9, quality: 'excellent' },
      { label: 'Late afternoon (4–7pm)', hoursStart: 16, hoursEnd: 19, quality: 'good' },
      { label: 'Overcast / cloudy midday', hoursStart: 10, hoursEnd: 15, quality: 'fair' },
    ],
    methods: [
      { method: 'Spoon', detail: 'Flashy silver or gold spoons retrieved steadily through weedy backwaters' },
      { method: 'Large jerkbait', detail: 'Erratic pauses trigger big pike; 4–6" profiles in perch or shad patterns' },
      { method: 'Live / dead sucker minnow', detail: 'Large sucker rigged under a float or on a quick-strike rig; deadly in cold water' },
    ],
    peakMonths: [3, 4, 10, 11],
    maxWindMph: 22,
    minClarityFt: 1.0,
    detroitNotes:
      'Found in slower backwaters and weedy margins throughout the Detroit River system. Spring (pre-spawn to post-spawn) and fall are most productive. Use steel leaders — pike teeth will cut monofilament.',
    isSampleGuidance: true,
  },
  {
    speciesId: 'steelhead',
    speciesName: 'Steelhead / Rainbow Trout',
    emoji: '💠',
    optimalWaterTempMin: 42,
    optimalWaterTempMax: 58,
    coldThresholdF: 32,
    heatThresholdF: 65,
    shallowDepthFt: '2–6 ft',
    deepDepthFt: '6–15 ft',
    timeWindows: [
      { label: 'Dawn (5–9am)', hoursStart: 5, hoursEnd: 9, quality: 'excellent' },
      { label: 'Late afternoon (2–6pm)', hoursStart: 14, hoursEnd: 18, quality: 'good' },
      { label: 'Morning (9am–12pm)', hoursStart: 9, hoursEnd: 12, quality: 'fair' },
    ],
    methods: [
      { method: 'Spawn bag under float', detail: 'Pink/chartreuse spawn bag suspended 2 ft above bottom on light float; standard Huron River technique' },
      { method: 'Nymphs / wet flies', detail: 'Small stonefly or mayfly nymphs in natural colors; effective in clear water' },
      { method: 'Bead (pegged egg pattern)', detail: '10–12mm orange/pink bead 2" above hook; drift near bottom through runs and tailouts' },
    ],
    peakMonths: [3, 4, 11],
    maxWindMph: 25,
    minClarityFt: 1.5,
    detroitNotes:
      'Huron River near Flat Rock (Flat Rock Community Launch) is the key Detroit corridor tributary. Spring run (Mar–Apr) and fall run (Oct–Nov) — note Oct 1–Dec 31 tributary closures in some zones. Check Zone 6 regulations before fishing tributaries.',
    isSampleGuidance: true,
  },
];

export const getSpeciesProfile = (speciesId: string): SpeciesProfile | undefined =>
  SPECIES_PROFILES.find((p) => p.speciesId === speciesId);
