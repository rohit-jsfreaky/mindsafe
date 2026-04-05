import { TextStyle } from 'react-native';

export const colors = {
  // Core palette — derived from the HTML design tokens
  background: '#F7F5F0',
  surface: '#FFFFFF',
  surfaceMuted: '#EDE9E1',
  surfaceCard: 'rgba(255,255,255,0.4)', // bg-white/40 cards
  surfaceCardSolid: 'rgba(255,255,255,0.5)', // bg-white/50 hero
  primary: '#3D6B4F',           // primary-container / button green
  primaryDark: '#255338',       // primary / darker accent
  primaryLight: '#BCEECB',      // primary-fixed
  accent: '#3D6B4F',
  textPrimary: '#2C2926',
  textSecondary: '#908981',
  textTertiary: '#B0A99F',
  divider: '#E2DED6',
  iconCircleBg: '#FFFFFF',

  mood: {
    awful: '#C4634F',
    bad: '#D4A54A',
    okay: '#B8B06C',
    good: '#7BAF6E',
    great: '#3D6B4F',
  },

  chart: {
    line: '#3D6B4F',
    barBackground: '#E8F0E5',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,
  full: 9999,
} as const;

export const typography: Record<string, TextStyle> = {
  heading1: {
    fontSize: 32,
    fontWeight: '500',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  heading2: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textTertiary,
  },
};

export const moodColors = [
  colors.mood.awful,
  colors.mood.bad,
  colors.mood.okay,
  colors.mood.good,
  colors.mood.great,
] as const;
