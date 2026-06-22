import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassCard } from '../src/components/ui/GlassCard';
import { useAppStore } from '../src/store/useAppStore';
import { Colors, Typography, Spacing, Radius } from '../src/design/tokens';

export default function SettingsScreen() {
  const { preferences, savePreferences } = useAppStore();
  const router = useRouter();

  const handleClearData = () => {
    Alert.alert(
      'Clear All Local Data?',
      'This will erase your catch log, saved spots, and trip history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Data',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Data cleared', 'Please restart the app.');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Text size */}
        <Text style={styles.sectionLabel}>DISPLAY</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.settingLabel}>Text Size</Text>
          <View style={styles.segmented}>
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <TouchableOpacity
                key={size}
                style={[styles.segment, preferences.textSize === size && styles.segmentActive]}
                onPress={() => savePreferences({ textSize: size })}
                accessibilityLabel={`Text size ${size}`}
              >
                <Text style={[styles.segmentText, preferences.textSize === size && styles.segmentTextActive]}>
                  {size.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        <GlassCard style={styles.card}>
          <View style={styles.toggleRow}>
            <Text style={styles.settingLabel}>High Contrast Mode</Text>
            <Switch
              value={preferences.highContrast}
              onValueChange={(v) => savePreferences({ highContrast: v })}
              trackColor={{ false: Colors.bg.elevated, true: Colors.brand.teal }}
              thumbColor={preferences.highContrast ? Colors.brand.tealLight : Colors.text.muted}
              accessibilityLabel="Toggle high contrast mode"
            />
          </View>
          <View style={[styles.toggleRow, { marginTop: 14 }]}>
            <Text style={styles.settingLabel}>Reduced Motion</Text>
            <Switch
              value={preferences.reducedMotion}
              onValueChange={(v) => savePreferences({ reducedMotion: v })}
              trackColor={{ false: Colors.bg.elevated, true: Colors.brand.teal }}
              thumbColor={preferences.reducedMotion ? Colors.brand.tealLight : Colors.text.muted}
              accessibilityLabel="Toggle reduced motion"
            />
          </View>
        </GlassCard>

        {/* Units */}
        <Text style={styles.sectionLabel}>UNITS</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.settingLabel}>Measurement System</Text>
          <View style={styles.segmented}>
            {(['imperial', 'metric'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.segment, preferences.units === u && styles.segmentActive]}
                onPress={() => savePreferences({ units: u })}
                accessibilityLabel={`Use ${u} units`}
              >
                <Text style={[styles.segmentText, preferences.units === u && styles.segmentTextActive]}>
                  {u.charAt(0).toUpperCase() + u.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>

        {/* Data */}
        <Text style={styles.sectionLabel}>DATA & PRIVACY</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.settingNote}>
            Pure MI Fishing stores all data locally on your device using AsyncStorage and SQLite. Cloud backup is optional and off by default. No accounts required.
          </Text>
        </GlassCard>
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push('/sync-status')}
          accessibilityLabel="Open sync and backup status"
        >
          <Text style={styles.linkRowText}>Sync & Backup</Text>
          <Text style={styles.linkRowChevron}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dangerBtn}
          onPress={handleClearData}
          accessibilityLabel="Clear all local app data"
        >
          <Text style={styles.dangerBtnText}>Clear All Local Data</Text>
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.sectionLabel}>LEGAL</Text>
        <GlassCard style={styles.card}>
          <Text style={styles.settingNote}>
            Pure MI Fishing is an independent app not affiliated with the Michigan DNR, State of Michigan, or Pure Michigan tourism campaign. Regulation summaries are for planning only — always verify at michigan.gov/dnr.
          </Text>
        </GlassCard>

        <Text style={styles.version}>Pure MI Fishing · MVP v0.1 · Detroit River Region</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: 80 },
  sectionLabel: { ...Typography.overline, color: Colors.text.muted, marginBottom: Spacing.sm, marginTop: Spacing.md, marginLeft: 4 },
  card: { marginBottom: Spacing.sm },
  settingLabel: { ...Typography.titleSm, color: Colors.text.primary, marginBottom: 12 },
  segmented: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.elevated,
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: Colors.brand.blue },
  segmentText: { ...Typography.label, color: Colors.text.muted },
  segmentTextActive: { color: '#fff' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingNote: { ...Typography.bodyMd, color: Colors.text.secondary, lineHeight: 21 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.md,
    paddingVertical: 16,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  linkRowText: { ...Typography.titleSm, color: Colors.text.primary },
  linkRowChevron: { ...Typography.titleLg, color: Colors.text.muted },
  dangerBtn: {
    backgroundColor: 'rgba(244,67,54,0.12)',
    borderRadius: Radius.md,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244,67,54,0.25)',
    marginBottom: Spacing.sm,
  },
  dangerBtnText: { ...Typography.label, color: Colors.status.danger },
  version: { ...Typography.caption, color: Colors.text.muted, textAlign: 'center', marginTop: Spacing.lg },
});
