// src/store/userStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, WorkoutPreferences } from '../types/workout';

interface UserState {
  profile: UserProfile | null;
  preferences: WorkoutPreferences;
  
  // Profile actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  
  // Preferences actions
  updatePreferences: (updates: Partial<WorkoutPreferences>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: WorkoutPreferences = {
  defaultRestDuration: 60,
  autoStartNextExercise: false,
  voiceCountdownInterval: 5,
  workoutReminders: true,
  restDayReminders: true,
  hapticFeedback: true,
  voiceGuidance: true,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      preferences: defaultPreferences,

      setProfile: (profile) => {
        set({ profile });
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...updates }
            : ({
                fitnessLevel: 'beginner',
                goals: [],
                preferredSchedule: [],
                onboardingComplete: false,
                createdAt: new Date().toISOString(),
                ...updates,
              } as UserProfile),
        }));
      },

      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        }));
      },

      resetPreferences: () => {
        set({ preferences: defaultPreferences });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
