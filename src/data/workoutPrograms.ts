// src/data/workoutPrograms.ts
import { WorkoutProgram, WeekPlan } from '../types/workout';
import { FULL_PROGRAM_DATA } from './fullProgram';

// Foundation Program (6 weeks)
export const FOUNDATION_PROGRAM: WorkoutProgram = {
  id: 'foundation-6-week',
  name: '6-Week Foundation Program',
  description: 'A comprehensive 6-week program designed for beginners to build strength, endurance, and proper form. Perfect for those starting their fitness journey.',
  duration: '6 weeks',
  totalWeeks: 6,
  workoutsPerWeek: 3,
  estimatedTimePerWorkout: '25-35 min',
  difficulty: 'beginner',
  focus: ['Full Body', 'Strength', 'Form & Consistency'],
  weeks: FULL_PROGRAM_DATA,
};

// Create a shorter 3-week foundation program
const FOUNDATION_WEEK_1_2_3: WeekPlan[] = FULL_PROGRAM_DATA.slice(0, 3);

export const FOUNDATION_3_WEEK_PROGRAM: WorkoutProgram = {
  id: 'foundation-3-week',
  name: '3-Week Foundation Starter',
  description: 'A condensed 3-week introduction to bodyweight training. Perfect for absolute beginners or those returning to fitness.',
  duration: '3 weeks',
  totalWeeks: 3,
  workoutsPerWeek: 3,
  estimatedTimePerWorkout: '25-30 min',
  difficulty: 'beginner',
  focus: ['Full Body', 'Form & Consistency'],
  weeks: FOUNDATION_WEEK_1_2_3,
};

// Strength-focused program (weeks 3-6)
const STRENGTH_WEEKS: WeekPlan[] = FULL_PROGRAM_DATA.slice(2, 6);

export const STRENGTH_PROGRAM: WorkoutProgram = {
  id: 'strength-4-week',
  name: '4-Week Strength Builder',
  description: 'Focus on building muscle and strength with upper/lower body splits and HIIT training. For those ready to level up.',
  duration: '4 weeks',
  totalWeeks: 4,
  workoutsPerWeek: 4,
  estimatedTimePerWorkout: '30-35 min',
  difficulty: 'intermediate',
  focus: ['Strength', 'Hypertrophy', 'HIIT'],
  weeks: STRENGTH_WEEKS,
};

// HIIT-focused program (weeks 5-6)
const HIIT_WEEKS: WeekPlan[] = FULL_PROGRAM_DATA.slice(4, 6);

export const HIIT_PROGRAM: WorkoutProgram = {
  id: 'hiit-2-week',
  name: '2-Week HIIT Challenge',
  description: 'High-intensity interval training program to boost cardiovascular fitness and burn calories. Push/pull/legs split.',
  duration: '2 weeks',
  totalWeeks: 2,
  workoutsPerWeek: 4,
  estimatedTimePerWorkout: '30-40 min',
  difficulty: 'intermediate',
  focus: ['HIIT', 'Cardio', 'Full Body'],
  weeks: HIIT_WEEKS,
};

// All available programs
export const AVAILABLE_PROGRAMS: WorkoutProgram[] = [
  FOUNDATION_3_WEEK_PROGRAM,
  FOUNDATION_PROGRAM,
  STRENGTH_PROGRAM,
  HIIT_PROGRAM,
];

export const getProgramById = (id: string): WorkoutProgram | undefined => {
  return AVAILABLE_PROGRAMS.find(p => p.id === id);
};
