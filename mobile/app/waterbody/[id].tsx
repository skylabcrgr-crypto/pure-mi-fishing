import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MapPin, Bookmark, Play, ShoppingBag, AlertTriangle, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Badge } from '../../src/components/ui/Badge';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { LaunchCard } from '../../src/components/cards/LaunchCard';
import { getWaterbody } from '../../src/data/waterbodies';
import { getLaunchesForWaterbody } from '../../src/data/launches';
import { getConditionsForWaterbody, FISHING_RATING_COLORS } from '../../src/data/conditions';
import { getPackForWaterbody } from '../../src/data/offlinePacks';
import { useAppStore } from '../../src/store/useAppStore';
import {
  getRulesForWaterbody,
  getSeasonStatus,
  type RuleWithStatus,
} from '../../src/services/regulationService';
import { SPECIES } from '../../src/data/species';
import { Colors, Typography, Spacing, Radius, Gradients } from '../../src/design/tokens';

const LICENSE_URL = 'https://www.michigan.gov/dnr/licenses-and-permits/fishing-licenses';
const DISCLAIMER = '⚠️ Rules shown are simplified planning summaries only. Always verify with official Michigan DNR regulations at michigan.gov/dnr before fishing.';
const SAMPLE_WARNING = '🚧 Sample data — not yet officially verified for the current season.';

const SEASON_STATUS_CONFIG = {
  open:       { label: 'In Season',       color: Colors.status.success, Icon: CheckCircle },
  closed:     { label: 'Season Closed',   color: Colors.status.danger,  Icon: XCircle },
  restricted: { label: 'C&R Only',        color: Colors.status.warning, Icon: AlertCircle },
  unknown:    { label: 'Check DNR',       color: Colors.text.muted,     Icon: AlertTriangle },
} as const;

