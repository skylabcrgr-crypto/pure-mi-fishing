/**
 * Offline Packs screen — Phase 3.
 * Migrated from legacy OfflinePack type to OfflineRegionPack type.
 *
 * Migration status:
 *   - OfflineRegionPack (new): Detroit River Corridor pack — managed by useOfflinePackStore.
 *   - OfflinePack (legacy): offlinePacks.ts still exists but is no longer shown in UI.
 *     Legacy packs (belle-isle, lake-st-clair) are superseded by the region pack system.
 *     They remain in the data file as Phase 3 scope is Detroit River Corridor only.
 *
 * Map tile limitation: True offline raster tile downloads require a tile server (Phase 5+).
 * The pack currently bundles access point data, regulations, and condition snapshots.
 * The map renderer falls back to system tiles when offline — all other features remain available.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CheckCircle, Download, Trash2, RefreshCw, MapPin, BookOpen, Wifi,
} from 'lucide-react-native';
import { GlassCard } from '../src/components/ui/GlassCard';
import { useOfflinePackStore } from '../src/store/useOfflinePackStore';
import { Colors, Typography, Spacing, Radius } from '../src/design/tokens';
import { formatRelative, formatFileSize } from '../src/utils/format';
import type { OfflineRegionPack } from '../src/types';

export default function OfflinePacksScreen() {
  const {
    regionPacks,
    startPackDownload,
    updatePackProgress,
    markPackDownloaded,
    deletePackDownload,
  } = useOfflinePackStore();

  const handleDownload = (packId: string) => {
    startPackDownload(packId);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.06 + Math.random() * 0.06;
      if (progress >= 1) {
        clearInterval(interval);
        markPackDownloaded(packId);
      } else {
        updatePackProgress(packId, progress);
      }
    }, 200);
  };

  const downloaded = regionPacks.filter((p) => p.status === 'downloaded');
  const available  = regionPacks.filter((p) => p.status !== 'downloaded');

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.headerNote}>
          Download region packs to use access point data, regulations, and condition
          snapshots without a cell signal. Map tiles fall back to system cache offline.
        </Text>

        {downloaded.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>DOWNLOADED</Text>
            {downloaded.map((pack) => (
              <RegionPackCard
                key={pack.id}
                pack={pack}
                onDownload={() => handleDownload(pack.id)}
                onDelete={() => deletePackDownload(pack.id)}
              />
            ))}
          </>
        )}

        {available.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>AVAILABLE TO DOWNLOAD</Text>
            {available.map((pack) => (
              <RegionPackCard
                key={pack.id}
                pack={pack}
                onDownload={() => handleDownload(pack.id)}
              />
            ))}
          </>
        )}

        {regionPacks.every((p) => p.status === 'downloaded') && (
          <View style={styles.allReady}>
            <Text style={styles.allReadyText}>
              ✅ All packs downloaded. You're ready for the water.
            </Text>
          </View>
        )}

        <View style={styles.tileNote}>
          <Text style={styles.tileNoteText}>
            🗺️  Map tile note: True offline raster tiles require a tile server (Phase 5+).
            Access points, regulation rules, and condition data are fully available offline.
          </Text>
        </View>

        <Text style={styles.disclaimer}>
          ⚠️  All regulation data is sample/unverified. Always confirm current season
          rules at michigan.gov/dnr before fishing.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Region pack card ─────────────────────────────────────────────────
function RegionPackCard({
  pack,
  onDownload,
  onDelete,
}: {
  pack: OfflineRegionPack;
  onDownload: () => void;
  onDelete?: () => void;
}) {
  const isDownloaded = pack.status === 'downloaded';
  const isDownloading = pack.status === 'downloading';

  return (
    <GlassCard style={packStyles.card}>
      {/* Header */}
      <View style={packStyles.header}>
        <View style={packStyles.iconBox}>
          {isDownloaded
            ? <CheckCircle size={20} color={Colors.status.success} />
            : <Download size={20} color={Colors.text.accent} />}
        </View>
        <View style={packStyles.textBlock}>
          <Text style={packStyles.name}>{pack.name}</Text>
          <Text style={packStyles.meta}>{formatFileSize(pack.sizeEstimateMB)} · v{pack.version}</Text>
        </View>
        {isDownloaded && onDelete != null && (
          <TouchableOpacity onPress={onDelete} accessibilityLabel="Delete offline pack">
            <Trash2 size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Data version row */}
      <View style={packStyles.versionRow}>
        <View style={packStyles.versionItem}>
          <MapPin size={11} color={Colors.text.muted} />
          <Text style={packStyles.versionText}>{pack.accessPointCount} access points</Text>
        </View>
        <View style={packStyles.versionItem}>
          <Wifi size={11} color={Colors.text.accent} />
          <Text style={[packStyles.versionText, { color: Colors.text.accent }]}>
            Map v{pack.mapDataVersion}
          </Text>
        </View>
        <View style={packStyles.versionItem}>
          <BookOpen size={11} color={Colors.text.muted} />
          <Text style={packStyles.versionText}>Rules v{pack.regulationDataVersion}</Text>
        </View>
      </View>

      {/* Includes */}
      <View style={packStyles.includes}>
        {pack.includes.map((item) => (
          <View key={item} style={packStyles.includeRow}>
            <Text style={packStyles.bullet}>·</Text>
            <Text style={packStyles.includeText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Download progress bar */}
      {isDownloading && pack.downloadProgress != null && (
        <View style={packStyles.progressContainer}>
          <View style={packStyles.progressTrack}>
            <View
              style={[
                packStyles.progressFill,
                { width: `${Math.round(pack.downloadProgress * 100)}%` },
              ]}
            />
          </View>
          <Text style={packStyles.progressLabel}>
            {Math.round(pack.downloadProgress * 100)}%
          </Text>
        </View>
      )}

      {/* Downloaded badge */}
      {isDownloaded && pack.downloadedAt != null && (
        <Text style={packStyles.syncedLabel}>
          ✓ Pack ready · {formatRelative(pack.downloadedAt)}
        </Text>
      )}

      {/* Download / downloading button */}
      {!isDownloaded && (
        <TouchableOpacity
          style={[packStyles.downloadBtn, isDownloading && packStyles.downloadBtnDisabled]}
          onPress={onDownload}
          disabled={isDownloading}
          accessibilityLabel={`Download ${pack.name}`}
        >
          {isDownloading
            ? <RefreshCw size={14} color={Colors.text.muted} />
            : <Download size={14} color={Colors.text.accent} />}
          <Text style={[packStyles.downloadLabel, isDownloading && { color: Colors.text.muted }]}>
            {isDownloading ? 'Downloading…' : 'Download Pack'}
          </Text>
        </TouchableOpacity>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: 60 },
  headerNote: {
    ...Typography.bodyMd, color: Colors.text.secondary,
    lineHeight: 21, marginBottom: Spacing.lg,
  },
  sectionLabel: {
    ...Typography.overline, color: Colors.text.muted,
    marginBottom: Spacing.sm, marginTop: Spacing.sm,
  },
  allReady: {
    padding: Spacing.md,
    backgroundColor: 'rgba(76,175,80,0.10)',
    borderRadius: Radius.md, borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.25)',
    marginTop: Spacing.md,
  },
  allReadyText: { ...Typography.bodyMd, color: Colors.status.success },
  tileNote: {
    marginTop: Spacing.lg, padding: Spacing.md,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border,
  },
  tileNoteText: { ...Typography.bodySm, color: Colors.text.secondary, lineHeight: 17 },
  disclaimer: {
    ...Typography.bodySm, color: Colors.text.muted,
    lineHeight: 17, marginTop: Spacing.md,
  },
});

const packStyles = StyleSheet.create({
  card: { marginBottom: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  textBlock: { flex: 1 },
  name: { ...Typography.titleSm, color: Colors.text.primary },
  meta: { ...Typography.caption, color: Colors.text.muted, marginTop: 1 },
  versionRow: { flexDirection: 'row', gap: Spacing.md, marginTop: 10, flexWrap: 'wrap' },
  versionItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  versionText: { ...Typography.caption, color: Colors.text.muted },
  includes: { marginTop: 12, gap: 4 },
  includeRow: { flexDirection: 'row', gap: 6 },
  bullet: { ...Typography.bodySm, color: Colors.text.accent, width: 10 },
  includeText: { ...Typography.bodySm, color: Colors.text.secondary, flex: 1 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  progressTrack: { flex: 1, height: 4, backgroundColor: Colors.border, borderRadius: 2 },
  progressFill: { height: 4, backgroundColor: Colors.text.accent, borderRadius: 2 },
  progressLabel: { ...Typography.caption, color: Colors.text.muted, width: 32 },
  syncedLabel: { ...Typography.bodySm, color: Colors.status.success, marginTop: 10 },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
    paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bg.elevated,
  },
  downloadBtnDisabled: { opacity: 0.5 },
  downloadLabel: { ...Typography.label, color: Colors.text.accent },
});
