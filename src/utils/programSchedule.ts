// src/utils/programSchedule.ts
import { format, startOfWeek, differenceInDays } from 'date-fns';
import { WeekPlan, WorkoutDay } from '../types/workout';

/**
 * Calculate which day of the program a given date is
 * Returns: { weekNumber: number, dayOfWeek: number (0-6, where 0 is Monday) }
 */
export function getProgramDay(startDate: string, targetDate: Date): { weekNumber: number; dayOfWeek: number } {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const daysSinceStart = differenceInDays(target, start);
  
  // Week 1 starts on day 0, so day 0-6 is week 1, day 7-13 is week 2, etc.
  const weekNumber = Math.floor(daysSinceStart / 7) + 1;
  
  // Day of week: 0 = Monday, 1 = Tuesday, ..., 6 = Sunday
  const dayOfWeek = target.getDay() === 0 ? 6 : target.getDay() - 1; // Convert Sunday (0) to 6
  
  return { weekNumber, dayOfWeek };
}

/**
 * Get the workout for a specific date based on program start date
 * Maps program days (0, 1, 2, ...) to the schedule days (Monday, Tuesday, ...)
 */
export function getWorkoutForDate(
  startDate: string,
  targetDate: Date,
  programWeeks: WeekPlan[]
): WorkoutDay | null {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const daysSinceStart = differenceInDays(target, start);
  
  // If before start date, return null
  if (daysSinceStart < 0) {
    return null;
  }
  
  // Week 1 starts on day 0, so day 0-6 is week 1, day 7-13 is week 2, etc.
  const weekNumber = Math.floor(daysSinceStart / 7) + 1;
  
  // Check if week exists in program
  if (weekNumber < 1 || weekNumber > programWeeks.length) {
    return null;
  }

  const week = programWeeks.find(w => w.weekNumber === weekNumber);
  if (!week) return null;

  // Map program day (0-6 within the week) to calendar day name
  // Day 0 of program = Monday, Day 1 = Tuesday, etc.
  const dayOfWeekInProgram = daysSinceStart % 7;
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayName = dayNames[dayOfWeekInProgram];
  
  return week.schedule[dayName as keyof typeof week.schedule] || null;
}

/**
 * Get the day name for a specific date
 */
export function getDayName(date: Date): string {
  return format(date, 'EEEE');
}

