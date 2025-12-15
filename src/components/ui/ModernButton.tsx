// src/components/ui/ModernButton.tsx
// iOS 18+ Liquid Glass Button
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing, calculateNestedRadius, shadows, textStyles } from '../../theme/design-system';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'large' | 'medium' | 'small';

interface ModernButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  active?: boolean;
}

export const ModernButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  active = false,
}: ModernButtonProps) => {
  const buttonRadius = radius.md; // 20px for buttons
  const buttonPadding = spacing.sm; // 12px padding
  
  const getButtonStyles = (): ViewStyle[] => {
    const baseStyle: ViewStyle = {
      borderRadius: buttonRadius,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
    };

    // Size-based styles
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      large: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        minHeight: 56,
      },
      medium: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        minHeight: 48,
      },
      small: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        minHeight: 40,
      },
    };

    // Variant-based styles (glass effect handles background)
    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: 'transparent', // Glass effect handles background
        borderColor: active ? colors.accent.primary : 'rgba(255, 255, 255, 0.2)',
        overflow: 'hidden',
        ...(active && shadows.soft),
      },
      secondary: {
        backgroundColor: 'transparent', // Glass effect handles background
        borderColor: 'rgba(255, 255, 255, 0.15)',
        overflow: 'hidden',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
      },
    };

    return [
      baseStyle,
      sizeStyles[size],
      variantStyles[variant],
      disabled && { opacity: 0.5 },
      style,
    ];
  };

  const getTextStyles = (): TextStyle[] => {
    const variantTextStyles: Record<ButtonVariant, TextStyle> = {
      primary: {
        color: active ? colors.bg.app : colors.accent.primary,
        fontWeight: '600',
      },
      secondary: {
        color: colors.text.primary,
        fontWeight: '600',
      },
      ghost: {
        color: colors.text.secondary,
        fontWeight: '600',
      },
    };

    const sizeTextStyles: Record<ButtonSize, TextStyle> = {
      large: { fontSize: 17 },
      medium: { fontSize: 15 },
      small: { fontSize: 13 },
    };

    return [
      variantTextStyles[variant],
      sizeTextStyles[size],
      textStyle,
    ];
  };

  const getBlurIntensity = () => {
    if (variant === 'primary' && active) return Platform.OS === 'ios' ? 100 : 80;
    if (variant === 'primary') return Platform.OS === 'ios' ? 80 : 60;
    return Platform.OS === 'ios' ? 60 : 40;
  };

  const getBlurTint = () => {
    if (variant === 'primary' && active) {
      return Platform.OS === 'ios' ? 'systemMaterialDark' : 'dark';
    }
    return Platform.OS === 'ios' ? 'systemThinMaterialDark' : 'dark';
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        ...getButtonStyles(),
        pressed && !disabled && { opacity: 0.8 },
      ]}
    >
      {/* iOS 18+ Liquid Glass Background */}
      <BlurView
        intensity={getBlurIntensity()}
        tint={getBlurTint()}
        style={StyleSheet.absoluteFill}
      />
      {variant === 'primary' && active && (
        <View 
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.accent.primary, opacity: 0.2 }
          ]} 
        />
      )}
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' && active ? colors.bg.app : colors.accent.primary} 
        />
      ) : (
        <Text style={getTextStyles()}>{title}</Text>
      )}
    </Pressable>
  );
};

// Helper for nested radius in button children
export function getNestedRadiusForButton(innerPadding: number = 0): number {
  return calculateNestedRadius(radius.md, spacing.sm + innerPadding);
}

