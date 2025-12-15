// src/store/achievementsStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Achievement } from '../types/workout';
import { useWorkoutStore } from './workoutStore';
import { useNutritionStore } from './nutritionStore';
import { FULL_PROGRAM_DATA } from '../data/fullProgram';

export const ACHIEVEMENTS_DEFINITIONS: Omit<Achievement, 'unlockedAt' | 'progress'>[] = [
  {
    id: 'first_workout',
    title: 'First Step',
    icon: '🏃',
    description: 'Complete your first workout',
  },
  {
    id: 'week_complete',
    title: 'Week Warrior',
    icon: '💪',
    description: 'Complete a full week of workouts',
  },
  {
    id: 'streak_3',
    title: 'Getting Started',
    icon: '🔥',
    description: '3-day workout streak',
  },
  {
    id: 'streak_7',
    title: 'Week Streak',
    icon: '🔥',
    description: '7-day workout streak',
  },
  {
    id: 'streak_14',
    title: 'Two Week Champion',
    icon: '⚡',
    description: '14-day workout streak',
  },
  {
    id: 'streak_30',
    title: 'Unstoppable',
    icon: '⚡',
    description: '30-day workout streak',
  },
  {
    id: 'phase_1_complete',
    title: 'Foundation Built',
    icon: '🏗️',
    description: 'Complete Phase 1 (Weeks 1-2)',
  },
  {
    id: 'phase_2_complete',
    title: 'Strength Master',
    icon: '💪',
    description: 'Complete Phase 2 (Weeks 3-4)',
  },
  {
    id: 'phase_3_complete',
    title: 'HIIT Hero',
    icon: '⚡',
    description: 'Complete Phase 3 (Weeks 5-6)',
  },
  {
    id: 'program_complete',
    title: 'Program Champion',
    icon: '🏆',
    description: 'Complete the full 6-week program',
  },
  {
    id: 'personal_record',
    title: 'New PR!',
    icon: '🏆',
    description: 'Set a personal record',
  },
  {
    id: 'workout_10',
    title: 'Dedicated',
    icon: '🎯',
    description: 'Complete 10 workouts',
  },
  {
    id: 'workout_25',
    title: 'Committed',
    icon: '🎯',
    description: 'Complete 25 workouts',
  },
  {
    id: 'workout_50',
    title: 'Elite',
    icon: '👑',
    description: 'Complete 50 workouts',
  },
  {
    id: 'nutrition_week',
    title: 'Well Nourished',
    icon: '🥗',
    description: 'Complete a full week of nutrition check-ins',
  },
];

interface AchievementsState {
  unlockedAchievements: Record<string, string>; // achievementId -> unlockedAt ISO string
  checkAndUnlockAchievements: () => Achievement[]; // Returns newly unlocked achievements
  getAllAchievements: () => Achievement[];
  getUnlockedAchievements: () => Achievement[];
  getLockedAchievements: () => Achievement[];
  getAchievementProgress: (achievementId: string) => number; // 0-100
  resetAchievements: () => void; // Reset all achievements
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      unlockedAchievements: {},

