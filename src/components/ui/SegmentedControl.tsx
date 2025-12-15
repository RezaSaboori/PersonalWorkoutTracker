// src/components/ui/SegmentedControl.tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../theme/design-system';

interface SegmentedControlOption {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  style?: any;
}

export const SegmentedControl = ({
  options,
  selectedValue,
  onValueChange,
  style,
}: SegmentedControlProps) => {
  const selectedIndex = options.findIndex(opt => opt.value === selectedValue);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.segmentedContainer}>
        {options.map((option, index) => {
          const isSelected = option.value === selectedValue;
          const isFirst = index === 0;
          const isLast = index === options.length - 1;

          return (
            <Pressable
              key={option.value}
              onPress={() => onValueChange(option.value)}
              style={({ pressed }) => [
                styles.segment,
                isFirst && styles.segmentFirst,
                isLast && styles.segmentLast,
                isSelected && styles.segmentSelected,
                pressed && !isSelected && { opacity: 0.7 },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  isSelected && styles.segmentTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentFirst: {
    borderTopLeftRadius: radius.sm,
    borderBottomLeftRadius: radius.sm,
  },
  segmentLast: {
    borderTopRightRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
  segmentSelected: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.sm,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  segmentTextSelected: {
    color: colors.text.primary,
    fontWeight: '600',
  },
});

