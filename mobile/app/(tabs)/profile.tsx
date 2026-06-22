import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ExternalLink, ShoppingBag, Settings, Database, Info, ChevronRight, HardDrive } from 'lucide-react-native';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { useLogbookStore } from '../../src/store/useLogbookStore';
import { useTripsStore } from '../../src/store/useTripsStore';
import { Colors, Typography, Spacing, Radius, Gradients } from '../../src/design/tokens';

const LICENSE_URL = 'https://www.michigan.gov/dnr/things-to-do/fishing/license-info';

export default function ProfileScreen() {
  const router = useRouter();
  const { catches } = useLogbookStore();
  const { trips } = useTripsStore();

  const watersFished = React.useMemo(() => {
    const ids = new Set<string>();
    catches.forEach((c) => c.waterbodyId && ids.add(c.waterbodyId));
    trips.forEach((t) => t.waterbodyId && ids.add(t.waterbodyId));
    return ids.size;
  }, [catches, trips]);

  const handleLicense = () => {
    Linking.openURL(LICENSE_URL).catch(() =>
      Alert.alert('Could not open browser', 'Visit michigan.gov/dnr for license info.'),
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* License card */}
        <LinearGradient colors={['#003DA5', '#1565C0']} style={styles.licenseHero}>
          <ShoppingBag size={28} color="#CDA323" />
          <Text style={styles.licenseTitle}>Michigan Fishing License</Text>
          <Text style={styles.licenseBody}>
            Purchase directly from the official Michigan DNR portal. Annual resident licenses start at $26.
          </Text>
          <TouchableOpacity
            style={styles.licenseBtn}
            onPress={handleLicense}
            accessibilityLabel="Buy Michigan Fishing License on DNR website"
          >
            <ExternalLink size={16} color="#003DA5" />
            <Text style={styles.licenseBtnText}>Buy on Michigan DNR</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Season stats */}
        <GlassCard style={styles.statsCard}>
          <Text style={styles.statsTitle}>Season Summary</Text>
          <View style={styles.statsRow}>
            <StatItem label="Catches" value={String(catches.length)} />
            <StatItem label="Trips" value={String(trips.length)} />
            <StatItem label="Waters" value={String(watersFished)} />
          </View>
        </GlassCard>

        {/* Settings rows */}
        <View style={styles.section}>
          <MenuRow icon={<Settings size={18} color={Colors.text.accent} />} label="App Settings" onPress={() => router.push('/settings')} />
          <MenuRow icon={<Database size={18} color={Colors.text.accent} />} label="Offline Packs" onPress={() => router.push('/offline-packs')} />
          <MenuRow icon={<HardDrive size={18} color={Colors.text.accent} />} label="Storage Usage" onPress={() => {}} note="<1 MB" />
        </View>

        {/* Accessibility */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCESSIBILITY</Text>
          <GlassCard>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => router.push('/settings')}
              accessibilityLabel="Open accessibility settings"
            >
              <Text style={styles.menuLabel}>Text size, contrast, reduced motion</Text>
              <ChevronRight size={16} color={Colors.text.muted} />
            </TouchableOpacity>
          </GlassCard>
        </View>

        {/* Disclaimer */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <GlassCard style={styles.disclaimerCard}>
            <View style={styles.disclaimerRow}>
              <Info size={16} color={Colors.brand.sand} />
              <Text style={styles.disclaimerTitle}>Independent App</Text>
            </View>
            <Text style={styles.disclaimerBody}>
              Pure MI Fishing is an independent fishing companion app. It is NOT affiliated with the Michigan DNR, State of Michigan, or the Pure Michigan tourism campaign.
            </Text>
            <Text style={[styles.disclaimerBody, { marginTop: 8 }]}>
              All regulation summaries are for planning purposes only. Always verify current rules at michigan.gov/dnr before fishing.
            </Text>
          </GlassCard>
        </View>

        <Text style={styles.version}>Pure MI Fishing · MVP v0.1 · Detroit River Region</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuRow({ icon, label, onPress, note }: { icon: React.ReactNode; label: string; onPress: () => void; note?: string }) {
  return (
    <TouchableOpacity style={styles.menuRowOuter} onPress={onPress} accessibilityLabel={label}>
      <GlassCard style={styles.menuRowCard}>
        <View style={styles.menuRowInner}>
          {icon}
          <Text style={styles.menuLabel}>{label}</Text>
          {note && <Text style={styles.menuNote}>{note}</Text>}
          <ChevronRight size={16} color={Colors.text.muted} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  licenseHero: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  licenseTitle: { ...Typography.titleLg, color: '#fff' },
  licenseBody: { ...Typography.bodyMd, color: 'rgba(255,255,255,0.78)', lineHeight: 21 },
  licenseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#CDA323',
    borderRadius: Radius.md,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  licenseBtnText: { ...Typography.label, color: '#003DA5' },
  statsCard: { marginBottom: Spacing.md },
  statsTitle: { ...Typography.titleSm, color: Colors.text.primary, marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { ...Typography.titleLg, color: Colors.text.primary },
  statLabel: { ...Typography.caption, color: Colors.text.muted },
  section: { marginBottom: Spacing.md },
  sectionLabel: { ...Typography.overline, color: Colors.text.muted, marginBottom: 8, marginLeft: 4 },
  menuRowOuter: { marginBottom: Spacing.sm },
  menuRowCard: { padding: 0, overflow: 'hidden' },
  menuRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 2 },
  menuLabel: { ...Typography.bodyMd, color: Colors.text.primary, flex: 1 },
  menuNote: { ...Typography.caption, color: Colors.text.muted },
  disclaimerCard: { gap: 8 },
  disclaimerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  disclaimerTitle: { ...Typography.label, color: Colors.brand.sand },
  disclaimerBody: { ...Typography.bodySm, color: Colors.text.secondary, lineHeight: 17 },
  version: { ...Typography.caption, color: Colors.text.muted, textAlign: 'center', marginTop: 8 },
});
