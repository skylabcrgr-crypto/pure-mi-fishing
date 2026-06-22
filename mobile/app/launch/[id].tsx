import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Navigation, Bookmark, Play, Car, Waves, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Badge } from '../../src/components/ui/Badge';
import { getLaunch } from '../../src/data/launches';
import { useAppStore } from '../../src/store/useAppStore';
import { Colors, Typography, Spacing, Radius, Gradients } from '../../src/design/tokens';

export default function LaunchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { preferences, toggleSavedLaunch } = useAppStore();

  const launch = getLaunch(id);
  if (!launch) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Launch site not found.</Text>
      </View>
    );
  }

  const isSaved = preferences.savedLaunchIds.includes(id);

  const handleNavigate = () => {
    const url = `https://maps.apple.com/?daddr=${launch.coordinates.latitude},${launch.coordinates.longitude}&dirflg=d`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Cannot open maps', 'Your device may not support map deep links.'),
    );
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSavedLaunch(id);
  };

  const accessTypeLabel: Record<string, string> = {
    ramp: 'Boat Ramp',
    shore: 'Shore Access',
    marina: 'Marina',
    'carry-in': 'Carry-In / Kayak',
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Hero */}
        <LinearGradient colors={Gradients.teal} style={styles.hero}>
          <View style={styles.heroTop}>
            <MapPin size={18} color="#fff" />
            <Text style={styles.heroWaterbody}>{launch.waterbodyName}</Text>
          </View>
          <Text style={styles.heroName}>{launch.name}</Text>
          <View style={styles.badgeRow}>
            <Badge label={accessTypeLabel[launch.accessType] ?? launch.accessType} variant="default" size="sm" />
            {launch.trailerFriendly && <Badge label="Trailer Friendly" variant="teal" size="sm" />}
            {launch.shoreAccess && <Badge label="Shore Access" variant="forest" size="sm" />}
          </View>
        </LinearGradient>

        {/* Key stats */}
        <View style={styles.statsRow}>
          <StatCard icon={<Car size={18} color={Colors.text.accent} />} label="Parking" value={`~${launch.parkingEstimate} spots`} />
          <StatCard icon={<Clock size={18} color={Colors.text.accent} />} label="Hours" value={launch.hours} />
          <StatCard icon={<Waves size={18} color={Colors.text.accent} />} label="Fee" value={launch.fee} />
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.navBtn}
            onPress={handleNavigate}
            accessibilityLabel={`Navigate to ${launch.name}`}
          >
            <Navigation size={18} color="#fff" />
            <Text style={styles.navBtnText}>Navigate</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, isSaved && styles.saveBtnActive]}
            onPress={handleSave}
            accessibilityLabel={isSaved ? 'Unsave this launch' : 'Save this launch'}
          >
            <Bookmark size={18} color={isSaved ? Colors.brand.sand : Colors.text.secondary} fill={isSaved ? Colors.brand.sand : 'transparent'} />
            <Text style={[styles.saveBtnText, isSaved && styles.saveBtnTextActive]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tripBtn}
            onPress={() => router.push(`/trip-mode/${launch.waterbodyId}`)}
            accessibilityLabel="Start trip from this launch"
          >
            <Play size={18} color={Colors.text.primary} fill={Colors.text.primary} />
            <Text style={styles.tripBtnText}>Start Trip</Text>
          </TouchableOpacity>
        </View>

        {/* Details */}
        <GlassCard style={styles.detailCard}>
          <Text style={styles.detailTitle}>Launch Details</Text>
          <DetailRow label="Access type" value={accessTypeLabel[launch.accessType] ?? launch.accessType} />
          <DetailRow label="Trailer friendly" value={launch.trailerFriendly ? 'Yes' : 'No'} />
          <DetailRow label="Shore fishing" value={launch.shoreAccess ? 'Yes' : 'No'} />
          <DetailRow label="Parking" value={`~${launch.parkingEstimate} vehicles`} />
          <DetailRow label="Fee" value={launch.fee} />
          <DetailRow label="Hours" value={launch.hours} />
          {launch.address && <DetailRow label="Address" value={launch.address} />}
          <DetailRow
            label="Coordinates"
            value={`${launch.coordinates.latitude.toFixed(4)}, ${launch.coordinates.longitude.toFixed(4)}`}
          />
        </GlassCard>

        {/* Notes */}
        {launch.notes && (
          <GlassCard style={styles.notesCard}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{launch.notes}</Text>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <GlassCard style={styles.statCard} padded={false}>
      <View style={styles.statCardInner}>
        {icon}
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </GlassCard>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.bg.primary },
  notFoundText: { ...Typography.bodyLg, color: Colors.text.secondary },
  content: { paddingBottom: 80 },
  hero: { paddingHorizontal: Spacing.lg, paddingTop: 20, paddingBottom: Spacing.xl },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  heroWaterbody: { ...Typography.label, color: 'rgba(255,255,255,0.75)' },
  heroName: { ...Typography.displayMd, color: '#fff', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md },
  statCard: { flex: 1 },
  statCardInner: { padding: 12, alignItems: 'center', gap: 6 },
  statValue: { ...Typography.label, color: Colors.text.primary, textAlign: 'center' },
  statLabel: { ...Typography.caption, color: Colors.text.muted },
  actionRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  navBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.brand.blue, borderRadius: Radius.lg, height: 48,
  },
  navBtnText: { ...Typography.label, color: '#fff' },
  saveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.bg.elevated, borderRadius: Radius.lg, height: 48,
    borderWidth: 1, borderColor: Colors.border,
  },
  saveBtnActive: { backgroundColor: 'rgba(212,168,83,0.16)', borderColor: 'rgba(212,168,83,0.35)' },
  saveBtnText: { ...Typography.label, color: Colors.text.secondary },
  saveBtnTextActive: { color: Colors.brand.sand },
  tripBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.bg.elevated, borderRadius: Radius.lg, height: 48,
    borderWidth: 1, borderColor: Colors.border,
  },
  tripBtnText: { ...Typography.label, color: Colors.text.primary },
  detailCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md, gap: 10 },
  detailTitle: { ...Typography.titleSm, color: Colors.text.primary, marginBottom: 4 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  detailLabel: { ...Typography.bodyMd, color: Colors.text.secondary, flex: 1 },
  detailValue: { ...Typography.label, color: Colors.text.primary, flex: 1, textAlign: 'right' },
  notesCard: { marginHorizontal: Spacing.md, gap: 8 },
  notesTitle: { ...Typography.titleSm, color: Colors.text.primary },
  notesText: { ...Typography.bodyMd, color: Colors.text.secondary, lineHeight: 22 },
});
