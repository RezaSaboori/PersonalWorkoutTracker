// src/store/workoutStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WorkoutCompletion, WorkoutCustomization, PersonalRecord, CustomWorkout, WorkoutNote, ProgramConfig, MissedWorkout, WeekPlan } from '../types/workout';

export type InProgressWorkout = {
  workoutId: string;
  week: number;
  day: string;
  currentExerciseIndex: number;
  completedExercises: Record<string, number[]>;
  exerciseCompletions: Record<string, ExerciseCompletion>;
  workoutStartTime: number;
  pausedDuration: number;
  workoutNotes: Record<string, string>;
};

interface WorkoutState {
  currentWeek: number;
  completedWorkouts: WorkoutCompletion[];
  customizedWorkouts: Record<string, WorkoutCustomization>;
  personalRecords: PersonalRecord[];
  customWorkouts: CustomWorkout[];
  workoutNotes: WorkoutNote[];
  programConfig: ProgramConfig | null;
  missedWorkouts: MissedWorkout[];
  activeProgramWeeks: WeekPlan[] | null;
  inProgressWorkout: InProgressWorkout | null;
  
  // Actions
  toggleWorkoutComplete: (date: string) => void;
  addWorkoutCompletion: (completion: WorkoutCompletion) => void;
  updateWorkoutCustomization: (customization: WorkoutCustomization) => void;
  resetWorkoutCustomization: (workoutId: string) => void;
  addPersonalRecord: (record: PersonalRecord) => void;
  advanceWeek: () => void;
  setWeek: (week: number) => void;
  resetProgress: () => void;
  
  // Program config actions
  setProgramStartDate: (date: string) => void;
  getCurrentWeekFromStartDate: () => number;
  updateProgramConfig: (config: Partial<ProgramConfig>) => void;
  setActiveProgramWeeks: (weeks: WeekPlan[]) => void;
  
  // Missed workout actions
  getMissedWorkouts: () => MissedWorkout[];
  markWorkoutAsMissed: (date: string, workoutId: string, workoutName: string, week: number, day: string) => void;
  rescheduleMissedWorkout: (missedWorkoutId: string, newDate: string) => void;
  clearMissedWorkout: (missedWorkoutId: string) => void;
  clearAllMissedWorkouts: () => void;
  
  // Custom workout actions
  addCustomWorkout: (workout: CustomWorkout) => void;
  updateCustomWorkout: (id: string, workout: Partial<CustomWorkout>) => void;
  deleteCustomWorkout: (id: string) => void;
  getCustomWorkout: (id: string) => CustomWorkout | null;
  
  // Notes actions
  addWorkoutNote: (note: WorkoutNote) => void;
  getWorkoutNotes: (workoutId: string) => WorkoutNote[];
  
  // In-progress workout actions
  saveInProgressWorkout: (workout: InProgressWorkout) => void;
  getInProgressWorkout: (workoutId: string) => InProgressWorkout | null;
  clearInProgressWorkout: (workoutId: string) => void;
  
  // Computed
  getStreak: () => { current: number; longest: number };
  isWorkoutCompleted: (date: string, workoutId: string) => boolean;
  getCustomizedWorkout: (workoutId: string) => WorkoutCustomization | null;
  getPersonalRecord: (exerciseId: string) => PersonalRecord | null;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      currentWeek: 1,
      completedWorkouts: [],
      customizedWorkouts: {},
      personalRecords: [],
      customWorkouts: [],
      workoutNotes: [],
      programConfig: null,
      missedWorkouts: [],
      activeProgramWeeks: null,
      inProgressWorkout: null,

      toggleWorkoutComplete: (date) => {
        // Legacy support - keeping for backward compatibility
        set((state) => {
          const exists = state.completedWorkouts.some(w => w.date === date);
          if (exists) {
            return {
              completedWorkouts: state.completedWorkouts.filter(w => w.date !== date)
            };
          }
          return state;
        });
      },