      checkAndUnlockAchievements: () => {
        const state = get();
        const workoutState = useWorkoutStore.getState();
        const nutritionState = useNutritionStore.getState();
        const newlyUnlocked: Achievement[] = [];

        const checkAchievement = (id: string, condition: boolean) => {
          if (condition && !state.unlockedAchievements[id]) {
            const achievementDef = ACHIEVEMENTS_DEFINITIONS.find(a => a.id === id);
            if (achievementDef) {
              const now = new Date().toISOString();
              set((s) => ({
                unlockedAchievements: {
                  ...s.unlockedAchievements,
                  [id]: now,
                }
              }));
              newlyUnlocked.push({
                ...achievementDef,
                unlockedAt: now,
              });
            }
          }
        };

        // Check all achievements
        const completedWorkouts = workoutState.completedWorkouts;
        const totalWorkouts = completedWorkouts.length;
        const streak = workoutState.getStreak();
        const currentWeek = workoutState.currentWeek;
        const hasPersonalRecords = workoutState.personalRecords.length > 0;

        // First workout
        checkAchievement('first_workout', totalWorkouts >= 1);

        // Workout counts
        checkAchievement('workout_10', totalWorkouts >= 10);
        checkAchievement('workout_25', totalWorkouts >= 25);
        checkAchievement('workout_50', totalWorkouts >= 50);

        // Streaks
        checkAchievement('streak_3', streak.current >= 3);
        checkAchievement('streak_7', streak.current >= 7);
        checkAchievement('streak_14', streak.current >= 14);
        checkAchievement('streak_30', streak.current >= 30);

        // Phase completions (simplified - check if user has completed workouts in that phase)
        const phase1Workouts = completedWorkouts.filter(w => {
          // Check if workout belongs to weeks 1-2
          const week = FULL_PROGRAM_DATA.find(wp => 
            Object.values(wp.schedule).some(wo => wo?.id === w.workoutId)
          );
          return week && (week.weekNumber === 1 || week.weekNumber === 2);
        });
        checkAchievement('phase_1_complete', phase1Workouts.length >= 6); // 3 workouts/week * 2 weeks

        const phase2Workouts = completedWorkouts.filter(w => {
          const week = FULL_PROGRAM_DATA.find(wp => 
            Object.values(wp.schedule).some(wo => wo?.id === w.workoutId)
          );
          return week && (week.weekNumber === 3 || week.weekNumber === 4);
        });
        checkAchievement('phase_2_complete', phase2Workouts.length >= 8); // 4 workouts/week * 2 weeks

        const phase3Workouts = completedWorkouts.filter(w => {
          const week = FULL_PROGRAM_DATA.find(wp => 
            Object.values(wp.schedule).some(wo => wo?.id === w.workoutId)
          );
          return week && (week.weekNumber === 5 || week.weekNumber === 6);
        });
        checkAchievement('phase_3_complete', phase3Workouts.length >= 8);

        // Full program
        checkAchievement('program_complete', currentWeek === 6 && totalWorkouts >= 20);

        // Personal records
        checkAchievement('personal_record', hasPersonalRecords);

        // Nutrition (check if user has completed a week of nutrition)
        const weeklyStats = nutritionState.getWeeklyNutritionStats();
        checkAchievement('nutrition_week', weeklyStats.mealsCompleted >= 20); // ~3 meals/day * 7 days

        return newlyUnlocked;
      },

      getAllAchievements: () => {
        const state = get();
        return ACHIEVEMENTS_DEFINITIONS.map(def => {
          const unlockedAt = state.unlockedAchievements[def.id];
          const progress = get().getAchievementProgress(def.id);
          return {
            ...def,
            unlockedAt,
            progress,
          };
        });
      },

      getUnlockedAchievements: () => {
        const state = get();
        return state.getAllAchievements().filter(a => a.unlockedAt);
      },

      getLockedAchievements: () => {
        const state = get();
        return state.getAllAchievements().filter(a => !a.unlockedAt);
      },

      getAchievementProgress: (achievementId) => {
        const workoutState = useWorkoutStore.getState();
        const nutritionState = useNutritionStore.getState();
        const completedWorkouts = workoutState.completedWorkouts;
        const totalWorkouts = completedWorkouts.length;
        const streak = workoutState.getStreak();
        const currentWeek = workoutState.currentWeek;

        switch (achievementId) {
          case 'first_workout':
            return totalWorkouts >= 1 ? 100 : 0;
          case 'workout_10':
            return Math.min(100, (totalWorkouts / 10) * 100);
          case 'workout_25':
            return Math.min(100, (totalWorkouts / 25) * 100);
          case 'workout_50':
            return Math.min(100, (totalWorkouts / 50) * 100);
          case 'streak_3':
            return Math.min(100, (streak.current / 3) * 100);
          case 'streak_7':
            return Math.min(100, (streak.current / 7) * 100);
          case 'streak_14':
            return Math.min(100, (streak.current / 14) * 100);
          case 'streak_30':
            return Math.min(100, (streak.current / 30) * 100);
          case 'phase_1_complete':
            return Math.min(100, (currentWeek / 2) * 100);
          case 'phase_2_complete':
            return currentWeek >= 2 ? Math.min(100, ((currentWeek - 2) / 2) * 100) : 0;
          case 'phase_3_complete':
            return currentWeek >= 4 ? Math.min(100, ((currentWeek - 4) * 50)) : 0;
          case 'program_complete':
            return Math.min(100, (currentWeek / 6) * 100);
          default:
            return 0;
        }
      },

      resetAchievements: () => {
        set({ unlockedAchievements: {} });
      },
    }),
    {
      name: 'achievements-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
