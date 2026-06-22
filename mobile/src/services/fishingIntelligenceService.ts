/**
 * fishingIntelligenceService.ts — Phase 4
 *
 * Rules-based fishing recommendation engine for the Detroit River Corridor.
 *
 * This is a DETERMINISTIC scoring engine. No AI APIs. No network calls.
 * Every score is computed from explicit rules that can be inspected and explained.
 *
 * Inputs:
 *   - Date/time (current or user-supplied)
 *   - Waterbody ID
 *   - WeatherSnapshot (from seed data or live service)
 *   - WaterConditionSnapshot (from seed data or live service)
 *   - Recent catch logs (optional — if available from logbook store)
 *
 * Outputs:
 *   - FishingRecommendation with ranked species, explanation, and data quality warnings
 *
 * ⚠️ Not a guarantee. Conditions change, data may be stale or mock.
 *    Always verify regulations at michigan.gov/dnr before fishing.
 */

import { SPECIES_PROFILES, type SpeciesProfile, type TimeWindow } from '../data/speciesProfiles';
import { SEED_WEATHER_SNAPSHOTS, getWeatherSnapshotForWaterbody } from '../data/weatherSnapshots';
import { SEED_WATER_SNAPSHOTS, getWaterSnapshotForWaterbody } from '../data/waterSnapshots';
import { getRulesForWaterbody, getSeasonStatus } from './regulationService';
import { WATERBODIES } from '../data/waterbodies';
import type {
  FishingConditionInput,
  FishingRecommendation,
  SpeciesScore,
  FishingMethodSuggestion,
  ConfidenceLevel,
  WeatherSnapshot,
  WaterConditionSnapshot,
  CatchEntry,
} from '../types';

// ── Constants ───────────────────────────────────────────────────────────────

/** How old (ms) a weather snapshot can be before it's considered stale. */
const WEATHER_STALE_MS = 4 * 60 * 60 * 1000; // 4 hours

/** How old (ms) a water snapshot can be before it's considered stale. */
const WATER_STALE_MS = 6 * 60 * 60 * 1000; // 6 hours

/** Recent catch window: catches logged in the last N days influence scoring. */
const RECENT_CATCH_DAYS = 7;

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate a fishing recommendation for a given waterbody + date.
 * Falls back gracefully to seed data if no live snapshots are available.
 * Will NOT throw — returns a degraded recommendation on any error.
 */
export function generateRecommendation(
  input: FishingConditionInput,
): FishingRecommendation {
  try {
    return _generate(input);
  } catch {
    return _degradedRecommendation(input);
  }
}

/**
 * Quick helper: get only the top species for a waterbody right now.
 * Returns null if no species are scoreable.
 */
export function getTopSpecies(
  waterbodyId: string,
  date: Date = new Date(),
): SpeciesScore | null {
  const rec = generateRecommendation({ date, waterbodyId });
  return rec.topPick;
}

// ── Core scoring engine ─────────────────────────────────────────────────────

