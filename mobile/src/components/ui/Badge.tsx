import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius } from '../../design/tokens';

type BadgeVariant = 'default' | 'teal' | 'orange' | 'forest' | 'sand' | 'danger' | 'warning';

import type { ViewStyle } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  default: { bg: 'rgba(21,101,192,0.18)', text: '#4FC3F7', border: 'rgba(79,195,247,0.25)' },
  teal:    { bg: 'rgba(0,172,193,0.18)',  text: '#4FC3F7', border: 'rgba(0,172,193,0.30)' },
  orange:  { bg: 'rgba(255,107,53,0.18)', text: '#FF8F65', border: 'rgba(255,107,53,0.30)' },
  forest:  { bg: 'rgba(27,94,32,0.28)',   text: '#81C784', border: 'rgba(129,199,132,0.25)' },
  sand:    { bg: 'rgba(212,168,83,0.18)', text: '#D4A853', border: 'rgba(212,168,83,0.30)' },
  danger:  { bg: 'rgba(244,67,54,0.16)',  text: '#EF9A9A', border: 'rgba(244,67,54,0.28)' },
  warning: { bg: 'rgba(255,152,0,0.18)',  text: '#FFB74D', border: 'rgba(255,152,0,0.30)' },
};

export function Badge({ label, variant = 'default', size = 'md', style }: BadgeProps) {
  const v = VARIANT_STYLES[variant];
  const isSmall = size === 'sm';
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          paddingHorizontal: isSmall ? 8 : 10,
          paddingVertical: isSmall ? 2 : 4,
        },
        style,
      ]}
    >
      <Text style={[styles.label, { color: v.text, fontSize: isSmall ? 10 : 12 }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
