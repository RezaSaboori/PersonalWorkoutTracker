// src/utils/analytics.ts
import { WorkoutCompletion, VolumeData, TrainingLoad } from '../types/workout';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';

export function calculateVolume(workouts: WorkoutCompletion[]): VolumeData[] {
  const volumeMap = new Map<string, { date: string; volume: number; muscleGroup: string }>();

  workouts.forEach(workout => {
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
          muscleGroup: 'full_body', // Simplified
          exerciseId: exercise.exerciseId,
        });
      }
    });
  });

  return Array.from(volumeMap.values());
}

export function calculateTrainingLoad(workouts: WorkoutCompletion[], weekStart: string): TrainingLoad {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const weekWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    return workoutDate >= new Date(weekStart) && workoutDate < weekEnd;
  });

  const totalDuration = weekWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const load = weekWorkouts.length * 10 + (totalDuration / 60);

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
}

export function getMuscleGroupBalance(workouts: WorkoutCompletion[]): Record<string, number> {
  // Simplified - would need exercise library mapping
  const balance: Record<string, number> = {
    full_body: 0,
    upper: 0,
    lower: 0,
    core: 0,
  };

  workouts.forEach(workout => {
    workout.exercises.forEach(() => {
      balance.full_body += 1;
    });
  });

  return balance;
}

export function calculateProgressiveOverload(workouts: WorkoutCompletion[], exerciseId: string): {
  trend: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
} {
  const exerciseWorkouts = workouts
    .map(w => {
      const exercise = w.exercises.find(e => e.exerciseId === exerciseId);
      if (!exercise) return null;

      let value = 0;
      if (exercise.repsCompleted && exercise.repsCompleted.length > 0) {
        value = Math.max(...exercise.repsCompleted);
      } else if (exercise.timeCompleted && exercise.timeCompleted.length > 0) {
        value = Math.max(...exercise.timeCompleted);
      }

      return { date: w.date, value };
    })
    .filter(Boolean) as Array<{ date: string; value: number }>;

  if (exerciseWorkouts.length < 2) {
    return { trend: 'stable', percentage: 0 };
  }

  const sorted = exerciseWorkouts.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const first = sorted[0].value;
  const last = sorted[sorted.length - 1].value;
  const percentage = first > 0 ? ((last - first) / first) * 100 : 0;

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (percentage > 5) trend = 'increasing';
  else if (percentage < -5) trend = 'decreasing';

  return { trend, percentage: Math.round(percentage) };
}
