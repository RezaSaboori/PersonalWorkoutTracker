// src/screens/WorkoutSession.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, CheckCircle, Info, Pause, Play, ChevronRight, FileText } from 'lucide-react-native';
import { ModernCard } from '../components/ui/ModernCard';
import { ModernButton } from '../components/ui/ModernButton';
import { BottomSheet } from '../components/ui/BottomSheet';
import { MinimalBackground } from '../components/MinimalBackground';
import { colors, spacing, radius, textStyles } from '../theme/design-system';
import { FULL_PROGRAM_DATA, getWorkoutForDate } from '../data/fullProgram';
import { useWorkoutStore, InProgressWorkout } from '../store/workoutStore';
import { useAchievementsStore } from '../store/achievementsStore';
import { RepBasedExercise } from '../components/workout/RepBasedExercise';
import { TimeBasedExercise } from '../components/workout/TimeBasedExercise';
import { IntervalTimer } from '../components/Timer/IntervalTimer';
import { getExerciseDescription } from '../data/exerciseDescriptions';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { WorkoutDay, Exercise, ExerciseCompletion } from '../types/workout';

export default function WorkoutSession() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    addWorkoutCompletion, 
    addPersonalRecord, 
    getPersonalRecord,
    saveInProgressWorkout,
    getInProgressWorkout,
    clearInProgressWorkout,
  } = useWorkoutStore();
  const { checkAndUnlockAchievements } = useAchievementsStore();
  
  // Get workout - try by ID first, then by week/day
  const workoutId = params.workoutId as string;
  const weekNum = params.week ? parseInt(params.week as string) : useWorkoutStore.getState().currentWeek;
  const dayName = params.day as string || format(new Date(), 'EEEE');
  
  let workout: WorkoutDay | null = null;
  
  if (workoutId) {
    // Find workout by ID
    for (const week of FULL_PROGRAM_DATA) {
      const found = Object.values(week.schedule).find(w => w?.id === workoutId);
      if (found) {
        workout = found;
        break;
      }
    }
  } else {
    workout = getWorkoutForDate(weekNum, dayName);
  }

  if (!workout) {
    return (
      <View style={styles.container}>
        <MinimalBackground />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.errorText}>Workout not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  // Check for in-progress workout
  const inProgressWorkout = workoutId ? getInProgressWorkout(workoutId) : null;
  
  const [completedExercises, setCompletedExercises] = useState<Record<string, number[]>>(
    inProgressWorkout?.completedExercises || {}
  );
  const [exerciseCompletions, setExerciseCompletions] = useState<Record<string, ExerciseCompletion>>(
    inProgressWorkout?.exerciseCompletions || {}
  );
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(
    inProgressWorkout?.currentExerciseIndex || 0
  );
  const [workoutStartTime] = useState(
    inProgressWorkout?.workoutStartTime || Date.now()
  );
  const [showHIITDescriptions, setShowHIITDescriptions] = useState<Record<string, boolean>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [pausedDuration, setPausedDuration] = useState(
    inProgressWorkout?.pausedDuration || 0
  );
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState<Record<string, string>>(
    inProgressWorkout?.workoutNotes || {}
  );
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [currentNote, setCurrentNote] = useState('');

  const saveWorkoutState = () => {
    if (workoutId) {
      const inProgress: InProgressWorkout = {
        workoutId: workout.id,
        week: weekNum,
        day: dayName,
        currentExerciseIndex,
        completedExercises,
        exerciseCompletions,
        workoutStartTime,
        pausedDuration: pausedDuration + (pauseStartTime ? Math.floor((Date.now() - pauseStartTime) / 1000) : 0),
        workoutNotes,
      };
      saveInProgressWorkout(inProgress);
    }
  };

  // Auto-save workout state when it changes
  useEffect(() => {
    if (workoutId && (Object.keys(completedExercises).length > 0 || Object.keys(exerciseCompletions).length > 0 || currentExerciseIndex > 0)) {
      saveWorkoutState();
    }
  }, [completedExercises, exerciseCompletions, currentExerciseIndex, workoutNotes]);

  const handleSetComplete = (exerciseId: string, setIndex: number, value?: number) => {
    setCompletedExercises((prev) => {
      const sets = prev[exerciseId] || [];
      if (!sets.includes(setIndex)) {
        const newSets = [...sets, setIndex].sort();
        
        // Update exercise completion
        const exercise = workout!.exercises.find(e => e.id === exerciseId);
        if (exercise) {
          const completion: ExerciseCompletion = {
            exerciseId,
            sets: newSets,
            completedAt: new Date().toISOString(),
          };

          if (exercise.type === 'reps' && value !== undefined) {
            completion.repsCompleted = exerciseCompletions[exerciseId]?.repsCompleted || [];
            completion.repsCompleted[setIndex] = value;
            
            // Check for personal record
            const pr = getPersonalRecord(exerciseId);
            if (!pr || value > pr.value) {
              addPersonalRecord({
                exerciseId,
                exerciseName: exercise.name,
                type: 'reps',
                value,
                date: new Date().toISOString(),
                workoutId: workout!.id,
              });
            }
          } else if (exercise.type === 'time' && value !== undefined) {
            completion.timeCompleted = exerciseCompletions[exerciseId]?.timeCompleted || [];
            completion.timeCompleted[setIndex] = value;
            
            // Check for personal record
            const pr = getPersonalRecord(exerciseId);
            if (!pr || value > pr.value) {
              addPersonalRecord({
                exerciseId,
                exerciseName: exercise.name,
                type: 'time',
                value,
                date: new Date().toISOString(),
                workoutId: workout!.id,
              });
            }
          }

          setExerciseCompletions((prev) => ({
            ...prev,
            [exerciseId]: completion,
          }));
        }

        return { ...prev, [exerciseId]: newSets };
      }
      return prev;
    });
  };

  const handleExerciseComplete = (exerciseId: string) => {
    const exercise = workout!.exercises.find(e => e.id === exerciseId);
    const currentIndex = workout!.exercises.findIndex(e => e.id === exerciseId);
    
    if (currentIndex < workout!.exercises.length - 1) {
      setCurrentExerciseIndex(currentIndex + 1);
    } else {
      // All exercises complete
      handleWorkoutComplete();
    }
  };

  const handleWorkoutComplete = () => {
    const duration = elapsedTime;
    const today = new Date().toISOString().split('T')[0];
    
    // Save notes to workout completion
    const notes = Object.entries(workoutNotes).map(([exerciseId, note]) => ({
      workoutId: workout!.id,
      exerciseId,
      note,
      timestamp: new Date().toISOString(),
    }));

    const completion = {
      date: today,
      workoutId: workout!.id,
      exercises: Object.values(exerciseCompletions),
      completedAt: new Date().toISOString(),
      duration,
    };

    addWorkoutCompletion(completion);
    
    // Save notes
    notes.forEach(note => {
      useWorkoutStore.getState().addWorkoutNote(note);
    });
    
    // Check achievements
    const newAchievements = checkAndUnlockAchievements();
    if (newAchievements.length > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Clear in-progress workout
    clearInProgressWorkout(workout!.id);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const currentExercise = workout.exercises[currentExerciseIndex];
  const nextExercise = currentExerciseIndex < workout.exercises.length - 1 
    ? workout.exercises[currentExerciseIndex + 1] 
    : null;
  
  const allExercisesComplete = workout.exercises.every((e) => {
    const completed = completedExercises[e.id] || [];
    return e.type === 'hiit' ? completed.length >= e.rounds : completed.length >= e.sets;
  });

  // Calculate workout progress
  const completedExercisesCount = workout.exercises.filter(e => {
    const completed = completedExercises[e.id] || [];
    return e.type === 'hiit' ? completed.length >= e.rounds : completed.length >= e.sets;
  }).length;
  const workoutProgress = (completedExercisesCount / workout.exercises.length) * 100;

  // Calculate elapsed time
  const elapsedTime = useMemo(() => {
    if (isPaused && pauseStartTime) {
      // Currently paused - use time up to pause start
      return Math.floor((pauseStartTime - workoutStartTime) / 1000) - pausedDuration;
    }
    // Running - calculate current time minus paused duration
    return Math.floor((Date.now() - workoutStartTime) / 1000) - pausedDuration;
  }, [isPaused, pauseStartTime, workoutStartTime, pausedDuration]);

  const handlePause = () => {
    setIsPaused(true);
    setPauseStartTime(Date.now());
    // Save workout state when pausing
    saveWorkoutState();
  };

  const handleResume = () => {
    if (pauseStartTime) {
      // Add the paused duration to total paused time
      const pauseDuration = Math.floor((Date.now() - pauseStartTime) / 1000);
      setPausedDuration(prev => prev + pauseDuration);
    }
    setIsPaused(false);
    setPauseStartTime(null);
  };

  const handleAddNote = () => {
    if (currentNote.trim()) {
      setWorkoutNotes({
        ...workoutNotes,
        [currentExercise.id]: currentNote,
      });
      setCurrentNote('');
      setShowNotesModal(false);
    }
  };

  const renderExercise = (exercise: Exercise, index: number) => {
    const completedSets = completedExercises[exercise.id] || [];
    const isCurrent = index === currentExerciseIndex;
    
    // Check if exercise is complete based on type
    const isComplete = exercise.type === 'hiit' 
      ? completedSets.length >= exercise.rounds
      : completedSets.length >= exercise.sets;

    if (!isCurrent && !isComplete) {
      return null; // Don't show future exercises
    }

    if (exercise.type === 'reps') {
      return (
        <RepBasedExercise
          key={exercise.id}
          exercise={exercise}
          exerciseIndex={index}
          onSetComplete={(setIndex, repsCompleted) =>
            handleSetComplete(exercise.id, setIndex, repsCompleted)
          }
          onExerciseComplete={() => handleExerciseComplete(exercise.id)}
          completedSets={completedSets}
          restDuration={exercise.rest}
        />
      );
    } else if (exercise.type === 'time') {
      return (
        <TimeBasedExercise
          key={exercise.id}
          exercise={exercise}
          exerciseIndex={index}
          onSetComplete={(setIndex, timeCompleted) =>
            handleSetComplete(exercise.id, setIndex, timeCompleted)
          }
          onExerciseComplete={() => handleExerciseComplete(exercise.id)}
          completedSets={completedSets}
        />
      );
    } else if (exercise.type === 'hiit') {
      const showDesc = showHIITDescriptions[exercise.id] || false;
      const descriptions = exercise.exercises.map(ex => getExerciseDescription(ex)).join('\n\n');
      
      return (
        <ModernCard key={exercise.id} variant="hero" style={styles.exerciseCard} elevated>
          <View style={styles.exerciseHeader}>
            <Text style={styles.exerciseIndex}>{index + 1}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.exerciseTitleRow}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <TouchableOpacity
                  onPress={() => setShowHIITDescriptions(prev => ({
                    ...prev,
                    [exercise.id]: !prev[exercise.id]
                  }))}
                  style={styles.infoButton}
                >
                  <Info size={18} color={colors.accent.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.exerciseDetails}>
                {exercise.exercises.join(', ')}
              </Text>
            </View>
          </View>
          
          {showDesc && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionTitle}>Exercise Instructions:</Text>
              {exercise.exercises.map((exName, idx) => (
                <View key={idx} style={styles.exerciseDescItem}>
                  <Text style={styles.exerciseDescName}>{exName}:</Text>
                  <Text style={styles.exerciseDescText}>{getExerciseDescription(exName)}</Text>
                </View>
              ))}
            </View>
          )}
          
          <IntervalTimer
            workInterval={exercise.workInterval}
            restInterval={exercise.restInterval}
            rounds={exercise.rounds}
            onComplete={() => handleExerciseComplete(exercise.id)}
            onRoundComplete={(round) => {
              handleSetComplete(exercise.id, round);
            }}
          />
        </ModernCard>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <MinimalBackground />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => {
              // Save state when exiting
              saveWorkoutState();
              router.back();
            }} 
            style={styles.backButton}
          >
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{workout.title}</Text>
            <View style={styles.headerMeta}>
              <View style={styles.timerTag}>
                <Clock size={12} color="#4fffc2" />
                <Text style={styles.timerText}>
                  {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </Text>
              </View>
              {isPaused && (
                <View style={styles.pausedBadge}>
                  <Pause size={10} color="#ff6b6b" />
                  <Text style={styles.pausedText}>PAUSED</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            onPress={isPaused ? handleResume : handlePause}
            style={styles.pauseButton}
          >
            {isPaused ? (
              <Play size={20} color="#4fffc2" />
            ) : (
              <Pause size={20} color="#4fffc2" />
            )}
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${workoutProgress}%` }]} />
          </View>
          <Text style={styles.progressTextSmall}>
            {completedExercisesCount} / {workout.exercises.length} exercises
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Warmup Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>WARM UP</Text>
          </View>
          <ModernCard variant="content" style={styles.infoCard}>
            <Text style={styles.infoText}>{workout.warmup}</Text>
          </ModernCard>

          {/* Exercises */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>MAIN WORKOUT</Text>
            <Text style={styles.progressText}>
              {workout.exercises.filter(e => {
                const completed = completedExercises[e.id] || [];
                return e.type === 'hiit' ? completed.length >= e.rounds : completed.length >= e.sets;
              }).length} / {workout.exercises.length} Complete
            </Text>
          </View>

          {renderExercise(currentExercise, currentExerciseIndex)}

          {/* Next Exercise Preview */}
          {nextExercise && !allExercisesComplete && (
            <ModernCard variant="compact" style={styles.nextExerciseCard}>
              <View style={styles.nextExerciseHeader}>
                <ChevronRight size={16} color={colors.accent.primary} />
                <Text style={styles.nextExerciseTitle}>Next: {nextExercise.name}</Text>
              </View>
              {nextExercise.type === 'reps' && (
                <Text style={styles.nextExerciseDetails}>
                  {nextExercise.sets} sets × {nextExercise.reps} reps
                </Text>
              )}
              {nextExercise.type === 'time' && (
                <Text style={styles.nextExerciseDetails}>
                  {nextExercise.sets} sets × {nextExercise.duration}s
                </Text>
              )}
              {nextExercise.type === 'hiit' && (
                <Text style={styles.nextExerciseDetails}>
                  {nextExercise.rounds} rounds × {nextExercise.workInterval}s work
                </Text>
              )}
            </ModernCard>
          )}

          {/* Notes Button */}
          <TouchableOpacity
            style={styles.notesButton}
            onPress={() => {
              setCurrentNote(workoutNotes[currentExercise.id] || '');
              setShowNotesModal(true);
            }}
          >
            <FileText size={16} color="#c084fc" />
            <Text style={styles.notesButtonText}>
              {workoutNotes[currentExercise.id] ? 'Edit Notes' : 'Add Notes'}
            </Text>
          </TouchableOpacity>

          {/* Show completed exercises */}
          {workout.exercises
            .filter((_, idx) => idx < currentExerciseIndex)
            .map((exercise, idx) => renderExercise(exercise, idx))}

          {/* Cool-down */}
          {allExercisesComplete && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>COOL DOWN</Text>
              </View>
              <ModernCard variant="content" style={styles.infoCard}>
                <Text style={styles.infoText}>{workout.cooldown}</Text>
              </ModernCard>
            </>
          )}

          {allExercisesComplete && (
            <View style={styles.completeButtonContainer}>
              <ModernButton
                title="Complete Workout"
                onPress={handleWorkoutComplete}
                variant="primary"
                size="large"
                active
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Notes Bottom Sheet */}
      <BottomSheet
        visible={showNotesModal}
        onClose={() => {
          setShowNotesModal(false);
          setCurrentNote('');
        }}
      >
        <Text style={styles.modalTitle}>Notes for {currentExercise.name}</Text>
        <TextInput
          style={styles.notesInput}
          value={currentNote}
          onChangeText={setCurrentNote}
          placeholder="Add your notes here..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          numberOfLines={6}
        />
        <View style={styles.modalActions}>
          <ModernButton
            title="Cancel"
            onPress={() => {
              setShowNotesModal(false);
              setCurrentNote('');
            }}
            variant="ghost"
            size="medium"
          />
          <ModernButton
            title="Save"
            onPress={handleAddNote}
            variant="primary"
            size="medium"
            active
          />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.bg.app 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.bg.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  headerTitle: { 
    ...textStyles.h3,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  timerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timerText: { 
    ...textStyles.tiny,
    color: colors.accent.primary,
  },
  pausedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent.error + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  pausedText: {
    ...textStyles.tiny,
    color: colors.accent.error,
    fontWeight: '700',
  },
  pauseButton: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.accent.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.accent.primary + '40',
  },
  progressContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.primary,
    borderRadius: radius.sm,
  },
  progressTextSmall: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  nextExerciseCard: {
    marginBottom: spacing.md,
  },
  nextExerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  nextExerciseTitle: {
    ...textStyles.body,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  nextExerciseDetails: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  notesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent.secondary + '20',
    borderWidth: 1,
    borderColor: colors.accent.secondary + '40',
    marginBottom: spacing.md,
  },
  notesButtonText: {
    ...textStyles.body,
    color: colors.accent.secondary,
    fontWeight: '600',
  },
  modalTitle: {
    ...textStyles.h2,
    marginBottom: spacing.md,
  },
  notesInput: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text.primary,
    ...textStyles.body,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.subtle,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  completeButtonContainer: {
    marginTop: spacing.lg,
  },
  content: { 
    padding: spacing.lg, 
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...textStyles.tiny,
    color: colors.text.tertiary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressText: {
    ...textStyles.caption,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  infoCard: { 
    marginBottom: 0,
  },
  infoText: { 
    ...textStyles.body,
    color: colors.text.secondary,
  },
  exerciseCard: { 
    marginBottom: spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  exerciseIndex: {
    ...textStyles.h1,
    color: colors.text.tertiary + '40',
    marginRight: spacing.md,
    minWidth: 32,
  },
  exerciseName: { 
    ...textStyles.h3,
    marginBottom: spacing.xs,
  },
  exerciseDetails: { 
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  exerciseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accent.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.accent.primary + '10',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent.primary + '20',
  },
  descriptionTitle: {
    ...textStyles.body,
    color: colors.accent.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  exerciseDescItem: {
    marginBottom: spacing.md,
  },
  exerciseDescName: {
    ...textStyles.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  exerciseDescText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  errorText: {
    ...textStyles.h2,
    marginBottom: spacing.lg,
  },
  backText: {
    ...textStyles.body,
    color: colors.accent.primary,
  },
});