export default function WaterbodyScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { preferences, toggleSavedWaterbody } = useAppStore();
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);

  const waterbody = getWaterbody(id);
  const launches = getLaunchesForWaterbody(id);
  const conditions = getConditionsForWaterbody(id);
  const pack = getPackForWaterbody(id);

  // Regulation engine — runs offline from SQLite/seed data
  const today = useMemo(() => new Date(), []);
  const allRules = useMemo(() => getRulesForWaterbody(id, today), [id, today]);
  const hasSampleData = allRules.some((r) => r.verificationStatus !== 'official');

  // Filter species available at this waterbody
  const waterbodySpeciesIds = waterbody?.species ?? [];
  const availableSpecies = SPECIES.filter((s) => waterbodySpeciesIds.includes(s.id));

  // Rules to display — filtered by selected species, or all
  const displayRules = useMemo(() => {
    if (!selectedSpeciesId) return allRules;
    return allRules.filter((r) => r.speciesId === selectedSpeciesId);
  }, [allRules, selectedSpeciesId]);

  if (!waterbody) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Waterbody not found.</Text>
      </View>
    );
  }

  const isSaved = preferences.savedWaterbodyIds.includes(id);
  const ratingColor = conditions ? FISHING_RATING_COLORS[conditions.fishingRating] : Colors.text.muted;

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSavedWaterbody(id);
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero map card */}
        <LinearGradient colors={Gradients.hero} style={styles.heroGrad}>
          <SafeAreaView edges={[]} style={styles.heroInner}>
            <View style={styles.heroOverlay}>
              <MapPin size={16} color={Colors.text.accent} />
              <Text style={styles.heroRegion}>{waterbody.region}</Text>
            </View>
            <Text style={styles.heroName}>{waterbody.name}</Text>
            {conditions && (
              <View style={styles.ratingPill}>
                <View style={[styles.ratingDot, { backgroundColor: ratingColor }]} />
                <Text style={[styles.ratingText, { color: ratingColor }]}>
                  Fishing: {conditions.fishingRatingLabel}
                </Text>
              </View>
            )}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badges}>
              {waterbody.badges.map((b) => (
                <Badge key={b} label={b} variant="teal" size="sm" style={{ marginRight: 6 }} />
              ))}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>{waterbody.description}</Text>
        </View>

        {/* CTA buttons */}
        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.ctaPrimary}
            onPress={() => router.push(`/trip-mode/${id}`)}
            accessibilityLabel="Start Trip Mode"
          >
            <Play size={16} color="#fff" fill="#fff" />
            <Text style={styles.ctaPrimaryText}>Start Trip Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctaSecondary, isSaved && styles.ctaSaved]}
            onPress={handleSave}
            accessibilityLabel={isSaved ? 'Unsave waterbody' : 'Save waterbody'}
          >
            <Bookmark size={16} color={isSaved ? Colors.brand.sand : Colors.text.secondary} fill={isSaved ? Colors.brand.sand : 'transparent'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.ctaLicense}
            onPress={() => router.push('/license')}
            accessibilityLabel="Buy Fishing License"
          >
            <ShoppingBag size={16} color={Colors.brand.sand} />
          </TouchableOpacity>
        </View>

        {/* Rules Summary — Powered by Offline Regulation Engine */}
        <View style={styles.section}>
          <SectionHeader title="Fishing Rules" subtitle="Offline regulation engine" />

          {/* Disclaimer */}
          <GlassCard style={styles.disclaimerCard}>
            <View style={styles.disclaimerRow}>
              <AlertTriangle size={14} color={Colors.status.warning} />
              <Text style={styles.disclaimerText}>{DISCLAIMER}</Text>
            </View>
            {hasSampleData && (
              <View style={[styles.disclaimerRow, { marginTop: 6 }]}>
                <AlertTriangle size={14} color={Colors.status.danger} />
                <Text style={[styles.disclaimerText, { color: Colors.status.danger }]}>{SAMPLE_WARNING}</Text>
              </View>
            )}
          </GlassCard>

          {/* Species filter chips */}
          {availableSpecies.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.speciesScroll}
              contentContainerStyle={styles.speciesScrollContent}
            >
              <TouchableOpacity
                style={[styles.speciesChip, !selectedSpeciesId && styles.speciesChipActive]}
                onPress={() => setSelectedSpeciesId(null)}
              >
                <Text style={[styles.speciesChipText, !selectedSpeciesId && styles.speciesChipTextActive]}>
                  All Species
                </Text>
              </TouchableOpacity>
              {availableSpecies.map((s) => {
                const rule = allRules.find((r) => r.speciesId === s.id);
                const status = rule?.seasonStatus ?? 'unknown';
                const statusColor = SEASON_STATUS_CONFIG[status].color;
                const active = selectedSpeciesId === s.id;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.speciesChip, active && styles.speciesChipActive, { borderColor: statusColor + '55' }]}
                    onPress={() => setSelectedSpeciesId(active ? null : s.id)}
                    accessibilityLabel={`Filter by ${s.name}`}
                  >
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.speciesChipText, active && styles.speciesChipTextActive]}>
                      {s.emoji} {s.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Rule cards */}
          {displayRules.length > 0 ? (
            <View style={styles.ruleList}>
              {displayRules.map((rule) => (
                <RuleCard key={rule.id} rule={rule} />
              ))}
            </View>
          ) : (
            <GlassCard>
              <Text style={styles.regEmpty}>
                No rules found for this selection. Check michigan.gov/dnr.
              </Text>
            </GlassCard>
          )}

          <TouchableOpacity
            style={styles.drnLink}
            onPress={() => Linking.openURL('https://www.michigan.gov/dnr/things-to-do/fishing/regulations')}
            accessibilityLabel="Open official DNR regulations in browser"
          >
            <Text style={styles.drnLinkText}>Official DNR Regulations ↗</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Launches */}
        {launches.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="Nearby Launches" subtitle={`${launches.length} access points`} />
            {launches.slice(0, 3).map((launch) => (
              <LaunchCard
                key={launch.id}
                launch={launch}
                isSaved={preferences.savedLaunchIds.includes(launch.id)}
                onSave={() => {}}
                compact
              />
            ))}
          </View>
        )}

        {/* Conditions snapshot */}
        {conditions && (
          <View style={styles.section}>
            <SectionHeader title="Conditions Snapshot" />
            <GlassCard style={styles.condRow}>
              <CondItem label="Air" value={`${conditions.weather.tempF}°F ${conditions.weather.description}`} />
              <CondItem label="Wind" value={`${conditions.weather.windSpeedMph} mph ${conditions.weather.windDirection}`} />
              {conditions.water.tempF && <CondItem label="Water" value={`${conditions.water.tempF}°F`} />}
              <CondItem label="Ice" value={conditions.iceStatus === 'open' ? 'Open Water' : '🧊 Ice Present'} />
            </GlassCard>
            <TouchableOpacity onPress={() => router.push('/(tabs)/conditions')} style={styles.condLink}>
              <Text style={styles.condLinkText}>View full conditions →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Offline status */}
        {pack && (
          <View style={styles.section}>
            <SectionHeader title="Offline Status" />
            <GlassCard>
              <Text style={styles.packName}>{pack.name}</Text>
              <Text style={styles.packStatus}>
                Status: {pack.status === 'downloaded' ? '✅ Downloaded' : '⬇️ Available to download'}
              </Text>
              <TouchableOpacity onPress={() => router.push('/offline-packs')} style={styles.condLink}>
                <Text style={styles.condLinkText}>Manage offline packs →</Text>
              </TouchableOpacity>
            </GlassCard>
          </View>
        )}

        {/* Fishing notes */}
        <View style={styles.section}>
          <SectionHeader title="Fishing Notes" />
          <GlassCard>
            <Text style={styles.fishingNotes}>{waterbody.fishingNotes}</Text>
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  );
}

function CondItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.condItemRow}>
      <Text style={styles.condLabel}>{label}</Text>
      <Text style={styles.condValue}>{value}</Text>
    </View>
  );
}

function RuleCard({ rule }: { rule: RuleWithStatus }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEASON_STATUS_CONFIG[rule.seasonStatus];
  const StatusIcon = cfg.Icon;

  return (
    <GlassCard style={styles.ruleCard}>
      {/* Header row: species + season status */}
      <TouchableOpacity
        style={styles.ruleHeader}
        onPress={() => setExpanded((v) => !v)}
        accessibilityLabel={`${rule.speciesName} rule — tap to expand`}
      >
        <View style={styles.ruleHeaderLeft}>
          <Text style={styles.ruleSpecies}>{rule.speciesName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: cfg.color + '22', borderColor: cfg.color + '55' }]}>
            <StatusIcon size={11} color={cfg.color} />
            <Text style={[styles.statusBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
          </View>
        </View>
        <ChevronRight
          size={16}
          color={Colors.text.muted}
          style={expanded ? styles.chevronDown : undefined}
        />
      </TouchableOpacity>

      {/* Summary line always visible */}
      <Text style={styles.ruleSummary}>{rule.summary}</Text>

      {/* Expanded detail */}
      {expanded && (
        <View style={styles.ruleDetail}>
          {rule.minLengthIn !== undefined && (
            <RuleDetailRow label="Min Size" value={`${rule.minLengthIn} inches`} />
          )}
          {rule.maxLengthIn !== undefined && (
            <RuleDetailRow label="Max Size" value={`${rule.maxLengthIn} inches (slot)`} />
          )}
          {rule.dailyBagLimit !== undefined && (
            <RuleDetailRow label="Daily Limit" value={String(rule.dailyBagLimit)} />
          )}
          {rule.possessionLimit !== undefined && (
            <RuleDetailRow label="Possession" value={String(rule.possessionLimit)} />
          )}
          {rule.seasonStart && rule.seasonEnd && (
            <RuleDetailRow label="Season" value={`${rule.seasonStart} – ${rule.seasonEnd}`} />
          )}
          {rule.gearRestrictions && (
            <RuleDetailRow label="Gear" value={rule.gearRestrictions} />
          )}
          {rule.specialNotes && (
            <View style={styles.specialNotesRow}>
              <Text style={styles.specialNotesLabel}>Special Rules</Text>
              <Text style={styles.specialNotesText}>ⓘ {rule.specialNotes}</Text>
            </View>
          )}

          {/* Verification status */}
          <View style={styles.verifiedRow}>
            {rule.verificationStatus !== 'official' ? (
              <Text style={styles.unverifiedText}>🚧 Sample data — verify before fishing</Text>
            ) : (
              <Text style={styles.verifiedText}>✅ Verified {rule.lastVerifiedAt}</Text>
            )}
            <TouchableOpacity
              onPress={() => Linking.openURL(rule.sourceUrl)}
              accessibilityLabel="Open source regulation link"
            >
              <Text style={styles.sourceLink}>Source ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </GlassCard>
  );
}

function RuleDetailRow({ label, value }: { label: string; value: string }) {
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
  scrollContent: { paddingBottom: 80 },
  heroGrad: { paddingTop: 20, paddingBottom: Spacing.xl },
  heroInner: { paddingHorizontal: Spacing.lg },
  heroOverlay: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  heroRegion: { ...Typography.label, color: Colors.text.accent },
  heroName: { ...Typography.displayMd, color: Colors.text.primary, marginBottom: Spacing.sm },
  ratingPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  ratingDot: { width: 8, height: 8, borderRadius: 4 },
  ratingText: { ...Typography.label },
  badges: { flexGrow: 0 },
  section: { paddingHorizontal: Spacing.md, marginTop: Spacing.lg },
  description: { ...Typography.bodyLg, color: Colors.text.secondary, lineHeight: 24 },
  ctaRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.md, marginTop: Spacing.md },
  ctaPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.brand.orange, borderRadius: Radius.lg, height: 48,
    shadowColor: Colors.brand.orange, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 8, elevation: 8,
  },
  ctaPrimaryText: { ...Typography.titleSm, color: '#fff' },
  ctaSecondary: {
    width: 48, height: 48, borderRadius: Radius.md,
    backgroundColor: Colors.bg.elevated, borderWidth: 1, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaSaved: { backgroundColor: 'rgba(212,168,83,0.18)', borderColor: 'rgba(212,168,83,0.35)' },
  ctaLicense: {
    width: 48, height: 48, borderRadius: Radius.md,
    backgroundColor: 'rgba(0,61,165,0.25)', borderWidth: 1, borderColor: 'rgba(0,61,165,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },

  // ── Regulation engine styles ──────────────────────────────────────
  disclaimerCard: { marginBottom: Spacing.sm },
  disclaimerRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  disclaimerText: { ...Typography.bodySm, color: Colors.status.warning, flex: 1, lineHeight: 16 },

  speciesScroll: { marginTop: Spacing.sm, marginBottom: Spacing.sm },
  speciesScrollContent: { gap: 8, paddingVertical: 4 },
  speciesChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1, borderColor: Colors.border,
  },
  speciesChipActive: {
    backgroundColor: 'rgba(79,195,247,0.15)',
    borderColor: Colors.text.accent,
  },
  speciesChipText: { ...Typography.label, color: Colors.text.secondary },
  speciesChipTextActive: { color: Colors.text.accent },
  statusDot: { width: 7, height: 7, borderRadius: 4 },

  ruleList: { gap: Spacing.sm },
  ruleCard: { gap: 6 },
  ruleHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  ruleHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  ruleSpecies: { ...Typography.titleSm, color: Colors.text.primary },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: Radius.full, borderWidth: 1,
  },
  statusBadgeText: { ...Typography.label, fontSize: 10 },
  chevronDown: { transform: [{ rotate: '90deg' }] },
  ruleSummary: { ...Typography.bodyMd, color: Colors.text.secondary, lineHeight: 20 },
  ruleDetail: { gap: 8, marginTop: 6, borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { ...Typography.bodySm, color: Colors.text.muted },
  detailValue: { ...Typography.label, color: Colors.text.primary },
  specialNotesRow: { gap: 4 },
  specialNotesLabel: { ...Typography.bodySm, color: Colors.text.muted },
  specialNotesText: { ...Typography.bodySm, color: Colors.text.accent, lineHeight: 17 },
  verifiedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  unverifiedText: { ...Typography.label, color: Colors.status.danger, fontSize: 11 },
  verifiedText: { ...Typography.label, color: Colors.status.success, fontSize: 11 },
  sourceLink: { ...Typography.label, color: Colors.text.accent, fontSize: 11 },
  regEmpty: { ...Typography.bodyMd, color: Colors.text.muted },
  drnLink: { marginTop: Spacing.sm },
  drnLinkText: { ...Typography.label, color: Colors.text.accent },

  // ── Conditions + pack ─────────────────────────────────────────────
  condRow: { gap: 10 },
  condItemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  condLabel: { ...Typography.bodyMd, color: Colors.text.secondary },
  condValue: { ...Typography.label, color: Colors.text.primary },
  condLink: { marginTop: 10 },
  condLinkText: { ...Typography.label, color: Colors.text.accent },
  packName: { ...Typography.titleSm, color: Colors.text.primary, marginBottom: 4 },
  packStatus: { ...Typography.bodyMd, color: Colors.text.secondary },
  fishingNotes: { ...Typography.bodyMd, color: Colors.text.secondary, lineHeight: 22 },
});