      addWorkoutCompletion: (completion) => {
        set((state) => {
          // Remove existing completion for same date/workout if exists
          const filtered = state.completedWorkouts.filter(
            w => !(w.date === completion.date && w.workoutId === completion.workoutId)
          );
          return {
            completedWorkouts: [...filtered, completion]
          };
        });
      },

      updateWorkoutCustomization: (customization) => {
        set((state) => ({
          customizedWorkouts: {
            ...state.customizedWorkouts,
            [customization.workoutId]: customization
          }
        }));
      },

      resetWorkoutCustomization: (workoutId) => {
        set((state) => {
          const { [workoutId]: removed, ...rest } = state.customizedWorkouts;
          return { customizedWorkouts: rest };
        });
      },

      addPersonalRecord: (record) => {
        set((state) => {
          const existing = state.personalRecords.find(r => r.exerciseId === record.exerciseId);
          if (existing) {
            // Only update if new record is better
            const isBetter = record.type === 'reps' 
              ? record.value > existing.value
              : record.value > existing.value; // For time, higher is better (longer hold)
            
            if (isBetter) {
              return {
                personalRecords: state.personalRecords.map(r => 
                  r.exerciseId === record.exerciseId ? record : r
                )
              };
            }
            return state;
          }
        return {
            personalRecords: [...state.personalRecords, record]
          };
        });
      },

      advanceWeek: () => {
        set((state) => ({ 
          currentWeek: Math.min(state.currentWeek + 1, 6) 
        }));
      },

      setWeek: (week) => {
        set({ currentWeek: Math.max(1, Math.min(week, 6)) });
      },

      resetProgress: () => {
        set({ 
          currentWeek: 1, 
          completedWorkouts: [],
          personalRecords: []
        });
      },

