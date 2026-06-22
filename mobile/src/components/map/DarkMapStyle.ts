/**
 * DarkMapStyle.ts
 * Google Maps / Apple Maps custom style for the Pure MI Fishing dark UI.
 *
 * Palette:
 *  - Land:   #0a1628  (dark navy)
 *  - Water:  #162540  (deeper navy-blue)
 *  - Roads:  #1a2e4a  (mid-navy)
 *  - POI:    #1b3a2a  (forest tint)
 *  - Labels: #4FC3F7  (water teal — water labels only)
 *
 * Applied to <MapView customMapStyle={DARK_MAP_STYLE} />.
 * Note: customMapStyle is ignored on iOS with PROVIDER_DEFAULT; it only
 * applies when PROVIDER_GOOGLE is used on Android.  On iOS the dark
 * appearance is approximated by the system dark-mode map rendering.
 */

import type { MapStyleElement } from 'react-native-maps';

export const DARK_MAP_STYLE: MapStyleElement[] = [
  // Base geometry
  { elementType: 'geometry',             stylers: [{ color: '#0a1628' }] },
  { elementType: 'labels.text.stroke',   stylers: [{ color: '#0a1628' }] },
  { elementType: 'labels.text.fill',     stylers: [{ color: '#8ec3b9' }] },
  { elementType: 'labels.icon',          stylers: [{ visibility: 'off' }] },

  // Water
  { featureType: 'water', elementType: 'geometry',        stylers: [{ color: '#162540' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4fc3f7' }] },

  // Roads
  { featureType: 'road',              elementType: 'geometry',        stylers: [{ color: '#1a2e4a' }] },
  { featureType: 'road',              elementType: 'geometry.stroke', stylers: [{ color: '#0f1e35' }] },
  { featureType: 'road',              elementType: 'labels.text.fill', stylers: [{ color: '#4a6fa5' }] },
  { featureType: 'road.highway',      elementType: 'geometry',        stylers: [{ color: '#213d6b' }] },
  { featureType: 'road.highway',      elementType: 'geometry.stroke', stylers: [{ color: '#1a3055' }] },
  { featureType: 'road.highway',      elementType: 'labels.text.fill', stylers: [{ color: '#6fa8d4' }] },

  // Transit / admin
  { featureType: 'transit',           elementType: 'geometry',        stylers: [{ color: '#0f1e35' }] },
  { featureType: 'administrative',    elementType: 'geometry',        stylers: [{ color: '#1a2e4a' }] },
  { featureType: 'administrative',    elementType: 'labels.text.fill', stylers: [{ color: '#4a6fa5' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#1565c0' }] },

  // Points of interest
  { featureType: 'poi',               elementType: 'geometry',        stylers: [{ color: '#1b3a2a' }] },
  { featureType: 'poi',               elementType: 'labels.text.fill', stylers: [{ color: '#4a9070' }] },
  { featureType: 'poi.park',          elementType: 'geometry',        stylers: [{ color: '#1b3a2a' }] },
  { featureType: 'poi.park',          elementType: 'labels.text.fill', stylers: [{ color: '#4a9070' }] },

  // Landscape
  { featureType: 'landscape',         elementType: 'geometry',        stylers: [{ color: '#0d1f38' }] },
  { featureType: 'landscape.natural', elementType: 'geometry',        stylers: [{ color: '#0f2a20' }] },
];
