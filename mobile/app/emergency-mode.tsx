/**
 * emergency-mode.tsx — Phase 5
 *
 * Emergency Mode screen for Pure MI Fishing.
 *
 * Opens instantly with no network required.
 * Accepts optional params:
 *   - tripId: string  (passed from trip-mode to link incident to active trip)
 *
 * ⚠️  DISCLAIMER
 * This app does NOT contact emergency services automatically.
 * If you are in immediate danger, CALL 911.
 * Location may be inaccurate or unavailable.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, TextInput, Alert, Share, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Phone, MapPin, Share2, MessageSquare, CheckCircle,
  AlertTriangle, X, Shield, Save, User,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocation } from '../src/hooks/useLocation';
import {
  saveEmergencyContact,
  getEmergencyContact,
  clearEmergencyContact,
  generateEmergencyMessage,
  findNearestEmergencyAccessPoint,
  createEmergencyIncident,
  getLastKnownLocation,
  saveLastKnownLocation,
  type SaveableEmergencyContact,
  type LastKnownLocation,
  type NearestEmergencyPoint,
} from '../src/services/emergencyService';
import { GlassCard } from '../src/components/ui/GlassCard';
import { Colors, Typography, Spacing, Radius } from '../src/design/tokens';

// ── Screen ────────────────────────────────────────────────────────────────────

export default function EmergencyModeScreen() {
  const router = useRouter();
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  const { position, hasPermission, error: locationError } = useLocation();

  // ── State ─────────────────────────────────────────────────────────────────
  const [lastKnown, setLastKnown] = useState<LastKnownLocation | null>(null);
  const [contact, setContact] = useState<SaveableEmergencyContact | null>(null);
  const [nearestPoint, setNearestPoint] = useState<NearestEmergencyPoint | null>(null);
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [incidentSaved, setIncidentSaved] = useState(false);
  const [markedSafe, setMarkedSafe] = useState(false);

  // Contact edit modal
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRelationship, setEditRelationship] = useState('');

  // ── Load saved data on mount ──────────────────────────────────────────────
  useEffect(() => {
    void (async () => {
      const [savedContact, savedLocation] = await Promise.all([
        getEmergencyContact(),
        getLastKnownLocation(),
      ]);
      setContact(savedContact);
      setLastKnown(savedLocation);
    })();
  }, []);

  // ── Persist current GPS as "last known" whenever we get a good fix ────────
  useEffect(() => {
    if (position) {
      const loc: LastKnownLocation = {
        latitude: position.latitude,
        longitude: position.longitude,
        accuracyMeters: null,
        timestamp: new Date().toISOString(),
      };
      setLastKnown(loc);
      void saveLastKnownLocation(loc);
    }
  }, [position]);

  // ── Compute nearest emergency point ──────────────────────────────────────
  useEffect(() => {
    const coords = position ?? (lastKnown ? { latitude: lastKnown.latitude, longitude: lastKnown.longitude } : null);
    if (coords) {
      const np = findNearestEmergencyAccessPoint(coords.latitude, coords.longitude);
      setNearestPoint(np);
    }
  }, [position, lastKnown]);

  // ── Regenerate emergency message whenever inputs change ───────────────────
  useEffect(() => {
    const msg = generateEmergencyMessage({
      currentCoords: position,
      lastKnownLocation: lastKnown,
      nearestPoint,
      batteryPercent: null, // expo-battery not installed; deferred
    });
    setEmergencyMessage(msg);
  }, [position, lastKnown, nearestPoint]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleCall911 = useCallback(() => {
    Linking.openURL('tel:911');
  }, []);

  const handleTextContact = useCallback(() => {
    if (!contact?.phone) {
      setContactModalVisible(true);
      return;
    }
    const encoded = encodeURIComponent(emergencyMessage);
    Linking.openURL(`sms:${contact.phone}?body=${encoded}`);
  }, [contact, emergencyMessage]);

  const handleShareMessage = useCallback(async () => {
    try {
      await Share.share({ message: emergencyMessage, title: 'Emergency Message' });
    } catch {
      // Share cancelled — not an error
    }
  }, [emergencyMessage]);

  const handleSaveIncident = useCallback(() => {
    if (incidentSaved) return;
    createEmergencyIncident({
      coordinates: position,
      lastKnownCoordinates: lastKnown ? { latitude: lastKnown.latitude, longitude: lastKnown.longitude } : null,
      lastKnownAt: lastKnown?.timestamp ?? null,
      batteryLevel: null,
      emergencyContact: contact ? { name: contact.name, phone: contact.phone } : undefined,
      tripId: tripId ?? null,
    });
    setIncidentSaved(true);
    Alert.alert('Incident Saved', 'Emergency record saved offline. It will sync when connectivity returns.');
  }, [incidentSaved, position, lastKnown, contact, tripId]);

  const handleMarkSafe = useCallback(() => {
    Alert.alert(
      'Mark Safe',
      "Confirm you're safe and exiting Emergency Mode.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: "I'm Safe",
          style: 'default',
          onPress: () => {
            setMarkedSafe(true);
            setTimeout(() => router.back(), 600);
          },
        },
      ],
    );
  }, [router]);

  const openContactModal = useCallback(() => {
    setEditName(contact?.name ?? '');
    setEditPhone(contact?.phone ?? '');
    setEditRelationship(contact?.relationship ?? '');
    setContactModalVisible(true);
  }, [contact]);

  const handleSaveContact = useCallback(async () => {
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert('Required', 'Please enter a name and phone number.');
      return;
    }
    const newContact: SaveableEmergencyContact = {
      name: editName.trim(),
      phone: editPhone.trim().replace(/[^0-9+]/g, ''),
      relationship: editRelationship.trim() || undefined,
    };
    await saveEmergencyContact(newContact);
    setContact(newContact);
    setContactModalVisible(false);
  }, [editName, editPhone, editRelationship]);

  const handleClearContact = useCallback(async () => {
    Alert.alert('Remove Contact', 'Remove saved emergency contact?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await clearEmergencyContact();
          setContact(null);
        },
      },
    ]);
  }, []);

  // ── Coord display helpers ─────────────────────────────────────────────────
  const coordLine = (lat: number, lon: number) =>
    `${lat.toFixed(5)}°N, ${Math.abs(lon).toFixed(5)}°W`;

  // ── Render ────────────────────────────────────────────────────────────────

  if (markedSafe) {
    return (
      <View style={styles.safeScreen}>
        <CheckCircle size={72} color={Colors.status.success} />
        <Text style={styles.safeText}>You're marked safe.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient colors={['#3E0000', '#1A0000']} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerTitle}>
            <AlertTriangle size={20} color={Colors.status.danger} />
            <Text style={styles.headerText}>EMERGENCY MODE</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.closeBtn}
            accessibilityLabel="Close Emergency Mode"
          >
            <X size={22} color={Colors.text.secondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimerBanner}>
          This app does not contact emergency services · Call 911 for immediate danger
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ── CALL 911 ─────────────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.call911Btn}
          onPress={handleCall911}
          accessibilityLabel="Call 911"
          accessibilityRole="button"
        >
          <Phone size={28} color="#fff" />
          <Text style={styles.call911Text}>CALL 911</Text>
        </TouchableOpacity>

        {/* ── LOCATION ─────────────────────────────────────────────────── */}
        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <MapPin size={16} color={Colors.brand.teal} />
            <Text style={styles.sectionTitle}>Your Location</Text>
          </View>

          {position ? (
            <View>
              <Text style={styles.coordPrimary}>{coordLine(position.latitude, position.longitude)}</Text>
              <Text style={styles.coordLabel}>Current GPS fix</Text>
            </View>
          ) : lastKnown ? (
            <View>
              <Text style={styles.coordPrimary}>{coordLine(lastKnown.latitude, lastKnown.longitude)}</Text>
              <Text style={styles.coordLabel}>
                Last known · {_timeSince(lastKnown.timestamp)} ago
                {!hasPermission ? ' · GPS permission denied' : ''}
              </Text>
            </View>
          ) : (
            <View style={styles.coordUnavailable}>
              <Text style={styles.coordLabel}>
                {!hasPermission ? 'GPS permission denied.' : 'Acquiring GPS fix…'}
              </Text>
              {!hasPermission && (
                <Text style={styles.coordHint}>Last known location will appear here once GPS is granted.</Text>
              )}
            </View>
          )}

          {/* Nearest emergency resource */}
          {nearestPoint && (
            <View style={styles.nearestRow}>
              <Shield size={14} color={Colors.status.warning} />
              <Text style={styles.nearestText}>
                {nearestPoint.accessPoint.name} · {nearestPoint.distanceMi} mi
                {nearestPoint.accessPoint.emergencyPhone
                  ? `\n${nearestPoint.accessPoint.emergencyPhone}`
                  : ''}
              </Text>
            </View>
          )}
        </GlassCard>

        {/* ── EMERGENCY CONTACT ────────────────────────────────────────── */}
        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <User size={16} color={Colors.brand.teal} />
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={openContactModal}
              accessibilityLabel={contact ? 'Edit emergency contact' : 'Add emergency contact'}
            >
              <Text style={styles.editBtnText}>{contact ? 'Edit' : 'Add'}</Text>
            </TouchableOpacity>
          </View>

          {contact ? (
            <View style={styles.contactRow}>
              <View>
                <Text style={styles.contactName}>{contact.name}</Text>
                {contact.relationship ? (
                  <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                ) : null}
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <TouchableOpacity
                style={styles.smsBtn}
                onPress={handleTextContact}
                accessibilityLabel={`Send emergency SMS to ${contact.name}`}
              >
                <MessageSquare size={18} color="#fff" />
                <Text style={styles.smsBtnText}>Text Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={openContactModal} style={styles.addContactPrompt}>
              <Text style={styles.addContactText}>Tap "Add" to save a contact for emergencies.</Text>
            </TouchableOpacity>
          )}
        </GlassCard>

        {/* ── EMERGENCY MESSAGE ─────────────────────────────────────────── */}
        <GlassCard style={styles.card}>
          <View style={styles.sectionHeader}>
            <MessageSquare size={16} color={Colors.brand.teal} />
            <Text style={styles.sectionTitle}>Emergency Message</Text>
          </View>
          <Text style={styles.messagePreview} selectable>
            {emergencyMessage}
          </Text>
          <TouchableOpacity
            style={styles.copyBtn}
            onPress={handleShareMessage}
            accessibilityLabel="Share emergency message via share sheet"
          >
            <Share2 size={16} color={Colors.brand.teal} />
            <Text style={styles.copyBtnText}>Share Message</Text>
          </TouchableOpacity>
        </GlassCard>

        {/* ── ACTION BUTTONS ─────────────────────────────────────────────── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.saveBtn, incidentSaved && styles.actionBtnDone]}
            onPress={handleSaveIncident}
            disabled={incidentSaved}
            accessibilityLabel="Save incident offline"
          >
            <Save size={18} color={incidentSaved ? Colors.status.success : Colors.text.primary} />
            <Text style={[styles.actionBtnText, incidentSaved && { color: Colors.status.success }]}>
              {incidentSaved ? 'Saved ✓' : 'Save Incident'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.safeBtn]}
            onPress={handleMarkSafe}
            accessibilityLabel="Mark yourself as safe"
          >
            <CheckCircle size={18} color={Colors.status.success} />
            <Text style={[styles.actionBtnText, { color: Colors.status.success }]}>I'm Safe</Text>
          </TouchableOpacity>
        </View>

        {/* ── SAFETY DISCLAIMER ─────────────────────────────────────────── */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>⚠️ Important</Text>
          <Text style={styles.disclaimerText}>
            Pure MI Fishing does not contact emergency services automatically.
            {'\n\n'}If you are in immediate danger, call 911.
            {'\n\n'}Location data may be inaccurate or unavailable — provide a verbal description of your surroundings when calling for help.
          </Text>
        </View>
      </ScrollView>

      {/* ── CONTACT EDIT MODAL ───────────────────────────────────────────── */}
      <Modal
        visible={contactModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setContactModalVisible(false)}
      >
        <SafeAreaView style={styles.modalRoot} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Emergency Contact</Text>
            <TouchableOpacity onPress={() => setContactModalVisible(false)}>
              <X size={22} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="e.g. Jane Smith"
              placeholderTextColor={Colors.text.muted}
              autoCapitalize="words"
              returnKeyType="next"
              accessibilityLabel="Contact name"
            />

            <Text style={styles.inputLabel}>Phone *</Text>
            <TextInput
              style={styles.input}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="e.g. 3135550123"
              placeholderTextColor={Colors.text.muted}
              keyboardType="phone-pad"
              returnKeyType="next"
              accessibilityLabel="Contact phone number"
            />

            <Text style={styles.inputLabel}>Relationship (optional)</Text>
            <TextInput
              style={styles.input}
              value={editRelationship}
              onChangeText={setEditRelationship}
              placeholder="e.g. Spouse, Parent, Friend"
              placeholderTextColor={Colors.text.muted}
              autoCapitalize="words"
              returnKeyType="done"
              accessibilityLabel="Relationship to contact"
            />

            <TouchableOpacity style={styles.saveContactBtn} onPress={handleSaveContact}>
              <Text style={styles.saveContactBtnText}>Save Contact</Text>
            </TouchableOpacity>

            {contact && (
              <TouchableOpacity style={styles.clearContactBtn} onPress={handleClearContact}>
                <Text style={styles.clearContactBtnText}>Remove Contact</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function _timeSince(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  return hrs < 24 ? `${hrs}h` : `${Math.floor(hrs / 24)}d`;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },

  // Header
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerText: { ...Typography.titleMd, color: Colors.status.danger, fontWeight: '800' as const, letterSpacing: 1.5 },
  closeBtn: { padding: 4 },
  disclaimerBanner: { ...Typography.caption, color: 'rgba(244,67,54,0.8)', textAlign: 'center' },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.md },

  // CALL 911
  call911Btn: {
    backgroundColor: Colors.status.danger,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 20,
    shadowColor: Colors.status.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 12,
  },
  call911Text: { ...Typography.titleLg, color: '#fff', fontWeight: '900' as const, letterSpacing: 2 },

  // Cards
  card: { gap: 12 },

  // Section headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { ...Typography.label, color: Colors.text.accent, flex: 1 },
  editBtn: {
    paddingHorizontal: 10, paddingVertical: 3,
    backgroundColor: 'rgba(79,195,247,0.15)',
    borderRadius: Radius.sm,
    borderWidth: 1, borderColor: 'rgba(79,195,247,0.3)',
  },
  editBtnText: { ...Typography.caption, color: Colors.brand.teal, fontWeight: '700' as const },

  // Location
  coordPrimary: { ...Typography.titleMd, color: Colors.text.primary, marginTop: 4 },
  coordLabel: { ...Typography.caption, color: Colors.text.muted, marginTop: 2 },
  coordHint: { ...Typography.bodySm, color: Colors.text.muted, marginTop: 4 },
  coordUnavailable: { gap: 4, marginTop: 4 },
  nearestRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  nearestText: { ...Typography.bodySm, color: Colors.text.secondary, flex: 1, lineHeight: 18 },

  // Contact
  contactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  contactName: { ...Typography.titleSm, color: Colors.text.primary },
  contactRelationship: { ...Typography.caption, color: Colors.text.muted },
  contactPhone: { ...Typography.bodyMd, color: Colors.brand.teal, marginTop: 2 },
  smsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.brand.teal,
    paddingHorizontal: Spacing.sm, paddingVertical: 8,
    borderRadius: Radius.md,
  },
  smsBtnText: { ...Typography.label, color: '#000', fontWeight: '700' as const },
  addContactPrompt: { paddingVertical: Spacing.sm },
  addContactText: { ...Typography.bodyMd, color: Colors.text.muted },

  // Message
  messagePreview: {
    ...Typography.bodySm,
    color: Colors.text.secondary,
    lineHeight: 20,
    backgroundColor: Colors.bg.card,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    fontFamily: 'monospace',
  },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(79,195,247,0.3)',
    borderRadius: Radius.md,
  },
  copyBtnText: { ...Typography.label, color: Colors.brand.teal },

  // Action row
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    backgroundColor: Colors.bg.card,
  },
  actionBtnDone: { borderColor: Colors.status.success, opacity: 0.8 },
  saveBtn: {},
  safeBtn: { borderColor: Colors.status.success },
  actionBtnText: { ...Typography.label, color: Colors.text.primary },

  // Disclaimer
  disclaimer: {
    padding: Spacing.md,
    backgroundColor: 'rgba(244,67,54,0.06)',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: 'rgba(244,67,54,0.2)',
    gap: 4,
  },
  disclaimerTitle: { ...Typography.label, color: Colors.status.warning },
  disclaimerText: { ...Typography.bodySm, color: Colors.text.secondary, lineHeight: 18 },

  // Safe screen
  safeScreen: {
    flex: 1, backgroundColor: Colors.bg.primary,
    alignItems: 'center', justifyContent: 'center', gap: 16,
  },
  safeText: { ...Typography.titleLg, color: Colors.status.success },

  // Modal
  modalRoot: { flex: 1, backgroundColor: Colors.bg.primary },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { ...Typography.titleMd, color: Colors.text.primary },
  modalContent: { padding: Spacing.md, gap: Spacing.sm },
  inputLabel: { ...Typography.label, color: Colors.text.secondary },
  input: {
    ...Typography.bodyMd,
    color: Colors.text.primary,
    backgroundColor: Colors.bg.input,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  saveContactBtn: {
    backgroundColor: Colors.brand.teal,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveContactBtnText: { ...Typography.label, color: '#000', fontWeight: '700' as const },
  clearContactBtn: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(244,67,54,0.4)',
  },
  clearContactBtnText: { ...Typography.label, color: Colors.status.danger },
});
