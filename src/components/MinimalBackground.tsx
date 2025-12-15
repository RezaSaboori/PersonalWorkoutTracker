// src/components/MinimalBackground.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/design-system';

export const MinimalBackground = () => {
  return (
    <View style={styles.container} />
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg.app,
  },
});

