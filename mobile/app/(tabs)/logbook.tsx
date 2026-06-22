import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Modal, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Fish, Trash2, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { Button } from '../../src/components/ui/Button';
import { SectionHeader } from '../../src/components/ui/SectionHeader';
import { useLogbookStore } from '../../src/store/useLogbookStore';
import { SPECIES } from '../../src/data/species';
import { WATERBODIES } from '../../src/data/waterbodies';
import { Colors, Typography, Spacing, Radius } from '../../src/design/tokens';
import { formatRelative } from '../../src/utils/format';
import type { CatchEntry } from '../../src/types';

const METHODS = ['Jigging', 'Trolling', 'Shore casting', 'Drop-shot', 'Float fishing', 'Fly fishing', 'Ice fishing'];

export default function LogbookScreen() {
  const { catches, addCatch, deleteCatch } = useLogbookStore();
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [selectedSpecies, setSelectedSpecies] = useState('walleye');
  const [length, setLength] = useState('');
  const [weight, setWeight] = useState('');
  const [waterbody, setWaterbody] = useState('detroit-river');
  const [method, setMethod] = useState('Jigging');
  const [bait, setBait] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setSelectedSpecies('walleye');
    setLength('');
    setWeight('');
    setWaterbody('detroit-river');
    setMethod('Jigging');
    setBait('');
    setNotes('');
  };

  const handleSubmit = async () => {
    const sp = SPECIES.find((s) => s.id === selectedSpecies);
    const wb = WATERBODIES.find((w) => w.id === waterbody);
    if (!sp || !wb) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addCatch({
      speciesId: sp.id,
      speciesName: sp.name,
      lengthIn: length ? parseFloat(length) : undefined,
      weightLb: weight ? parseFloat(weight) : undefined,
      method,
      bait: bait || undefined,
      notes: notes || undefined,
      waterbodyId: wb.id,
      waterbodyName: wb.name,
      isPublic: false,
    });
    resetForm();
    setShowModal(false);
  };

  const handleDelete = (entry: CatchEntry) => {
    Alert.alert('Delete catch?', `Remove ${entry.speciesName} from your logbook?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCatch(entry.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Logbook</Text>
            <Text style={styles.subtitle}>{catches.length} catch{catches.length !== 1 ? 'es' : ''} recorded</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowModal(true)}
            accessibilityLabel="Log a new catch"
          >
            <Plus size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {catches.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <Fish size={40} color={Colors.text.muted} />
            <Text style={styles.emptyTitle}>Your first Detroit River catch starts here.</Text>
            <Text style={styles.emptyBody}>
              Tap + to log species, size, method, and location. Everything stays on your device.
            </Text>
            <Button label="Log First Catch" onPress={() => setShowModal(true)} size="md" />
          </GlassCard>
        ) : (
          <>
            <SectionHeader title="Your Catches" subtitle="Stored locally on your device" />
            {catches.map((entry) => (
              <CatchCard key={entry.id} entry={entry} onDelete={() => handleDelete(entry)} />
            ))}
          </>
        )}
      </ScrollView>

      <AddCatchModal
        visible={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        onSubmit={handleSubmit}
        selectedSpecies={selectedSpecies} setSelectedSpecies={setSelectedSpecies}
        length={length} setLength={setLength}
        weight={weight} setWeight={setWeight}
        waterbody={waterbody} setWaterbody={setWaterbody}
        method={method} setMethod={setMethod}
        bait={bait} setBait={setBait}
        notes={notes} setNotes={setNotes}
      />
    </SafeAreaView>
  );
}

function CatchCard({ entry, onDelete }: { entry: CatchEntry; onDelete: () => void }) {
  const sp = SPECIES.find((s) => s.id === entry.speciesId);
  return (
    <GlassCard style={styles.catchCard}>
      <View style={styles.catchRow}>
        <Text style={styles.catchEmoji}>{sp?.emoji ?? '🎣'}</Text>
        <View style={styles.catchText}>
          <Text style={styles.catchSpecies}>{entry.speciesName}</Text>
          <Text style={styles.catchMeta}>
            {[
              entry.lengthIn ? `${entry.lengthIn}"` : null,
              entry.weightLb ? `${entry.weightLb} lb` : null,
              entry.method,
              entry.waterbodyName,
            ].filter(Boolean).join(' · ')}
          </Text>
          <Text style={styles.catchTime}>{formatRelative(entry.timestamp)}</Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} accessibilityLabel="Delete catch">
          <Trash2 size={16} color={Colors.text.muted} />
        </TouchableOpacity>
      </View>
      {entry.notes ? <Text style={styles.catchNotes}>{entry.notes}</Text> : null}
    </GlassCard>
  );
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  selectedSpecies: string; setSelectedSpecies: (v: string) => void;
  length: string; setLength: (v: string) => void;
  weight: string; setWeight: (v: string) => void;
  waterbody: string; setWaterbody: (v: string) => void;
  method: string; setMethod: (v: string) => void;
  bait: string; setBait: (v: string) => void;
  notes: string; setNotes: (v: string) => void;
}

