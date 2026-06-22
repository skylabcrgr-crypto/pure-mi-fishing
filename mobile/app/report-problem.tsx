/**
 * report-problem.tsx — Phase 6
 *
 * Offline-first "Report a Problem" screen for Pure MI Fishing.
 * Accepts optional query params:
 *   - reportType: CitizenReportType  (pre-select a type, e.g. from trip-mode)
 *   - waterbodyId: string            (pre-select a waterbody)
 *
 * Two views:
 *   1. Report Form — create a new report
 *   2. My Reports — local report history with delete
 *
 * ⚠️  Reports are saved locally. Pure MI Fishing is not an official
 *     government reporting channel. For immediate danger, call 911.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  X, AlertTriangle, CheckCircle, Trash2, ChevronRight,
  MapPin, Clock, FileText, Eye, Radio,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocation } from '../src/hooks/useLocation';
import { getLastKnownLocation, type LastKnownLocation } from '../src/services/emergencyService';
import {
  REPORT_TYPE_META,
  getReportTypeMeta,
  createCitizenReport,
  getCitizenReports,
  deleteCitizenReport,
  resolveNearestWaterbody,
  type ReportTypeMeta,
} from '../src/services/citizenReportService';
import { GlassCard } from '../src/components/ui/GlassCard';
import { Badge } from '../src/components/ui/Badge';
import { Colors, Typography, Spacing, Radius } from '../src/design/tokens';
import type { CitizenReport, CitizenReportType } from '../src/types';

type TabId = 'form' | 'history';

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function ReportProblemScreen() {
  const router = useRouter();
  const { reportType: paramType, waterbodyId: paramWbId } = useLocalSearchParams<{
    reportType?: string;
    waterbodyId?: string;
  }>();

  const { position, hasPermission } = useLocation();

  // ── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>('form');
  const [lastKnown, setLastKnown] = useState<LastKnownLocation | null>(null);

  // Form fields
  const [selectedType, setSelectedType] = useState<CitizenReportType>(
    (paramType as CitizenReportType | undefined) ?? 'other',
  );
  const [notes, setNotes] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [typePickerVisible, setTypePickerVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // History
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [detailReport, setDetailReport] = useState<CitizenReport | null>(null);

  // ── Load on mount ──────────────────────────────────────────────────────
  useEffect(() => {
    void getLastKnownLocation().then(setLastKnown);
    refreshReports();
  }, []);

  // Persist GPS as last known whenever available
  useEffect(() => {
    if (position) {
      const { saveLastKnownLocation } = require('../src/services/emergencyService');
      void saveLastKnownLocation({
        latitude: position.latitude,
        longitude: position.longitude,
        accuracyMeters: null,
        timestamp: new Date().toISOString(),
      });
    }
  }, [position]);

  const refreshReports = useCallback(() => {
    setReports(getCitizenReports());
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────
  const effectiveCoords = useMemo(() => {
    if (useCurrentLocation && position) return position;
    if (lastKnown) return { latitude: lastKnown.latitude, longitude: lastKnown.longitude };
    return null;
  }, [useCurrentLocation, position, lastKnown]);

  const resolvedWaterbody = useMemo(() => {
    if (paramWbId) return null; // will be passed directly
    if (!effectiveCoords) return null;
    return resolveNearestWaterbody(effectiveCoords.latitude, effectiveCoords.longitude);
  }, [effectiveCoords, paramWbId]);

  const selectedMeta = getReportTypeMeta(selectedType);

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const report = createCitizenReport({
      reportType: selectedType,
      coordinates: effectiveCoords,
      waterbodyId: paramWbId ?? resolvedWaterbody?.id ?? null,
      waterbodyName: resolvedWaterbody?.name ?? null,
      notes: notes.trim() || undefined,
      isAnonymous,
    });

    if (report) {
      setSubmitted(true);
      setNotes('');
      refreshReports();
      setTimeout(() => {
        setSubmitted(false);
        setActiveTab('history');
      }, 1800);
    }
  }, [selectedType, effectiveCoords, paramWbId, resolvedWaterbody, notes, isAnonymous, refreshReports]);

  // ── Delete ────────────────────────────────────────────────────────────
  const handleDelete = useCallback((report: CitizenReport) => {
    Alert.alert(
      'Delete Report',
      `Delete this ${getReportTypeMeta(report.reportType).label} report?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCitizenReport(report.id);
            setDetailReport(null);
            refreshReports();
          },
        },
      ],
    );
  }, [refreshReports]);

  // ── Coord display ─────────────────────────────────────────────────────
  const coordDisplay = useMemo(() => {
    if (position && useCurrentLocation)
      return `${position.latitude.toFixed(4)}, ${position.longitude.toFixed(4)}`;
    if (lastKnown)
      return `${lastKnown.latitude.toFixed(4)}, ${lastKnown.longitude.toFixed(4)} (last known)`;
    return hasPermission ? 'Acquiring GPS…' : 'GPS permission denied';
  }, [position, lastKnown, useCurrentLocation, hasPermission]);

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient colors={['#0A1628', '#0F1E35']} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitle}>
            <Radio size={18} color={Colors.brand.orange} />
            <Text style={styles.headerText}>Report a Problem</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} accessibilityLabel="Close">
            <X size={22} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {(['form', 'history'] as TabId[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => { setActiveTab(tab); if (tab === 'history') refreshReports(); }}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'form' ? 'New Report' : `My Reports (${reports.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* ── FORM TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'form' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Success flash */}
          {submitted && (
            <View style={styles.successBanner}>
              <CheckCircle size={18} color={Colors.status.success} />
              <Text style={styles.successText}>Report saved locally ✓</Text>
            </View>
          )}

          {/* Report type selector */}
          <GlassCard style={styles.card}>
            <Text style={styles.fieldLabel}>Report Type *</Text>
            <TouchableOpacity
              style={styles.typeSelector}
              onPress={() => setTypePickerVisible(true)}
              accessibilityLabel="Select report type"
            >
              <Text style={styles.typeSelectorEmoji}>{selectedMeta.emoji}</Text>
              <View style={styles.typeSelectorInfo}>
                <Text style={styles.typeSelectorLabel}>{selectedMeta.label}</Text>
                <Text style={styles.typeSelectorDesc} numberOfLines={1}>{selectedMeta.description}</Text>
              </View>
              <ChevronRight size={18} color={Colors.text.muted} />
            </TouchableOpacity>
            {selectedMeta.urgency === 'high' && (
              <View style={styles.urgencyBanner}>
                <AlertTriangle size={14} color={Colors.status.warning} />
                <Text style={styles.urgencyText}>
                  High-priority issue. For immediate enforcement help, contact DNR directly.
                </Text>
              </View>
            )}
          </GlassCard>

          {/* Location */}
          <GlassCard style={styles.card}>
            <Text style={styles.fieldLabel}>Location</Text>
            <View style={styles.locationRow}>
              <MapPin size={14} color={Colors.brand.teal} />
              <Text style={styles.locationText}>{coordDisplay}</Text>
            </View>

            {/* Toggle between current and last known */}
            {lastKnown && position && (
              <View style={styles.locationToggleRow}>
                <TouchableOpacity
                  style={[styles.locationToggleBtn, useCurrentLocation && styles.locationToggleBtnActive]}
                  onPress={() => setUseCurrentLocation(true)}
                >
                  <Text style={[styles.locationToggleText, useCurrentLocation && styles.locationToggleTextActive]}>
                    Current GPS
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.locationToggleBtn, !useCurrentLocation && styles.locationToggleBtnActive]}
                  onPress={() => setUseCurrentLocation(false)}
                >
                  <Text style={[styles.locationToggleText, !useCurrentLocation && styles.locationToggleTextActive]}>
                    Last Known
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Resolved waterbody */}
            {(resolvedWaterbody ?? paramWbId) && (
              <View style={styles.waterbodyRow}>
                <Text style={styles.waterbodyLabel}>
                  Waterbody: {resolvedWaterbody?.name ?? paramWbId}
                  {resolvedWaterbody ? ` (${resolvedWaterbody.distanceMi} mi)` : ''}
                </Text>
              </View>
            )}
          </GlassCard>

          {/* Notes */}
          <GlassCard style={styles.card}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Describe what you observed. Include any relevant details, species, quantities, or visual landmarks."
              placeholderTextColor={Colors.text.muted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              accessibilityLabel="Report notes"
            />
          </GlassCard>

          {/* Photo placeholder */}
          <GlassCard style={styles.card}>
            <Text style={styles.fieldLabel}>Photo</Text>
            <View style={styles.photoPlaceholder}>
              <FileText size={24} color={Colors.text.muted} />
              <Text style={styles.photoPlaceholderText}>
                Photo attachment coming in Phase 7/8.
              </Text>
            </View>
          </GlassCard>

          {/* Anonymous toggle */}
          <GlassCard style={styles.card}>
            <TouchableOpacity
              style={styles.anonRow}
              onPress={() => setIsAnonymous((v) => !v)}
              accessibilityLabel={`Submit anonymously: ${isAnonymous ? 'yes' : 'no'}`}
            >
              <View style={styles.anonLeft}>
                <Text style={styles.anonLabel}>Submit anonymously</Text>
                <Text style={styles.anonHint}>No name or account info attached to report.</Text>
              </View>
              <View style={[styles.toggle, isAnonymous && styles.toggleOn]}>
                <View style={[styles.toggleThumb, isAnonymous && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>
          </GlassCard>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, submitted && styles.submitBtnDone]}
            onPress={handleSubmit}
            disabled={submitted}
            accessibilityLabel="Save report locally"
          >
            <Text style={styles.submitBtnText}>
              {submitted ? 'Report Saved ✓' : 'Save Report Locally'}
            </Text>
          </TouchableOpacity>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerTitle}>⚠️ Important</Text>
            <Text style={styles.disclaimerText}>
              Reports are saved locally and may sync later when backend sync is enabled.
              {'\n\n'}For immediate danger or emergencies, call 911.
              {'\n\n'}For urgent poaching or enforcement issues, contact the Michigan DNR RAP Line: 1-800-292-7800.
              {'\n\n'}Pure MI Fishing is not an official government reporting channel.
            </Text>
          </View>
        </ScrollView>
      )}

      {/* ── HISTORY TAB ───────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {reports.length === 0 ? (
            <View style={styles.emptyState}>
              <Radio size={36} color={Colors.text.muted} />
              <Text style={styles.emptyTitle}>No reports yet</Text>
              <Text style={styles.emptyBody}>
                Reports you save will appear here. They stay on your device until backend sync is enabled.
              </Text>
            </View>
          ) : (
            reports.map((r) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => setDetailReport(r)}
                accessibilityLabel={`View ${getReportTypeMeta(r.reportType).label} report`}
              >
                <GlassCard style={styles.reportRow}>
                  <View style={styles.reportRowLeft}>
                    <Text style={styles.reportRowEmoji}>{getReportTypeMeta(r.reportType).emoji}</Text>
                    <View style={styles.reportRowInfo}>
                      <Text style={styles.reportRowType}>{getReportTypeMeta(r.reportType).label}</Text>
                      {r.waterbodyName ? (
                        <Text style={styles.reportRowWb}>{r.waterbodyName}</Text>
                      ) : r.coordinates ? (
                        <Text style={styles.reportRowWb}>
                          {r.coordinates.latitude.toFixed(3)}, {r.coordinates.longitude.toFixed(3)}
                        </Text>
                      ) : null}
                      <Text style={styles.reportRowDate}>{_formatDate(r.timestamp)}</Text>
                    </View>
                  </View>
                  <View style={styles.reportRowRight}>
                    <StatusBadge status={r.status} />
                    <ChevronRight size={16} color={Colors.text.muted} />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))
          )}

          {/* Local-only note */}
          {reports.length > 0 && (
            <View style={styles.syncNote}>
              <Text style={styles.syncNoteText}>
                📡 {reports.filter((r) => r.status === 'draft').length} pending sync · Reports are local-only until Phase 7 backend sync.
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* ── TYPE PICKER MODAL ─────────────────────────────────────────── */}
      <Modal
        visible={typePickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setTypePickerVisible(false)}
      >
        <SafeAreaView style={styles.modalRoot} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Report Type</Text>
            <TouchableOpacity onPress={() => setTypePickerVisible(false)}>
              <X size={22} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {REPORT_TYPE_META.map((meta) => (
              <TouchableOpacity
                key={meta.type}
                style={[styles.typeOption, selectedType === meta.type && styles.typeOptionSelected]}
                onPress={() => { setSelectedType(meta.type); setTypePickerVisible(false); }}
                accessibilityLabel={meta.label}
              >
                <Text style={styles.typeOptionEmoji}>{meta.emoji}</Text>
                <View style={styles.typeOptionInfo}>
                  <View style={styles.typeOptionTitleRow}>
                    <Text style={styles.typeOptionLabel}>{meta.label}</Text>
                    {meta.urgency === 'high' && (
                      <View style={styles.urgencyTag}>
                        <Text style={styles.urgencyTagText}>HIGH</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.typeOptionDesc}>{meta.description}</Text>
                </View>
                {selectedType === meta.type && (
                  <CheckCircle size={18} color={Colors.brand.teal} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ── REPORT DETAIL MODAL ───────────────────────────────────────── */}
      {detailReport && (
        <Modal
          visible
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setDetailReport(null)}
        >
          <SafeAreaView style={styles.modalRoot} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report Detail</Text>
              <TouchableOpacity onPress={() => setDetailReport(null)}>
                <X size={22} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <View style={styles.detailTypeRow}>
                <Text style={styles.detailEmoji}>{getReportTypeMeta(detailReport.reportType).emoji}</Text>
                <View>
                  <Text style={styles.detailType}>{getReportTypeMeta(detailReport.reportType).label}</Text>
                  <StatusBadge status={detailReport.status} />
                </View>
              </View>

              <DetailRow label="Date" value={_formatDate(detailReport.timestamp)} />
              {detailReport.waterbodyName && (
                <DetailRow label="Waterbody" value={detailReport.waterbodyName} />
              )}
              {detailReport.coordinates && (
                <DetailRow
                  label="Coordinates"
                  value={`${detailReport.coordinates.latitude.toFixed(5)}, ${detailReport.coordinates.longitude.toFixed(5)}`}
                />
              )}
              {detailReport.notes && (
                <DetailRow label="Notes" value={detailReport.notes} />
              )}
              <DetailRow label="Anonymous" value={detailReport.isAnonymous ? 'Yes' : 'No'} />
              <DetailRow label="Sync" value={`${detailReport.status} · ${detailReport.syncAttempts} attempt(s)`} />

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(detailReport)}
              >
                <Trash2 size={16} color={Colors.status.danger} />
                <Text style={styles.deleteBtnText}>Delete Report</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CitizenReport['status'] }) {
  const variant =
    status === 'synced' ? 'teal' :
    status === 'submitted' ? 'default' :
    'warning';
  const label =
    status === 'synced' ? 'Synced' :
    status === 'submitted' ? 'Submitted' :
    'Local';
  return <Badge label={label} variant={variant as 'teal' | 'default' | 'warning'} size="sm" />;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailRowLabel}>{label}</Text>
      <Text style={styles.detailRowValue}>{value}</Text>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },

  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: Spacing.sm,
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerText: { ...Typography.titleMd, color: Colors.text.primary },

  tabBar: { flexDirection: 'row', gap: 0 },
  tab: {
    flex: 1, paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: Colors.brand.teal },
  tabText: { ...Typography.label, color: Colors.text.muted },
  tabTextActive: { color: Colors.brand.teal },

  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },

  card: { gap: Spacing.sm },
  fieldLabel: { ...Typography.label, color: Colors.text.accent },

  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(76,175,80,0.15)',
    borderRadius: Radius.md, padding: Spacing.sm,
    borderWidth: 1, borderColor: 'rgba(76,175,80,0.3)',
  },
  successText: { ...Typography.bodyMd, color: Colors.status.success },

  // Type selector
  typeSelector: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md, padding: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border,
  },
  typeSelectorEmoji: { fontSize: 28, width: 36 },
  typeSelectorInfo: { flex: 1 },
  typeSelectorLabel: { ...Typography.titleSm, color: Colors.text.primary },
  typeSelectorDesc: { ...Typography.caption, color: Colors.text.muted },
  urgencyBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: 'rgba(255,152,0,0.10)',
    borderRadius: Radius.sm, padding: 8,
  },
  urgencyText: { ...Typography.caption, color: Colors.status.warning, flex: 1, lineHeight: 16 },

  // Location
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { ...Typography.bodyMd, color: Colors.text.secondary, flex: 1 },
  locationToggleRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: 6 },
  locationToggleBtn: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border,
  },
  locationToggleBtnActive: { borderColor: Colors.brand.teal, backgroundColor: 'rgba(0,172,193,0.12)' },
  locationToggleText: { ...Typography.caption, color: Colors.text.muted },
  locationToggleTextActive: { color: Colors.brand.teal },
  waterbodyRow: { paddingTop: 4 },
  waterbodyLabel: { ...Typography.caption, color: Colors.text.accent },

  // Notes
  notesInput: {
    ...Typography.bodyMd,
    color: Colors.text.primary,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    padding: Spacing.sm,
    minHeight: 100,
  },

  // Photo
  photoPlaceholder: {
    alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  photoPlaceholderText: { ...Typography.bodyMd, color: Colors.text.muted, textAlign: 'center' },

  // Anonymous toggle
  anonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  anonLeft: { flex: 1 },
  anonLabel: { ...Typography.bodyMd, color: Colors.text.primary },
  anonHint: { ...Typography.caption, color: Colors.text.muted },
  toggle: {
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: Colors.bg.elevated,
    justifyContent: 'center', padding: 2,
    borderWidth: 1, borderColor: Colors.border,
  },
  toggleOn: { backgroundColor: Colors.brand.teal },
  toggleThumb: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.text.muted,
    alignSelf: 'flex-start',
  },
  toggleThumbOn: { backgroundColor: '#fff', alignSelf: 'flex-end' },

  // Submit
  submitBtn: {
    backgroundColor: Colors.brand.orange,
    borderRadius: Radius.md,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: Colors.brand.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  submitBtnDone: { backgroundColor: Colors.status.success, shadowColor: Colors.status.success },
  submitBtnText: { ...Typography.titleSm, color: '#fff', fontWeight: '700' as const },

  // Disclaimer
  disclaimer: {
    padding: Spacing.md,
    backgroundColor: 'rgba(255,107,53,0.06)',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(255,107,53,0.2)',
    gap: 4,
  },
  disclaimerTitle: { ...Typography.label, color: Colors.status.warning },
  disclaimerText: { ...Typography.bodySm, color: Colors.text.secondary, lineHeight: 18 },

  // History
  emptyState: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: Spacing.xxl, gap: Spacing.md,
  },
  emptyTitle: { ...Typography.titleMd, color: Colors.text.secondary },
  emptyBody: { ...Typography.bodyMd, color: Colors.text.muted, textAlign: 'center', lineHeight: 20 },
  reportRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reportRowLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, flex: 1 },
  reportRowEmoji: { fontSize: 24, width: 32, marginTop: 2 },
  reportRowInfo: { flex: 1, gap: 2 },
  reportRowType: { ...Typography.titleSm, color: Colors.text.primary },
  reportRowWb: { ...Typography.caption, color: Colors.text.accent },
  reportRowDate: { ...Typography.caption, color: Colors.text.muted },
  reportRowRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  syncNote: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: 'rgba(79,195,247,0.06)',
    borderRadius: Radius.sm,
  },
  syncNoteText: { ...Typography.caption, color: Colors.text.muted, textAlign: 'center' },

  // Modals
  modalRoot: { flex: 1, backgroundColor: Colors.bg.primary },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { ...Typography.titleMd, color: Colors.text.primary },
  modalContent: { padding: Spacing.md, gap: Spacing.sm },

  // Type picker
  typeOption: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'transparent',
  },
  typeOptionSelected: { borderColor: Colors.brand.teal, backgroundColor: 'rgba(0,172,193,0.08)' },
  typeOptionEmoji: { fontSize: 24, width: 32 },
  typeOptionInfo: { flex: 1 },
  typeOptionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeOptionLabel: { ...Typography.titleSm, color: Colors.text.primary },
  urgencyTag: {
    paddingHorizontal: 6, paddingVertical: 1,
    backgroundColor: 'rgba(244,67,54,0.2)',
    borderRadius: 4,
  },
  urgencyTagText: { ...Typography.caption, color: Colors.status.danger, fontWeight: '700' as const },
  typeOptionDesc: { ...Typography.caption, color: Colors.text.muted, lineHeight: 16, marginTop: 2 },

  // Detail modal
  detailTypeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  detailEmoji: { fontSize: 36 },
  detailType: { ...Typography.titleMd, color: Colors.text.primary, marginBottom: 4 },
  detailRow: {
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    gap: 2,
  },
  detailRowLabel: { ...Typography.caption, color: Colors.text.muted },
  detailRowValue: { ...Typography.bodyMd, color: Colors.text.primary },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, marginTop: Spacing.md,
    borderWidth: 1, borderColor: 'rgba(244,67,54,0.4)',
    borderRadius: Radius.md,
  },
  deleteBtnText: { ...Typography.label, color: Colors.status.danger },
});
