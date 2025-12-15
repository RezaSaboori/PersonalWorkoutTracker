// src/data/exerciseDescriptions.ts

export const EXERCISE_DESCRIPTIONS: Record<string, string> = {
  // Foundation Exercises
  'Bodyweight Squats': 'Stand with feet shoulder-width apart. Lower your body by bending knees and pushing hips back, keeping chest up. Go down until thighs are parallel to floor, then push through heels to return to start.',
  'Push-ups': 'Start in plank position, hands slightly wider than shoulders. Lower body until chest nearly touches floor, keeping body straight. Push back up to start. For beginners, do on knees.',
  'Lunges': 'Step forward with one leg, lowering hips until both knees are bent at 90 degrees. Front knee should be above ankle, back knee hovering above ground. Push back to start and alternate legs.',
  'Plank': 'Start in push-up position, but rest on forearms. Keep body in straight line from head to heels. Engage core and hold position. Don\'t let hips sag or rise.',
  'Jumping Jacks': 'Stand with feet together, arms at sides. Jump up, spreading legs shoulder-width apart and raising arms overhead. Jump back to start position. Repeat rhythmically.',
  'Glute Bridges': 'Lie on back with knees bent, feet flat on floor. Lift hips by squeezing glutes, creating straight line from knees to shoulders. Hold briefly, then lower with control.',
  
  // Strength Exercises
  'Pike Push-ups': 'Start in downward dog position (hands and feet on ground, hips high). Lower head toward hands by bending arms, then push back up. This targets shoulders more than regular push-ups.',
  'Standard Push-ups': 'Classic push-up: full body plank, lower and raise with control. Keep core engaged and body straight throughout.',
  'Plank to Downward Dog': 'Start in plank position. Push hips up and back, moving into downward dog (inverted V shape). Return to plank. This combines core and shoulder strength.',
  'Jump Squats': 'Perform a squat, then explosively jump up as high as possible. Land softly with knees slightly bent, immediately going into next squat. Focus on soft landing.',
  'Alternating Lunges': 'Step forward into lunge, return to start, then step forward with opposite leg. Keep torso upright and core engaged throughout.',
  
  // HIIT Exercises
  'Burpees': 'Start standing. Squat down, place hands on floor. Jump feet back into plank. Do a push-up (optional). Jump feet forward, then explosively jump up with arms overhead. Repeat quickly.',
  'Mountain Climbers': 'Start in plank position. Alternately bring knees to chest in running motion, keeping hips level. Move quickly while maintaining plank form.',
  'High Knees': 'Stand tall and run in place, bringing knees up toward chest. Pump arms naturally. Move quickly, landing on balls of feet.',
  
  // Core Exercises
  'Side Plank': 'Lie on side, propped on one forearm. Lift hips to create straight line from head to feet. Hold position, keeping core engaged. Switch sides.',
  'Russian Twists': 'Sit with knees bent, lean back slightly. Rotate torso side to side, touching ground beside you. Keep core engaged and back straight. Can hold weight for added difficulty.',
  'Leg Raises': 'Lie on back, hands under glutes. Keeping legs straight, lift them toward ceiling until perpendicular to floor. Lower with control, stopping just above ground. Repeat.',
  'Crunches': 'Lie on back, knees bent, hands behind head. Lift shoulders off ground by contracting abs. Don\'t pull on neck. Lower with control.',
  
  // Advanced Exercises
  'Decline Push-ups': 'Place feet on elevated surface (bench/step), hands on floor. Perform push-ups in this declined position for increased difficulty.',
  'Inverted Rows': 'Lie under bar or table. Grab bar with overhand grip. Pull body up until chest touches bar, keeping body straight. Lower with control.',
  'Superman Holds': 'Lie face down, arms extended forward. Lift arms, chest, and legs off ground simultaneously. Hold position, squeezing back muscles. Lower with control.',
  'Plank with Alternating Leg Lifts': 'Start in plank. Lift one leg straight back, hold briefly, lower. Alternate legs while maintaining plank position.',
  'Single-leg Squats (assisted)': 'Stand on one leg, other leg extended forward. Lower into squat, using wall or support for balance. Push back up. This is very challenging - use assistance as needed.',
  'Calf Raises': 'Stand tall, feet hip-width apart. Rise up onto balls of feet, lifting heels as high as possible. Lower with control. Can hold weights for added resistance.',
  'V-Ups': 'Lie on back, arms extended overhead. Simultaneously lift legs and torso, reaching hands toward feet to form V shape. Lower with control.',
  'Bicycle Crunches': 'Lie on back, hands behind head. Bring one knee toward chest while rotating opposite elbow to meet it. Alternate sides in pedaling motion.',
  'Advanced Plank Variations (Plank Jacks)': 'Start in plank. Jump feet apart then together (like jumping jacks) while maintaining plank position. Keep core engaged and hips stable.',
};

export const getExerciseDescription = (exerciseName: string): string => {
  // Try exact match first
  if (EXERCISE_DESCRIPTIONS[exerciseName]) {
    return EXERCISE_DESCRIPTIONS[exerciseName];
  }
  
  // Try partial matches for variations
  const nameLower = exerciseName.toLowerCase();
  for (const [key, value] of Object.entries(EXERCISE_DESCRIPTIONS)) {
    if (nameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nameLower)) {
      return value;
    }
  }
  
  // Default description
  return 'Focus on proper form and controlled movements. Breathe out during exertion, breathe in during rest.';
};

