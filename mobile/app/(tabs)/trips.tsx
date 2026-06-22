import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Package, Plus, Clock } from 'lucide-react-native';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { TripCard } from '../../src/components/cards/TripCard';
import { OfflinePackCard } from '../../src/components/cards/OfflinePackCard';
import { useTripsStore } from '../../src/store/useTripsStore';
import { useAppStore } from '../../src/store/useAppStore';
import { Colors, Typography, Spacing, Radius } from '../../src/design/tokens';

export default function TripsScreen() {
  const router = useRouter();
  const { trips } = useTripsStore();
  const { offlinePacks, startPackDownload, updatePackProgress, markPackDownloaded, deletePackDownload } = useAppStore();

  const detroitPack = offlinePacks.find((p) => p.id === 'pack-detroit-river');
  const recentTrips = trips.slice(0, 5);

  const handleDownload = (packId: string) => {
    startPackDownload(packId);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.08 + Math.random() * 0.07;
      if (progress >= 1) {
        clearInterval(interval);
        markPackDownloaded(packId);
      } else {
        updatePackProgress(packId, progress);
      }
    }, 200);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Trips & Offline</Text>
          <Text style={styles.subtitle}>Detroit River fishing companion</Text>
        </View>

        {/* Offline packs */}
        <SectionHeader
          title="Offline Packs"
          actionLabel="Manage all"
          onAction={() => router.push('/offline-packs')}
        />
        {detroitPack && (
          <OfflinePackCard
            pack={detroitPack}
            onDownload={() => handleDownload(detroitPack.id)}
            onDelete={() => deletePackDownload(detroitPack.id)}
          />
        )}

        {/* Saved spots */}
        <SectionHeader title="Saved Spots" subtitle="Tap a pin on the map to save" />
        <GlassCard style={styles.emptyCard}>
          <Package size={24} color={Colors.text.muted} />
          <Text style={styles.emptyTitle}>No saved spots yet</Text>
          <Text style={styles.emptyBody}>
            Tap any launch or hotspot on the Explore map and save it here for quick access offline.
          </Text>
        </GlassCard>

        {/* Recent trips */}
        <View style={styles.sectionGap}>
          <SectionHeader
            title="Recent Trips"
            actionLabel={trips.length > 3 ? 'See all' : undefined}
            onAction={trips.length > 3 ? () => {} : undefined}
          />
          {recentTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
          <TouchableOpacity
            style={styles.newTripBtn}
            onPress={() => router.push('/waterbody/detroit-river')}
            accessibilityLabel="Start a new trip"
          >
            <Plus size={16} color={Colors.text.accent} />
            <Text style={styles.newTripLabel}>Start a new trip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  header: { marginBottom: Spacing.lg },
  title: { ...Typography.displayMd, color: Colors.text.primary },
  subtitle: { ...Typography.bodyMd, color: Colors.text.muted, marginTop: 4 },
  emptyCard: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
  },
  emptyTitle: { ...Typography.titleSm, color: Colors.text.secondary },
  emptyBody: { ...Typography.bodyMd, color: Colors.text.muted, textAlign: 'center', lineHeight: 21 },
  sectionGap: { marginTop: Spacing.md },
  newTripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginTop: Spacing.sm,
  },
  newTripLabel: { ...Typography.label, color: Colors.text.accent },
});
