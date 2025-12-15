import { NativeModule } from 'expo-modules-core';

export interface AppleAIModuleInterface extends NativeModule {
  generateWorkoutRecommendation(data: string): Promise<string>;
  analyzeWorkoutPattern(workouts: string): Promise<string>;
  predictOptimalRecovery(data: string): Promise<string>;
  isAvailable(): boolean;
}

