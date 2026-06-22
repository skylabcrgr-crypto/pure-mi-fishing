import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../design/tokens';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} accessibilityLabel={actionLabel}>
          <Text style={styles.action}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    ...Typography.titleMd,
    color: Colors.text.primary,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.text.muted,
    marginTop: 2,
  },
  action: {
    ...Typography.label,
    color: Colors.text.accent,
  },
});
