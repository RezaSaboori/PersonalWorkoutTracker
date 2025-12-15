// src/screens/WorkoutTab.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Calendar, Clock, CheckCircle, Plus, BookOpen } from 'lucide-react-native';
import { ModernCard } from '../components/ui/ModernCard';
import { MinimalBackground } from '../components/MinimalBackground';
import { colors, spacing, textStyles, radius } from '../theme/design-system';
import { useWorkoutStore } from '../store/workoutStore';
import { FULL_PROGRAM_DATA } from '../data/fullProgram';
import { WorkoutDay } from '../types/workout';
import { getWorkoutForDate as getWorkoutForDateByStart } from '../utils/programSchedule';
import { getWorkoutForDate } from '../data/fullProgram';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WorkoutTab() {
  const router = useRouter();
  const { currentWeek, isWorkoutCompleted, activeProgramWeeks, programConfig } = useWorkoutStore();
  const programWeeks = activeProgramWeeks || FULL_PROGRAM_DATA;

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday

  // Calculate effective week based on start date if available
  let effectiveWeek = currentWeek;
  if (programConfig?.startDate) {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const startDate = new Date(programConfig.startDate);
    startDate.setHours(0, 0, 0, 0);
    const daysSinceStart = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    effectiveWeek = Math.floor(daysSinceStart / 7) + 1;
  }

  // Find the current week plan for display
  const weekPlan = programWeeks.find(w => w.weekNumber === effectiveWeek);

  const getDayWorkout = (dayName: string, dayDate: Date): WorkoutDay | null => {
    // Use start date-based calculation if available
    if (programConfig?.startDate) {
      return getWorkoutForDateByStart(programConfig.startDate, dayDate, programWeeks);
    }
    
    // Fallback to week-based calculation
    const weekPlan = programWeeks.find(w => w.weekNumber === currentWeek);
    if (!weekPlan) return null;
    return weekPlan.schedule[dayName as keyof typeof weekPlan.schedule] || null;
  };

  const handleWorkoutPress = (workout: WorkoutDay, dayName: string) => {
    router.push({
      pathname: '/workout-preview',
      params: {
        workoutId: workout.id,
        week: currentWeek.toString(),
        day: dayName,
      },
    });
  };

  return (
    <View style={styles.container}>
      <MinimalBackground />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Calendar size={24} color="#4fffc2" />
            <View style={styles.headerText}>
              <Text style={styles.weekTitle}>Week {effectiveWeek}</Text>
              <Text style={styles.phaseName}>{weekPlan?.phaseName || ''}</Text>
            </View>
          </View>

          {/* Week Schedule */}
          <View style={styles.weekContainer}>
            {DAYS.map((dayName, index) => {
              const dayDate = addDays(weekStart, index);
              const workout = getDayWorkout(dayName, dayDate);
              const isToday = isSameDay(dayDate, today);
              const dateStr = format(dayDate, 'MMM dd');
              const isCompleted = workout
                ? isWorkoutCompleted(format(dayDate, 'yyyy-MM-dd'), workout.id)
                : false;

              return (
                <ModernCard
                  key={dayName}
                  variant="content"
                  style={[styles.dayCard, isToday && styles.todayCard]}
                >
                  <View style={styles.dayHeader}>
                    <View>
                      <Text style={styles.dayName}>{dayName}</Text>
                      <Text style={styles.dayDate}>{dateStr}</Text>
                    </View>
                    {isToday && (
                      <View style={styles.todayBadge}>
                        <Text style={styles.todayText}>TODAY</Text>
                      </View>
                    )}
                  </View>

                  {workout ? (
                    <TouchableOpacity
                      onPress={() => handleWorkoutPress(workout, dayName)}
                      style={styles.workoutButton}
                    >
                      <View style={styles.workoutInfo}>
                        <Text 
                          style={styles.workoutTitle}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {workout.title}
                        </Text>
                        <Text 
                          style={styles.workoutFocus}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {workout.focus}
                        </Text>
                        <View style={styles.workoutMeta}>
                          <Clock size={12} color="rgba(255, 255, 255, 0.6)" />
                          <Text style={styles.workoutDuration}>{workout.duration}</Text>
                          <Text style={styles.workoutSeparator}>•</Text>
                          <Text style={styles.workoutExercises}>
                            {workout.exercises.length} exercises
                          </Text>
                        </View>
                      </View>
                      {isCompleted && (
                        <CheckCircle size={24} color="#4fffc2" />
                      )}
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.restDay}>
                      <Text style={styles.restText}>Rest Day</Text>
                      <Text style={styles.restSubtext}>Active recovery recommended</Text>
                    </View>
                  )}
                </ModernCard>
              );
            })}
          </View>

          {/* Browse Plans Button */}
          <TouchableOpacity
            style={styles.plansButton}
            onPress={() => router.push('/plans')}
          >
            <BookOpen size={20} color="#c084fc" />
            <Text style={styles.plansButtonText}>Browse Workout Plans</Text>
          </TouchableOpacity>

          {/* Create Custom Workout Button */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/custom-workout-creator')}
          >
            <Plus size={20} color="#4fffc2" />
            <Text style={styles.createButtonText}>Create Custom Workout</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  weekTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  phaseName: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  weekContainer: {
    gap: 12,
  },
  dayCard: {
    padding: 16,
  },
  todayCard: {
    borderColor: 'rgba(79, 255, 194, 0.3)',
    borderWidth: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dayDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  todayBadge: {
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  todayText: {
    color: '#4fffc2',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  workoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutInfo: {
    flex: 1,
    minWidth: 0, // Critical for flex text to shrink properly
  },
  workoutTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutFocus: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 8,
  },
  workoutMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workoutDuration: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  workoutSeparator: {
    color: 'rgba(255, 255, 255, 0.3)',
    fontSize: 12,
  },
  workoutExercises: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  restDay: {
    paddingVertical: 12,
  },
  restText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  restSubtext: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
  },
  plansButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    marginTop: 20,
    marginBottom: 12,
  },
  plansButtonText: {
    color: '#c084fc',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 255, 194, 0.3)',
  },
  createButtonText: {
    color: '#4fffc2',
    fontSize: 16,
    fontWeight: '600',
  },
});
