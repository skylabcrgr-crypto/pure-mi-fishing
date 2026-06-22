import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, MapPin, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { GlassCard } from '../ui/GlassCard';
import { Colors, Typography, Spacing } from '../../design/tokens';
import { formatDate, formatDuration } from '../../utils/format';
import type { Trip } from '../../types';

interface TripCardProps {
  trip: Trip;
  onPress?: () => void;
}

export function TripCard({ trip, onPress }: TripCardProps) {
  const router = useRouter();
  const handlePress = () => {
    if (onPress) { onPress(); }
    else { router.push(`/trip-mode/${trip.id}`); }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.82}
      accessibilityLabel={`Trip: ${trip.title}`}
    >
      <GlassCard style={styles.card}>
        {trip.isActive && (
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeLabel}>Active</Text>
          </View>
        )}
        <Text style={styles.title} numberOfLines={1}>{trip.title}</Text>
        <View style={styles.meta}>
          <View style={styles.metaRow}>
            <MapPin size={12} color={Colors.text.muted} />
            <Text style={styles.metaText}>{trip.waterbodyName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Calendar size={12} color={Colors.text.muted} />
            <Text style={styles.metaText}>{formatDate(trip.startTime)}</Text>
          </View>
          {trip.endTime && (
            <View style={styles.metaRow}>
              <Clock size={12} color={Colors.text.muted} />
              <Text style={styles.metaText}>{formatDuration(trip.startTime, trip.endTime)}</Text>
            </View>
          )}
        </View>
        {trip.notes ? (
          <Text style={styles.notes} numberOfLines={2}>{trip.notes}</Text>
        ) : null}
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: Spacing.sm },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(76,175,80,0.18)',
    alignSelf: 'flex-start',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(76,175,80,0.30)',
  },
  activeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.status.success },
  activeLabel: { ...Typography.caption, color: Colors.status.success },
  title: { ...Typography.titleSm, color: Colors.text.primary, marginBottom: 8 },
  meta: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { ...Typography.bodySm, color: Colors.text.secondary },
  notes: { ...Typography.bodySm, color: Colors.text.secondary, marginTop: 8, lineHeight: 17 },
});