function _generate(input: FishingConditionInput): FishingRecommendation {
  const { date, waterbodyId, weatherSnapshot, waterSnapshot, recentCatches } = input;

  // Resolve data sources
  const weather = weatherSnapshot ?? getWeatherSnapshotForWaterbody(waterbodyId) ?? SEED_WEATHER_SNAPSHOTS[0];
  const water   = waterSnapshot   ?? getWaterSnapshotForWaterbody(waterbodyId)   ?? SEED_WATER_SNAPSHOTS[0];

  const isWeatherStale = _isStale(weather.capturedAt, WEATHER_STALE_MS) || weather.source === 'mock';
  const isWaterStale   = _isStale(water.capturedAt,   WATER_STALE_MS)   || water.source === 'mock';
  const hasMockData    = weather.source === 'mock' || water.source === 'mock';

  // Get regulation rules for this waterbody
  const regRules = getRulesForWaterbody(waterbodyId, date);

  // Get waterbody name
  const wb = WATERBODIES.find((w) => w.id === waterbodyId);
  const waterbodyName = wb?.name ?? waterbodyId;

  // Build catch frequency map for recent-catch bonus
  const catchMap = _buildCatchMap(recentCatches ?? [], date);

  // Score all 7 species
  const rankedSpecies: SpeciesScore[] = SPECIES_PROFILES
    .map((profile) => _scoreSpecies(profile, date, weather, water, regRules, catchMap))
    .sort((a, b) => b.finalScore - a.finalScore);

  // Top pick = highest-scoring non-closed species
  const topPick = rankedSpecies.find((s) => !s.isClosed) ?? null;

  // Overall confidence = top pick confidence, or low if all closed
  const confidence: ConfidenceLevel = topPick?.confidence ?? 'low';

  // Best time window = from top pick, or generic
  const bestTimeWindow = topPick?.bestTimeWindow ?? _getBestTimeWindowForHour(date.getHours()).label;

  // Build data warnings
  const dataWarnings: string[] = [];
  if (isWeatherStale) dataWarnings.push('Weather data is mock/stale — actual conditions may differ.');
  if (isWaterStale)   dataWarnings.push('Water conditions data is mock/stale — actual conditions may differ.');
  if (rankedSpecies.some((s) => s.hasUnverifiedData)) {
    dataWarnings.push('Regulation data is sample/unverified. Verify at michigan.gov/dnr.');
  }

  // Summary paragraph
  const summary = _buildSummary(topPick, date, waterbodyName, hasMockData);

  return {
    generatedAt: new Date().toISOString(),
    waterbodyId,
    waterbodyName,
    rankedSpecies,
    topPick,
    bestTimeWindow,
    confidence,
    summary,
    dataWarnings,
    hasMockData,
    isWeatherStale,
    isWaterStale,
  };
}

// ── Species scoring ─────────────────────────────────────────────────────────

