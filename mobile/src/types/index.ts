// Pure MI Fishing — TypeScript Type Definitions

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Shared sync lifecycle status used across syncable records (Phase 7). */
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface Waterbody {
  id: string;
  name: string;
  region: string;
  description: string;
  coordinates: Coordinates;
  zoomLevel: number;
  badges: string[];
  species: string[];
  accessTypes: Array<'shore' | 'boat' | 'kayak' | 'ice'>;
  rulesNote: string;
  fishingNotes: string;
  isSaved: boolean;
}

export interface Launch {
  id: string;
  name: string;
  waterbodyId: string;
  waterbodyName: string;
  coordinates: Coordinates;
  accessType: 'ramp' | 'shore' | 'marina' | 'carry-in';
  trailerFriendly: boolean;
  shoreAccess: boolean;
  parkingEstimate: number;
  fee: string;
  hours: string;
  notes: string;
  address: string;
}

export interface Species {
  id: string;
  name: string;
  emoji: string;
  seasonOpen: string;
  seasonClose: string;
  minSizeIn: number;
  dailyLimit: number;
  possessionLimit: number;
  bestMonths: string[];
  notes: string;
  isTrophyFish: boolean;
}

export interface Regulation {
  id: string;
  waterbodyId: string;
  speciesId: string;
  speciesName: string;
  summary: string;
  minLengthIn?: number;
  dailyLimit?: number;
  seasonDates?: string;
  specialRules?: string;
  officialLink: string;
  lastVerified: string;
}

export interface WeatherData {
  tempF: number;
  feelsLikeF: number;
  description: string;
  windSpeedMph: number;
  windDirection: string;
  humidityPct: number;
  iconCode: string;
}

export interface WaterData {
  tempF?: number;
  levelFt?: number;
  clarityFt?: number;
  flowCfs?: string;
  trend?: 'rising' | 'falling' | 'stable';
}

export interface Conditions {
  waterbodyId: string;
  timestamp: string;
  weather: WeatherData;
  water: WaterData;
  iceStatus: 'open' | 'partial' | 'closed';
  fishingRating: 1 | 2 | 3 | 4 | 5;
  fishingRatingLabel: string;
  source: 'live' | 'cached' | 'mock';
}

export interface Alert {
  id: string;
  waterbodyId?: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'danger';
  source: string;
  timestamp: string;
  expiresAt?: string;
}

export type OfflinePackStatus = 'available' | 'downloading' | 'downloaded' | 'outdated';

export interface OfflinePack {
  id: string;
  name: string;
  waterbodyId: string;
  sizeEstimateMB: number;
  includes: string[];
  downloadedAt?: string;
  status: OfflinePackStatus;
  version: string;
  downloadProgress?: number; // 0–1
}

export interface Trip {
  id: string;
  title: string;
  waterbodyId: string;
  waterbodyName: string;
  startTime: string;
  endTime?: string;
  launchId?: string;
  launchName?: string;
  notes?: string;
  isActive: boolean;
  // Phase 7 sync metadata (optional — absent on legacy/demo records)
  syncStatus?: SyncStatus;
  syncAttempts?: number;
  lastSyncAttemptAt?: string;
  syncedAt?: string;
}

export interface CatchEntry {
  id: string;
  tripId?: string;
  speciesId: string;
  speciesName: string;
  lengthIn?: number;
  weightLb?: number;
  method?: string;
  bait?: string;
  notes?: string;
  timestamp: string;
  waterbodyId: string;
  waterbodyName: string;
  isPublic: boolean;
  // Phase 7 sync metadata (optional — absent on legacy records)
  syncStatus?: SyncStatus;
  syncAttempts?: number;
  lastSyncAttemptAt?: string;
  syncedAt?: string;
}

export interface MapPin {
  id: string;
  title: string;
  type: 'launch' | 'hotspot' | 'access' | 'hazard';
  coordinates: Coordinates;
  description?: string;
  waterbodyId?: string;
}

export interface FilterChip {
  id: string;
  label: string;
  icon?: string;
  active: boolean;
}

export interface UserPreferences {
  units: 'imperial' | 'metric';
  textSize: 'sm' | 'md' | 'lg';
  highContrast: boolean;
  reducedMotion: boolean;
  onboardingComplete: boolean;
  savedWaterbodyIds: string[];
  savedLaunchIds: string[];
}

// ─── Phase 1 additions ────────────────────────────────────────────────────────

export interface RegionBounds {
  northeast: Coordinates;
  southwest: Coordinates;
}

export interface Region {
  id: string;
  name: string;
  state: string;
  description: string;
  bounds: RegionBounds;
  centerCoordinates: Coordinates;
  defaultZoom: number;
  waterbodyIds: string[];
  isMvpRegion: boolean;
}

export type AccessPointType =
  | 'boat_launch'
  | 'shore_access'
  | 'marina'
  | 'carry_in'
  | 'bait_shop'
  | 'emergency_resource'
  | 'parking'
  | 'hotspot';

export interface AccessPoint {
  id: string;
  regionId: string;
  name: string;
  type: AccessPointType;
  coordinates: Coordinates;
  waterbodyId?: string;
  waterbodyName?: string;
  address?: string;
  hours?: string;
  fee?: string;
  amenities: string[];
  notes?: string;
  isVerified: boolean;
  isEmergencyResource: boolean;
  emergencyPhone?: string;
}

export type VerificationStatus = 'official' | 'sample_unverified' | 'pending_review';

