import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ShoppingBag, ExternalLink, Shield, Fish, Info } from 'lucide-react-native';
import { GlassCard } from '../src/components/ui/GlassCard';
import { Colors, Typography, Spacing, Radius, Gradients } from '../src/design/tokens';

const LICENSE_URL = 'https://www.michigan.gov/dnr/licenses-and-permits/fishing-licenses';

const LICENSE_TYPES = [
  { name: 'Annual Fishing License – Resident', price: '$26', note: 'Michigan residents' },
  { name: 'Annual Fishing License – Non-Resident', price: '$76', note: 'Out-of-state anglers' },
  { name: '24-Hour License – Resident', price: '$9', note: 'Single day' },
  { name: '24-Hour License – Non-Resident', price: '$11', note: 'Single day' },
  { name: 'Inland Trout/Salmon Stamp', price: '$14', note: 'Required for trout/salmon inland' },
  { name: 'Great Lakes Trout/Salmon Stamp', price: '$14', note: 'Required on Great Lakes' },
  { name: 'Lake Erie Charter Stamp', price: '$11', note: 'Charter boats on Lake Erie' },
];

export default function LicenseScreen() {
  const handleBuy = () => {
    Linking.openURL(LICENSE_URL).catch(() =>
      Alert.alert('Browser error', 'Visit michigan.gov/dnr to purchase a fishing license.'),
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <LinearGradient colors={['#003DA5', '#1565C0']} style={styles.hero}>
          <Shield size={36} color="#CDA323" />
          <Text style={styles.heroTitle}>Michigan Fishing License</Text>
          <Text style={styles.heroBody}>
            Purchase directly from the official Michigan DNR. Pure MI Fishing is an independent app and never handles payments.
          </Text>
        </LinearGradient>

        <Text style={styles.sectionLabel}>2025 LICENSE FEES</Text>
        <GlassCard style={styles.tableCard} padded={false}>
          {LICENSE_TYPES.map((item, i) => (
            <View
              key={item.name}
              style={[styles.tableRow, i < LICENSE_TYPES.length - 1 && styles.tableRowBorder]}
            >
              <View style={styles.tableText}>
                <Text style={styles.tableName}>{item.name}</Text>
                <Text style={styles.tableNote}>{item.note}</Text>
              </View>
              <Text style={styles.tablePrice}>{item.price}</Text>
            </View>
          ))}
        </GlassCard>

        <TouchableOpacity
          style={styles.buyBtn}
          onPress={handleBuy}
          accessibilityLabel="Buy Michigan Fishing License on the DNR website"
        >
          <LinearGradient colors={['#003DA5', '#1565C0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.buyGradient}>
            <ShoppingBag size={20} color="#CDA323" />
            <Text style={styles.buyBtnText}>Buy on Michigan DNR</Text>
            <ExternalLink size={16} color="#CDA323" />
          </LinearGradient>
        </TouchableOpacity>

        <GlassCard style={styles.reminderCard}>
          <View style={styles.reminderRow}>
            <Fish size={18} color={Colors.brand.orange} />
            <Text style={styles.reminderTitle}>Carry your license</Text>
          </View>
          <Text style={styles.reminderBody}>
            Always carry proof of your fishing license when on the water. Michigan Conservation Officers check regularly.
          </Text>
        </GlassCard>

        <GlassCard style={styles.disclaimerCard}>
          <View style={styles.reminderRow}>
            <Info size={16} color={Colors.brand.sand} />
            <Text style={[styles.reminderTitle, { color: Colors.brand.sand }]}>Independent App Notice</Text>
          </View>
          <Text style={styles.reminderBody}>
            Pure MI Fishing is not affiliated with the Michigan DNR. All license purchase transactions occur directly on the official michigan.gov website.
          </Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { paddingBottom: Spacing.xxl },
  hero: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  heroTitle: { ...Typography.titleLg, color: '#fff', textAlign: 'center' },
  heroBody: { ...Typography.bodyMd, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 21 },
  sectionLabel: { ...Typography.overline, color: Colors.text.muted, paddingHorizontal: Spacing.md, marginTop: Spacing.lg, marginBottom: Spacing.sm },
  tableCard: { marginHorizontal: Spacing.md },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: Spacing.md },
  tableRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.divider },
  tableText: { flex: 1 },
  tableName: { ...Typography.label, color: Colors.text.primary },
  tableNote: { ...Typography.caption, color: Colors.text.muted, marginTop: 2 },
  tablePrice: { ...Typography.titleSm, color: Colors.brand.tealLight },
  buyBtn: { margin: Spacing.md, borderRadius: Radius.lg, overflow: 'hidden' },
  buyGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 16,
  },
  buyBtnText: { ...Typography.titleMd, color: '#fff' },
  reminderCard: { marginHorizontal: Spacing.md, marginBottom: Spacing.sm, gap: 8 },
  reminderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reminderTitle: { ...Typography.titleSm, color: Colors.brand.orange },
  reminderBody: { ...Typography.bodyMd, color: Colors.text.secondary, lineHeight: 21 },
  disclaimerCard: { marginHorizontal: Spacing.md, gap: 8 },
});
