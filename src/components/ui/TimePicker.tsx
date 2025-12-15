// src/components/ui/TimePicker.tsx
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { colors, spacing, textStyles, radius } from '../../theme/design-system';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

interface TimePickerProps {
  initialSeconds: number;
  minSeconds?: number;
  maxSeconds?: number;
  step?: number; // Step in seconds (e.g., 5 for 5-second increments)
  onValueChange: (seconds: number) => void;
  onClose: () => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  initialSeconds,
  minSeconds = 5,
  maxSeconds = 600,
  step = 5,
  onValueChange,
  onClose,
}) => {
  const [selectedSeconds, setSelectedSeconds] = useState(initialSeconds);
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate time options
  const timeOptions: number[] = [];
  for (let seconds = minSeconds; seconds <= maxSeconds; seconds += step) {
    timeOptions.push(seconds);
  }

  // Find initial index
  const initialIndex = timeOptions.findIndex(
    (val) => val >= initialSeconds
  ) || 0;

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleScroll = (event: any) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, timeOptions.length - 1));
    const newValue = timeOptions[clampedIndex];
    
    if (newValue !== selectedSeconds) {
      setSelectedSeconds(newValue);
      // Only update on scroll end, not during scrolling
    }
  };

  const handleConfirm = () => {
    onValueChange(selectedSeconds);
    onClose();
  };

  // Scroll to initial position
  React.useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: initialIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  }, []);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Set Duration</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.doneButton}>
            <Text style={styles.doneText}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerContainer}>
          <View style={styles.pickerWrapper}>
            <View style={styles.selectionIndicator} />
            <ScrollView
              ref={scrollViewRef}
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={handleScroll}
              onScrollEndDrag={handleScroll}
            >
              {/* Top padding items */}
              {Array.from({ length: Math.floor(VISIBLE_ITEMS / 2) }).map((_, i) => (
                <View key={`top-${i}`} style={styles.pickerItem} />
              ))}

              {/* Time options */}
              {timeOptions.map((seconds, index) => {
                const isSelected = seconds === selectedSeconds;
                return (
                  <View key={seconds} style={styles.pickerItem}>
                    <Text
                      style={[
                        styles.pickerItemText,
                        isSelected && styles.pickerItemTextSelected,
                      ]}
                    >
                      {formatTime(seconds)}
                    </Text>
                  </View>
                );
              })}

              {/* Bottom padding items */}
              {Array.from({ length: Math.floor(VISIBLE_ITEMS / 2) }).map((_, i) => (
                <View key={`bottom-${i}`} style={styles.pickerItem} />
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  container: {
    backgroundColor: colors.bg.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    paddingBottom: spacing.xl,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.subtle,
  },
  cancelButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  title: {
    ...textStyles.h3,
  },
  doneButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  doneText: {
    ...textStyles.body,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  pickerContainer: {
    height: PICKER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  pickerWrapper: {
    width: '100%',
    height: PICKER_HEIGHT,
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: (VISIBLE_ITEMS - 1) * ITEM_HEIGHT / 2,
    left: spacing.lg,
    right: spacing.lg,
    height: ITEM_HEIGHT,
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.accent.primary + '40',
    zIndex: 1,
    pointerEvents: 'none',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: (VISIBLE_ITEMS - 1) * ITEM_HEIGHT / 2,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 2,
  },
  pickerItemText: {
    ...textStyles.body,
    color: colors.text.tertiary,
    fontSize: 18,
    zIndex: 2,
  },
  pickerItemTextSelected: {
    color: colors.accent.primary,
    fontWeight: '700',
    fontSize: 22,
    zIndex: 2,
  },
});

