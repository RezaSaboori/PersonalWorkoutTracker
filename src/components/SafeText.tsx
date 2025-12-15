// src/components/SafeText.tsx
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface SafeTextProps extends TextProps {
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  children: React.ReactNode;
}

/**
 * SafeText component that prevents text overflow by default
 * Use this instead of Text for any text that might overflow
 */
export const SafeText = ({ 
  numberOfLines = 1, 
  ellipsizeMode = 'tail',
  style,
  children,
  ...props 
}: SafeTextProps) => {
  return (
    <Text
      style={[styles.default, style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  default: {
    // Default styles can be added here if needed
  },
});