      getStreak: () => {
        const state = get();
        const sorted = [...state.completedWorkouts]
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        if (sorted.length === 0) {
          return { current: 0, longest: 0 };
        }

        // Calculate current streak (consecutive days from today backwards)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let currentStreak = 0;
        let checkDate = new Date(today);
        
        const uniqueDates = new Set(sorted.map(w => w.date));
        
        while (true) {
          const dateStr = checkDate.toISOString().split('T')[0];
          if (uniqueDates.has(dateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        // Calculate longest streak
        let longestStreak = 1;
        let tempStreak = 1;
        const dates = Array.from(uniqueDates).sort();
        
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1]);
          const curr = new Date(dates[i]);
          const diffDays = Math.floor((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 1;
          }
        }

        return { current: currentStreak, longest: longestStreak };
      },

      isWorkoutCompleted: (date, workoutId) => {
        const state = get();
        return state.completedWorkouts.some(
          w => w.date === date && w.workoutId === workoutId
        );
      },

      getCustomizedWorkout: (workoutId) => {
        const state = get();
        return state.customizedWorkouts[workoutId] || null;
      },

      getPersonalRecord: (exerciseId) => {
        const state = get();
        return state.personalRecords.find(r => r.exerciseId === exerciseId) || null;
      },

      // Custom workout methods
      addCustomWorkout: (workout) => {
        set((state) => ({
          customWorkouts: [...state.customWorkouts, workout]
        }));
      },

      updateCustomWorkout: (id, updates) => {
        set((state) => ({
          customWorkouts: state.customWorkouts.map(w =>
            w.id === id ? { ...w, ...updates, lastModified: new Date().toISOString() } : w
          )
        }));
      },

      deleteCustomWorkout: (id) => {
        set((state) => ({
          customWorkouts: state.customWorkouts.filter(w => w.id !== id)
        }));
      },

      getCustomWorkout: (id) => {
        const state = get();
        return state.customWorkouts.find(w => w.id === id) || null;
      },

      // Notes methods
      addWorkoutNote: (note) => {
        set((state) => ({
          workoutNotes: [...state.workoutNotes, note]
        }));
      },

      getWorkoutNotes: (workoutId) => {
        const state = get();
        return state.workoutNotes.filter(n => n.workoutId === workoutId);
      },

      // Program config methods
      setProgramStartDate: (date) => {
        set((state) => ({
          programConfig: {
            startDate: date,
            currentWeek: state.currentWeek,
            autoAdvance: true,
          }
        }));
      },

      getCurrentWeekFromStartDate: () => {
        const state = get();
        if (!state.programConfig?.startDate) {
          return state.currentWeek;
        }

        const startDate = new Date(state.programConfig.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);

        const diffTime = today.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const weeksSinceStart = Math.floor(diffDays / 7) + 1;

        // Auto-advance if enabled
        if (state.programConfig.autoAdvance && weeksSinceStart !== state.currentWeek) {
          const newWeek = Math.min(Math.max(1, weeksSinceStart), 6);
          set({ currentWeek: newWeek });
          return newWeek;
        }

        return state.currentWeek;
      },

      updateProgramConfig: (updates) => {
        set((state) => ({
          programConfig: state.programConfig
            ? { ...state.programConfig, ...updates }
            : {
                startDate: new Date().toISOString().split('T')[0],
                currentWeek: 1,
                autoAdvance: true,
                ...updates,
              },
        }));
      },

      setActiveProgramWeeks: (weeks: WeekPlan[]) => {
        set({ activeProgramWeeks: weeks });
      },

      // Missed workout methods
      getMissedWorkouts: () => {
        const state = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Filter out old missed workouts (older than 7 days) and those that have been made up
        return state.missedWorkouts.filter(missed => {
          const missedDate = new Date(missed.scheduledDate);
          missedDate.setHours(0, 0, 0, 0);
          const daysSince = Math.floor((today.getTime() - missedDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Keep if within last 7 days and not made up
          return daysSince <= 7 && !missed.makeUpDate;
        });
      },

      markWorkoutAsMissed: (date, workoutId, workoutName, week, day) => {
        set((state) => {
          // Check if already marked as missed
          const existing = state.missedWorkouts.find(
            m => m.scheduledDate === date && m.workoutId === workoutId
          );
          
          if (existing) {
            return state;
          }

          const missed: MissedWorkout = {
            scheduledDate: date,
            workoutId,
            workoutName,
            week,
            day,
            canMakeUp: true,
          };

          return {
            missedWorkouts: [...state.missedWorkouts, missed],
          };
        });
      },

      rescheduleMissedWorkout: (missedWorkoutId, newDate) => {
        set((state) => ({
          missedWorkouts: state.missedWorkouts.map(missed => {
            if (missed.scheduledDate === missedWorkoutId.split('-')[0] && 
                missed.workoutId === missedWorkoutId.split('-')[1]) {
              return { ...missed, makeUpDate: newDate };
            }
            return missed;
          }),
        }));
      },

      clearMissedWorkout: (missedWorkoutId) => {
        set((state) => {
          const [date, workoutId] = missedWorkoutId.split('-');
          return {
            missedWorkouts: state.missedWorkouts.filter(
              m => !(m.scheduledDate === date && m.workoutId === workoutId)
            ),
          };
        });
      },

      clearAllMissedWorkouts: () => {
        set({ missedWorkouts: [] });
      },

      // In-progress workout actions
      saveInProgressWorkout: (workout) => {
        set({ inProgressWorkout: workout });
      },

      getInProgressWorkout: (workoutId) => {
        const state = get();
        return state.inProgressWorkout?.workoutId === workoutId 
          ? state.inProgressWorkout 
          : null;
      },

      clearInProgressWorkout: (workoutId) => {
        set((state) => {
          if (state.inProgressWorkout?.workoutId === workoutId) {
            return { inProgressWorkout: null };
          }
          return state;
        });
      },
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
