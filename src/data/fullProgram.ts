// src/data/fullProgram.ts
import { WeekPlan, WorkoutDay, Exercise } from '../types/workout';

// Helper function to parse rest time (handles ranges like "60-90" or "45-60")
// Based on scientific recommendations: uses average of range for optimal recovery
function parseRestTime(rest: string): number {
  // Handle ranges like "60-90" -> use average rounded to nearest 5
  const rangeMatch = rest.match(/(\d+)-(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1]);
    const max = parseInt(rangeMatch[2]);
    // Use average for ranges, rounded to nearest 5 seconds
    const average = (min + max) / 2;
    return Math.round(average / 5) * 5;
  }
  // Handle single number
  const singleMatch = rest.match(/(\d+)/);
  return singleMatch ? parseInt(singleMatch[1]) : 60;
}

// Helper function to parse reps string and determine if it's time-based
function parseExercise(
  id: string,
  name: string,
  repsOrTime: string,
  sets: number,
  rest: string
): Exercise {
  const restSeconds = parseRestTime(rest);
  
  // Check if it's time-based (contains "sec", "seconds", or time patterns)
  if (repsOrTime.toLowerCase().includes('sec') || 
      repsOrTime.toLowerCase().includes('seconds') ||
      repsOrTime.match(/\d+\s*(sec|s)$/i)) {
    // Extract time in seconds
    const timeMatch = repsOrTime.match(/(\d+)/);
    const duration = timeMatch ? parseInt(timeMatch[1]) : 30;
    
    return {
      id,
      type: 'time',
      name,
      duration,
      sets,
      rest: restSeconds,
    };
  }
  
  // Check if it's HIIT (contains "work" or interval patterns)
  if (repsOrTime.toLowerCase().includes('work') || 
      repsOrTime.toLowerCase().includes('high intensity')) {
    const workMatch = repsOrTime.match(/(\d+)s?\s*(work|high)/i);
    const workInterval = workMatch ? parseInt(workMatch[1]) : 30;
    const restInterval = parseRestTime(rest);
    
    return {
      id,
      type: 'hiit',
      name,
      workInterval,
      restInterval,
      rounds: sets,
      exercises: [name], // For HIIT circuits, we'll expand this
    };
  }
  
  // Default to rep-based
  return {
    id,
    type: 'reps',
    name,
    reps: repsOrTime,
    sets,
    rest: restSeconds,
  };
}

// Week 1 & 2: Foundation Building
const WEEK_1_WORKOUT: WorkoutDay = {
  id: 'w1-foundation',
  title: 'Foundation Circuit',
  focus: 'Full Body Form & Consistency',
  duration: '25-30 min',
  warmup: '5 mins: Dynamic stretching (arm circles, leg swings)',
  cooldown: '5 mins: Static stretching (hold each for 20-30s)',
  exercises: [
    parseExercise('sq1', 'Bodyweight Squats', '12-15', 2, '60-90'),
    parseExercise('pu1', 'Push-ups (on knees or toes)', '8-12', 2, '60-90'),
    parseExercise('lu1', 'Lunges (alternating)', '10-12 / leg', 2, '60-90'),
    parseExercise('pl1', 'Plank', '20-30 sec', 2, '60-90'),
    parseExercise('jj1', 'Jumping Jacks', '30 sec', 2, '60-90'),
    parseExercise('gb1', 'Glute Bridges', '15-20', 2, '60-90'),
  ],
};

const WEEK_2_WORKOUT: WorkoutDay = {
  id: 'w2-foundation',
  title: 'Foundation Circuit (Progressive)',
  focus: 'Full Body Form & Consistency',
  duration: '25-30 min',
  warmup: '5 mins: Dynamic stretching',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('sq2', 'Bodyweight Squats', '15-18', 2, '60-90'),
    parseExercise('pu2', 'Push-ups (on knees or toes)', 'Increase by 1-2 reps', 2, '60-90'),
    parseExercise('lu2', 'Lunges (alternating)', '12-15 / leg', 2, '60-90'),
    parseExercise('pl2', 'Plank', '30-40 sec', 2, '60-90'),
    parseExercise('jj2', 'Jumping Jacks', '40 sec', 2, '60-90'),
    parseExercise('gb2', 'Glute Bridges', '20-25', 2, '60-90'),
  ],
};

