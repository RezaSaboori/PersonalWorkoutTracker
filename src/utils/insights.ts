// src/utils/insights.ts
import { useWorkoutStore } from '../store/workoutStore';
import { useProgressStore } from '../store/progressStore';

export const generateInsights = () => {
  const workoutStore = useWorkoutStore.getState();
  const progressStore = useProgressStore.getState();
  const completedWorkouts = workoutStore.completedWorkouts;
  const streak = workoutStore.getStreak();

  const insights: string[] = [];

  // Consistency analysis
  if (completedWorkouts.length > 0) {
    const dayCounts: Record<string, number> = {};
    completedWorkouts.forEach(w => {
      const day = new Date(w.date).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });
    
    const mostActiveDay = Object.entries(dayCounts).reduce((a, b) => 
      dayCounts[a[0]] > dayCounts[b[0]] ? a : b
    );
    
    if (mostActiveDay) {
      insights.push(`You work out most on ${mostActiveDay[0]}s!`);
    }
  }

  // Streak motivation
  if (streak.current >= 7) {
    insights.push(`🔥 Amazing ${streak.current}-day streak! Keep it up!`);
  } else if (streak.current >= 3) {
    insights.push(`Great ${streak.current}-day streak! You're building momentum.`);
  }

  // Progress encouragement
  if (completedWorkouts.length >= 10) {
    insights.push(`You've completed ${completedWorkouts.length} workouts! Consistency is key.`);
  }

  return insights.length > 0 ? insights : ['Keep going! Every workout counts. 💪'];
};
