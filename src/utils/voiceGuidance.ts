// src/utils/voiceGuidance.ts
import * as Speech from 'expo-speech';

let isEnabled = true;
let volume = 1.0;

export const setVoiceEnabled = (enabled: boolean) => {
  isEnabled = enabled;
};

export const setVoiceVolume = (vol: number) => {
  volume = Math.max(0, Math.min(1, vol));
};

export const speak = (text: string, options?: { rate?: number; pitch?: number }) => {
  if (!isEnabled) return;
  
  Speech.speak(text, {
    language: 'en',
    pitch: options?.pitch || 1.0,
    rate: options?.rate || 0.9,
    volume,
    onDone: () => {},
    onStopped: () => {},
    onError: () => {},
  });
};

export const stopSpeaking = () => {
  Speech.stop();
};

export const voiceCues = {
  start: () => speak('Start'),
  rest: () => speak('Rest'),
  ready: () => speak('Ready'),
  nextSet: () => speak('Next set'),
  nextExercise: () => speak('Next exercise'),
  workoutComplete: () => speak('Workout complete! Great job!'),
  tenSeconds: () => speak('Ten seconds remaining'),
  fiveSeconds: () => speak('Five seconds'),
  threeSeconds: () => speak('Three'),
  twoSeconds: () => speak('Two'),
  oneSecond: () => speak('One'),
};
