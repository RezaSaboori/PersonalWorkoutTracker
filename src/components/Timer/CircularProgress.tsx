// src/components/Timer/CircularProgress.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  width?: number;
  duration: number; // total duration in seconds
  currentTime: number; // current time in seconds
  color?: string;
  backgroundColor?: string;
  showTime?: boolean;
}

export const CircularProgress = ({
  progress,
  size = 200,
  width = 12,
  duration,
  currentTime,
  color = '#4fffc2',
  backgroundColor = 'rgba(255, 255, 255, 0.1)',
  showTime = true,
}: CircularProgressProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        size={size}
        width={width}
        fill={progress}
        tintColor={color}
        backgroundColor={backgroundColor}
        rotation={0}
        lineCap="round"
      >
        {() => (
          <View style={styles.content}>
            {showTime && (
              <>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                <Text style={styles.durationText}>/ {formatTime(duration)}</Text>
              </>
            )}
          </View>
        )}
      </AnimatedCircularProgress>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  durationText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    marginTop: 4,
  },
});
