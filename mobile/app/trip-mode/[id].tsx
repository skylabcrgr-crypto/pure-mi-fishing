import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Alert, StatusBar, Modal, ScrollView, Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  X, BookOpen, MapPin, CloudSun, Compass,
  Phone, Fish, WifiOff, AlertTriangle, CheckCircle, XCircle, AlertCircle, Radio,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { getWaterbody } from '../../src/data/waterbodies';
import { getRegulationSummaryForTrip, type RuleWithStatus } from '../../src/services/regulationService';
import { Colors, Typography, Spacing, Radius } from '../../src/design/tokens';

const ACTIONS = [
  { id: 'rules',      label: 'Rules',       icon: BookOpen,  color: '#1565C0', bg: 'rgba(21,101,192,0.25)' },
  { id: 'launches',   label: 'Launches',    icon: MapPin,    color: '#00ACC1', bg: 'rgba(0,172,193,0.25)' },
  { id: 'conditions', label: 'Conditions',  icon: CloudSun,  color: '#4FC3F7', bg: 'rgba(79,195,247,0.20)' },
  { id: 'compass',    label: 'Compass',     icon: Compass,   color: '#D4A853', bg: 'rgba(212,168,83,0.20)' },
  { id: 'emergency',  label: 'Emergency',   icon: Phone,     color: '#F44336', bg: 'rgba(244,67,54,0.25)' },
  { id: 'log',        label: 'Log Catch',   icon: Fish,      color: '#FF6B35', bg: 'rgba(255,107,53,0.25)' },
  { id: 'report',     label: 'Report',      icon: Radio,     color: '#FF6B35', bg: 'rgba(255,107,53,0.15)' },
];

