// src/screens/WorkoutPreview.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, Activity, Edit3, Play, Info } from 'lucide-react-native';
import { ModernCard } from '../components/ui/ModernCard';
import { ModernButton } from '../components/ui/ModernButton';
import { MinimalBackground } from '../components/MinimalBackground';
import { colors, spacing, textStyles, radius } from '../theme/design-system';
import { FULL_PROGRAM_DATA } from '../data/fullProgram';
import { useWorkoutStore } from '../store/workoutStore';
import { WorkoutDay, Exercise } from '../types/workout';
import { format } from 'date-fns';
import { getWorkoutForDate as getWorkoutForDateByStart } from '../utils/programSchedule';
import { getWorkoutForDate } from '../data/fullProgram';

export default function WorkoutPreview() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    getCustomizedWorkout, 
    activeProgramWeeks, 
    currentWeek, 
    programConfig,
    getInProgressWorkout,
  } = useWorkoutStore();
  
  // Get workout - try by ID first, then by week/day
  const workoutId = params.workoutId as string;
  const weekNum = params.week ? parseInt(params.week as string) : currentWeek;
  const dayName = params.day as string || format(new Date(), 'EEEE');
  
  // Use active program weeks if available, otherwise fall back to FULL_PROGRAM_DATA
  const programWeeks = activeProgramWeeks || FULL_PROGRAM_DATA;
  
  let workout: WorkoutDay | null = null;
  
  if (workoutId) {
    // Find workout by ID in active program weeks
    for (const week of programWeeks) {
      const found = Object.values(week.schedule).find(w => w?.id === workoutId);
      if (found) {
        workout = found;
        break;
      }
    }
  } else {
    // Use start date-based calculation if available
    if (programConfig?.startDate) {
      const targetDate = new Date(); // Use today as default
      workout = getWorkoutForDateByStart(programConfig.startDate, targetDate, programWeeks);
    } else {
      workout = getWorkoutForDate(weekNum, dayName, programWeeks);
    }
  }

  // Get customizations if any
  const customization = workout ? getCustomizedWorkout(workout.id) : null;
  
  // Check for in-progress workout
  const inProgressWorkout = workout ? getInProgressWorkout(workout.id) : null;
  const hasInProgressWorkout = !!inProgressWorkout;
  
  // Merge customizations with base workout
  const displayWorkout = workout ? mergeCustomizations(workout, customization) : null;

  if (!displayWorkout) {
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

  // Calculate estimated duration
  const estimatedDuration = calculateEstimatedDuration(displayWorkout);

  const handleStartWorkout = () => {
    router.push({
      pathname: '/workout-session',
      params: {
        workoutId: displayWorkout.id,
        week: weekNum.toString(),
        day: dayName,
      },
    });
  };

  const handleCustomize = () => {
    router.push({
      pathname: '/customize-workout',
      params: {
        workoutId: displayWorkout.id,
        week: weekNum.toString(),
        day: dayName,
      },
    });
  };

  return (
    <View style={styles.container}>
      <MinimalBackground />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Preview</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Summary Card */}
          <ModernCard variant="content" style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{displayWorkout.duration}</Text>
              </View>
              {customization && (
                <View style={styles.customizedBadge}>
                  <Edit3 size={12} color="#c084fc" />
                  <Text style={styles.customizedText}>Customized</Text>
                </View>
              )}
            </View>
            <Text style={styles.workoutTitle}>{displayWorkout.title}</Text>
            <Text style={styles.workoutFocus}>{displayWorkout.focus}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Activity size={16} color="#4fffc2" />
                <Text style={styles.metaText}>{displayWorkout.exercises.length} Exercises</Text>
              </View>
              <View style={styles.metaItem}>
                <Clock size={16} color="#60a5fa" />
                <Text style={styles.metaText}>~{estimatedDuration} min</Text>
              </View>
            </View>
          </ModernCard>

          {/* Warmup */}
          {displayWorkout.warmup && (
            <ModernCard variant="content" style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Warmup</Text>
              </View>
              <Text style={styles.sectionText}>{displayWorkout.warmup}</Text>
            </ModernCard>
          )}

          {/* Exercises List */}
          <ModernCard variant="content" style={styles.exercisesCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exercises</Text>
              <Text style={styles.exerciseCount}>{displayWorkout.exercises.length} total</Text>
            </View>
            
            <View style={styles.exercisesList}>
              {displayWorkout.exercises.map((exercise, index) => (
                <ExercisePreviewCard
                  key={exercise.id}
                  exercise={exercise}
                  index={index + 1}
                />
              ))}
            </View>
          </ModernCard>

          {/* Cooldown */}
          {displayWorkout.cooldown && (
            <ModernCard variant="content" style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Cooldown</Text>
              </View>
              <Text style={styles.sectionText}>{displayWorkout.cooldown}</Text>
            </ModernCard>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.customizeButton}
              onPress={handleCustomize}
            >
              <Edit3 size={18} color="#c084fc" />
              <Text style={styles.customizeButtonText}>Customize</Text>
            </TouchableOpacity>
            
            <ModernButton
              title={hasInProgressWorkout ? "Resume Workout" : "Start Workout"}
              onPress={handleStartWorkout}
              active
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ExercisePreviewCard({ exercise, index }: { exercise: Exercise; index: number }) {
  const getExerciseDetails = () => {
    if (exercise.type === 'reps') {
      return `${exercise.sets} sets × ${exercise.reps} reps`;
    } else if (exercise.type === 'time') {
      return `${exercise.sets} sets × ${exercise.duration}s`;
    } else {
      return `${exercise.rounds} rounds × ${exercise.workInterval}s work / ${exercise.restInterval}s rest`;
    }
  };

  const getRestTime = () => {
    if (exercise.type === 'reps' || exercise.type === 'time') {
      return `${exercise.rest}s rest`;
    }
    return '';
  };

  return (
    <View style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseNumber}>
          <Text style={styles.exerciseNumberText}>{index}</Text>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.exerciseDetails}>{getExerciseDetails()}</Text>
          {getRestTime() && (
            <Text style={styles.exerciseRest}>{getRestTime()}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

function mergeCustomizations(workout: WorkoutDay, customization: any): WorkoutDay {
  if (!customization) return workout;

  const mergedExercises = workout.exercises.map(exercise => {
    const custom = customization.exerciseCustomizations[exercise.id];
    if (!custom) return exercise;

    if (exercise.type === 'reps') {
      return {
        ...exercise,
        reps: custom.reps ?? exercise.reps,
        sets: custom.sets ?? exercise.sets,
        rest: custom.rest ?? exercise.rest,
      };
    } else if (exercise.type === 'time') {
      return {
        ...exercise,
        duration: custom.duration ?? exercise.duration,
        sets: custom.sets ?? exercise.sets,
        rest: custom.rest ?? exercise.rest,
      };
    } else {
      return {
        ...exercise,
        workInterval: custom.workInterval ?? exercise.workInterval,
        restInterval: custom.restInterval ?? exercise.restInterval,
        rounds: custom.sets ?? exercise.rounds,
      };
    }
  });

  return {
    ...workout,
    exercises: mergedExercises,
  };
}

function calculateEstimatedDuration(workout: WorkoutDay): number {
  let totalSeconds = 0;
  
  // Warmup: ~5 minutes
  totalSeconds += 300;
  
  // Exercises
  workout.exercises.forEach(exercise => {
    if (exercise.type === 'reps') {
      // Estimate 2 seconds per rep, plus rest between sets
      const repsPerSet = parseInt(exercise.reps.split('-')[0]) || 10;
      const exerciseTime = exercise.sets * (repsPerSet * 2);
      const restTime = exercise.rest * (exercise.sets - 1);
      totalSeconds += exerciseTime + restTime;
    } else if (exercise.type === 'time') {
      const exerciseTime = exercise.sets * exercise.duration;
      const restTime = exercise.rest * (exercise.sets - 1);
      totalSeconds += exerciseTime + restTime;
    } else {
      // HIIT
      const roundTime = exercise.workInterval + exercise.restInterval;
      totalSeconds += exercise.rounds * roundTime;
    }
  });
  
  // Cooldown: ~5 minutes
  totalSeconds += 300;
  
  return Math.round(totalSeconds / 60);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  summaryCard: {
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#4fffc2',
    fontSize: 12,
    fontWeight: '600',
  },
  customizedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  customizedText: {
    color: '#c084fc',
    fontSize: 10,
    fontWeight: '600',
  },
  workoutTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  workoutFocus: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sectionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  exercisesCard: {
    marginBottom: 16,
  },
  exerciseCount: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: {
    color: '#4fffc2',
    fontSize: 14,
    fontWeight: '700',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseDetails: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginBottom: 2,
  },
  exerciseRest: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
  },
  actionsContainer: {
    marginTop: 8,
    gap: 12,
  },
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  customizeButtonText: {
    color: '#c084fc',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
  },
  backText: {
    color: '#4fffc2',
    fontSize: 16,
  },
});
