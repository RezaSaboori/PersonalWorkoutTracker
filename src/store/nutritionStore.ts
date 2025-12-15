// src/store/nutritionStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NutritionCheckIn } from '../types/workout';

interface NutritionState {
  checkIns: NutritionCheckIn[];
  defaultTargetHydration: number; // ml

  // Actions
  addCheckIn: (checkIn: NutritionCheckIn) => void;
  updateCheckIn: (date: string, updates: Partial<NutritionCheckIn>) => void;
  getCheckIn: (date: string) => NutritionCheckIn | null;
  getTodayCheckIn: () => NutritionCheckIn | null;
  getHydrationProgress: (date: string) => number; // 0-100 percentage
  getWeeklyNutritionStats: () => {
    mealsCompleted: number;
    totalMeals: number;
    averageHydration: number;
  };
}

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      checkIns: [],
      defaultTargetHydration: 3000, // 3L default

      addCheckIn: (checkIn) => {
        set((state) => {
          const exists = state.checkIns.find(c => c.date === checkIn.date);
          if (exists) {
            return {
              checkIns: state.checkIns.map(c => 
                c.date === checkIn.date ? checkIn : c
              )
            };
          }
          return {
            checkIns: [...state.checkIns, checkIn]
          };
        });
      },

      updateCheckIn: (date, updates) => {
        set((state) => {
          const existing = state.checkIns.find(c => c.date === date);
          if (existing) {
            return {
              checkIns: state.checkIns.map(c => 
                c.date === date ? { ...c, ...updates } : c
              )
            };
          }
          // Create new check-in if doesn't exist
          const newCheckIn: NutritionCheckIn = {
            date,
            breakfast: false,
            lunch: false,
            dinner: false,
            snacks: false,
            hydration: 0,
            targetHydration: state.defaultTargetHydration,
            ...updates,
          };
          return {
            checkIns: [...state.checkIns, newCheckIn]
          };
        });
      },

      getCheckIn: (date) => {
        const state = get();
        return state.checkIns.find(c => c.date === date) || null;
      },

      getTodayCheckIn: () => {
        const state = get();
        const today = getTodayDateString();
        return state.checkIns.find(c => c.date === today) || null;
      },

      getHydrationProgress: (date) => {
        const state = get();
        const checkIn = state.checkIns.find(c => c.date === date);
        if (!checkIn) return 0;
        return Math.min(100, (checkIn.hydration / checkIn.targetHydration) * 100);
      },

      getWeeklyNutritionStats: () => {
        const state = get();
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7); // Monday
        
        const weekCheckIns = state.checkIns.filter(c => {
          const checkInDate = new Date(c.date);
          return checkInDate >= weekStart && checkInDate <= today;
        });

        const mealsCompleted = weekCheckIns.reduce((sum, c) => {
          return sum + (c.breakfast ? 1 : 0) + (c.lunch ? 1 : 0) + 
                 (c.dinner ? 1 : 0) + (c.snacks ? 1 : 0);
        }, 0);
        
        const totalMeals = weekCheckIns.length * 4; // 4 meals per day
        const totalHydration = weekCheckIns.reduce((sum, c) => sum + c.hydration, 0);
        const averageHydration = weekCheckIns.length > 0 
          ? totalHydration / weekCheckIns.length 
          : 0;

        return {
          mealsCompleted,
          totalMeals,
          averageHydration,
        };
      },
    }),
    {
      name: 'nutrition-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
