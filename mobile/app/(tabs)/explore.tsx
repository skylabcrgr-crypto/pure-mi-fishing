/**
 * Explore screen — Detroit River Corridor access point map.
 * Phase 3: Upgraded from legacy MAP_PINS (7 pins) to canonical ACCESS_POINTS (9 points).
 *
 * mapPins.ts is kept as legacy data but is no longer used by this screen.
 * Map tiles use system provider — true offline tiles deferred to Phase 5.
 * Access points, regulations, and saved spots work fully offline.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Dimensions, Linking,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Search, Download, CheckCircle, Bookmark, Phone, Navigation, RefreshCw, Wifi, Radio,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../src/components/ui/GlassCard';
import {
  ACCESS_POINTS,
  getAccessPointDistanceMi,
} from '../../src/data/accessPoints';
import { useOfflinePackStore } from '../../src/store/useOfflinePackStore';
import { useLocation } from '../../src/hooks/useLocation';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../src/design/tokens';
import { DARK_MAP_STYLE } from '../../src/components/map/DarkMapStyle';
import { formatRelative } from '../../src/utils/format';
import { getTopSpecies } from '../../src/services/fishingIntelligenceService';
import type { AccessPoint, AccessPointType, OfflineRegionPack } from '../../src/types';

const { height: SCREEN_H } = Dimensions.get('window');

const DETROIT_RIVER_REGION = {
  latitude: 42.18,
  longitude: -83.12,
  latitudeDelta: 0.38,
  longitudeDelta: 0.38,
};

// ── Filter chips ─────────────────────────────────────────────────────
type FilterId = 'all' | 'launches' | 'shore' | 'marina' | 'emergency' | 'saved';

const FILTER_CHIPS: { id: FilterId; label: string }[] = [
  { id: 'all',       label: 'All' },
  { id: 'launches',  label: 'Boat Launches' },
  { id: 'shore',     label: 'Shore Access' },
  { id: 'marina',    label: 'Bait / Marina' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'saved',     label: '⭐ Saved' },
];

// ── Access point type display config ─────────────────────────────────
const AP_TYPE_CONFIG: Record<AccessPointType, { label: string; color: string }> = {
  boat_launch:        { label: 'Boat Launch',  color: Colors.map.launch },
  marina:             { label: 'Marina',        color: Colors.brand.sand },
  bait_shop:          { label: 'Bait Shop',     color: Colors.brand.forestLight },
  shore_access:       { label: 'Shore Access',  color: Colors.map.access },
  carry_in:           { label: 'Carry-In',      color: Colors.map.access },
  emergency_resource: { label: 'Emergency',     color: Colors.status.danger },
  hotspot:            { label: 'Hotspot',       color: Colors.map.hotspot },
  parking:            { label: 'Parking',       color: Colors.text.muted },
};

function apMatchesFilter(
  ap: AccessPoint,
  filter: FilterId,
  savedIds: string[],
  query: string,
): boolean {
  if (query) {
    const hay = `${ap.name} ${ap.waterbodyName ?? ''} ${ap.notes ?? ''}`.toLowerCase();
    if (!hay.includes(query)) return false;
  }
  switch (filter) {
    case 'all':       return true;
    case 'launches':  return ap.type === 'boat_launch';
    case 'shore':     return ap.type === 'shore_access' || ap.type === 'carry_in';
    case 'marina':    return ap.type === 'marina' || ap.type === 'bait_shop';
    case 'emergency': return ap.type === 'emergency_resource' || ap.isEmergencyResource;
    case 'saved':     return savedIds.includes(ap.id);
    default:          return true;
  }
}

// ── Main screen ───────────────────────────────────────────────────────
export default function ExploreScreen() {
  const router = useRouter();
  const { position } = useLocation();
  const {
    regionPacks,
    savedAccessPointIds,
    toggleSavedAccessPoint,
    startPackDownload,
    updatePackProgress,
    markPackDownloaded,
  } = useOfflinePackStore();

  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [searchText, setSearchText] = useState('');
  const [selectedAP, setSelectedAP] = useState<AccessPoint | null>(null);

  const mvpPack: OfflineRegionPack | undefined = regionPacks[0];
  const q = searchText.trim().toLowerCase();

  // Fish Today — compact top-pick for map bottom sheet
  const topFish = useMemo(() => getTopSpecies('detroit-river', new Date()), []);

  const visibleAPs = useMemo(
    () => ACCESS_POINTS.filter((ap) => apMatchesFilter(ap, activeFilter, savedAccessPointIds, q)),
    [activeFilter, savedAccessPointIds, q],
  );

  const handleDownloadPack = useCallback(() => {
    if (!mvpPack || mvpPack.status !== 'available') return;
    startPackDownload(mvpPack.id);
    let progress = 0;
    const tick = setInterval(() => {
      progress += 0.07 + Math.random() * 0.07;
      if (progress >= 1) {
        clearInterval(tick);
        markPackDownloaded(mvpPack.id);
      } else {
        updatePackProgress(mvpPack.id, progress);
      }
    }, 180);
  }, [mvpPack, startPackDownload, updatePackProgress, markPackDownloaded]);

  return (
    <View style={styles.root}>
      {/* Map — tiles use system provider; true offline tiles deferred to Phase 5 */}
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={DETROIT_RIVER_REGION}
        showsUserLocation
        showsCompass={false}
        showsScale
        customMapStyle={DARK_MAP_STYLE}
        accessibilityLabel="Detroit River Corridor access points map"
      >
        {visibleAPs.map((ap) => (
          <Marker
            key={ap.id}
            coordinate={ap.coordinates}
            pinColor={AP_TYPE_CONFIG[ap.type].color}
            title={ap.name}
            description={ap.waterbodyName}
            onPress={() => setSelectedAP(ap)}
            accessibilityLabel={ap.name}
          />
        ))}
      </MapView>

      {/* Floating top bar */}
      <SafeAreaView edges={['top']} style={styles.topOverlay}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={16} color={Colors.text.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search launches, shore access, bait shops…"
              placeholderTextColor={Colors.text.muted}
              value={searchText}
              onChangeText={setSearchText}
              accessibilityLabel="Search access points"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')} accessibilityLabel="Clear search">
                <Text style={styles.clearBtn}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Type filter chips — single-select */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTER_CHIPS.map((chip) => {
            const active = activeFilter === chip.id;
            return (
              <TouchableOpacity
                key={chip.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setActiveFilter(chip.id)}
                accessibilityLabel={chip.label}
              >
                <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Access point detail card — floating above bottom sheet */}
      {selectedAP !== null && (
        <AccessPointDetailCard
          ap={selectedAP}
          userLat={position?.latitude}
          userLon={position?.longitude}
          isSaved={savedAccessPointIds.includes(selectedAP.id)}
          onSave={() => { void toggleSavedAccessPoint(selectedAP.id); }}
          onClose={() => setSelectedAP(null)}
          onCheckRules={() => {
            if (selectedAP.waterbodyId) {
              setSelectedAP(null);
              router.push(`/waterbody/${selectedAP.waterbodyId}`);
            }
          }}
        />
      )}

      {/* Bottom sheet */}
      <View style={styles.sheet}>
        {/* Fish Today compact card */}
        {topFish !== null && (
          <TouchableOpacity
            style={styles.fishTodayCard}
            onPress={() => router.push('/(tabs)/conditions')}
            accessibilityLabel={`Fish Today: ${topFish.speciesName}, score ${topFish.finalScore}. Tap to see full forecast.`}
          >
            <Text style={styles.fishTodayEmoji}>{topFish.emoji}</Text>
            <View style={styles.fishTodayInfo}>
              <Text style={styles.fishTodayLabel}>Fish Today</Text>
              <Text style={styles.fishTodaySpecies}>{topFish.speciesName}</Text>
            </View>
            <View style={styles.fishTodayRight}>
              <View style={styles.fishTodayScore}>
                <Text style={styles.fishTodayScoreText}>{topFish.finalScore}</Text>
              </View>
              <Text style={styles.fishTodaySeeMore}>Full forecast →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Pack status row */}
        <PackStatusRow
          pack={mvpPack}
          onDownload={handleDownloadPack}
          onViewPack={() => router.push('/offline-packs')}
        />

        {/* Report a Problem shortcut */}
        <TouchableOpacity
          style={styles.reportBtn}
          onPress={() => router.push('/report-problem')}
          accessibilityLabel="Report a problem"
        >
          <Radio size={14} color={Colors.brand.orange} />
          <Text style={styles.reportBtnText}>Report a Problem</Text>
        </TouchableOpacity>

        {/* Access point list */}
        <Text style={styles.sheetTitle}>
          {visibleAPs.length} access point{visibleAPs.length === 1 ? '' : 's'}
          {activeFilter === 'all' ? ' · Detroit River Corridor' : ''}
        </Text>
        {visibleAPs.length === 0 ? (
          <Text style={styles.emptyText}>No access points match this filter.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.apListRow}
          >
            {visibleAPs.map((ap) => (
              <TouchableOpacity
                key={ap.id}
                style={styles.apChip}
                onPress={() => setSelectedAP(ap)}
                accessibilityLabel={ap.name}
              >
                <View style={[styles.apChipDot, { backgroundColor: AP_TYPE_CONFIG[ap.type].color }]} />
                <Text style={styles.apChipName} numberOfLines={2}>{ap.name}</Text>
                <Text style={styles.apChipType}>{AP_TYPE_CONFIG[ap.type].label}</Text>
                {position != null && (
                  <Text style={styles.apChipDist}>
                    {getAccessPointDistanceMi(position.latitude, position.longitude, ap)} mi
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

// ── Pack status row ───────────────────────────────────────────────────
function PackStatusRow({
  pack,
  onDownload,
  onViewPack,
}: {
  pack: OfflineRegionPack | undefined;
  onDownload: () => void;
  onViewPack: () => void;
}) {
  if (!pack) return null;
  const isDownloaded = pack.status === 'downloaded';
  const isDownloading = pack.status === 'downloading';

  if (isDownloaded) {
    return (
      <TouchableOpacity
        style={packRowStyles.rowReady}
        onPress={onViewPack}
        accessibilityLabel="Detroit River Pack ready — tap to view"
      >
        <CheckCircle size={15} color={Colors.status.success} />
        <Text style={packRowStyles.readyText}>Pack Ready</Text>
        <Text style={packRowStyles.metaText}>v{pack.version}</Text>
        {pack.downloadedAt != null && (
          <Text style={packRowStyles.metaText}>· {formatRelative(pack.downloadedAt)}</Text>
        )}
      </TouchableOpacity>
    );
  }

  if (isDownloading) {
    return (
      <View style={packRowStyles.rowDownloading}>
        <RefreshCw size={15} color={Colors.text.accent} />
        <View style={packRowStyles.progressTrack}>
          <View
            style={[
              packRowStyles.progressFill,
              { width: `${Math.round((pack.downloadProgress ?? 0) * 100)}%` },
            ]}
          />
        </View>
        <Text style={packRowStyles.metaText}>
          {Math.round((pack.downloadProgress ?? 0) * 100)}%
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={packRowStyles.rowDownload}
      onPress={onDownload}
      accessibilityLabel="Download Detroit River Corridor Pack for offline use"
    >
      <LinearGradient
        colors={['#1565C0', '#00ACC1']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={packRowStyles.gradient}
      >
        <Download size={15} color="#fff" />
        <Text style={packRowStyles.downloadText}>Download Detroit River Pack</Text>
        <Text style={packRowStyles.sizeText}>{pack.sizeEstimateMB}MB</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const packRowStyles = StyleSheet.create({
  rowReady: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingVertical: 9, paddingHorizontal: 12,
    backgroundColor: 'rgba(76,175,80,0.10)',
    borderRadius: Radius.md, borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.25)',
    marginBottom: Spacing.sm,
  },
  rowDownloading: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 9, paddingHorizontal: 12,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  rowDownload: { borderRadius: Radius.md, overflow: 'hidden', marginBottom: Spacing.sm },
  gradient: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 11, paddingHorizontal: 14,
  },
  readyText: { ...Typography.label, color: Colors.status.success, flex: 1 },
  downloadText: { ...Typography.label, color: '#fff', flex: 1 },
  metaText: { ...Typography.caption, color: Colors.text.muted },
  sizeText: { ...Typography.caption, color: 'rgba(255,255,255,0.65)' },
  progressTrack: { flex: 1, height: 4, backgroundColor: Colors.border, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: Colors.text.accent, borderRadius: 2 },
});

// ── Access point detail card ──────────────────────────────────────────
function AccessPointDetailCard({
  ap,
  userLat,
  userLon,
  isSaved,
  onSave,
  onClose,
  onCheckRules,
}: {
  ap: AccessPoint;
  userLat?: number;
  userLon?: number;
  isSaved: boolean;
  onSave: () => void;
  onClose: () => void;
  onCheckRules: () => void;
}) {
  const config = AP_TYPE_CONFIG[ap.type];
  const distanceMi =
    userLat != null && userLon != null
      ? getAccessPointDistanceMi(userLat, userLon, ap)
      : null;

  return (
    <View style={detailStyles.container}>
      <GlassCard style={detailStyles.card}>
        {/* Header */}
        <View style={detailStyles.headerRow}>
          <View style={[detailStyles.typeDot, { backgroundColor: config.color }]} />
          <View style={detailStyles.titleBlock}>
            <Text style={detailStyles.name} numberOfLines={2}>{ap.name}</Text>
            <View style={detailStyles.badgeRow}>
              <View style={[detailStyles.typeBadge, { borderColor: config.color + '55', backgroundColor: config.color + '18' }]}>
                <Text style={[detailStyles.typeBadgeText, { color: config.color }]}>{config.label}</Text>
              </View>
              {distanceMi != null && (
                <View style={detailStyles.distBadge}>
                  <Navigation size={10} color={Colors.text.muted} />
                  <Text style={detailStyles.distText}>{distanceMi} mi</Text>
                </View>
              )}
              {ap.isEmergencyResource && (
                <View style={[detailStyles.typeBadge, { borderColor: Colors.status.danger + '55', backgroundColor: Colors.status.danger + '18' }]}>
                  <Text style={[detailStyles.typeBadgeText, { color: Colors.status.danger }]}>Emergency</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={detailStyles.closeBtn} accessibilityLabel="Close">
            <Text style={detailStyles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Hours + fee */}
        {(ap.fee != null || ap.hours != null) && (
          <View style={detailStyles.infoRow}>
            {ap.fee != null && <Text style={detailStyles.infoText}>💰 {ap.fee}</Text>}
            {ap.hours != null && <Text style={detailStyles.infoText}>🕐 {ap.hours}</Text>}
          </View>
        )}

        {/* Notes */}
        {ap.notes != null && (
          <Text style={detailStyles.notes} numberOfLines={3}>{ap.notes}</Text>
        )}

        {/* Amenities — up to 4 */}
        {ap.amenities.length > 0 && (
          <Text style={detailStyles.amenities} numberOfLines={2}>
            {ap.amenities.slice(0, 4).join(' · ')}
          </Text>
        )}

        {/* Emergency phone */}
        {ap.emergencyPhone != null && (
          <TouchableOpacity
            style={detailStyles.phoneRow}
            onPress={() => { void Linking.openURL(`tel:${ap.emergencyPhone}`); }}
            accessibilityLabel={`Call emergency line ${ap.emergencyPhone ?? ''}`}
          >
            <Phone size={12} color={Colors.status.danger} />
            <Text style={detailStyles.phoneText}>Emergency: {ap.emergencyPhone}</Text>
          </TouchableOpacity>
        )}

        {/* Offline indicator */}
        <View style={detailStyles.offlineRow}>
          <Wifi size={11} color={Colors.text.accent} />
          <Text style={detailStyles.offlineText}>Available offline</Text>
          {!ap.isVerified && (
            <Text style={detailStyles.unverifiedText}> · Data unverified</Text>
          )}
        </View>

        {/* Actions */}
        <View style={detailStyles.actionsRow}>
          <TouchableOpacity
            style={[detailStyles.actionBtn, isSaved && detailStyles.actionBtnSaved]}
            onPress={onSave}
            accessibilityLabel={isSaved ? 'Remove saved spot' : 'Save spot'}
          >
            <Bookmark size={13} color={isSaved ? Colors.brand.orange : Colors.text.secondary} />
            <Text style={[detailStyles.actionLabel, isSaved && { color: Colors.brand.orange }]}>
              {isSaved ? 'Saved' : 'Save Spot'}
            </Text>
          </TouchableOpacity>
          {ap.waterbodyId != null && (
            <TouchableOpacity
              style={detailStyles.actionBtn}
              onPress={onCheckRules}
              accessibilityLabel="Check fishing rules for this waterbody"
            >
              <Text style={detailStyles.actionLabel}>Check Rules →</Text>
            </TouchableOpacity>
          )}
        </View>
      </GlassCard>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: SCREEN_H * 0.40,
    left: Spacing.md,
    right: Spacing.md,
    ...Shadows.elevated,
  },
  card: { padding: Spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  typeDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  titleBlock: { flex: 1, gap: 4 },
  name: { ...Typography.titleSm, color: Colors.text.primary },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' as const },
  distBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  distText: { fontSize: 11, color: Colors.text.muted },
  closeBtn: { paddingLeft: 8, paddingTop: 2 },
  closeText: { ...Typography.bodyMd, color: Colors.text.muted },
  infoRow: { flexDirection: 'row', gap: Spacing.md, marginTop: 8, flexWrap: 'wrap' },
  infoText: { ...Typography.bodySm, color: Colors.text.secondary },
  notes: { ...Typography.bodySm, color: Colors.text.secondary, marginTop: 8, lineHeight: 17 },
  amenities: { ...Typography.bodySm, color: Colors.text.muted, marginTop: 6 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  phoneText: { ...Typography.bodySm, color: Colors.status.danger, fontWeight: '600' as const },
  offlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 },
  offlineText: { fontSize: 11, color: Colors.text.accent },
  unverifiedText: { fontSize: 11, color: Colors.text.muted },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 10 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border,
  },
  actionBtnSaved: { borderColor: Colors.brand.orange + '55', backgroundColor: Colors.brand.orange + '15' },
  actionLabel: { ...Typography.label, color: Colors.text.secondary },
});

// ── Screen styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  map: { position: 'absolute', top: 0, left: 0, right: 0, height: SCREEN_H * 0.65 },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: 'rgba(10,22,40,0.92)', borderRadius: Radius.full,
    paddingHorizontal: 14, height: 42, borderWidth: 1, borderColor: Colors.border,
    ...Shadows.card,
  },
  searchInput: { flex: 1, ...Typography.bodyMd, color: Colors.text.primary },
  clearBtn: { ...Typography.bodyMd, color: Colors.text.muted },
  chipsRow: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.sm },
  chip: {
    backgroundColor: 'rgba(10,22,40,0.88)', borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.brand.orange, borderColor: Colors.brand.orange },
  chipLabel: { ...Typography.label, color: Colors.text.secondary },
  chipLabelActive: { color: '#fff' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: SCREEN_H * 0.42,
    backgroundColor: Colors.bg.surface,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    borderTopWidth: 1, borderColor: Colors.border,
    paddingTop: Spacing.md, paddingHorizontal: Spacing.md,
  },
  // Fish Today compact card
  fishTodayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
    backgroundColor: 'rgba(0,188,212,0.10)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(0,188,212,0.25)',
  },
  fishTodayEmoji: { fontSize: 28, width: 36 },
  fishTodayInfo: { flex: 1 },
  fishTodayLabel: { ...Typography.caption, color: Colors.text.accent, fontWeight: '700' },
  fishTodaySpecies: { ...Typography.titleSm, color: Colors.text.primary },
  fishTodayRight: { alignItems: 'flex-end', gap: 2 },
  fishTodayScore: {
    backgroundColor: Colors.brand.teal,
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8,
  },
  fishTodayScoreText: { ...Typography.caption, color: '#000', fontWeight: '800' },
  fishTodaySeeMore: { ...Typography.caption, color: Colors.text.muted },
  reportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 7,
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(255,107,53,0.10)',
    borderRadius: Radius.sm,
    borderWidth: 1, borderColor: 'rgba(255,107,53,0.25)',
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  reportBtnText: { ...Typography.caption, color: Colors.brand.orange, fontWeight: '700' as const },
  sheetTitle: { ...Typography.label, color: Colors.text.secondary, marginBottom: Spacing.sm },
  apListRow: { gap: Spacing.sm, paddingBottom: Spacing.sm },
  apChip: {
    width: 132, padding: Spacing.sm,
    backgroundColor: Colors.bg.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border, gap: 4,
  },
  apChipDot: { width: 8, height: 8, borderRadius: 4 },
  apChipName: { fontSize: 12, fontWeight: '600' as const, color: Colors.text.primary, lineHeight: 16 },
  apChipType: { ...Typography.caption, color: Colors.text.muted },
  apChipDist: { ...Typography.caption, color: Colors.text.accent },
  emptyText: { ...Typography.bodySm, color: Colors.text.muted, paddingTop: 4 },
});
