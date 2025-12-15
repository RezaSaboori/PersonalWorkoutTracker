// src/components/ui/ModernCard.tsx
// iOS 18+ Liquid Glass Card
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, cardRadius, cardPadding, calculateNestedRadius, shadows } from '../../theme/design-system';

type CardVariant = 'hero' | 'content' | 'compact';

interface ModernCardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevated?: boolean;
}

interface ModernCardContentProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const ModernCardComponent = ({ 
  children, 
  variant = 'content', 
  style,
  onPress,
  elevated = false 
}: ModernCardProps) => {
  const radius = cardRadius[variant];
  const padding = cardPadding[variant];
  
  const cardStyle = [
    styles.card,
    {
      borderRadius: radius,
      padding: 0, // Padding handled by content wrapper
      backgroundColor: 'transparent', // Glass effect handles background
      borderColor: 'rgba(255, 255, 255, 0.15)', // Enhanced for glass effect
      overflow: 'hidden',
    },
    elevated && shadows.soft,
    style,
  ];

  const contentStyle = {
    padding,
  };

  const cardContent = (
    <>
      {/* iOS 18+ Liquid Glass Background */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 60}
        tint={Platform.OS === 'ios' ? 'systemThinMaterialDark' : 'dark'}
        style={StyleSheet.absoluteFill}
      />
      <View style={contentStyle}>
        {children}
      </View>
    </>
  );

  if (onPress) {
    const Pressable = require('react-native').Pressable;
    return (
      <Pressable onPress={onPress} style={cardStyle}>
        {cardContent}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle}>
      {cardContent}
    </View>
  );
};

const ModernCardContent = ({ children, style }: ModernCardContentProps) => {
  // Content automatically gets nested radius calculation
  // This is for inner elements that need their own radius
  return (
    <View style={style}>
      {children}
    </View>
  );
};

// Attach Content as a sub-component
ModernCardComponent.Content = ModernCardContent;

export const ModernCard = ModernCardComponent;

// Helper to get nested radius for inner elements
export function getNestedRadiusForCard(variant: CardVariant, innerPadding: number = 0): number {
  const outerRadius = cardRadius[variant];
  const outerPadding = cardPadding[variant];
  // If inner element has its own padding, calculate from the content area
  return calculateNestedRadius(outerRadius - outerPadding, innerPadding);
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginBottom: 0, // Spacing handled by parent containers
  },
});

