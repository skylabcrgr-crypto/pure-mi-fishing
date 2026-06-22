import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Shadows } from '../../design/tokens';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  elevated?: boolean;
}

export function GlassCard({ children, style, padded = true, elevated = false }: GlassCardProps) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        elevated && Shadows.elevated,
        !elevated && Shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  padded: {
    padding: 16,
  },
});
