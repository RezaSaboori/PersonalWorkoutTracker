// src/utils/hapticFeedback.ts
import * as Haptics from 'expo-haptics';

let isEnabled = true;

export const setHapticEnabled = (enabled: boolean) => {
  isEnabled = enabled;
};

export const hapticPatterns = {
  light: () => {
    if (!isEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },
  medium: () => {
    if (!isEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  heavy: () => {
    if (!isEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },
  success: () => {
    if (!isEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },
  warning: () => {
    if (!isEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
  error: () => {
    if (!isEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },
  selection: () => {
    if (!isEnabled) return;
    Haptics.selectionAsync();
  },
  // Custom patterns
  setComplete: () => {
    if (!isEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },
  restOver: () => {
    if (!isEnabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, 100);
  },
  workoutComplete: () => {
    if (!isEnabled) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, 200);
  },
  timerTick: () => {
    if (!isEnabled) return;
    Haptics.selectionAsync();
  },
};
