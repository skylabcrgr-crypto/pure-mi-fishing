import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Download, CheckCircle, Trash2 } from 'lucide-react-native';
import { GlassCard } from '../ui/GlassCard';
import { Colors, Typography, Spacing } from '../../design/tokens';
import { formatFileSize, formatRelative } from '../../utils/format';
import type { OfflinePack } from '../../types';

interface OfflinePackCardProps {
  pack: OfflinePack;
  onDownload: () => void;
  onDelete?: () => void;
}

export function OfflinePackCard({ pack, onDownload, onDelete }: OfflinePackCardProps) {
  const isDownloaded = pack.status === 'downloaded';
  const isDownloading = pack.status === 'downloading';

  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          {isDownloaded
            ? <CheckCircle size={20} color={Colors.status.success} />
            : <Download size={20} color={Colors.text.accent} />}
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.name}>{pack.name}</Text>
          <Text style={styles.size}>{formatFileSize(pack.sizeEstimateMB)} · v{pack.version}</Text>
        </View>
        {isDownloaded && onDelete ? (
          <TouchableOpacity onPress={onDelete} accessibilityLabel="Delete offline pack">
            <Trash2 size={16} color={Colors.text.muted} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.includes}>
        {pack.includes.map((item) => (
          <View key={item} style={styles.includeRow}>
            <Text style={styles.includeBullet}>·</Text>
            <Text style={styles.includeText}>{item}</Text>
          </View>
        ))}
      </View>

      {isDownloading && pack.downloadProgress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(pack.downloadProgress * 100)}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{Math.round(pack.downloadProgress * 100)}%</Text>
        </View>
      )}

      {isDownloaded && pack.downloadedAt && (
        <Text style={styles.syncedLabel}>✓ Synced {formatRelative(pack.downloadedAt)}</Text>
      )}

      {!isDownloaded && (
        <TouchableOpacity
          style={[styles.downloadBtn, isDownloading && styles.downloadBtnDisabled]}
          onPress={onDownload}
          disabled={isDownloading}
          accessibilityLabel={`Download ${pack.name}`}
        >
          <Download size={14} color={isDownloading ? Colors.text.muted : Colors.text.accent} />
          <Text style={[styles.downloadLabel, isDownloading && { color: Colors.text.muted }]}>
            {isDownloading ? 'Downloading…' : 'Download Pack'}
          </Text>
        </TouchableOpacity>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textBlock: { flex: 1 },
  name: { ...Typography.titleSm, color: Colors.text.primary },
  size: { ...Typography.caption, color: Colors.text.muted, marginTop: 1 },
  includes: { marginTop: 12, gap: 4 },
  includeRow: { flexDirection: 'row', gap: 6 },
  includeBullet: { ...Typography.bodySm, color: Colors.text.accent, width: 10 },
  includeText: { ...Typography.bodySm, color: Colors.text.secondary, flex: 1 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.bg.elevated,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: Colors.brand.teal },
  progressLabel: { ...Typography.caption, color: Colors.text.accent, width: 30, textAlign: 'right' },
  syncedLabel: { ...Typography.caption, color: Colors.status.success, marginTop: 10 },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(79,195,247,0.10)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  downloadBtnDisabled: { opacity: 0.5 },
  downloadLabel: { ...Typography.label, color: Colors.text.accent },
});
