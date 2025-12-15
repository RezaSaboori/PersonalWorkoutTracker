// src/services/appleAI.ts
// Apple Foundation Kit AI Service using Core ML and Apple Intelligence APIs
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { WorkoutCompletion, PersonalRecord, Recommendation } from '../types/workout';

// Native module interface for Apple AI (Core ML / Apple Intelligence)
interface AppleAIModule {
  generateWorkoutRecommendation: (data: string) => Promise<string>;
  analyzeWorkoutPattern: (workouts: string) => Promise<string>;
  predictOptimalRecovery: (data: string) => Promise<string>;
  isAvailable: () => boolean;
}

// Try to load native Apple AI module
let AppleAI: AppleAIModule | null = null;
let isAppleAIAvailable = false;

// Check if we're in a native build (not Expo Go)
const isNativeBuild = Constants.executionEnvironment !== 'storeClient' && 
                      Constants.appOwnership !== 'expo';

if (isNativeBuild && Platform.OS === 'ios') {
  try {
    // Try to load native Expo module
    const { default: AppleAIModule } = require('../native/AppleAI');
    if (AppleAIModule && AppleAIModule.isAvailable && AppleAIModule.isAvailable()) {
      AppleAI = {
        generateWorkoutRecommendation: AppleAIModule.generateWorkoutRecommendation.bind(AppleAIModule),
        analyzeWorkoutPattern: AppleAIModule.analyzeWorkoutPattern.bind(AppleAIModule),
        predictOptimalRecovery: AppleAIModule.predictOptimalRecovery.bind(AppleAIModule),
        isAvailable: AppleAIModule.isAvailable.bind(AppleAIModule),
      };
      isAppleAIAvailable = true;
    }
  } catch (error) {
    // Native module not available - will use fallback
    console.log('Apple AI native module not available, using fallback:', error);
  }
}

/**
 * Generate AI-powered workout recommendations using Apple Foundation Kit
 * Falls back to rule-based recommendations if native AI is unavailable
 */
export async function generateAIRecommendations(
  workouts: WorkoutCompletion[],
  personalRecords: PersonalRecord[],
  currentWeek: number,
  streak: { current: number; longest: number }
): Promise<Recommendation[]> {
  // If Apple AI is available, use it
  if (isAppleAIAvailable && AppleAI) {
    try {
      const workoutData = JSON.stringify({
        workouts: workouts.slice(-10), // Last 10 workouts for context
        personalRecords,
        currentWeek,
        streak,
        timestamp: new Date().toISOString(),
      });

      const aiResponse = await AppleAI.generateWorkoutRecommendation(workoutData);
      const recommendations = JSON.parse(aiResponse) as Recommendation[];
      
      if (recommendations && Array.isArray(recommendations)) {
        return recommendations.slice(0, 5);
      }
    } catch (error) {
      console.error('Apple AI recommendation error:', error);
      // Fall through to fallback
    }
  }

  // Fallback to rule-based recommendations
  return generateFallbackRecommendations(workouts, personalRecords, currentWeek, streak);
}

/**
 * Analyze workout patterns using Apple Intelligence
 */
export async function analyzeWorkoutPatterns(
  workouts: WorkoutCompletion[]
): Promise<{
  trend: 'improving' | 'stable' | 'declining';
  insights: string[];
  suggestions: string[];
}> {
  if (isAppleAIAvailable && AppleAI) {
    try {
      const data = JSON.stringify({ workouts: workouts.slice(-20) });
      const analysis = await AppleAI.analyzeWorkoutPattern(data);
      return JSON.parse(analysis);
    } catch (error) {
      console.error('Apple AI pattern analysis error:', error);
    }
  }

  // Fallback analysis
  return {
    trend: 'stable',
    insights: ['Continue your current routine'],
    suggestions: ['Maintain consistency'],
  };
}

/**
 * Predict optimal recovery time using Core ML
 */
export async function predictRecoveryTime(
  recentWorkouts: WorkoutCompletion[],
  lastWorkout: WorkoutCompletion
): Promise<number> {
  if (isAppleAIAvailable && AppleAI) {
    try {
      const data = JSON.stringify({ recentWorkouts, lastWorkout });
      const prediction = await AppleAI.predictOptimalRecovery(data);
      const result = JSON.parse(prediction);
      return result.hours || 24;
    } catch (error) {
      console.error('Apple AI recovery prediction error:', error);
    }
  }

  // Fallback: simple calculation
  const intensity = lastWorkout.exercises.length * 2;
  return Math.max(24, Math.min(72, intensity * 12));
}

/**
 * Fallback rule-based recommendations (used when Apple AI unavailable)
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
        recommendations.push({
          id: `progressive-${exerciseId}`,
          type: 'progressive_overload',
          title: 'Time to Progress',
          message: `You've been doing the same reps for ${recentWorkouts.length} workouts. Consider increasing reps or adding resistance.`,
          priority: 'medium',
          createdAt: new Date().toISOString(),
        });
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

  return recommendations.slice(0, 5);
}

// Helper function for progressive overload calculation
function calculateProgressiveOverload(workouts: WorkoutCompletion[], exerciseId: string): {
  trend: 'improving' | 'stable' | 'declining';
  percentage: number;
} {
  const exerciseData = workouts
    .map(w => {
      const exercise = w.exercises.find(e => e.exerciseId === exerciseId);
      if (!exercise) return null;
      
      let value = 0;
      if (exercise.repsCompleted && exercise.repsCompleted.length > 0) {
        value = exercise.repsCompleted.reduce((sum, reps) => sum + reps, 0);
      } else if (exercise.timeCompleted && exercise.timeCompleted.length > 0) {
        value = exercise.timeCompleted.reduce((sum, time) => sum + time, 0);
      }
      
      return { date: w.date, value };
    })
    .filter(Boolean) as Array<{ date: string; value: number }>;

  if (exerciseData.length < 2) {
    return { trend: 'stable', percentage: 0 };
  }

  const sorted = exerciseData.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const first = sorted[0].value;
  const last = sorted[sorted.length - 1].value;
  const percentage = first > 0 ? ((last - first) / first) * 100 : 0;

  if (percentage > 5) return { trend: 'improving', percentage: Math.round(percentage) };
  if (percentage < -5) return { trend: 'declining', percentage: Math.round(percentage) };
  return { trend: 'stable', percentage: Math.round(percentage) };
}

/**
 * Check if Apple AI is available on this device
 */
export function isAppleAIAvailable(): boolean {
  return isAppleAIAvailable && Platform.OS === 'ios';
}

