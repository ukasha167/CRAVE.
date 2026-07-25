import { ViewStyle } from 'react-native';

/**
 * CRAVE. Design System
 * Minimalist editorial layout · Brutalist ALL-CAPS typography
 */

export const Colors = {
  /** Primary text, headings */
  ink: '#1A1A1A',
  /** Page backgrounds */
  surface: '#FAFAF8',
  /** Card / elevated surfaces */
  card: '#FFFFFF',
  /** Secondary text, placeholders */
  muted: '#8E8E93',
  /** Lighter muted for disabled states */
  mutedLight: '#C7C7CC',
  /** Subtle dividers, skeleton backgrounds */
  border: '#F0EFED',
  /** CTAs, prices, badges — warm terracotta */
  accent: '#C45D4A',
  /** Light accent tint for tags, badges */
  accentSoft: '#FDF0ED',
  /** Confirmation, success states */
  success: '#2D6A4F',
  /** Success screen background tint */
  successSoft: '#EDF7F0',
  /** Destructive actions */
  danger: '#DC3545',
  /** Light danger tint */
  dangerSoft: '#FEF2F2',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  } as ViewStyle,
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } as ViewStyle,
} as const;

export const Animation = {
  fast: 200,
  normal: 300,
  slow: 500,
} as const;
