import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MapPin, Navigation, Bookmark } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '../ui/GlassCard';
import { Colors, Typography, Spacing } from '../../design/tokens';
import type { Launch } from '../../types';

interface LaunchCardProps {
  launch: Launch;
  isSaved?: boolean;
  onSave?: () => void;
  onNavigate?: () => void;
  compact?: boolean;
}

export function LaunchCard({ launch, isSaved, onSave, onNavigate, compact }: LaunchCardProps) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/launch/${launch.id}`)}
      accessibilityLabel={`View ${launch.name} details`}
      activeOpacity={0.82}
    >
      <GlassCard style={compact ? styles.compact : styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconBox}>
            <MapPin size={16} color={Colors.map.launch} />
          </View>
          <View style={styles.textBlock}>
            <Text style={styles.name} numberOfLines={1}>{launch.name}</Text>
            <Text style={styles.waterbody}>{launch.waterbodyName}</Text>
          </View>
          <TouchableOpacity
            onPress={onSave}
            style={styles.saveBtn}
            accessibilityLabel={isSaved ? 'Unsave launch' : 'Save launch'}
          >
            <Bookmark
              size={16}
              color={isSaved ? Colors.brand.sand : Colors.text.muted}
              fill={isSaved ? Colors.brand.sand : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        {!compact && (
          <>
            <View style={styles.chips}>
              <Chip label={launch.accessType} />
              {launch.trailerFriendly && <Chip label="Trailer OK" accent />}
              {launch.shoreAccess && <Chip label="Shore" />}
              <Chip label={launch.fee} />
            </View>
            {launch.notes ? (
              <Text style={styles.notes} numberOfLines={2}>{launch.notes}</Text>
            ) : null}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={onNavigate}
                style={styles.navBtn}
                accessibilityLabel={`Navigate to ${launch.name}`}
              >
                <Navigation size={14} color={Colors.text.accent} />
                <Text style={styles.navLabel}>Navigate</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </GlassCard>
    </TouchableOpacity>
  );
}

function Chip({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View style={[styles.chip, accent && styles.chipAccent]}>
      <Text style={[styles.chipText, accent && styles.chipTextAccent]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.sm },
  compact: { marginBottom: Spacing.sm, padding: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(21,101,192,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1 },
  name: { ...Typography.titleSm, color: Colors.text.primary },
  waterbody: { ...Typography.bodySm, color: Colors.text.muted, marginTop: 1 },
  saveBtn: { padding: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipAccent: { backgroundColor: 'rgba(0,172,193,0.16)', borderColor: 'rgba(0,172,193,0.30)' },
  chipText: { ...Typography.caption, color: Colors.text.secondary },
  chipTextAccent: { color: Colors.text.accent },
  notes: { ...Typography.bodySm, color: Colors.text.secondary, marginTop: 8, lineHeight: 17 },
  actions: { flexDirection: 'row', marginTop: 10, gap: 8 },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(79,195,247,0.12)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navLabel: { ...Typography.label, color: Colors.text.accent, fontSize: 12 },
});