function _scoreSpecies(
  profile: SpeciesProfile,
  date: Date,
  weather: WeatherSnapshot,
  water: WaterConditionSnapshot,
  regRules: ReturnType<typeof getRulesForWaterbody>,
  catchMap: Record<string, number>,
): SpeciesScore {
  const explanationLines: string[] = [];

  // ── 1. Season score ──────────────────────────────────────
  const rule = regRules.find((r) => r.speciesId === profile.speciesId);
  const seasonStatus = rule ? getSeasonStatus(rule, date) : _fallbackSeasonStatus(profile, date);
  const isClosed = seasonStatus === 'closed';

  let seasonScore: number;
  if (seasonStatus === 'open') {
    seasonScore = 1.0;
    explanationLines.push('✅ In season');
  } else if (seasonStatus === 'restricted') {
    seasonScore = 0.4;
    explanationLines.push('⚠️ Restricted (catch-and-release only)');
  } else if (seasonStatus === 'closed') {
    seasonScore = 0.0;
    explanationLines.push('🚫 Season closed — not recommended');
  } else {
    seasonScore = 0.6;
    explanationLines.push('❓ Season status unknown — check DNR');
  }

  // Month bonus: are we in a peak month?
  const month = date.getMonth() + 1;
  const inPeakMonth = profile.peakMonths.includes(month);
  if (inPeakMonth) {
    explanationLines.push('📅 Peak month for this species');
  }
  const peakBonus = inPeakMonth ? 0.15 : 0.0;

  // ── 2. Regulation score (data quality) ──────────────────
  const hasUnverifiedData = rule ? rule.verificationStatus !== 'official' : true;
  const regulationScore = hasUnverifiedData ? 0.6 : 1.0;
  if (hasUnverifiedData) {
    explanationLines.push('🚧 Regulation data is sample — verify at DNR');
  }

  // ── 3. Water temperature score ──────────────────────────
  const waterTempF = water.tempF ?? null;
  let waterTempScore = 0.5; // neutral when no data
  if (waterTempF !== null) {
    waterTempScore = _tempScore(
      waterTempF,
      profile.optimalWaterTempMin,
      profile.optimalWaterTempMax,
      profile.coldThresholdF,
      profile.heatThresholdF,
    );
    if (waterTempScore >= 0.8) {
      explanationLines.push(`🌡️ Water temp ${waterTempF}°F — ideal for ${profile.speciesName}`);
    } else if (waterTempScore >= 0.5) {
      explanationLines.push(`🌡️ Water temp ${waterTempF}°F — acceptable for ${profile.speciesName}`);
    } else {
      explanationLines.push(`🌡️ Water temp ${waterTempF}°F — outside optimal range`);
    }
  } else {
    explanationLines.push('🌡️ Water temp unavailable — using neutral score');
  }

  // ── 4. Time of day score ─────────────────────────────────
  const hour = date.getHours();
  const bestWindow = _findBestTimeWindow(profile.timeWindows, hour);
  const timeOfDayScore = _timeScore(profile.timeWindows, hour);
  if (bestWindow.quality === 'excellent') {
    explanationLines.push(`⏰ Prime time window: ${bestWindow.label}`);
  } else if (bestWindow.quality === 'good') {
    explanationLines.push(`⏰ Good time window: ${bestWindow.label}`);
  } else {
    explanationLines.push(`⏰ Off-peak time — best windows: ${_topTwoWindows(profile.timeWindows)}`);
  }

  // ── 5. Weather score ────────────────────────────────────
  const airTempF = weather.tempF;
  const weatherScore = _weatherScore(airTempF, weather.description);
  if (weather.description.toLowerCase().includes('storm') || weather.description.toLowerCase().includes('thunder')) {
    explanationLines.push('⛈️ Storm conditions — fishing not recommended');
  } else if (weatherScore >= 0.8) {
    explanationLines.push(`☁️ ${weather.description} — good fishing weather`);
  } else if (weatherScore < 0.5) {
    explanationLines.push(`🌤️ ${weather.description} — fair conditions`);
  }

  // ── 6. Wind score ────────────────────────────────────────
  const windMph = weather.windSpeedMph;
  const windScore = _windScore(windMph, profile.maxWindMph);
  if (windMph > profile.maxWindMph) {
    explanationLines.push(`💨 Wind ${windMph} mph — exceeds optimal for ${profile.speciesName}`);
  } else if (windMph > profile.maxWindMph * 0.7) {
    explanationLines.push(`💨 Wind ${windMph} mph — manageable but watch for whitecaps`);
  }

  // ── 7. Water condition score ─────────────────────────────
  const clarityFt = water.clarityFt ?? null;
  const trend = water.trend ?? 'stable';
  const waterConditionScore = _waterConditionScore(clarityFt, trend, profile.minClarityFt);
  if (clarityFt !== null && clarityFt < profile.minClarityFt) {
    explanationLines.push(`👁️ Clarity ${clarityFt} ft — murky; switch to louder presentations`);
  }
  if (trend === 'rising') {
    explanationLines.push('📈 Water level rising — can activate feeding');
  } else if (trend === 'falling') {
    explanationLines.push('📉 Water level falling — fish may be pulling back');
  }

  // ── 8. Recent catch score ───────────────────────────────
  const recentCatchScore = _recentCatchScore(profile.speciesId, catchMap);
  if (recentCatchScore > 0.5) {
    explanationLines.push(`🎣 Recent catches of ${profile.speciesName} in this area`);
  }

  // ── Composite score ─────────────────────────────────────
  // Weights: season/regulation are most important; others moderate
  const weights = {
    seasonScore:         0.28,
    regulationScore:     0.04,
    waterTempScore:      0.18,
    timeOfDayScore:      0.14,
    weatherScore:        0.12,
    windScore:           0.10,
    waterConditionScore: 0.08,
    recentCatchScore:    0.06,
  };

  const weighted =
    weights.seasonScore         * seasonScore +
    weights.regulationScore     * regulationScore +
    weights.waterTempScore      * waterTempScore +
    weights.timeOfDayScore      * timeOfDayScore +
    weights.weatherScore        * weatherScore +
    weights.windScore           * windScore +
    weights.waterConditionScore * waterConditionScore +
    weights.recentCatchScore    * recentCatchScore;

  // Apply peak-month bonus (additive, capped at 1.0)
  const rawScore = Math.min(1.0, weighted + peakBonus * 0.5);

  // Closed species get a hard cap
  const finalScore = Math.round((isClosed ? Math.min(rawScore, 0.15) : rawScore) * 100);

  // Confidence from data quality + score spread
  const confidence: ConfidenceLevel =
    hasMockDataCheck(weather, water) ? 'low'
    : finalScore >= 65 ? 'high'
    : finalScore >= 40 ? 'medium'
    : 'low';

  // Pick best current time window
  const currentWindow = _findBestTimeWindow(profile.timeWindows, hour);
  const nextWindow = _findBestTimeWindow(profile.timeWindows, (hour + 4) % 24);
  const bestTimeWindow =
    currentWindow.quality === 'excellent'
      ? currentWindow.label
      : `Now: ${currentWindow.label} · Better: ${nextWindow.label}`;

  // Depth hint: simple heuristic based on water temp vs. optimal
  const depthRangeFt =
    waterTempF !== null && waterTempF > profile.optimalWaterTempMax
      ? profile.deepDepthFt
      : waterTempF !== null && waterTempF < profile.optimalWaterTempMin
      ? profile.deepDepthFt
      : profile.shallowDepthFt;

  const methods: FishingMethodSuggestion[] = profile.methods.map((m) => ({
    method: m.method,
    detail: m.detail,
  }));

  return {
    speciesId: profile.speciesId,
    speciesName: profile.speciesName,
    emoji: profile.emoji,
    finalScore,
    confidence,
    subscores: {
      seasonScore,
      regulationScore,
      waterTempScore,
      timeOfDayScore,
      weatherScore,
      windScore,
      waterConditionScore,
      recentCatchScore,
    },
    explanationLines,
    bestTimeWindow,
    depthRangeFt,
    methods,
    hasUnverifiedData,
    isClosed,
  };
}

