// src/store/progressStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWorkoutStore } from './workoutStore';
import { WorkoutHistoryFilters, VolumeData, TrainingLoad, WorkoutCompletion } from '../types/workout';

interface ProgressState {
  // Statistics
  totalWorkoutsCompleted: number;
  totalWorkoutTime: number; // in seconds
  averageWorkoutDuration: number; // in seconds
  
  // Computed stats
  getWeeklyStats: (weekNumber: number) => {
    workoutsCompleted: number;
    totalTime: number;
    averageTime: number;
  };
  getMonthlyStats: (year: number, month: number) => {
    workoutsCompleted: number;
    totalTime: number;
    averageTime: number;
  };
  getExerciseProgression: (exerciseId: string) => Array<{
    date: string;
    reps?: number;
    time?: number;
  }>;
  
  // History and search
  getWorkoutHistory: (filters?: WorkoutHistoryFilters) => WorkoutCompletion[];
  searchWorkouts: (query: string) => WorkoutCompletion[];
  
  // Analytics
  getVolumeData: (startDate: string, endDate: string) => VolumeData[];
  getTrainingLoad: (weekStart: string) => TrainingLoad;
  exportWorkoutData: () => string; // Returns JSON string
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      totalWorkoutsCompleted: 0,
      totalWorkoutTime: 0,
      averageWorkoutDuration: 0,

      getWeeklyStats: (weekNumber) => {
        const workouts = useWorkoutStore.getState().completedWorkouts;
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7); // Monday
        
        const weekWorkouts = workouts.filter(w => {
          const workoutDate = new Date(w.date);
          const weekNum = Math.ceil((workoutDate.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
          return weekNum === weekNumber;
        });

        const totalTime = weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        const workoutsCompleted = weekWorkouts.length;
        const averageTime = workoutsCompleted > 0 ? totalTime / workoutsCompleted : 0;

        return {
          workoutsCompleted,
          totalTime,
          averageTime,
        };
      },

      getMonthlyStats: (year, month) => {
        const workouts = useWorkoutStore.getState().completedWorkouts;
        const monthWorkouts = workouts.filter(w => {
          const workoutDate = new Date(w.date);
          return workoutDate.getFullYear() === year && workoutDate.getMonth() === month - 1;
        });

        const totalTime = monthWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        const workoutsCompleted = monthWorkouts.length;
        const averageTime = workoutsCompleted > 0 ? totalTime / workoutsCompleted : 0;

        return {
          workoutsCompleted,
          totalTime,
          averageTime,
        };
      },

      getExerciseProgression: (exerciseId) => {
        const workouts = useWorkoutStore.getState().completedWorkouts;
        const progression: Array<{ date: string; reps?: number; time?: number }> = [];

        workouts.forEach(workout => {
          const exercise = workout.exercises.find(e => e.exerciseId === exerciseId);
          if (exercise) {
            if (exercise.repsCompleted && exercise.repsCompleted.length > 0) {
              const maxReps = Math.max(...exercise.repsCompleted);
              progression.push({ date: workout.date, reps: maxReps });
            }
            if (exercise.timeCompleted && exercise.timeCompleted.length > 0) {
              const maxTime = Math.max(...exercise.timeCompleted);
              progression.push({ date: workout.date, time: maxTime });
            }
          }
        });

        return progression.sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      },

      // History and search methods
      getWorkoutHistory: (filters = {}) => {
        const workouts = useWorkoutStore.getState().completedWorkouts;
        let filtered = [...workouts];

        // Date range filter
        if (filters.dateRange) {
          filtered = filtered.filter(w => {
            const workoutDate = new Date(w.date);
            const start = new Date(filters.dateRange!.start);
            const end = new Date(filters.dateRange!.end);
            return workoutDate >= start && workoutDate <= end;
          });
        }

        // Workout type filter (would need to check if workout is custom vs program)
        // This is simplified - in real implementation, you'd check workoutId against customWorkouts

        // Search query
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          filtered = filtered.filter(w => {
            // Search in workout ID (which contains workout name)
            return w.workoutId.toLowerCase().includes(query) ||
                   w.exercises.some(e => e.exerciseId.toLowerCase().includes(query));
          });
        }

        // Sort by date descending (most recent first)
        return filtered.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },

      searchWorkouts: (query) => {
        const workouts = useWorkoutStore.getState().completedWorkouts;
        const lowerQuery = query.toLowerCase();
        
        return workouts.filter(w => {
          return w.workoutId.toLowerCase().includes(lowerQuery) ||
                 w.exercises.some(e => e.exerciseId.toLowerCase().includes(lowerQuery));
        }).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },

      // Analytics methods
      getVolumeData: (startDate, endDate) => {
        const workouts = useWorkoutStore.getState().completedWorkouts;
        const volumeMap = new Map<string, { date: string; volume: number; muscleGroup: string }>();

        workouts.forEach(workout => {
          if (workout.date >= startDate && workout.date <= endDate) {
            workout.exercises.forEach(exercise => {
              const key = `${workout.date}-${exercise.exerciseId}`;
              let volume = 0;

              if (exercise.repsCompleted && exercise.repsCompleted.length > 0) {
                // Volume = sets × reps
                volume = exercise.repsCompleted.reduce((sum, reps) => sum + reps, 0);
              } else if (exercise.timeCompleted && exercise.timeCompleted.length > 0) {
                // For time-based, use total time as volume
                volume = exercise.timeCompleted.reduce((sum, time) => sum + time, 0);
              }

              if (volume > 0) {
                volumeMap.set(key, {
                  date: workout.date,
                  volume,
                  muscleGroup: 'full_body', // Simplified - would need exercise library for muscle groups
                  exerciseId: exercise.exerciseId,
                });
              }
            });
          }
        });

        return Array.from(volumeMap.values());
      },

      getTrainingLoad: (weekStart) => {
        const workouts = useWorkoutStore.getState().completedWorkouts;
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekWorkouts = workouts.filter(w => {
          const workoutDate = new Date(w.date);
          return workoutDate >= new Date(weekStart) && workoutDate < weekEnd;
        });

        // Calculate load based on workout count and duration
        const totalDuration = weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        const load = weekWorkouts.length * 10 + (totalDuration / 60); // Simplified load calculation

        let intensity: 'low' | 'moderate' | 'high' | 'very_high' = 'low';
        if (load > 50) intensity = 'very_high';
        else if (load > 35) intensity = 'high';
        else if (load > 20) intensity = 'moderate';

        return {
          weekStart,
          load: Math.round(load),
          intensity,
          workoutsCompleted: weekWorkouts.length,
        };
      },

      exportWorkoutData: () => {
        const workoutState = useWorkoutStore.getState();
        const data = {
          completedWorkouts: workoutState.completedWorkouts,
          personalRecords: workoutState.personalRecords,
          customWorkouts: workoutState.customWorkouts,
          exportDate: new Date().toISOString(),
        };
        return JSON.stringify(data, null, 2);
      },
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
