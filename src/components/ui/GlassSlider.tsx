// src/components/ui/GlassSlider.tsx
// iOS 18+ Liquid Glass Slider Component
import React, { useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing } from '../../theme/design-system';

interface GlassSliderProps {
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  label?: string;
  unit?: string;
  disabled?: boolean;
  style?: any;
}

export const GlassSlider = ({
  value,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  onSlidingComplete,
  label,
  unit,
  disabled = false,
  style,
}: GlassSliderProps) => {
  const trackWidth = useRef(0);
  const isDragging = useRef(false);
  const currentPosition = useRef(0);
  const pan = useRef(new Animated.Value(0)).current;

  // Calculate position from value
  const valueToPosition = (val: number) => {
    if (!trackWidth.current) return 0;
    const percentage = ((val - minimumValue) / (maximumValue - minimumValue)) * 100;
    return (percentage / 100) * trackWidth.current;
  };

  // Update animated value when prop changes (but not while dragging)
  React.useEffect(() => {
    if (!isDragging.current && trackWidth.current > 0) {
      const newPosition = valueToPosition(value);
      currentPosition.current = newPosition;
      Animated.spring(pan, {
        toValue: newPosition,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
    }
  }, [value, trackWidth.current]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        isDragging.current = true;
        pan.setOffset(currentPosition.current);
        pan.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!trackWidth.current) return;
        
        const newPosition = currentPosition.current + gestureState.dx;
        const clampedPosition = Math.max(0, Math.min(trackWidth.current, newPosition));
        const percentage = clampedPosition / trackWidth.current;
        const steppedValue = Math.round((minimumValue + percentage * (maximumValue - minimumValue)) / step) * step;
        const finalValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
        
        pan.setValue(clampedPosition - currentPosition.current);
        onValueChange(finalValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (!trackWidth.current) return;
        
        const newPosition = currentPosition.current + gestureState.dx;
        const clampedPosition = Math.max(0, Math.min(trackWidth.current, newPosition));
        currentPosition.current = clampedPosition;
        
        isDragging.current = false;
        pan.flattenOffset();
        
        const percentage = clampedPosition / trackWidth.current;
        const steppedValue = Math.round((minimumValue + percentage * (maximumValue - minimumValue)) / step) * step;
        const finalValue = Math.max(minimumValue, Math.min(maximumValue, steppedValue));
        onSlidingComplete?.(finalValue);
      },
    })
  ).current;

  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.valueContainer}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 80 : 60}
              tint={Platform.OS === 'ios' ? 'systemUltraThinMaterialDark' : 'dark'}
              style={styles.valueBadge}
            >
              <Text style={styles.valueText}>
                {value}{unit ? ` ${unit}` : ''}
              </Text>
            </BlurView>
          </View>
        </View>
      )}
      
      <View
        style={styles.trackContainer}
        onLayout={(event) => {
          trackWidth.current = event.nativeEvent.layout.width;
          const initialPosition = (percentage / 100) * event.nativeEvent.layout.width;
          currentPosition.current = initialPosition;
          pan.setValue(initialPosition);
        }}
      >
        {/* Track background with glass effect */}
        <BlurView
          intensity={Platform.OS === 'ios' ? 40 : 30}
          tint={Platform.OS === 'ios' ? 'systemThinMaterialDark' : 'dark'}
          style={[styles.track, { borderRadius: radius.md }]}
        >
          {/* Filled portion */}
          <Animated.View
            style={[
              styles.trackFill,
              {
                width: pan.interpolate({
                  inputRange: [0, trackWidth.current || 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
              },
            ]}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 60 : 50}
              tint={Platform.OS === 'ios' ? 'systemMaterialDark' : 'dark'}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </BlurView>

        {/* Thumb with glass effect */}
        <Animated.View
          style={[
            styles.thumbContainer,
            {
              transform: [
                {
                  translateX: pan.interpolate({
                    inputRange: [0, trackWidth.current || 100],
                    outputRange: [0, Math.max(0, (trackWidth.current || 100) - 32)],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 100 : 80}
            tint={Platform.OS === 'ios' ? 'systemUltraThinMaterialDark' : 'dark'}
            style={styles.thumb}
          >
            <View style={styles.thumbInner} />
          </BlurView>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  valueContainer: {
    overflow: 'hidden',
    borderRadius: radius.sm,
  },
  valueBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent.primary,
  },
  trackContainer: {
    height: 48,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 8,
    width: '100%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  trackFill: {
    height: '100%',
    overflow: 'hidden',
    borderRadius: radius.md,
  },
  thumbContainer: {
    position: 'absolute',
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  thumbInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent.primary,
    opacity: 0.8,
  },
});