// Week 3 & 4: Strength Building
const WEEK_3_UPPER: WorkoutDay = {
  id: 'w3-upper',
  title: 'Upper Body Strength',
  focus: 'Hypertrophy & Strength',
  duration: '30-35 min',
  warmup: '5 mins: Dynamic stretching',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('ppu3', 'Pike Push-ups', '8-10', 3, '60'),
    parseExercise('spu3', 'Standard Push-ups', 'Max', 3, '60'),
    parseExercise('pdd3', 'Plank to Downward Dog', '10-12', 3, '60'),
  ],
};

const WEEK_3_LOWER: WorkoutDay = {
  id: 'w3-lower',
  title: 'Lower Body Strength',
  focus: 'Leg Power',
  duration: '30-35 min',
  warmup: '5 mins: Dynamic stretching',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('js3', 'Jump Squats', '10-12', 3, '60'),
    parseExercise('al3', 'Alternating Lunges', '12-15 / leg', 3, '60'),
    parseExercise('gb3', 'Glute Bridges', '20-25', 3, '60'),
  ],
};

const WEEK_3_HIIT: WorkoutDay = {
  id: 'w3-hiit',
  title: 'Full Body HIIT',
  focus: 'Metabolic Conditioning',
  duration: '30-35 min',
  warmup: '5 mins: Light cardio',
  cooldown: '5 mins: Static stretching',
  exercises: [
    {
      id: 'hiit3',
      type: 'hiit',
      name: 'HIIT Circuit',
      workInterval: 30,
      restInterval: 30,
      rounds: 3,
      exercises: ['Burpees', 'Mountain Climbers', 'High Knees', 'Jumping Jacks'],
    },
  ],
};

const WEEK_3_CORE: WorkoutDay = {
  id: 'w3-core',
  title: 'Core & Cardio',
  focus: 'Stability',
  duration: '30-35 min',
  warmup: '15 mins: Light jogging, cycling, or brisk walking',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('sp3', 'Side Plank', '30s / side', 3, '0'),
    parseExercise('rt3', 'Russian Twists', '15-20', 3, '0'),
    parseExercise('lr3', 'Leg Raises', '15-20', 3, '0'),
  ],
};

const WEEK_4_UPPER: WorkoutDay = {
  id: 'w4-upper',
  title: 'Upper Body Strength',
  focus: 'Hypertrophy & Strength',
  duration: '30-35 min',
  warmup: '5 mins: Dynamic stretching',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('ppu4', 'Pike Push-ups', '8-12', 3, '45'),
    parseExercise('spu4', 'Standard Push-ups', 'Max', 3, '45'),
    parseExercise('pdd4', 'Plank to Downward Dog', '12-15', 3, '45'),
  ],
};

const WEEK_4_LOWER: WorkoutDay = {
  id: 'w4-lower',
  title: 'Lower Body Strength',
  focus: 'Leg Power',
  duration: '30-35 min',
  warmup: '5 mins: Dynamic stretching',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('js4', 'Jump Squats', '12-15', 3, '45'),
    parseExercise('al4', 'Alternating Lunges', '15-18 / leg', 3, '45'),
    parseExercise('gb4', 'Glute Bridges', '25-30', 3, '45'),
  ],
};

const WEEK_4_HIIT: WorkoutDay = {
  id: 'w4-hiit',
  title: 'Full Body HIIT',
  focus: 'Metabolic Conditioning',
  duration: '30-35 min',
  warmup: '5 mins: Light cardio',
  cooldown: '5 mins: Static stretching',
  exercises: [
    {
      id: 'hiit4',
      type: 'hiit',
      name: 'HIIT Circuit',
      workInterval: 30,
      restInterval: 25, // Average of 20-30s
      rounds: 4,
      exercises: ['Burpees', 'Mountain Climbers', 'High Knees', 'Jumping Jacks'],
    },
  ],
};

