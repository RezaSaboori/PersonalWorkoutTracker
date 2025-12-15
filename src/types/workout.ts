// src/types/workout.ts

export type ExerciseType = 'reps' | 'time' | 'hiit';

export type RepBasedExercise = {
  id: string;
  type: 'reps';
  name: string;
  reps: string; // "12-15" or "10-12 / leg" or "Max"
  sets: number;
  rest: number; // in seconds
};

export type TimeBasedExercise = {
  id: string;
  type: 'time';
  name: string;
  duration: number; // in seconds
  sets: number;
  rest: number; // in seconds
};

export type HIITExercise = {
  id: string;
  type: 'hiit';
  name: string;
  workInterval: number; // in seconds
  restInterval: number; // in seconds
  rounds: number;
  exercises: string[]; // exercise names in the circuit
};

export type Exercise = RepBasedExercise | TimeBasedExercise | HIITExercise;

export type WorkoutDay = {
  id: string;
  title: string;
  focus: string;
  duration: string;
  warmup: string;
  exercises: Exercise[];
  cooldown: string;
};

export type WeekPlan = {
  weekNumber: number;
  phaseName: string;
  schedule: Record<string, WorkoutDay | null>; // "Monday", "Tuesday", etc. Null = Rest
};

// Workout Program (complete program definition)
export type WorkoutProgram = {
  id: string;
  name: string;
  description: string;
  duration: string; // e.g., "6 weeks"
  totalWeeks: number;
  workoutsPerWeek: number;
  estimatedTimePerWorkout: string; // e.g., "25-30 min"
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  focus: string[]; // e.g., ['Full Body', 'Strength', 'Cardio']
  weeks: WeekPlan[];
  icon?: string;
};

// Program configuration
export type ProgramConfig = {
  startDate: string; // ISO date string when program started
  currentWeek: number;
  autoAdvance: boolean; // Auto-advance week based on start date
  activeProgramId?: string; // ID of the selected program
};

// Missed workout handling
export type MissedWorkout = {
  scheduledDate: string; // ISO date
  workoutId: string;
  workoutName: string;
  week: number;
  day: string;
  canMakeUp: boolean;
  makeUpDate?: string; // If user rescheduled
};

export type ExerciseCompletion = {
  exerciseId: string;
  sets: number[]; // Array of completed set indices (0-based)
  repsCompleted?: number[]; // For rep-based: actual reps per set
  timeCompleted?: number[]; // For time-based: actual time per set in seconds
  completedAt: string; // ISO timestamp
};

export type WorkoutCompletion = {
  date: string; // ISO date string
  workoutId: string;
  exercises: ExerciseCompletion[];
  completedAt: string; // ISO timestamp
  duration?: number; // Total workout duration in seconds
};

export type WorkoutCustomization = {
  workoutId: string;
  exerciseCustomizations: Record<string, {
    reps?: string;
    sets?: number;
    rest?: number;
    duration?: number;
    workInterval?: number;
    restInterval?: number;
  }>;
};

export type PersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  type: ExerciseType;
  value: number; // Max reps, longest time, etc.
  date: string; // ISO date
  workoutId: string;
};

export type NutritionCheckIn = {
  date: string; // ISO date
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
  snacks: boolean;
  hydration: number; // ml of water
  targetHydration: number; // ml target (default 3000ml = 3L)
};

export type Achievement = {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlockedAt?: string; // ISO timestamp
  progress?: number; // 0-100 for progress toward achievement
};

// Custom workout type
export type CustomWorkout = {
  id: string;
  name: string;
  focus: string;
  duration: string;
  warmup: string;
  exercises: Exercise[];
  cooldown: string;
  createdAt: string;
  lastModified: string;
  isTemplate?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  basedOnWorkoutId?: string; // If created from a program workout
};

// Workout note
export type WorkoutNote = {
  workoutId: string;
  exerciseId?: string;
  note: string;
  timestamp: string;
};

// Analytics types
export type VolumeData = {
  date: string;
  volume: number;
  muscleGroup: string;
  exerciseId?: string;
  exerciseName?: string;
};

export type TrainingLoad = {
  weekStart: string;
  load: number;
  intensity: 'low' | 'moderate' | 'high' | 'very_high';
  workoutsCompleted: number;
};

// User preferences
export type WorkoutPreferences = {
  defaultRestDuration: number;
  autoStartNextExercise: boolean;
  voiceCountdownInterval: number;
  workoutReminders: boolean;
  restDayReminders: boolean;
  hapticFeedback: boolean;
  voiceGuidance: boolean;
};

// Exercise definition for library
export type ExerciseDefinition = {
  id: string;
  name: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'hiit';
  muscleGroups: string[]; // 'chest', 'legs', 'back', 'core', 'shoulders', 'arms', etc.
  equipment: 'bodyweight' | 'dumbbells' | 'barbell' | 'bands' | 'none';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  formTips: string[];
  defaultSets?: number;
  defaultReps?: string;
  defaultDuration?: number;
  defaultRest?: number;
  videoUrl?: string; // Optional video demo
  imageUrl?: string;
};

// User profile
export type UserProfile = {
  name?: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  preferredSchedule: string[];
  onboardingComplete: boolean;
  createdAt: string;
};

// Workout history filters
export type WorkoutHistoryFilters = {
  dateRange?: {
    start: string; // ISO date
    end: string; // ISO date
  };
  workoutType?: 'program' | 'custom' | 'all';
  phase?: number;
  week?: number;
  searchQuery?: string;
};

// AI Recommendation
export type Recommendation = {
  id: string;
  type: 'workout_suggestion' | 'progressive_overload' | 'recovery' | 'goal_guidance' | 'balance';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionLabel?: string;
  actionRoute?: string;
  createdAt: string;
  dismissed?: boolean;
};
