// src/components/workout/RepBasedExercise.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModernCard } from '../ui/ModernCard';
import { colors, spacing, textStyles, radius } from '../../theme/design-system';
import { Check, Minus, Plus, Info } from 'lucide-react-native';
import { RestTimer } from './RestTimer';
import { hapticPatterns } from '../../utils/hapticFeedback';
import { RepBasedExercise as RepExercise } from '../../types/workout';
import { getExerciseDescription } from '../../data/exerciseDescriptions';
import { parseReps, isRepsComplete } from '../../utils/repParser';

interface RepBasedExerciseProps {
  exercise: RepExercise;
  exerciseIndex: number;
  onSetComplete: (setIndex: number, repsCompleted?: number) => void;
  onExerciseComplete: () => void;
  completedSets: number[];
  restDuration?: number;
}

export const RepBasedExercise = ({
  exercise,
  exerciseIndex,
  onSetComplete,
  onExerciseComplete,
  completedSets,
  restDuration,
}: RepBasedExerciseProps) => {
  // Calculate default reps (mean of target range)
  const { mean: defaultReps } = parseReps(exercise.reps);
  
  // Initialize currentReps with default mean value for each set
  const [currentReps, setCurrentReps] = useState<Record<number, number>>(() => {
    const initial: Record<number, number> = {};
    for (let i = 0; i < exercise.sets; i++) {
      initial[i] = defaultReps;
    }
    return initial;
  });
  
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restingSetIndex, setRestingSetIndex] = useState<number | null>(null);
  const [showDescription, setShowDescription] = useState(false);

  const handleSetComplete = (setIndex: number) => {
    const reps = currentReps[setIndex] || defaultReps;
    // This is only called when reps meet minimum (button is enabled)
    onSetComplete(setIndex, reps);
    hapticPatterns.setComplete();

    // Show rest timer if not last set
    if (setIndex < exercise.sets - 1 && restDuration && restDuration > 0) {
      setRestingSetIndex(setIndex);
      setShowRestTimer(true);
    } else if (setIndex === exercise.sets - 1) {
      // All sets complete
      onExerciseComplete();
    }
  };

  const handleRestComplete = () => {
    setShowRestTimer(false);
    setRestingSetIndex(null);
  };

  const handleRestSkip = () => {
    setShowRestTimer(false);
    setRestingSetIndex(null);
    hapticPatterns.selection();
  };

  const updateReps = (setIndex: number, delta: number) => {
    setCurrentReps((prev) => {
      const current = prev[setIndex] || 0;
      const newValue = Math.max(0, current + delta);
      return { ...prev, [setIndex]: newValue };
    });
  };

  if (showRestTimer && restingSetIndex !== null && restDuration) {
    return (
      <RestTimer
        duration={restDuration}
        onComplete={handleRestComplete}
        onSkip={handleRestSkip}
        autoStart={true}
        exerciseId={exercise.id}
        exerciseName={exercise.name}
        setNumber={restingSetIndex + 1}
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
          <Text style={styles.exerciseDetails}>
            Target: {exercise.reps} reps • {exercise.sets} sets
          </Text>
        </View>
      </View>

      {showDescription && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>{description}</Text>
        </View>
      )}

      <View style={styles.setsContainer}>
        {Array.from({ length: exercise.sets }).map((_, setIdx) => {
          const isCompleted = completedSets.includes(setIdx);
          const reps = currentReps[setIdx] || defaultReps;
          const { min: minReps } = parseReps(exercise.reps);
          const meetsMinimum = isRepsComplete(reps, exercise.reps);
          const canComplete = !isCompleted && meetsMinimum;

          return (
            <View key={setIdx} style={styles.setRow}>
              <TouchableOpacity
                style={[
                  styles.setButton, 
                  isCompleted && styles.setButtonActive,
                  !canComplete && !isCompleted && styles.setButtonDisabled
                ]}
                onPress={() => canComplete && handleSetComplete(setIdx)}
                disabled={isCompleted || !canComplete}
              >
                {isCompleted ? (
                  <Check size={20} color="#000" />
                ) : (
                  <Text style={styles.setText}>Set {setIdx + 1}</Text>
                )}
              </TouchableOpacity>

              {!isCompleted && (
                <View style={styles.repCounter}>
                  <TouchableOpacity
                    style={styles.repButton}
                    onPress={() => updateReps(setIdx, -1)}
                  >
                    <Minus size={16} color="#fff" />
                  </TouchableOpacity>
                  <View style={styles.repTextContainer}>
                    <Text style={[
                      styles.repText,
                      !meetsMinimum && styles.repTextWarning
                    ]}>
                      {reps}
                    </Text>
                    {!meetsMinimum && (
                      <Text style={styles.minRepsHint}>Min: {minReps}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.repButton}
                    onPress={() => updateReps(setIdx, 1)}
                  >
                    <Plus size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}

              {isCompleted && (
                <Text style={styles.completedText}>
                  {reps > 0 ? `${reps} reps` : 'Done'}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {completedSets.length === exercise.sets && (
        <TouchableOpacity
          style={styles.completeButton}
          onPress={onExerciseComplete}
        >
          <Text style={styles.completeButtonText}>Exercise Complete ✓</Text>
        </TouchableOpacity>
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
    marginBottom: 16,
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
  exerciseDetails: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  setsContainer: {
    gap: 12,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  setButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setButtonActive: {
    backgroundColor: '#4fffc2',
    borderColor: '#4fffc2',
  },
  setText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  repCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  repButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repTextContainer: {
    alignItems: 'center',
    minWidth: 50,
  },
  repText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  repTextWarning: {
    color: '#ff6b6b',
  },
  minRepsHint: {
    color: 'rgba(255, 107, 107, 0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  setButtonDisabled: {
    opacity: 0.5,
  },
  completedText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontStyle: 'italic',
  },
  completeButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(79, 255, 194, 0.3)',
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#4fffc2',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 8,
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
