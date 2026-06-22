// Pure MI Fishing — Design Tokens
// Michigan-inspired premium outdoors palette
// NOT affiliated with official Michigan DNR or Pure Michigan branding

export const Colors = {
  bg: {
    primary:  '#0A1628',  // dark navy
    surface:  '#0F1E35',  // navy surface
    card:     '#162540',  // card background
    elevated: '#1A2E4A',  // elevated card
    input:    '#1E3554',  // input field
  },
  brand: {
    blue:       '#1565C0',  // Michigan blue
    blueLight:  '#1E88E5',
    teal:       '#00ACC1',  // freshwater teal
    tealLight:  '#4FC3F7',
    orange:     '#FF6B35',  // safety orange
    orangeLight:'#FF8F65',
    forest:     '#1B5E20',  // forest green
    forestLight:'#2E7D32',
    sand:       '#D4A853',  // warm sand
  },
  text: {
    primary:  '#F5F5F0',
    secondary:'rgba(245,245,240,0.72)',
    muted:    'rgba(245,245,240,0.40)',
    accent:   '#4FC3F7',
    orange:   '#FF6B35',
  },
  border:    'rgba(79,195,247,0.14)',
  divider:   'rgba(245,245,240,0.08)',
  glass:     'rgba(22,37,64,0.88)',
  overlay:   'rgba(10,22,40,0.75)',
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    danger:  '#F44336',
    info:    '#29B6F6',
  },
  map: {
    launch:  '#1565C0',
    hotspot: '#FF6B35',
    access:  '#00ACC1',
    hazard:  '#F44336',
  },
} as const;

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  '3xl': 64,
} as const;

export const Radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
} as const;

export const Typography = {
  displayLg: { fontSize: 34, fontWeight: '800' as const, letterSpacing: -0.5, lineHeight: 40 },
  displayMd: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.3, lineHeight: 34 },
  titleLg:   { fontSize: 22, fontWeight: '700' as const, lineHeight: 28 },
  titleMd:   { fontSize: 18, fontWeight: '600' as const, lineHeight: 24 },
  titleSm:   { fontSize: 16, fontWeight: '600' as const, lineHeight: 22 },
  bodyLg:    { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyMd:    { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  bodySm:    { fontSize: 12, fontWeight: '400' as const, lineHeight: 17 },
  label:     { fontSize: 13, fontWeight: '600' as const, lineHeight: 18 },
  caption:   { fontSize: 11, fontWeight: '500' as const, lineHeight: 15, letterSpacing: 0.4 },
  overline:  { fontSize: 11, fontWeight: '700' as const, letterSpacing: 1.0, textTransform: 'uppercase' as const },
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 8,
    elevation: 8,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.42,
    shadowRadius: 16,
    elevation: 16,
  },
  glow: {
    shadowColor: '#4FC3F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// Gradient presets — typed as tuples for expo-linear-gradient compatibility
export const Gradients = {
  hero:     ['#0A1628', '#0F2744', '#1565C0'] as [string, string, string],
  teal:     ['#004D61', '#00ACC1', '#4FC3F7'] as [string, string, string],
  card:     ['#162540', '#0F1E35'] as [string, string],
  orange:   ['#E64A19', '#FF6B35', '#FF8F65'] as [string, string, string],
  forest:   ['#1B3A2A', '#1B5E20', '#2E7D32'] as [string, string, string],
  tripMode: ['#040D1A', '#0A1628'] as [string, string],
} as const;
