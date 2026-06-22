import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Radius, Shadows } from '../../design/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary:   { bg: Colors.brand.orange,   text: '#fff' },
  secondary: { bg: Colors.bg.elevated,    text: Colors.text.primary, border: Colors.border },
  ghost:     { bg: 'transparent',         text: Colors.text.accent },
  danger:    { bg: Colors.status.danger,  text: '#fff' },
  outline:   { bg: 'transparent',         text: Colors.text.primary, border: Colors.text.secondary },
};

const SIZE_STYLES: Record<ButtonSize, { height: number; fontSize: number; paddingH: number; radius: number }> = {
  sm: { height: 36, fontSize: 13, paddingH: 16, radius: Radius.sm },
  md: { height: 44, fontSize: 15, paddingH: 20, radius: Radius.md },
  lg: { height: 52, fontSize: 16, paddingH: 24, radius: Radius.lg },
  xl: { height: 60, fontSize: 18, paddingH: 28, radius: Radius.xl },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const v = VARIANT_STYLES[variant];
  const s = SIZE_STYLES[size];

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.75}
      disabled={disabled || loading}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          height: s.height,
          paddingHorizontal: s.paddingH,
          borderRadius: s.radius,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border ?? 'transparent',
          opacity: disabled ? 0.45 : 1,
        },
        variant === 'primary' && Shadows.glow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: v.text, fontSize: s.fontSize }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontWeight: '700',
  },
});
