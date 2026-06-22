import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Wind, Thermometer, Droplets, Activity, AlertTriangle, RefreshCw, Fish, Clock, Gauge } from 'lucide-react-native';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Badge } from '../../src/components/ui/Badge';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { getConditionsForWaterbody, FISHING_RATING_COLORS } from '../../src/data/conditions';
import { getAlertsForWaterbody } from '../../src/data/alerts';
import { Colors, Typography, Spacing, Radius, Gradients } from '../../src/design/tokens';
import { formatDateTime } from '../../src/utils/format';
import { generateRecommendation } from '../../src/services/fishingIntelligenceService';
import type { Conditions, FishingRecommendation, SpeciesScore } from '../../src/types';

export default function ConditionsScreen() {
  const [conditions, setConditions] = useState<Conditions | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const alerts = getAlertsForWaterbody('detroit-river');

  const load = () => {
    const c = getConditionsForWaterbody('detroit-river');
    setConditions(c ?? null);
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    load();
    setRefreshing(false);
  };

  // Fish Forecast — deterministic, offline-first, no AI APIs
  const today = useMemo(() => new Date(), []);
  const forecast = useMemo<FishingRecommendation>(
    () => generateRecommendation({ date: today, waterbodyId: 'detroit-river' }),
    [today],
  );

  if (!conditions) return null;

  const ratingColor = FISHING_RATING_COLORS[conditions.fishingRating] ?? Colors.text.muted;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.text.accent} />}
      >
        {/* Hero condition banner */}
        <LinearGradient colors={Gradients.hero} style={styles.hero}>
          <Text style={styles.heroLocation}>Detroit River · SE Michigan</Text>
          <Text style={styles.heroTemp}>{conditions.weather.tempF}°F</Text>
          <Text style={styles.heroDesc}>{conditions.weather.description}</Text>
          <View style={styles.ratingRow}>
            <View style={[styles.ratingDot, { backgroundColor: ratingColor }]} />
            <Text style={[styles.ratingLabel, { color: ratingColor }]}>
              Fishing: {conditions.fishingRatingLabel}
            </Text>
          </View>
          <Text style={styles.mockBadge}>📡 Mock data — live API adapter ready</Text>
        </LinearGradient>

        {/* Weather grid */}
        <SectionHeader title="Weather Snapshot" subtitle={formatDateTime(conditions.timestamp)} />
        <View style={styles.grid}>
          <MetricCard icon={<Wind size={20} color={Colors.brand.teal} />}
            label="Wind" value={`${conditions.weather.windSpeedMph} mph ${conditions.weather.windDirection}`} />
          <MetricCard icon={<Thermometer size={20} color={Colors.brand.orange} />}
            label="Feels Like" value={`${conditions.weather.feelsLikeF}°F`} />
          <MetricCard icon={<Droplets size={20} color={Colors.brand.tealLight} />}
            label="Humidity" value={`${conditions.weather.humidityPct}%`} />
          <MetricCard icon={<Activity size={20} color={Colors.brand.blue} />}
            label="Water Temp" value={conditions.water.tempF ? `${conditions.water.tempF}°F` : 'N/A'} />
        </View>

        {/* Water conditions */}
        <SectionHeader title="Water Conditions" />
        <GlassCard style={styles.waterCard}>
          <Row label="Ice Status" value={conditions.iceStatus === 'open' ? '✅ Open Water' : '🧊 Ice Present'} />
          {conditions.water.levelFt !== undefined && (
            <Row label="Water Level" value={`${conditions.water.levelFt} ft`} trend={conditions.water.trend} />
          )}
          {conditions.water.clarityFt !== undefined && (
            <Row label="Clarity (est.)" value={`${conditions.water.clarityFt} ft`} />
          )}
          {conditions.water.flowCfs && (
            <Row label="Flow" value={conditions.water.flowCfs} />
          )}
        </GlassCard>

        {/* DNR Alerts */}
        {alerts.length > 0 && (
          <>
            <SectionHeader title="Alerts & Notices" />
            {alerts.map((alert) => (
              <GlassCard key={alert.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <AlertTriangle
                    size={16}
                    color={alert.severity === 'danger' ? Colors.status.danger : alert.severity === 'warning' ? Colors.status.warning : Colors.status.info}
                  />
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Badge
                    label={alert.severity}
                    variant={alert.severity === 'danger' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'default'}
                    size="sm"
                  />
                </View>
                <Text style={styles.alertBody}>{alert.body}</Text>
                <Text style={styles.alertSource}>{alert.source}</Text>
              </GlassCard>
            ))}
          </>
        )}

        {/* ── Fish Forecast ────────────────────────────────── */}
        <SectionHeader
          title="Fish Forecast"
          subtitle="Condition-based guidance · Not a guarantee"
        />

        {/* Data quality warnings */}
        {forecast.dataWarnings.map((w, i) => (
          <View key={i} style={styles.warningBanner}>
            <Text style={styles.warningText}>⚠️ {w}</Text>
          </View>
        ))}

        {/* Top pick card */}
        {forecast.topPick ? (
          <GlassCard style={styles.topPickCard}>
            <View style={styles.topPickHeader}>
              <Text style={styles.topPickEmoji}>{forecast.topPick.emoji}</Text>
              <View style={styles.topPickInfo}>
                <Text style={styles.topPickName}>{forecast.topPick.speciesName}</Text>
                <View style={styles.topPickBadges}>
                  <View style={styles.scorePill}>
                    <Text style={styles.scorePillText}>{forecast.topPick.finalScore}/100</Text>
                  </View>
                  <View style={[styles.confidencePill, styles[`conf_${forecast.topPick.confidence}`]]}>
                    <Text style={styles.confidencePillText}>{forecast.topPick.confidence.toUpperCase()}</Text>
                  </View>
                  {forecast.topPick.hasUnverifiedData && (
                    <View style={styles.samplePill}>
                      <Text style={styles.samplePillText}>SAMPLE DATA</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.topPickDetails}>
              <View style={styles.forecastDetailRow}>
                <Clock size={14} color={Colors.brand.teal} />
                <Text style={styles.forecastDetailText}>{forecast.topPick.bestTimeWindow}</Text>
              </View>
              <View style={styles.forecastDetailRow}>
                <Gauge size={14} color={Colors.brand.teal} />
                <Text style={styles.forecastDetailText}>Depth: {forecast.topPick.depthRangeFt}</Text>
              </View>
              {forecast.topPick.methods[0] != null && (
                <View style={styles.forecastDetailRow}>
                  <Fish size={14} color={Colors.brand.teal} />
                  <Text style={styles.forecastDetailText}>
                    {forecast.topPick.methods[0].method}: {forecast.topPick.methods[0].detail}
                  </Text>
                </View>
              )}
            </View>

            {/* Explanation lines */}
            <View style={styles.explanationBlock}>
              {forecast.topPick.explanationLines.slice(0, 4).map((line, i) => (
                <Text key={i} style={styles.explanationLine}>{line}</Text>
              ))}
            </View>
          </GlassCard>
        ) : (
          <GlassCard style={styles.noPickCard}>
            <Text style={styles.noPickText}>
              🚫 No species recommended under current conditions.
            </Text>
          </GlassCard>
        )}

        {/* Ranked species list */}
        <SectionHeader title="All Species Ranked" subtitle="Tap to see full conditions detail" />
        <GlassCard>
          {forecast.rankedSpecies.map((s, i) => (
            <SpeciesRankRow key={s.speciesId} species={s} rank={i + 1} />
          ))}
        </GlassCard>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Conditions data is currently mocked. Live weather, water level, and DNR notice adapters are ready to connect. See /src/services.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <GlassCard style={styles.metricCard} padded={false}>
      <View style={styles.metricInner}>
        {icon}
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    </GlassCard>
  );
}

