// Pure MI Fishing — Sync & Backup Status (Phase 7)
// ----------------------------------------------------------------------------
// Diagnostics + manual sync screen. Always renders, even fully offline / with
// no backend configured. Never crashes.
// ----------------------------------------------------------------------------

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { User } from '@supabase/supabase-js';
import { CheckCircle2, CloudOff, RefreshCw } from 'lucide-react-native';
import { GlassCard } from '../src/components/ui/GlassCard';
import { Button } from '../src/components/ui/Button';
import { Colors, Typography, Spacing, Radius } from '../src/design/tokens';
import { getSupabaseConfigSummary, isSupabaseConfigured } from '../src/lib/supabase';
import { getCurrentUser } from '../src/services/authService';
import { getPendingCounts, syncNow, type PendingCounts, type SyncResult } from '../src/services/syncService';

export default function SyncStatusScreen() {
  const [configured] = useState<boolean>(isSupabaseConfigured());
  const [configSummary] = useState(getSupabaseConfigSummary());
  const [user, setUser] = useState<User | null>(null);
  const [counts, setCounts] = useState<PendingCounts | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<SyncResult | null>(null);

  const refresh = useCallback(async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch {
      setUser(null);
    }
    try {
      setCounts(await getPendingCounts());
    } catch {
      setCounts(null);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSync = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await syncNow();
      setLastResult(result);
      await refresh();
      if (result.reason === 'not-configured') {
        Alert.alert('Backup not configured', 'Cloud backup is not set up for this build. Your data is safe on this device.');
      } else if (result.reason === 'not-signed-in') {
        Alert.alert('Sign in required', 'Sign in to back up your data to the cloud. Your data is safe on this device either way.');
      } else if (result.totalFailed > 0) {
        Alert.alert('Partial sync', `Uploaded ${result.totalPushed}. ${result.totalFailed} item(s) will retry next time.`);
      } else if (result.totalPushed > 0) {
        Alert.alert('Backup complete', `Uploaded ${result.totalPushed} item(s).`);
      } else {
        Alert.alert('Up to date', 'Nothing pending to back up.');
      }
    } catch {
      Alert.alert('Sync error', 'Could not sync right now. Your data is safe on this device.');
    } finally {
      setSyncing(false);
    }
  }, [refresh]);

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Pure MI Fishing works fully offline. Cloud backup is optional — when configured and signed in,
          your trips, catches, reports, and emergency records can be backed up to your private account.
        </Text>

        {/* Backend status */}
        <Text style={styles.sectionLabel}>BACKEND</Text>
        <GlassCard style={styles.card}>
          <StatusRow
            ok={configured}
            okLabel="Cloud backup configured"
            failLabel="Cloud backup not configured"
          />
          {configured && configSummary.url ? (
            <Text style={styles.meta}>{configSummary.url}</Text>
          ) : null}
          <Text style={styles.meta}>Environment: {configSummary.appEnv}</Text>
        </GlassCard>

        {/* Account status */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <GlassCard style={styles.card}>
          <StatusRow
            ok={Boolean(user)}
            okLabel={user?.email ? `Signed in as ${user.email}` : 'Signed in'}
            failLabel="Not signed in"
          />
          {!user ? (
            <Text style={styles.meta}>
              Accounts are optional. You can use every feature without signing in.
            </Text>
          ) : null}
        </GlassCard>

        {/* Pending counts */}
        <Text style={styles.sectionLabel}>PENDING TO BACK UP</Text>
        <GlassCard style={styles.card}>
          <CountRow label="Trips" value={counts?.trips ?? 0} />
          <CountRow label="Catches" value={counts?.catches ?? 0} />
          <CountRow label="Reports" value={counts?.citizenReports ?? 0} />
          <CountRow label="Emergency records" value={counts?.emergencyIncidents ?? 0} />
          <View style={styles.divider} />
          <CountRow label="Total pending" value={counts?.total ?? 0} emphasize />
        </GlassCard>

        {/* Last sync */}
        {lastResult ? (
          <>
            <Text style={styles.sectionLabel}>LAST SYNC</Text>
            <GlassCard style={styles.card}>
              <Text style={styles.meta}>
                {new Date(lastResult.ranAt).toLocaleString()}
              </Text>
              <Text style={styles.meta}>
                Uploaded {lastResult.totalPushed} · Failed {lastResult.totalFailed}
              </Text>
              {lastResult.reason ? (
                <Text style={styles.meta}>Status: {labelForReason(lastResult.reason)}</Text>
              ) : null}
            </GlassCard>
          </>
        ) : null}

        <Button
          label={syncing ? 'Syncing…' : 'Sync Now'}
          onPress={handleSync}
          loading={syncing}
          disabled={syncing}
          size="lg"
          icon={<RefreshCw size={18} color="#fff" />}
          style={{ marginTop: Spacing.md }}
          accessibilityLabel="Sync local data to cloud backup now"
        />

        <Text style={styles.footnote}>
          Your data is always saved on this device first. Sync never deletes local data — failed
          uploads are kept and retried automatically.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusRow({ ok, okLabel, failLabel }: { ok: boolean; okLabel: string; failLabel: string }) {
  return (
    <View style={styles.statusRow}>
      {ok ? (
        <CheckCircle2 size={20} color={Colors.status.success} />
      ) : (
        <CloudOff size={20} color={Colors.text.muted} />
      )}
      <Text style={[styles.statusText, { color: ok ? Colors.text.primary : Colors.text.secondary }]}>
        {ok ? okLabel : failLabel}
      </Text>
    </View>
  );
}

function CountRow({ label, value, emphasize }: { label: string; value: number; emphasize?: boolean }) {
  return (
    <View style={styles.countRow}>
      <Text style={[styles.countLabel, emphasize && styles.countLabelEmphasize]}>{label}</Text>
      <Text style={[styles.countValue, value > 0 && styles.countValuePending]}>{value}</Text>
    </View>
  );
}

function labelForReason(reason: NonNullable<SyncResult['reason']>): string {
  switch (reason) {
    case 'not-configured':
      return 'Backend not configured';
    case 'not-signed-in':
      return 'Not signed in';
    case 'nothing-pending':
      return 'Up to date';
    case 'completed':
      return 'Completed';
    default:
      return reason;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: Spacing.md, paddingBottom: 80 },
  intro: { ...Typography.bodySm, color: Colors.text.secondary, marginBottom: Spacing.md, lineHeight: 20 },
  sectionLabel: {
    ...Typography.overline,
    color: Colors.text.muted,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
    marginLeft: 4,
  },
  card: { marginBottom: Spacing.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusText: { ...Typography.titleSm, flex: 1 },
  meta: { ...Typography.caption, color: Colors.text.muted, marginTop: 6 },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  countLabel: { ...Typography.bodyMd, color: Colors.text.secondary },
  countLabelEmphasize: { ...Typography.titleSm, color: Colors.text.primary },
  countValue: { ...Typography.titleSm, color: Colors.text.muted },
  countValuePending: { color: Colors.brand.tealLight },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: 8 },
  footnote: { ...Typography.caption, color: Colors.text.muted, marginTop: Spacing.lg, lineHeight: 18, textAlign: 'center' },
});