// ── Scoring helpers ─────────────────────────────────────────────────────────

/** Bell-curve score for a value within an optimal range. */
function _tempScore(
  tempF: number,
  optMin: number,
  optMax: number,
  coldThresh: number,
  heatThresh: number,
): number {
  if (tempF < coldThresh || tempF > heatThresh) return 0.05;
  if (tempF >= optMin && tempF <= optMax) {
    // Within optimal — peak score, slight penalty at extremes of range
    const mid = (optMin + optMax) / 2;
    const halfRange = (optMax - optMin) / 2;
    const dist = Math.abs(tempF - mid);
    return 0.7 + 0.3 * (1 - dist / halfRange);
  }
  // Outside optimal but within survival range
  if (tempF < optMin) {
    return 0.5 * ((tempF - coldThresh) / (optMin - coldThresh));
  }
  return 0.5 * ((heatThresh - tempF) / (heatThresh - optMax));
}

/** Score based on air temp and weather description. */
function _weatherScore(airTempF: number, description: string): number {
  const desc = description.toLowerCase();
  if (desc.includes('thunderstorm') || desc.includes('storm')) return 0.05;
  if (desc.includes('heavy rain')) return 0.2;
  if (desc.includes('overcast') || desc.includes('cloudy')) return 0.9; // overcast = great fishing
  if (desc.includes('partly cloudy') || desc.includes('light rain') || desc.includes('drizzle')) return 0.85;
  if (desc.includes('clear') || desc.includes('sunny')) {
    // Bright sun can suppress midday fishing; reduce slightly
    return airTempF > 85 ? 0.55 : 0.7;
  }
  return 0.65; // default neutral
}

