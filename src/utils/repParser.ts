// src/utils/repParser.ts

/**
 * Parses a reps string (e.g., "12-15", "10-12 / leg", "Max", "20") 
 * and returns the minimum and mean values
 */
export function parseReps(repsString: string): { min: number; mean: number } {
  // Handle ranges like "12-15" or "10-12 / leg"
  const rangeMatch = repsString.match(/(\d+)-(\d+)/);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1], 10);
    const max = parseInt(rangeMatch[2], 10);
    const mean = Math.round((min + max) / 2);
    return { min, mean };
  }

  // Handle single numbers like "20" or "15 / leg"
  const singleMatch = repsString.match(/(\d+)/);
  if (singleMatch) {
    const value = parseInt(singleMatch[1], 10);
    return { min: value, mean: value };
  }

  // Handle "Max", "To failure", etc. - use a reasonable default
  // For "Max" or "To failure", we'll use 10 as default (user can adjust)
  if (repsString.toLowerCase().includes('max') || 
      repsString.toLowerCase().includes('failure') ||
      repsString.toLowerCase().includes('to failure')) {
    return { min: 1, mean: 10 }; // Minimum 1 rep to complete, default to 10
  }

  // Default fallback
  return { min: 1, mean: 10 };
}

/**
 * Checks if completed reps meet the minimum requirement
 */
export function isRepsComplete(completedReps: number, repsString: string): boolean {
  const { min } = parseReps(repsString);
  return completedReps >= min;
}

