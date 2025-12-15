// src/theme/design-system.ts
// Complete modern minimalist design system with mathematical border radius harmony

import { StyleSheet, TextStyle } from 'react-native';

// ============================================================================
// COLORS - Softer & Sophisticated
// ============================================================================

export const colors = {
  // Backgrounds - Layered depth
  bg: {
    app: '#0a0a0a',           // Deep base
    surface: '#141414',        // Raised surface
    elevated: '#1a1a1a',       // Cards
    float: '#1f1f1f',          // Floating elements (dock, modals)
  },
  
  // Text - Readable hierarchy
  text: {
    primary: '#f5f5f5',        // Headers
    secondary: '#b5b5b5',      // Body
    tertiary: '#787878',       // Captions
    disabled: '#4a4a4a',       // Disabled states
  },
  
  // Accents - Muted & Premium
  accent: {
    primary: '#5dd9b3',        // Softer cyan (was #4fffc2)
    secondary: '#9b7fd6',      // Softer purple (was #c084fc)
    info: '#6ba5e8',           // Softer blue (was #60a5fa)
    success: '#6dd9b3',        // Success states
    warning: '#e8b86b',        // Warning states
    error: '#e86b6b',          // Error/critical (was #ff6b6b)
  },
  
  // Borders - Almost invisible
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',    // Default borders
    medium: 'rgba(255, 255, 255, 0.1)',     // Hover/focus
    strong: 'rgba(255, 255, 255, 0.15)',    // Active states
  },
} as const;

// ============================================================================
// SPACING - Dramatic Breathing Room
// ============================================================================

export const spacing = {
  xs: 8,      // Tight internal spacing
  sm: 12,     // Button padding
  md: 16,     // Card internal elements
  lg: 24,     // Card padding
  xl: 32,     // Section gaps
  xxl: 48,    // Major section gaps
} as const;

// ============================================================================
// BORDER RADIUS - Mathematical Harmony System
// ============================================================================

export const radius = {
  sm: 16,     // Small elements
  md: 20,     // Buttons
  lg: 24,     // Standard cards
  xl: 28,     // Dock
  xxl: 32,    // Hero cards
} as const;

/**
 * Calculate nested border radius based on the golden rule:
 * Inner radius = Outer radius - Padding
 * 
 * @param outerRadius - The border radius of the outer container
 * @param padding - The padding of the outer container
 * @returns The calculated inner border radius
 * 
 * @example
 * // Container with 32px radius and 24px padding
 * const innerRadius = calculateNestedRadius(32, 24); // Returns 8
 */
export function calculateNestedRadius(outerRadius: number, padding: number): number {
  return Math.max(0, outerRadius - padding);
}

/**
 * Get border radius for card variants
 */
export const cardRadius = {
  hero: radius.xxl,      // 32px
  content: radius.lg,    // 24px
  compact: radius.md,    // 20px
  pill: radius.sm,       // 16px
} as const;

/**
 * Get padding for card variants
 */
export const cardPadding = {
  hero: spacing.lg,      // 24px
  content: spacing.md,   // 16px
  compact: spacing.sm,  // 12px
  pill: spacing.xs,      // 8px
} as const;

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================

export const typography = {
  hero: {
    fontSize: 32,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 38,
  },
  h1: {
    fontSize: 24,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 32,
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 28,
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 24,
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 18,
  },
  tiny: {
    fontSize: 11,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 14,
  },
} as const;

// ============================================================================
// SHADOW / ELEVATION SYSTEM
// ============================================================================

export const shadows = {
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ============================================================================
// ANIMATION TIMING
// ============================================================================

export const timing = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// ============================================================================
// TEXT STYLES (React Native StyleSheet compatible)
// ============================================================================

export const textStyles = StyleSheet.create({
  hero: {
    ...typography.hero,
    color: colors.text.primary,
  },
  h1: {
    ...typography.h1,
    color: colors.text.primary,
  },
  h2: {
    ...typography.h2,
    color: colors.text.primary,
  },
  h3: {
    ...typography.h3,
    color: colors.text.primary,
  },
  body: {
    ...typography.body,
    color: colors.text.secondary,
  },
  caption: {
    ...typography.caption,
    color: colors.text.tertiary,
  },
  tiny: {
    ...typography.tiny,
    color: colors.text.tertiary,
  },
});