/** Score based on wind speed relative to species tolerance. */
function _windScore(windMph: number, maxWindMph: number): number {
  if (windMph <= 5) return 0.95;
  if (windMph <= maxWindMph * 0.6) return 0.85;
  if (windMph <= maxWindMph) return 0.65;
  if (windMph <= maxWindMph * 1.4) return 0.35;
  return 0.1;
}

/** Score based on water clarity and trend. */
function _waterConditionScore(
  clarityFt: number | null,
  trend: string,
  minClarityFt: number,
): number {
  let base = 0.7; // neutral when no clarity data
  if (clarityFt !== null) {
    if (clarityFt >= minClarityFt * 2) base = 1.0;
    else if (clarityFt >= minClarityFt) base = 0.75;
    else if (clarityFt >= minClarityFt * 0.5) base = 0.45;
    else base = 0.2;
  }
  // Trend modifier
  if (trend === 'rising') base = Math.min(1.0, base + 0.1);
  if (trend === 'falling') base = Math.max(0.0, base - 0.05);
  return base;
}

/** Score for time of day against species time windows. */
function _timeScore(windows: TimeWindow[], hour: number): number {
  const window = _findBestTimeWindow(windows, hour);
  switch (window.quality) {
    case 'excellent': return 1.0;
    case 'good':      return 0.7;
    case 'fair':      return 0.4;
    default:          return 0.35;
  }
}

/** Find which time window the given hour falls in; return lowest-quality if none match. */
function _findBestTimeWindow(windows: TimeWindow[], hour: number): TimeWindow {
  for (const w of windows) {
    if (_hourInWindow(hour, w.hoursStart, w.hoursEnd)) return w;
  }
  // Return the first window as a fallback (still shows label + quality)
  return windows[0] ?? { label: 'Any time', hoursStart: 0, hoursEnd: 23, quality: 'fair' };
}

function _hourInWindow(hour: number, start: number, end: number): boolean {
  if (start <= end) return hour >= start && hour < end;
  // Wraps midnight (e.g., 22–2)
  return hour >= start || hour < end;
}

/** Return a generic best window label for the current hour (used when no profile available). */
function _getBestTimeWindowForHour(hour: number): TimeWindow {
  if (hour >= 5 && hour < 9)  return { label: 'Dawn (5–8am)',        hoursStart: 5,  hoursEnd: 9,  quality: 'excellent' };
  if (hour >= 19 && hour < 22) return { label: 'Dusk (7–10pm)',       hoursStart: 19, hoursEnd: 22, quality: 'excellent' };
  if (hour >= 9 && hour < 11)  return { label: 'Morning (9–11am)',    hoursStart: 9,  hoursEnd: 11, quality: 'good' };
  return { label: 'Midday (variable)', hoursStart: 11, hoursEnd: 17, quality: 'fair' };
}

/** Return top 2 window labels from a profile. */
function _topTwoWindows(windows: TimeWindow[]): string {
  const sorted = [...windows].sort((a, b) =>
    (b.quality === 'excellent' ? 2 : b.quality === 'good' ? 1 : 0) -
    (a.quality === 'excellent' ? 2 : a.quality === 'good' ? 1 : 0),
  );
  return sorted.slice(0, 2).map((w) => w.label).join(', ');
}

/** Build a map of speciesId → recent-catch count. */
function _buildCatchMap(
  catches: CatchEntry[],
  date: Date,
): Record<string, number> {
  const cutoff = date.getTime() - RECENT_CATCH_DAYS * 24 * 60 * 60 * 1000;
  const map: Record<string, number> = {};
  for (const c of catches) {
    if (new Date(c.timestamp).getTime() >= cutoff) {
      map[c.speciesId] = (map[c.speciesId] ?? 0) + 1;
    }
  }
  return map;
}