export interface RegulationRule {
  id: string;
  regionId: string;
  waterbodyId?: string;
  speciesId: string;
  speciesName: string;
  ruleType: 'size_limit' | 'bag_limit' | 'season' | 'gear' | 'special' | 'combined';
  summary: string;
  minLengthIn?: number;
  maxLengthIn?: number;
  dailyBagLimit?: number;
  possessionLimit?: number;
  /** 'MM/DD' format or 'All year' */
  seasonStart?: string;
  /** 'MM/DD' format or 'All year' */
  seasonEnd?: string;
  gearRestrictions?: string;
  specialNotes?: string;
  sourceUrl: string;
  lastVerifiedAt: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  effectiveYear: number;
  expiresYear?: number;
}

export type OfflineRegionPackStatus =
  | 'available'
  | 'downloading'
  | 'downloaded'
  | 'update_available'
  | 'error';

export interface OfflineRegionPack {
  id: string;
  regionId: string;
  name: string;
  version: string;
  sizeEstimateMB: number;
  mapDataVersion: string;
  regulationDataVersion: string;
  accessPointCount: number;
  downloadedAt?: string;
  status: OfflineRegionPackStatus;
  downloadProgress?: number; // 0–1
  includes: string[];
}

export interface WeatherSnapshot {
  id: string;
  waterbodyId: string;
  capturedAt: string;
  source: 'live' | 'cached' | 'mock';
  tempF: number;
  feelsLikeF?: number;
  description: string;
  windSpeedMph: number;
  windDirection: string;
  humidityPct?: number;
  iconCode?: string;
  forecastSummary?: string;
}

export interface WaterConditionSnapshot {
  id: string;
  waterbodyId: string;
  capturedAt: string;
  source: 'usgs' | 'manual' | 'mock';
  gaugeId?: string;
  tempF?: number;
  levelFt?: number;
  clarityFt?: number;
  flowCfs?: number;
  trend?: 'rising' | 'falling' | 'stable';
  iceStatus: 'open' | 'partial' | 'closed';
}

export type CitizenReportType =
  | 'invasive_species'
  | 'dead_fish'
  | 'pollution'
  | 'illegal_dumping'
  | 'broken_launch'
  | 'flooding'
  | 'erosion'
  | 'damaged_dock'
  | 'algae_bloom'
  | 'oil_spill'
  | 'poaching_concern'
  | 'navigation_hazard'
  | 'other';

export interface CitizenReport {
  id: string;
  reportType: CitizenReportType;
  coordinates?: Coordinates;
  waterbodyId?: string;
  waterbodyName?: string;
  photoUri?: string;
  notes?: string;
  timestamp: string;
  isAnonymous: boolean;
  status: 'draft' | 'submitted' | 'synced';
  syncAttempts: number;
  lastSyncAttemptAt?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface EmergencyIncident {
  id: string;
  createdAt: string;
  coordinates?: Coordinates;
  lastKnownCoordinates?: Coordinates;
  lastKnownAt?: string;
  batteryLevel?: number;
  notes?: string;
  emergencyContact?: EmergencyContact;
  nearestAccessPointId?: string;
  nearestAccessPointName?: string;
  nearestAccessPointDistanceMi?: number;
  status: 'active' | 'resolved' | 'false_alarm';
  syncStatus: 'pending' | 'synced' | 'failed';
  syncAttempts: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase 4 — Fishing Intelligence Types
// ─────────────────────────────────────────────────────────────────────────────

export type ConfidenceLevel = 'low' | 'medium' | 'high';

/** All inputs fed into the scoring engine. */
export interface FishingConditionInput {
  date: Date;
  waterbodyId: string;
  weatherSnapshot?: WeatherSnapshot;
  waterSnapshot?: WaterConditionSnapshot;
  recentCatches?: CatchEntry[];
}

/** Per-species breakdown of sub-scores (all 0–1). */
export interface SpeciesScore {
  speciesId: string;
  speciesName: string;
  emoji: string;
  /** Final 0–100 composite score. */
  finalScore: number;
  confidence: ConfidenceLevel;
  /** Sub-scores for transparency (each 0–1). */
  subscores: {
    seasonScore: number;
    regulationScore: number;
    waterTempScore: number;
    timeOfDayScore: number;
    weatherScore: number;
    windScore: number;
    waterConditionScore: number;
    recentCatchScore: number;
  };
  /** Why this score was given — plain English lines. */
  explanationLines: string[];
  /** Best time window for this species given current conditions. */
  bestTimeWindow: string;
  /** Depth range suggestion in feet. */
  depthRangeFt: string;
  /** 1–3 suggested methods with brief notes. */
  methods: FishingMethodSuggestion[];
  /** True if any regulation data is sample_unverified. */
  hasUnverifiedData: boolean;
  /** True if the species is currently in closed season. */
  isClosed: boolean;
}

export interface FishingMethodSuggestion {
  method: string;
  detail: string;
}

export interface FishingRecommendation {
  generatedAt: string;
  waterbodyId: string;
  waterbodyName: string;
  /** Ranked from highest to lowest score. */
  rankedSpecies: SpeciesScore[];
  /** The top-ranked non-closed species. */
  topPick: SpeciesScore | null;
  /** Best overall time window across all recommended species. */
  bestTimeWindow: string;
  /** Overall confidence level. */
  confidence: ConfidenceLevel;
  /** Plain-language summary paragraph. */
  summary: string;
  /** Data freshness warnings. */
  dataWarnings: string[];
  /** True if any input data is mock/seed. */
  hasMockData: boolean;
  /** True if weather data is stale (>4h old) or mock. */
  isWeatherStale: boolean;
  /** True if water data is stale (>6h old) or mock. */
  isWaterStale: boolean;
}
