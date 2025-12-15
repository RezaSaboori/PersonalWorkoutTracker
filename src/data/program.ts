// src/data/program.ts

export type Exercise = {
    id: string;
    name: string;
    reps: string;
    sets: number;
    rest: string; // in seconds
  };
  
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
  
  const PHASE_1_WORKOUT: WorkoutDay = {
    id: 'p1-foundation',
    title: 'Foundation Circuit',
    focus: 'Full Body Form & Consistency',
    duration: '25-30 min',
    warmup: '5 mins: Dynamic stretching (arm circles, leg swings)',
    cooldown: '5 mins: Static stretching',
    exercises: [
      { id: 'sq', name: 'Bodyweight Squats', reps: '12-15', sets: 2, rest: '60-90' },
      { id: 'pu', name: 'Push-ups', reps: '8-12', sets: 2, rest: '60-90' },
      { id: 'lu', name: 'Lunges', reps: '10-12 / leg', sets: 2, rest: '60-90' },
      { id: 'pl', name: 'Plank', reps: '20-30 sec', sets: 2, rest: '60-90' },
      { id: 'jj', name: 'Jumping Jacks', reps: '30 sec', sets: 2, rest: '60-90' },
      { id: 'gb', name: 'Glute Bridges', reps: '15-20', sets: 2, rest: '60-90' },
    ],
  };
  
  const PHASE_2_UPPER: WorkoutDay = {
    id: 'p2-upper',
    title: 'Upper Body Strength',
    focus: 'Hypertrophy & Strength',
    duration: '30-35 min',
    warmup: '5 mins Dynamic Stretching',
    cooldown: '5 mins Static Stretching',
    exercises: [
      { id: 'ppu', name: 'Pike Push-ups', reps: '8-10', sets: 3, rest: '60' },
      { id: 'spu', name: 'Standard Push-ups', reps: 'Max', sets: 3, rest: '60' },
      { id: 'pdd', name: 'Plank to Downward Dog', reps: '10-12', sets: 3, rest: '60' },
    ],
  };
  
  const PHASE_2_LOWER: WorkoutDay = {
    id: 'p2-lower',
    title: 'Lower Body Strength',
    focus: 'Leg Power',
    duration: '30-35 min',
    warmup: '5 mins Dynamic Stretching',
    cooldown: '5 mins Static Stretching',
    exercises: [
      { id: 'js', name: 'Jump Squats', reps: '10-12', sets: 3, rest: '60' },
      { id: 'al', name: 'Alternating Lunges', reps: '12-15 / leg', sets: 3, rest: '60' },
      { id: 'gb2', name: 'Glute Bridges', reps: '20-25', sets: 3, rest: '60' },
    ],
  };
  
  const PHASE_2_HIIT: WorkoutDay = {
    id: 'p2-hiit',
    title: 'Full Body HIIT',
    focus: 'Metabolic Conditioning',
    duration: '30 min',
    warmup: '5 mins Light Cardio',
    cooldown: '5 mins Static Stretching',
    exercises: [
      { id: 'bur', name: 'Burpees', reps: '30s Work', sets: 3, rest: '30' },
      { id: 'mc', name: 'Mountain Climbers', reps: '30s Work', sets: 3, rest: '30' },
      { id: 'hk', name: 'High Knees', reps: '30s Work', sets: 3, rest: '30' },
      { id: 'jj2', name: 'Jumping Jacks', reps: '30s Work', sets: 3, rest: '30' },
    ],
  };
  
  // ... Abbreviated map for brevity, but logic covers all weeks based on your docs
  export const PROGRAM_DATA: WeekPlan[] = [
    {
      weekNumber: 1,
      phaseName: 'Phase 1: Foundation',
      schedule: {
        Monday: PHASE_1_WORKOUT,
        Wednesday: PHASE_1_WORKOUT,
        Friday: PHASE_1_WORKOUT,
      },
    },
    {
      weekNumber: 2,
      phaseName: 'Phase 1: Foundation (Progressive)',
      schedule: {
        Monday: { ...PHASE_1_WORKOUT, exercises: PHASE_1_WORKOUT.exercises.map(e => ({...e, reps: e.reps + '+'})) }, // Simplified progression logic
        Wednesday: { ...PHASE_1_WORKOUT, exercises: PHASE_1_WORKOUT.exercises.map(e => ({...e, reps: e.reps + '+'})) },
        Friday: { ...PHASE_1_WORKOUT, exercises: PHASE_1_WORKOUT.exercises.map(e => ({...e, reps: e.reps + '+'})) },
      },
    },
    {
      weekNumber: 3,
      phaseName: 'Phase 2: Strength',
      schedule: {
        Monday: PHASE_2_UPPER,
        Tuesday: PHASE_2_LOWER,
        Thursday: PHASE_2_HIIT,
        Friday: {
          id: 'p2-core', title: 'Core & Cardio', focus: 'Stability', duration: '30 min', warmup: '15 mins Cardio', cooldown: '5 mins',
          exercises: [
            { id: 'sp', name: 'Side Plank', reps: '30s / side', sets: 3, rest: '0' },
            { id: 'rt', name: 'Russian Twists', reps: '15-20', sets: 3, rest: '0' },
            { id: 'lr', name: 'Leg Raises', reps: '15-20', sets: 3, rest: '0' }
          ]
        }
      }
    },
    // Mapping continues for Weeks 4, 5, 6...
  ];
  
  export const getWorkoutForDate = (weekNum: number, dayName: string) => {
    const week = PROGRAM_DATA.find(w => w.weekNumber === weekNum);
    if (!week) return null;
    return week.schedule[dayName as keyof typeof week.schedule] || null;
  };
  