export default function TripModeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const waterbody = getWaterbody(id);
  const [elapsed, setElapsed] = useState(0);
  const [rulesVisible, setRulesVisible] = useState(false);

  const name = waterbody?.name ?? 'Unknown Water';

  // Regulation summary — computed once, works offline
  const today = useMemo(() => new Date(), []);
  const regulationSummary = useMemo(
    () => getRegulationSummaryForTrip(id, today),
    [id, today],
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatElapsed = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const handleAction = (actionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (actionId === 'rules') {
      setRulesVisible(true);
    } else if (actionId === 'launches') {
      router.push(`/waterbody/${id}`);
    } else if (actionId === 'conditions') {
      router.push('/(tabs)/conditions');
    } else if (actionId === 'log') {
      router.push('/(tabs)/logbook');
    } else if (actionId === 'emergency') {
      // Phase 5: open full Emergency Mode, passing the current tripId
      router.push({ pathname: '/emergency-mode', params: { tripId: id } });
    } else if (actionId === 'compass') {
      Alert.alert('Compass', 'Device compass coming in a future update. Use your device\'s built-in compass app.');
    } else if (actionId === 'report') {
      // Phase 6: open Report a Problem, pre-filling the active waterbody
      router.push({ pathname: '/report-problem', params: { waterbodyId: id } });
    }
  };

  const handleClose = () => {
    Alert.alert('End Trip?', 'Return to the main app?', [
      { text: 'Keep Fishing', style: 'cancel' },
      { text: 'End Trip', onPress: () => router.back() },
    ]);
  };

  return (
    <LinearGradient colors={['#040D1A', '#0A1628', '#060F1E']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="light-content" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.offlineBadge}>
              <WifiOff size={12} color={Colors.brand.tealLight} />
              <Text style={styles.offlineBadgeText}>Offline Ready</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtn}
            accessibilityLabel="Close trip mode"
          >
            <X size={22} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Waterbody name */}
        <View style={styles.waterbodyBlock}>
          <Text style={styles.tripLabel}>NOW FISHING</Text>
          <Text style={styles.waterbodyName}>{name}</Text>
          <Text style={styles.regionText}>{waterbody?.region ?? 'SE Michigan'}</Text>
          <Text style={styles.timerText} accessibilityLabel={`Trip elapsed time ${formatElapsed(elapsed)}`}>
            {formatElapsed(elapsed)}
          </Text>
        </View>

        {/* Action grid */}
        <View style={styles.grid}>
          {ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <TouchableOpacity
                key={action.id}
                style={[styles.actionBtn, { backgroundColor: action.bg, borderColor: action.color + '40' }]}
                onPress={() => handleAction(action.id)}
                activeOpacity={0.72}
                accessibilityLabel={action.label}
              >
                <Icon size={32} color={action.color} />
                <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            Pure MI Fishing · Independent app · Verify regulations at michigan.gov/dnr
          </Text>
        </View>
      </SafeAreaView>

      {/* Quick Rules Modal — works fully offline */}
      <Modal
        visible={rulesVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setRulesVisible(false)}
      >
        <View style={styles.modalRoot}>
          {/* Modal header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHandleBar} />
            <View style={styles.modalTitleRow}>
              <BookOpen size={18} color={Colors.text.accent} />
              <Text style={styles.modalTitle}>Fishing Rules</Text>
              {regulationSummary.hasSampleData && (
                <View style={styles.sampleBadge}>
                  <Text style={styles.sampleBadgeText}>SAMPLE DATA</Text>
                </View>
              )}
            </View>
            <Text style={styles.modalSubtitle}>{regulationSummary.waterbodyName}</Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setRulesVisible(false)}
              accessibilityLabel="Close rules panel"
            >
              <X size={20} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Disclaimer */}
          <View style={styles.modalDisclaimer}>
            <AlertTriangle size={13} color={Colors.status.warning} />
            <Text style={styles.modalDisclaimerText}>
              Planning summaries only — verify at michigan.gov/dnr
            </Text>
          </View>
          {regulationSummary.hasSampleData && (
            <View style={[styles.modalDisclaimer, styles.sampleDisclaimer]}>
              <AlertTriangle size={13} color={Colors.status.danger} />
              <Text style={[styles.modalDisclaimerText, { color: Colors.status.danger }]}>
                🚧 Sample data — not officially verified for current season
              </Text>
            </View>
          )}

          {/* Season status summary row */}
          <View style={styles.seasonSummaryRow}>
            {regulationSummary.openSpecies.length > 0 && (
              <View style={[styles.seasonPill, { borderColor: Colors.status.success + '55' }]}>
                <CheckCircle size={12} color={Colors.status.success} />
                <Text style={[styles.seasonPillText, { color: Colors.status.success }]}>
                  {regulationSummary.openSpecies.length} In Season
                </Text>
              </View>
            )}
            {regulationSummary.restrictedSpecies.length > 0 && (
              <View style={[styles.seasonPill, { borderColor: Colors.status.warning + '55' }]}>
                <AlertCircle size={12} color={Colors.status.warning} />
                <Text style={[styles.seasonPillText, { color: Colors.status.warning }]}>
                  {regulationSummary.restrictedSpecies.length} Restricted
                </Text>
              </View>
            )}
            {regulationSummary.closedSpecies.length > 0 && (
              <View style={[styles.seasonPill, { borderColor: Colors.status.danger + '55' }]}>
                <XCircle size={12} color={Colors.status.danger} />
                <Text style={[styles.seasonPillText, { color: Colors.status.danger }]}>
                  {regulationSummary.closedSpecies.length} Closed
                </Text>
              </View>
            )}
          </View>

          {/* Rule list */}
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            {regulationSummary.rules.length === 0 ? (
              <Text style={styles.modalEmptyText}>
                No rules found. Check michigan.gov/dnr.
              </Text>
            ) : (
              regulationSummary.rules.map((rule) => (
                <TripRuleRow key={rule.id} rule={rule} />
              ))
            )}
            <TouchableOpacity
              style={styles.modalDnrLink}
              onPress={() => Linking.openURL('https://www.michigan.gov/dnr/things-to-do/fishing/regulations')}
            >
              <Text style={styles.modalDnrLinkText}>Official DNR Regulations ↗</Text>
            </TouchableOpacity>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// Compact rule row for trip-mode modal
function TripRuleRow({ rule }: { rule: RuleWithStatus }) {
  const statusColors = {
    open:       Colors.status.success,
    closed:     Colors.status.danger,
    restricted: Colors.status.warning,
    unknown:    Colors.text.muted,
  };
  const statusLabels = {
    open: 'In Season', closed: 'Closed', restricted: 'C&R Only', unknown: '?',
  };
  const color = statusColors[rule.seasonStatus];

  return (
    <View style={tripRuleStyles.row}>
      <View style={tripRuleStyles.headerRow}>
        <Text style={tripRuleStyles.species}>{rule.speciesName}</Text>
        <View style={[tripRuleStyles.statusPill, { borderColor: color + '55', backgroundColor: color + '18' }]}>
          <Text style={[tripRuleStyles.statusText, { color }]}>{statusLabels[rule.seasonStatus]}</Text>
        </View>
      </View>
      <Text style={tripRuleStyles.summary}>{rule.summary}</Text>
      {rule.specialNotes && (
        <Text style={tripRuleStyles.special}>ⓘ {rule.specialNotes}</Text>
      )}
      {rule.verificationStatus !== 'official' && (
        <Text style={tripRuleStyles.unverified}>🚧 Sample — verify at DNR</Text>
      )}
    </View>
  );
}

const tripRuleStyles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245,245,240,0.07)',
    gap: 4,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  species: { ...Typography.titleSm, color: Colors.text.primary, flex: 1 },
  statusPill: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 1,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  summary: { ...Typography.bodySm, color: Colors.text.secondary, lineHeight: 18 },
  special: { ...Typography.bodySm, color: Colors.text.accent, lineHeight: 17 },
  unverified: { fontSize: 10, color: Colors.status.danger, marginTop: 2 },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  headerLeft: {},
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(79,195,247,0.12)',
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(79,195,247,0.22)',
  },
  offlineBadgeText: { ...Typography.caption, color: Colors.brand.tealLight },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(245,245,240,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  waterbodyBlock: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  tripLabel: { ...Typography.overline, color: Colors.text.muted, marginBottom: 6 },
  waterbodyName: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  regionText: { ...Typography.titleSm, color: Colors.text.accent, marginTop: 6 },
  timerText: {
    fontSize: 30,
    fontWeight: '700',
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: 1,
    marginTop: 14,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
    alignContent: 'flex-start',
  },
  actionBtn: {
    width: '30%',
    flex: 1,
    minHeight: 110,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  footerNote: { ...Typography.caption, color: Colors.text.muted, textAlign: 'center', lineHeight: 16 },

  // ── Rules modal styles ─────────────────────────────────────────────
  modalRoot: { flex: 1, backgroundColor: Colors.bg.primary },
  modalHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  modalHandleBar: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center', marginBottom: Spacing.sm,
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { ...Typography.titleMd, color: Colors.text.primary, flex: 1 },
  modalSubtitle: { ...Typography.bodySm, color: Colors.text.accent, marginTop: 2 },
  modalCloseBtn: {
    position: 'absolute', right: Spacing.lg, top: Spacing.md + 4,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center', justifyContent: 'center',
  },
  sampleBadge: {
    backgroundColor: Colors.status.danger + '22',
    borderRadius: Radius.sm,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: Colors.status.danger + '55',
  },
  sampleBadgeText: { fontSize: 9, fontWeight: '800', color: Colors.status.danger, letterSpacing: 0.5 },
  modalDisclaimer: {
    flexDirection: 'row', gap: 7, alignItems: 'flex-start',
    paddingHorizontal: Spacing.lg, paddingVertical: 8,
    backgroundColor: 'rgba(255,152,0,0.07)',
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  sampleDisclaimer: { backgroundColor: 'rgba(244,67,54,0.07)' },
  modalDisclaimerText: { ...Typography.bodySm, color: Colors.status.warning, flex: 1, lineHeight: 16 },
  seasonSummaryRow: {
    flexDirection: 'row', gap: 8, flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  seasonPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.full, borderWidth: 1,
  },
  seasonPillText: { fontSize: 12, fontWeight: '700' },
  modalScroll: { flex: 1 },
  modalEmptyText: { ...Typography.bodyMd, color: Colors.text.muted, padding: Spacing.lg },
  modalDnrLink: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  modalDnrLinkText: { ...Typography.label, color: Colors.text.accent },
});