function AddCatchModal({ visible, onClose, onSubmit, selectedSpecies, setSelectedSpecies, length, setLength, weight, setWeight, waterbody, setWaterbody, method, setMethod, bait, setBait, notes, setNotes }: ModalProps) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <SafeAreaView style={styles.modal} edges={['top']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Log a Catch</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close form">
              <X size={22} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            <FieldLabel label="Species *" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
              {SPECIES.map((sp) => (
                <TouchableOpacity
                  key={sp.id}
                  style={[styles.pill, selectedSpecies === sp.id && styles.pillActive]}
                  onPress={() => setSelectedSpecies(sp.id)}
                  accessibilityLabel={sp.name}
                >
                  <Text style={styles.pillText}>{sp.emoji} {sp.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.twoCol}>
              <View style={styles.halfField}>
                <FieldLabel label="Length (in)" />
                <TextInput
                  style={styles.input}
                  value={length}
                  onChangeText={setLength}
                  keyboardType="decimal-pad"
                  placeholder="e.g. 18.5"
                  placeholderTextColor={Colors.text.muted}
                />
              </View>
              <View style={styles.halfField}>
                <FieldLabel label="Weight (lb)" />
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholder="optional"
                  placeholderTextColor={Colors.text.muted}
                />
              </View>
            </View>

            <FieldLabel label="Waterbody" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
              {WATERBODIES.map((wb) => (
                <TouchableOpacity
                  key={wb.id}
                  style={[styles.pill, waterbody === wb.id && styles.pillActive]}
                  onPress={() => setWaterbody(wb.id)}
                  accessibilityLabel={wb.name}
                >
                  <Text style={styles.pillText}>{wb.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <FieldLabel label="Method" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
              {METHODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.pill, method === m && styles.pillActive]}
                  onPress={() => setMethod(m)}
                  accessibilityLabel={m}
                >
                  <Text style={styles.pillText}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <FieldLabel label="Bait / Lure" />
            <TextInput
              style={styles.input}
              value={bait}
              onChangeText={setBait}
              placeholder="e.g. chartreuse jig, crawler, Rapala"
              placeholderTextColor={Colors.text.muted}
            />

            <FieldLabel label="Notes" />
            <TextInput
              style={[styles.input, styles.textarea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Water temp, structure, anything useful…"
              placeholderTextColor={Colors.text.muted}
              multiline
              numberOfLines={3}
            />

            <View style={styles.privateRow}>
              <Text style={styles.privateLabel}>Community Reports</Text>
              <View style={styles.privateDisabled}>
                <Text style={styles.privateDisabledText}>Coming later</Text>
              </View>
            </View>

            <Button label="Log This Catch" onPress={onSubmit} size="lg" style={styles.submitBtn} />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  headerText: { flex: 1 },
  title: { ...Typography.displayMd, color: Colors.text.primary },
  subtitle: { ...Typography.bodyMd, color: Colors.text.muted, marginTop: 4 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.brand.orange,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.brand.orange, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 8, elevation: 8,
  },
  emptyCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xxl, marginTop: Spacing.lg },
  emptyTitle: { ...Typography.titleMd, color: Colors.text.secondary, textAlign: 'center' },
  emptyBody: { ...Typography.bodyMd, color: Colors.text.muted, textAlign: 'center', lineHeight: 21, maxWidth: 280 },
  catchCard: { marginBottom: Spacing.sm, gap: 8 },
  catchRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  catchEmoji: { fontSize: 28, lineHeight: 32 },
  catchText: { flex: 1 },
  catchSpecies: { ...Typography.titleSm, color: Colors.text.primary },
  catchMeta: { ...Typography.bodySm, color: Colors.text.secondary, marginTop: 3 },
  catchTime: { ...Typography.caption, color: Colors.text.muted, marginTop: 2 },
  deleteBtn: { padding: 4 },
  catchNotes: { ...Typography.bodySm, color: Colors.text.secondary, lineHeight: 17 },
  // Modal
  modal: { flex: 1, backgroundColor: Colors.bg.primary },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  modalTitle: { ...Typography.titleLg, color: Colors.text.primary },
  modalContent: { padding: Spacing.md, paddingBottom: 80 },
  fieldLabel: { ...Typography.label, color: Colors.text.secondary, marginBottom: 6, marginTop: 14 },
  pillRow: { flexGrow: 0, marginBottom: 4 },
  pill: {
    backgroundColor: Colors.bg.elevated, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  pillActive: { backgroundColor: Colors.brand.blue, borderColor: Colors.brand.blue },
  pillText: { ...Typography.label, color: Colors.text.primary },
  twoCol: { flexDirection: 'row', gap: Spacing.md },
  halfField: { flex: 1 },
  input: {
    backgroundColor: Colors.bg.input,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    ...Typography.bodyMd,
    color: Colors.text.primary,
  },
  textarea: { minHeight: 72, textAlignVertical: 'top', paddingTop: 12 },
  privateRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: 14, marginBottom: 4,
  },
  privateLabel: { ...Typography.label, color: Colors.text.secondary },
  privateDisabled: {
    backgroundColor: Colors.bg.elevated, borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  privateDisabledText: { ...Typography.caption, color: Colors.text.muted },
  submitBtn: { marginTop: Spacing.lg },
});