/** Recent catch bonus score (0–1). */
function _recentCatchScore(speciesId: string, catchMap: Record<string, number>): number {
  const count = catchMap[speciesId] ?? 0;
  if (count === 0) return 0.0;
  if (count === 1) return 0.3;
  if (count <= 3) return 0.6;
  return 0.9;
}

/** Fallback season status when no regulation rule is found. Uses Species.bestMonths heuristic. */
function _fallbackSeasonStatus(
  profile: SpeciesProfile,
  date: Date,
): 'open' | 'closed' | 'restricted' | 'unknown' {
  // Steelhead and muskie have complex seasons — default unknown
  if (['steelhead', 'muskellunge'].includes(profile.speciesId)) return 'unknown';
  // Bass: closed Nov 30–Jun 1
  if (['smallmouth-bass', 'largemouth-bass'].includes(profile.speciesId)) {
    const month = date.getMonth() + 1;
    return month >= 6 && month <= 11 ? 'open' : 'closed';
  }
  // Walleye: closed Mar 16–Apr 30
  if (profile.speciesId === 'walleye') {
    const mmdd = (date.getMonth() + 1) * 100 + date.getDate();
    return (mmdd >= 316 && mmdd <= 430) ? 'closed' : 'open';
  }
  return 'open'; // perch, pike default open
}

function _isStale(isoString: string, maxAgeMs: number): boolean {
  const age = Date.now() - new Date(isoString).getTime();
  return age > maxAgeMs;
}

function hasMockDataCheck(weather: WeatherSnapshot, water: WaterConditionSnapshot): boolean {
  return weather.source === 'mock' || water.source === 'mock';
}

// ── Summary builder ─────────────────────────────────────────────────────────

function _buildSummary(
  top: SpeciesScore | null,
  date: Date,
  waterbodyName: string,
  hasMockData: boolean,
): string {
  const hour = date.getHours();
  const timeOfDay =
    hour < 6  ? 'before dawn' :
    hour < 9  ? 'morning' :
    hour < 12 ? 'mid-morning' :
    hour < 15 ? 'midday' :
    hour < 18 ? 'afternoon' :
    hour < 21 ? 'evening' :
    'night';

  const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  if (!top) {
    return `${dateStr} · ${waterbodyName}: No species are recommended under current conditions. Check individual species for details.`;
  }

  const mockNote = hasMockData ? ' (using seed data — connect to live conditions for better accuracy)' : '';

  return (
    `${dateStr} · ${waterbodyName} · ${timeOfDay}: ` +
    `Best target is ${top.emoji} ${top.speciesName} (score ${top.finalScore}/100, ${top.confidence} confidence). ` +
    `${top.bestTimeWindow} is the prime window. Depth: ${top.depthRangeFt}. ` +
    `${top.methods[0] != null ? `Try ${top.methods[0].method}.` : ''}` +
    mockNote
  );
}

// ── Degraded recommendation (error fallback) ────────────────────────────────

function _degradedRecommendation(input: FishingConditionInput): FishingRecommendation {
  const wb = WATERBODIES.find((w) => w.id === input.waterbodyId);
  return {
    generatedAt: new Date().toISOString(),
    waterbodyId: input.waterbodyId,
    waterbodyName: wb?.name ?? input.waterbodyId,
    rankedSpecies: [],
    topPick: null,
    bestTimeWindow: 'Dawn and dusk are generally productive',
    confidence: 'low',
    summary:
      'Unable to generate a full recommendation — condition data unavailable. ' +
      'Dawn and dusk at current water temps are a safe starting point. ' +
      'Verify current regulations at michigan.gov/dnr.',
    dataWarnings: [
      'Recommendation engine encountered an error.',
      'All data is unavailable — fishing guidance is generic only.',
    ],
    hasMockData: true,
    isWeatherStale: true,
    isWaterStale: true,
  };
}
