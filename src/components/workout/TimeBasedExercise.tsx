// src/components/workout/TimeBasedExercise.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModernCard } from '../ui/ModernCard';
import { colors, spacing, textStyles, radius } from '../../theme/design-system';
import { Play, Pause, Info, ChevronRight } from 'lucide-react-native';
import { CircularProgress } from '../Timer/CircularProgress';
import { RestTimer } from './RestTimer';
import { voiceCues } from '../../utils/voiceGuidance';
import { hapticPatterns } from '../../utils/hapticFeedback';
import { TimeBasedExercise as TimeExercise } from '../../types/workout';
import { getExerciseDescription } from '../../data/exerciseDescriptions';
import { TimePicker } from '../ui/TimePicker';
import { Clock } from 'lucide-react-native';

interface TimeBasedExerciseProps {
  exercise: TimeExercise;
  exerciseIndex: number;
  onSetComplete: (setIndex: number, timeCompleted?: number) => void;
  onExerciseComplete: () => void;
  completedSets: number[];
}

export const TimeBasedExercise = ({
  exercise,
  exerciseIndex,
  onSetComplete,
  onExerciseComplete,
  completedSets,
}: TimeBasedExerciseProps) => {
  // Get foundation plan minimum duration (20 seconds for Week 1 planks)
  // For now, we'll use 20s as the minimum for planks, or exercise.duration if it's already a minimum
  const foundationMinDuration = exercise.name.toLowerCase().includes('plank') ? 20 : exercise.duration;
  
  // Current duration (changeable by user)
  const [currentDuration, setCurrentDuration] = useState(exercise.duration);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  const [currentSet, setCurrentSet] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const lastAnnouncementRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = currentDuration - elapsed;
        
        setTimeElapsed(elapsed);

        // Announcements (with debouncing)
        const now = Date.now();
        if (remaining === 10 && now - lastAnnouncementRef.current > 1000) {
          voiceCues.tenSeconds();
          hapticPatterns.light();
          lastAnnouncementRef.current = now;
        } else if (remaining === 5 && now - lastAnnouncementRef.current > 1000) {
          voiceCues.fiveSeconds();
          hapticPatterns.light();
          lastAnnouncementRef.current = now;
        } else if (remaining === 3 && now - lastAnnouncementRef.current > 1000) {
          voiceCues.threeSeconds();
          hapticPatterns.timerTick();
          lastAnnouncementRef.current = now;
        } else if (remaining === 2 && now - lastAnnouncementRef.current > 1000) {
          voiceCues.twoSeconds();
          hapticPatterns.timerTick();
          lastAnnouncementRef.current = now;
        } else if (remaining === 1 && now - lastAnnouncementRef.current > 1000) {
          voiceCues.oneSecond();
          hapticPatterns.timerTick();
          lastAnnouncementRef.current = now;
        }

        // Check if duration reached
        if (elapsed >= currentDuration) {
          setIsRunning(false);
          setTimeElapsed(currentDuration);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          handleSetComplete();
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (!isRunning && timeElapsed > 0) {
        pausedTimeRef.current = timeElapsed * 1000;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, currentDuration]);

  const handleSetComplete = () => {
    setIsRunning(false);
    // Use actual elapsed time (user may have done less than target)
    onSetComplete(currentSet, timeElapsed);
    hapticPatterns.setComplete();

    // Show rest timer if not last set
    if (currentSet < exercise.sets - 1 && exercise.rest > 0) {
      setShowRestTimer(true);
    } else if (currentSet === exercise.sets - 1) {
      // All sets complete
      onExerciseComplete();
    }
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
    setCurrentSet((prev) => prev + 1);
    setTimeElapsed(0);
    pausedTimeRef.current = 0;
    startTimeRef.current = 0;
    setIsRunning(false);
  };

  const handlePlayPause = () => {
    if (!isRunning) {
      setIsRunning(true);
      voiceCues.start();
      hapticPatterns.medium();
    } else {
      setIsRunning(false);
      hapticPatterns.selection();
    }
  };

  const handleNext = () => {
    // Complete the set with current elapsed time
    if (timeElapsed > 0) {
      handleSetComplete();
    }
  };

  const handleDurationChange = (newDuration: number) => {
    setCurrentDuration(newDuration);
    // Reset timer if running or has elapsed time
    if (isRunning || timeElapsed > 0) {
      handleReset();
    }
  };

  const progress = (timeElapsed / currentDuration) * 100;
  const isCompleted = completedSets.includes(currentSet);
  const meetsMinimum = timeElapsed >= foundationMinDuration || isCompleted;

  if (showRestTimer && exercise.rest > 0) {
    return (
      <RestTimer
        duration={exercise.rest}
        onComplete={handleRestComplete}
        onSkip={handleRestComplete}
        autoStart={true}
        exerciseId={exercise.id}
        exerciseName={exercise.name}
        setNumber={currentSet + 1}
        totalSets={exercise.sets}
      />
    );
  }

  const description = getExerciseDescription(exercise.name);

  return (
    <ModernCard variant="hero" style={styles.card} elevated>
      <View style={styles.header}>
        <View style={styles.indexContainer}>
          <Text style={styles.index}>{exerciseIndex + 1}</Text>
        </View>
        <View style={styles.exerciseInfo}>
          <View style={styles.exerciseTitleRow}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <TouchableOpacity
              onPress={() => setShowDescription(!showDescription)}
              style={styles.infoButton}
            >
              <Info size={18} color="#4fffc2" />
            </TouchableOpacity>
          </View>
          <View style={styles.exerciseDetailsRow}>
            <Text style={styles.exerciseDetails}>
              Hold for {currentDuration}s • Set {currentSet + 1} / {exercise.sets}
            </Text>
            {!isCompleted && (
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={styles.timeChangeButton}
              >
                <Clock size={16} color={colors.accent.primary} />
              </TouchableOpacity>
            )}
          </View>
          {!isCompleted && (
            <Text style={styles.minDurationHint}>
              Minimum: {foundationMinDuration}s (Foundation Plan)
            </Text>
          )}
        </View>
      </View>

      {showDescription && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>
      )}

      <View style={styles.timerContainer}>
        <CircularProgress
          progress={Math.min(100, progress)}
          duration={currentDuration}
          currentTime={Math.max(0, currentDuration - timeElapsed)}
          size={220}
          width={16}
        />
        {!meetsMinimum && timeElapsed > 0 && (
          <View style={styles.minimumIndicator}>
            <Text style={styles.minimumText}>
              {foundationMinDuration - timeElapsed}s to minimum
            </Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {!isCompleted && (
          <>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handlePlayPause}
            >
              {isRunning ? (
                <Pause size={28} color="#4fffc2" />
              ) : (
                <Play size={28} color="#4fffc2" />
              )}
            </TouchableOpacity>

            {timeElapsed > 0 && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
              >
                <Text style={styles.nextButtonText}>Next</Text>
                <ChevronRight size={20} color={colors.accent.primary} />
              </TouchableOpacity>
            )}
          </>
        )}

        {isCompleted && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>Set {currentSet + 1} Complete ✓</Text>
            {currentSet < exercise.sets - 1 && (
              <Text style={styles.nextSetText}>Resting before next set...</Text>
            )}
          </View>
        )}
      </View>

      {showTimePicker && (
        <TimePicker
          initialSeconds={currentDuration}
          minSeconds={5}
          maxSeconds={300}
          step={5}
          onValueChange={handleDurationChange}
          onClose={() => setShowTimePicker(false)}
        />
      )}
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  indexContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  index: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4fffc2',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  exerciseDetails: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    flex: 1,
  },
  timeChangeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accent.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accent.primary + '40',
  },
  minDurationHint: {
    color: colors.text.tertiary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  timerContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  minimumIndicator: {
    position: 'absolute',
    bottom: -24,
    backgroundColor: colors.accent.error + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.accent.error + '40',
  },
  minimumText: {
    ...textStyles.caption,
    color: colors.accent.error,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.accent.primary + '20',
    borderWidth: 1,
    borderColor: colors.accent.primary + '40',
  },
  nextButtonText: {
    ...textStyles.body,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  completedContainer: {
    alignItems: 'center',
  },
  completedText: {
    color: '#4fffc2',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  nextSetText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: 'rgba(79, 255, 194, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 255, 194, 0.15)',
  },
  descriptionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
});