const WEEK_4_CORE: WorkoutDay = {
  id: 'w4-core',
  title: 'Core & Cardio',
  focus: 'Stability',
  duration: '30-35 min',
  warmup: '15 mins: Light jogging or cycling',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('sp4', 'Side Plank', '35-45s / side', 3, '30'),
    parseExercise('rt4', 'Russian Twists', '20-25', 3, '30'),
    parseExercise('lr4', 'Leg Raises', '20-25', 3, '30'),
  ],
};

// Week 5 & 6: HIIT Integration
const WEEK_5_PUSH: WorkoutDay = {
  id: 'w5-push',
  title: 'Push Focus',
  focus: 'Upper Body Strength',
  duration: '35-40 min',
  warmup: '5 mins: Dynamic stretching',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('dpu5', 'Decline Push-ups', '8-12', 3, '45-60'),
    parseExercise('ppu5', 'Pike Push-ups', '10-12', 3, '45-60'),
    parseExercise('spu5', 'Standard Push-ups', 'To failure', 3, '45-60'),
  ],
};

const WEEK_5_PULL: WorkoutDay = {
  id: 'w5-pull',
  title: 'Pull & Core',
  focus: 'Back & Core Strength',
  duration: '35-40 min',
  warmup: '5 mins: Dynamic stretching',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('ir5', 'Inverted Rows', '8-12', 3, '45-60'),
    parseExercise('sh5', 'Superman Holds', '30-45 seconds', 3, '45-60'),
    parseExercise('pall5', 'Plank with Alternating Leg Lifts', '15-20', 3, '45-60'),
  ],
};

const WEEK_5_LEGS: WorkoutDay = {
  id: 'w5-legs',
  title: 'Legs & Cardio',
  focus: 'Lower Body & Cardio',
  duration: '35-40 min',
  warmup: '5 mins: Dynamic stretching',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('sls5', 'Single-leg Squats (assisted)', '6-8 / leg', 3, '45-60'),
    parseExercise('js5', 'Jump Squats', '15-20', 3, '45-60'),
    parseExercise('cr5', 'Calf Raises', '25-30', 3, '45-60'),
    parseExercise('cardio5', 'Cardio', '10 mins moderate intensity', 1, '0'),
  ],
};

const WEEK_5_HIIT: WorkoutDay = {
  id: 'w5-hiit',
  title: 'HIIT Full Body',
  focus: 'Metabolic Conditioning',
  duration: '35-40 min',
  warmup: '5 mins: Light cardio',
  cooldown: '5 mins: Static stretching',
  exercises: [
    {
      id: 'hiit5',
      type: 'hiit',
      name: 'HIIT Circuit',
      workInterval: 30,
      restInterval: 30,
      rounds: 2,
      exercises: ['Burpees', 'High Knees', 'Jump Squats', 'Mountain Climbers'],
    },
    parseExercise('rt5', 'Russian Twists', '20', 2, '0'),
    parseExercise('lr5', 'Leg Raises', '20', 2, '0'),
  ],
};

const WEEK_6_PUSH: WorkoutDay = {
  id: 'w6-push',
  title: 'Push Focus',
  focus: 'Upper Body Strength',
  duration: '35-40 min',
  warmup: '5 mins: Dynamic stretching',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('dpu6', 'Decline Push-ups', '10-15', 3, '45-60'),
    parseExercise('ppu6', 'Pike Push-ups', '12-15', 3, '45-60'),
    parseExercise('spu6', 'Standard Push-ups', 'To failure', 3, '45-60'),
  ],
};

const WEEK_6_PULL: WorkoutDay = {
  id: 'w6-pull',
  title: 'Pull & Core',
  focus: 'Back & Core Strength',
  duration: '35-40 min',
  warmup: '5 mins: Dynamic stretching',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('ir6', 'Inverted Rows', '10-15', 3, '45-60'),
    parseExercise('sh6', 'Superman Holds', '45-60 seconds', 3, '45-60'),
    parseExercise('pj6', 'Advanced Plank Variations (Plank Jacks)', '30-45 seconds', 3, '45-60'),
  ],
};

