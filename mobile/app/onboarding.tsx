import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, FlatList, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Download, BookOpen, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../src/store/useAppStore';
import { Colors, Typography, Spacing, Radius, Gradients } from '../src/design/tokens';

const { width: SCREEN_W } = Dimensions.get('window');

const CARDS = [
  {
    icon: MapPin,
    title: 'Know what\'s nearby',
    body: 'Detroit River boat launches, shore access points, and fishing hotspots — pinned and ready without cell signal.',
    gradient: Gradients.teal,
  },
  {
    icon: Download,
    title: 'Save Detroit River packs offline',
    body: 'Download the full Detroit River pack: maps, regulations, launch details, and conditions — then fish from anywhere.',
    gradient: Gradients.hero,
  },
  {
    icon: BookOpen,
    title: 'Check rules before you cast',
    body: 'Simplified regulation summaries for walleye, bass, perch, muskie, and more. Always links to official DNR source.',
    gradient: Gradients.forest,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const [currentPage, setCurrentPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleExplore = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await completeOnboarding();
    router.replace('/(tabs)/explore');
  };

  const handleLater = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/explore');
  };

  return (
    <LinearGradient colors={['#04080F', '#0A1628', '#0F2744']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>🎣 Pure MI Fishing</Text>
          <Text style={styles.independentLabel}>Independent Michigan fishing companion</Text>
          <Text style={styles.heroTitle}>Michigan fishing maps,{'\n'}rules, and trip tools{'\n'}
            <Text style={styles.heroAccent}>built for the water.</Text>
          </Text>
        </View>

        {/* Feature cards */}
        <FlatList
          ref={flatListRef}
          data={CARDS}
          keyExtractor={(_, i) => String(i)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
            setCurrentPage(page);
          }}
          renderItem={({ item }) => {
            const Icon = item.icon;
            return (
              <View style={styles.cardWrapper}>
                <LinearGradient colors={item.gradient as [string, string, ...string[]]} style={styles.featureCard}>
                  <View style={styles.iconCircle}>
                    <Icon size={28} color="#fff" />
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardBody}>{item.body}</Text>
                </LinearGradient>
              </View>
            );
          }}
          style={styles.carousel}
        />

        {/* Dots */}
        <View style={styles.dotsRow}>
          {CARDS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === currentPage && styles.dotActive]}
            />
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Pure MI Fishing is an independent app — not affiliated with the Michigan DNR, State of Michigan, or Pure Michigan campaign. Always verify regulations at michigan.gov/dnr.
          </Text>
        </View>

        {/* CTAs */}
        <View style={styles.ctaBlock}>
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={handleExplore}
            accessibilityLabel="Explore Detroit River"
          >
            <Text style={styles.primaryCTAText}>Explore Detroit River</Text>
            <ChevronRight size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryCTA}
            onPress={handleLater}
            accessibilityLabel="Set up later"
          >
            <Text style={styles.secondaryCTAText}>Set up later</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  appName: { ...Typography.overline, color: Colors.text.accent, marginBottom: 4 },
  independentLabel: {
    ...Typography.caption,
    color: 'rgba(79,195,247,0.65)',
    marginBottom: Spacing.md,
    fontStyle: 'italic',
  },
  heroTitle: {
    ...Typography.displayMd,
    color: Colors.text.primary,
    lineHeight: 36,
  },
  heroAccent: { color: Colors.brand.orange },
  carousel: { marginTop: Spacing.lg, flexGrow: 0 },
  cardWrapper: {
    width: SCREEN_W,
    paddingHorizontal: Spacing.lg,
  },
  featureCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    minHeight: 180,
    justifyContent: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: { ...Typography.titleLg, color: '#fff', marginBottom: 8 },
  cardBody: { ...Typography.bodyMd, color: 'rgba(255,255,255,0.82)', lineHeight: 21 },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(245,245,240,0.28)',
  },
  dotActive: { backgroundColor: Colors.brand.orange, width: 18 },
  disclaimer: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: 'rgba(255,107,53,0.08)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.20)',
  },
  disclaimerText: { ...Typography.caption, color: Colors.text.secondary, lineHeight: 16 },
  ctaBlock: { padding: Spacing.lg, gap: Spacing.sm },
  primaryCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.brand.orange,
    borderRadius: Radius.lg,
    height: 56,
    shadowColor: Colors.brand.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryCTAText: { ...Typography.titleMd, color: '#fff' },
  secondaryCTA: { alignItems: 'center', padding: Spacing.sm },
  secondaryCTAText: { ...Typography.label, color: Colors.text.secondary },
});
