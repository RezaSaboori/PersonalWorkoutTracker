// src/utils/aiRecommendations.ts
// Updated to use Apple Foundation Kit AI
import { Recommendation } from '../types/workout';
import { WorkoutCompletion, PersonalRecord } from '../types/workout';
import { generateAIRecommendations } from '../services/appleAI';
import { calculateProgressiveOverload, getMuscleGroupBalance } from './analytics';

/**
 * Generate recommendations using Apple Foundation Kit AI (with fallback)
 */
export async function generateRecommendations(
  workouts: WorkoutCompletion[],
  personalRecords: PersonalRecord[],
  currentWeek: number,
  streak: { current: number; longest: number }
): Promise<Recommendation[]> {
  // Try Apple AI first
  try {
    const aiRecommendations = await generateAIRecommendations(
      workouts,
      personalRecords,
      currentWeek,
      streak
    );
    if (aiRecommendations && aiRecommendations.length > 0) {
      return aiRecommendations;
    }
  } catch (error) {
    console.log('Apple AI unavailable, using fallback:', error);
  }

  // Fallback to rule-based recommendations
  return generateFallbackRecommendations(workouts, personalRecords, currentWeek, streak);
}

/**
 * Fallback rule-based recommendations
 */
function generateFallbackRecommendations(
  workouts: WorkoutCompletion[],
  personalRecords: PersonalRecord[],
  currentWeek: number,
  streak: { current: number; longest: number }
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Progressive overload recommendations
  if (workouts.length >= 3) {
    const recentWorkouts = workouts.slice(-5);
    const exerciseIds = new Set<string>();
    recentWorkouts.forEach(w => {
      w.exercises.forEach(e => exerciseIds.add(e.exerciseId));
    });

    exerciseIds.forEach(exerciseId => {
      const progression = calculateProgressiveOverload(recentWorkouts, exerciseId);
      if (progression.trend === 'stable' && progression.percentage === 0) {
        const exercise = recentWorkouts[recentWorkouts.length - 1]?.exercises.find(
          e => e.exerciseId === exerciseId
        );
        if (exercise) {
          recommendations.push({
            id: `progressive-${exerciseId}`,
            type: 'progressive_overload',
            title: 'Time to Progress',
            message: `You've been doing the same reps for ${recentWorkouts.length} workouts. Consider increasing reps or adding resistance.`,
            priority: 'medium',
            createdAt: new Date().toISOString(),
          });
        }
      }
    });
  }

  // Streak encouragement
  if (streak.current >= 3 && streak.current < 7) {
    recommendations.push({
      id: 'streak-encouragement',
      type: 'goal_guidance',
      title: 'Great Streak!',
      message: `You're on a ${streak.current}-day streak! Keep it up to reach 7 days.`,
      priority: 'low',
      createdAt: new Date().toISOString(),
    });
  }

  // Muscle balance recommendations
  const balance = getMuscleGroupBalance(workouts);
  const total = Object.values(balance).reduce((sum, val) => sum + val, 0);
  if (total > 10) {
    // Simplified balance check
    recommendations.push({
      id: 'balance-check',
      type: 'workout_suggestion',
      title: 'Balance Your Training',
      message: "Make sure you're training all muscle groups evenly for optimal results.",
      priority: 'low',
      createdAt: new Date().toISOString(),
    });
  }

  // Recovery recommendations
  const recentWeekWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workoutDate >= weekAgo;
  });

  if (recentWeekWorkouts.length >= 5) {
    recommendations.push({
      id: 'recovery-suggestion',
      type: 'recovery',
      title: 'Rest Day Recommended',
      message: "You've been working out frequently. Consider taking a rest day for optimal recovery.",
      priority: 'medium',
      createdAt: new Date().toISOString(),
    });
  }

  // Personal record celebration
  if (personalRecords.length > 0) {
    const recentPR = personalRecords.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    
    const daysSincePR = Math.floor(
      (Date.now() - new Date(recentPR.date).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePR <= 7) {
      recommendations.push({
        id: 'pr-celebration',
        type: 'goal_guidance',
        title: 'New Personal Record!',
        message: `Congratulations on your new PR in ${recentPR.exerciseName}!`,
        priority: 'low',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}