const WEEK_6_LEGS: WorkoutDay = {
  id: 'w6-legs',
  title: 'Legs & Cardio',
  focus: 'Lower Body & Cardio',
  duration: '35-40 min',
  warmup: '5 mins: Dynamic stretching',
  cooldown: '5 mins: Static stretching',
  exercises: [
    parseExercise('sls6', 'Single-leg Squats (assisted)', '8-10 / leg', 3, '45-60'),
    parseExercise('js6', 'Jump Squats', '20-25', 3, '45-60'),
    parseExercise('cr6', 'Calf Raises', '30+', 3, '45-60'),
    parseExercise('cardio6', 'Cardio', '10 mins moderate intensity', 1, '0'),
  ],
};

const WEEK_6_HIIT: WorkoutDay = {
  id: 'w6-hiit',
  title: 'HIIT Full Body',
  focus: 'Metabolic Conditioning',
  duration: '35-40 min',
  warmup: '5 mins: Light cardio',
  cooldown: '5 mins: Static stretching',
  exercises: [
    {
      id: 'hiit6',
      type: 'hiit',
      name: 'HIIT Circuit',
      workInterval: 35,
      restInterval: 25,
      rounds: 3,
      exercises: ['Burpees', 'High Knees', 'Jump Squats', 'Mountain Climbers'],
    },
    parseExercise('vu6', 'V-Ups', '15', 2, '0'),
    parseExercise('bc6', 'Bicycle Crunches', '30 seconds', 2, '0'),
  ],
};

export const FULL_PROGRAM_DATA: WeekPlan[] = [
  {
    weekNumber: 1,
    phaseName: 'Phase 1: Foundation Building',
    schedule: {
      Monday: WEEK_1_WORKOUT,
      Tuesday: null,
      Wednesday: WEEK_1_WORKOUT,
      Thursday: null,
      Friday: WEEK_1_WORKOUT,
      Saturday: null,
      Sunday: null,
    },
  },
  {
    weekNumber: 2,
    phaseName: 'Phase 1: Foundation Building (Progressive)',
    schedule: {
      Monday: WEEK_2_WORKOUT,
      Tuesday: null,
      Wednesday: WEEK_2_WORKOUT,
      Thursday: null,
      Friday: WEEK_2_WORKOUT,
      Saturday: null,
      Sunday: null,
    },
  },
  {
    weekNumber: 3,
    phaseName: 'Phase 2: Strength Building',
    schedule: {
      Monday: WEEK_3_UPPER,
      Tuesday: WEEK_3_LOWER,
      Wednesday: null,
      Thursday: WEEK_3_HIIT,
      Friday: WEEK_3_CORE,
      Saturday: null,
      Sunday: null,
    },
  },
  {
    weekNumber: 4,
    phaseName: 'Phase 2: Strength Building',
    schedule: {
      Monday: WEEK_4_UPPER,
      Tuesday: WEEK_4_LOWER,
      Wednesday: null,
      Thursday: WEEK_4_HIIT,
      Friday: WEEK_4_CORE,
      Saturday: null,
      Sunday: null,
    },
  },
  {
    weekNumber: 5,
    phaseName: 'Phase 3: HIIT Integration',
    schedule: {
      Monday: WEEK_5_PUSH,
      Tuesday: WEEK_5_PULL,
      Wednesday: WEEK_5_LEGS,
      Thursday: null,
      Friday: WEEK_5_HIIT,
      Saturday: null,
      Sunday: null,
    },
  },
  {
    weekNumber: 6,
    phaseName: 'Phase 3: HIIT Integration',
    schedule: {
      Monday: WEEK_6_PUSH,
      Tuesday: WEEK_6_PULL,
      Wednesday: WEEK_6_LEGS,
      Thursday: null,
      Friday: WEEK_6_HIIT,
      Saturday: null,
      Sunday: null,
    },
  },
];

export const getWorkoutForDate = (weekNum: number, dayName: string, programWeeks?: WeekPlan[]): WorkoutDay | null => {
  const weeks = programWeeks || FULL_PROGRAM_DATA;
  const week = weeks.find(w => w.weekNumber === weekNum);
  if (!week) return null;
  return week.schedule[dayName as keyof typeof week.schedule] || null;
};

export const getAllWorkouts = (): WorkoutDay[] => {
  return FULL_PROGRAM_DATA.flatMap(week => 
    Object.values(week.schedule).filter((w): w is WorkoutDay => w !== null)
  );
};