function Row({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <View style={styles.waterRow}>
      <Text style={styles.waterLabel}>{label}</Text>
      <View style={styles.waterValueRow}>
        <Text style={styles.waterValue}>{value}</Text>
        {trend === 'rising' && <Text style={styles.trendUp}>↑</Text>}
        {trend === 'falling' && <Text style={styles.trendDown}>↓</Text>}
        {trend === 'stable' && <Text style={styles.trendFlat}>→</Text>}
      </View>
    </View>
  );
}

function SpeciesRankRow({ species, rank }: { species: SpeciesScore; rank: number }) {
  const barWidth = `${species.finalScore}%` as const;
  const barColor =
    species.isClosed ? Colors.status.danger :
    species.finalScore >= 65 ? Colors.status.success :
    species.finalScore >= 40 ? Colors.brand.orange :
    Colors.text.muted;

  return (
    <View style={styles.rankRow}>
      <Text style={styles.rankNum}>#{rank}</Text>
      <Text style={styles.rankEmoji}>{species.emoji}</Text>
      <View style={styles.rankInfo}>
        <View style={styles.rankNameRow}>
          <Text style={styles.rankName}>{species.speciesName}</Text>
          {species.isClosed && <Badge label="CLOSED" variant="danger" size="sm" />}
          {!species.isClosed && species.confidence === 'high' && (
            <Badge label="HIGH" variant="teal" size="sm" />
          )}
        </View>
        <View style={styles.scoreBar}>
          {/* @ts-ignore - dynamic width via percentage string */}
          <View style={[styles.scoreBarFill, { width: barWidth, backgroundColor: barColor }]} />
        </View>
      </View>
      <Text style={[styles.rankScore, { color: barColor }]}>{species.finalScore}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { paddingBottom: Spacing.xxl },
  hero: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  heroLocation: { ...Typography.overline, color: Colors.text.accent, marginBottom: 4 },
  heroTemp: { fontSize: 64, fontWeight: '800', color: Colors.text.primary, lineHeight: 72 },
  heroDesc: { ...Typography.titleMd, color: Colors.text.secondary, marginBottom: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingDot: { width: 10, height: 10, borderRadius: 5 },
  ratingLabel: { ...Typography.label, fontWeight: '700' },
  mockBadge: { ...Typography.caption, color: Colors.text.muted, marginTop: 12, fontStyle: 'italic' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, paddingHorizontal: Spacing.md, marginBottom: Spacing.md },
  metricCard: { width: '47%' },
  metricInner: { padding: 14, alignItems: 'center', gap: 6 },
  metricValue: { ...Typography.titleMd, color: Colors.text.primary },
  metricLabel: { ...Typography.caption, color: Colors.text.muted },
  waterCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md, gap: 12 },
  waterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  waterLabel: { ...Typography.bodyMd, color: Colors.text.secondary },
  waterValueRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  waterValue: { ...Typography.label, color: Colors.text.primary },
  trendUp: { color: Colors.status.success, fontWeight: '700' },
  trendDown: { color: Colors.status.danger, fontWeight: '700' },
  trendFlat: { color: Colors.text.muted, fontWeight: '700' },
  alertCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, gap: 8 },
  alertHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertTitle: { ...Typography.titleSm, color: Colors.text.primary, flex: 1 },
  alertBody: { ...Typography.bodyMd, color: Colors.text.secondary, lineHeight: 20 },
  alertSource: { ...Typography.caption, color: Colors.text.muted },
  disclaimer: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: 'rgba(79,195,247,0.06)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerText: { ...Typography.bodySm, color: Colors.text.muted, lineHeight: 17 },

  // ── Fish Forecast styles ──────────────────────────────────────────────────
  warningBanner: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(255,167,38,0.12)',
    borderRadius: Radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: Colors.status.warning,
  },
  warningText: { ...Typography.caption, color: Colors.status.warning },

  topPickCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md, gap: 12 },
  topPickHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  topPickEmoji: { fontSize: 40, lineHeight: 48 },
  topPickInfo: { flex: 1, gap: 6 },
  topPickName: { ...Typography.titleMd, color: Colors.text.primary },
  topPickBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  scorePill: {
    paddingHorizontal: 8, paddingVertical: 2,
    backgroundColor: Colors.brand.teal,
    borderRadius: 10,
  },
  scorePillText: { ...Typography.caption, color: '#000', fontWeight: '800' },
  confidencePill: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10,
  },
  confidencePillText: { ...Typography.caption, fontWeight: '700' },
  conf_high: { backgroundColor: Colors.status.success },
  conf_medium: { backgroundColor: Colors.brand.orange },
  conf_low: { backgroundColor: Colors.text.muted },
  samplePill: {
    paddingHorizontal: 8, paddingVertical: 2,
    backgroundColor: 'rgba(255,167,38,0.2)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.status.warning,
  },
  samplePillText: { ...Typography.caption, color: Colors.status.warning, fontWeight: '700' },

  topPickDetails: { gap: 6 },
  forecastDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  forecastDetailText: { ...Typography.bodyMd, color: Colors.text.secondary, flex: 1 },

  explanationBlock: {
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 4,
  },
  explanationLine: { ...Typography.bodySm, color: Colors.text.secondary, lineHeight: 18 },

  noPickCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.md, alignItems: 'center', paddingVertical: Spacing.lg },
  noPickText: { ...Typography.bodyMd, color: Colors.text.muted, textAlign: 'center' },

  // Ranked species list
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rankNum: { ...Typography.caption, color: Colors.text.muted, width: 20, textAlign: 'right' },
  rankEmoji: { fontSize: 20, width: 28 },
  rankInfo: { flex: 1, gap: 4 },
  rankNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rankName: { ...Typography.bodyMd, color: Colors.text.primary, flex: 1 },
  scoreBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  scoreBarFill: { height: 4, borderRadius: 2 },
  rankScore: { ...Typography.label, fontWeight: '800', width: 30, textAlign: 'right' },
});
