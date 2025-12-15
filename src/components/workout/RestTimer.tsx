// src/components/workout/RestTimer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { CircularProgress } from '../Timer/CircularProgress';
import { X, Plus, Minus, Play, Pause, SkipForward } from 'lucide-react-native';
import { voiceCues } from '../../utils/voiceGuidance';
import { hapticPatterns } from '../../utils/hapticFeedback';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RestTimerProps {
  duration: number; // seconds
  onComplete: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  exerciseId?: string;
  exerciseName?: string;
  setNumber?: number;
  totalSets?: number;
}

interface RestPreference {
  exerciseId: string;
  preferredRest: number;
  lastUsed: string;
}

const REST_PREFERENCES_KEY = 'rest_preferences';

export const RestTimer = ({
  duration,
  onComplete,
  onSkip,
  autoStart = true,
  exerciseId,
  exerciseName,
  setNumber,
  totalSets,
}: RestTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustValue, setAdjustValue] = useState(duration.toString());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnnouncementRef = useRef<number>(0);
  const initialDurationRef = useRef(duration);

  // Load user preference for this exercise
  useEffect(() => {
    if (exerciseId) {
      loadRestPreference(exerciseId).then((pref) => {
        if (pref && pref.preferredRest !== duration) {
          const newDuration = pref.preferredRest;
          initialDurationRef.current = newDuration;
          setTimeRemaining(newDuration);
        }
      });
    }
  }, [exerciseId, duration]);

  // Smart rest suggestion based on exercise and set number
  const getSuggestedRest = () => {
    if (!exerciseName || !setNumber) return null;
    
    // Increase rest as sets progress (fatigue factor)
    const fatigueMultiplier = 1 + (setNumber / (totalSets || 3)) * 0.2;
    
    // Base rest times by exercise type
    let baseRest = duration;
    const nameLower = exerciseName.toLowerCase();
    
    if (nameLower.includes('squat') || nameLower.includes('deadlift')) {
      baseRest = 90; // Compound leg exercises need more rest
    } else if (nameLower.includes('push') || nameLower.includes('press')) {
      baseRest = 60; // Upper body compound
    } else if (nameLower.includes('plank') || nameLower.includes('hold')) {
      baseRest = 45; // Isometric holds
    } else if (nameLower.includes('hiit') || nameLower.includes('burpee')) {
      baseRest = 30; // HIIT exercises
    }
    
    return Math.round(baseRest * fatigueMultiplier);
  };

  const suggestedRest = getSuggestedRest();

  useEffect(() => {
    if (isActive && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            hapticPatterns.restOver();
            voiceCues.ready();
            setTimeout(() => {
              onComplete();
            }, 500);
            return 0;
          }

          // Announcements
          const now = Date.now();
          if (prev === 10 && now - lastAnnouncementRef.current > 1000) {
            voiceCues.tenSeconds();
            hapticPatterns.light();
            lastAnnouncementRef.current = now;
          } else if (prev === 5 && now - lastAnnouncementRef.current > 1000) {
            voiceCues.fiveSeconds();
            hapticPatterns.light();
            lastAnnouncementRef.current = now;
          } else if (prev <= 3 && prev > 0 && now - lastAnnouncementRef.current > 1000) {
            if (prev === 3) voiceCues.threeSeconds();
            else if (prev === 2) voiceCues.twoSeconds();
            else if (prev === 1) voiceCues.oneSecond();
            hapticPatterns.timerTick();
            lastAnnouncementRef.current = now;
          }

          // Haptic pulse every 5 seconds
          if (prev % 5 === 0 && prev > 0) {
            hapticPatterns.light();
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, timeRemaining, onComplete]);

  const handleSkip = () => {
    setIsActive(false);
    hapticPatterns.selection();
    onSkip?.();
    onComplete();
  };

  const handleAdjust = (delta: number) => {
    const newTime = Math.max(0, timeRemaining + delta);
    setTimeRemaining(newTime);
    hapticPatterns.selection();
  };

  const handleSetCustomTime = () => {
    const num = parseInt(adjustValue) || 0;
    if (num > 0 && num <= 600) {
      setTimeRemaining(num);
      initialDurationRef.current = num;
      setShowAdjustModal(false);
      hapticPatterns.selection();
    } else {
      Alert.alert('Invalid Time', 'Please enter a time between 1 and 600 seconds');
    }
  };

  const handleSavePreference = async () => {
    if (exerciseId) {
      await saveRestPreference(exerciseId, timeRemaining);
      Alert.alert('Saved', `Rest time saved for ${exerciseName || 'this exercise'}`);
    }
  };

  const handleUseSuggestion = () => {
    if (suggestedRest) {
      setTimeRemaining(suggestedRest);
      initialDurationRef.current = suggestedRest;
      hapticPatterns.selection();
    }
  };

  const progress = ((initialDurationRef.current - timeRemaining) / initialDurationRef.current) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Rest</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setIsPaused(!isPaused)} 
            style={styles.iconButton}
          >
            {isPaused ? (
              <Play size={18} color="#4fffc2" />
            ) : (
              <Pause size={18} color="rgba(255, 255, 255, 0.6)" />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSkip} style={styles.iconButton}>
            <X size={20} color="rgba(255, 255, 255, 0.6)" />
          </TouchableOpacity>
        </View>
      </View>

      <CircularProgress
        progress={progress}
        duration={initialDurationRef.current}
        currentTime={timeRemaining}
        size={180}
        width={12}
      />

      {/* Adjust Controls */}
      <View style={styles.adjustControls}>
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => handleAdjust(-15)}
        >
          <Minus size={16} color="#fff" />
          <Text style={styles.adjustButtonText}>-15s</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowAdjustModal(true)}
        >
          <Text style={styles.timeButtonText}>{timeRemaining}s</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.adjustButton}
          onPress={() => handleAdjust(15)}
        >
          <Plus size={16} color="#fff" />
          <Text style={styles.adjustButtonText}>+15s</Text>
        </TouchableOpacity>
      </View>

      {/* Smart Suggestions */}
      {suggestedRest && suggestedRest !== timeRemaining && (
        <TouchableOpacity
          style={styles.suggestionButton}
          onPress={handleUseSuggestion}
        >
          <Text style={styles.suggestionText}>
            Suggested: {suggestedRest}s (based on exercise & set #{setNumber})
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.hint}>Get ready for the next set</Text>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          onPress={handleSkip} 
          style={styles.skipButton}
        >
          <SkipForward size={16} color="#fff" />
          <Text style={styles.skipText}>Skip Rest</Text>
        </TouchableOpacity>
        
        {exerciseId && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSavePreference}
          >
            <Text style={styles.saveText}>Save as Default</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Custom Time Modal */}
      <Modal
        visible={showAdjustModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdjustModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Set Rest Time</Text>
            <TextInput
              style={styles.modalInput}
              value={adjustValue}
              onChangeText={setAdjustValue}
              keyboardType="numeric"
              placeholder="Enter seconds"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowAdjustModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSetCustomTime}
              >
                <Text style={styles.modalSaveText}>Set</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Helper functions for rest preferences
async function loadRestPreference(exerciseId: string): Promise<RestPreference | null> {
  try {
    const data = await AsyncStorage.getItem(REST_PREFERENCES_KEY);
    if (data) {
      const preferences: RestPreference[] = JSON.parse(data);
      return preferences.find(p => p.exerciseId === exerciseId) || null;
    }
  } catch (error) {
    console.error('Error loading rest preference:', error);
  }
  return null;
}

async function saveRestPreference(exerciseId: string, restTime: number): Promise<void> {
  try {
    const data = await AsyncStorage.getItem(REST_PREFERENCES_KEY);
    let preferences: RestPreference[] = data ? JSON.parse(data) : [];
    
    const existingIndex = preferences.findIndex(p => p.exerciseId === exerciseId);
    const newPreference: RestPreference = {
      exerciseId,
      preferredRest: restTime,
      lastUsed: new Date().toISOString(),
    };
    
    if (existingIndex >= 0) {
      preferences[existingIndex] = newPreference;
    } else {
      preferences.push(newPreference);
    }
    
    await AsyncStorage.setItem(REST_PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving rest preference:', error);
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(79, 255, 194, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 255, 194, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  title: {
    color: '#4fffc2',
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    marginBottom: 12,
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  timeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(79, 255, 194, 0.3)',
    minWidth: 80,
    alignItems: 'center',
  },
  timeButtonText: {
    color: '#4fffc2',
    fontSize: 16,
    fontWeight: '700',
  },
  suggestionButton: {
    marginTop: 8,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  suggestionText: {
    color: '#60a5fa',
    fontSize: 12,
    textAlign: 'center',
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    width: '100%',
  },
  skipButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    alignItems: 'center',
  },
  saveText: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    borderWidth: 1,
    borderColor: '#4fffc2',
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#4fffc2',
    fontSize: 14,
    fontWeight: '600',
  },
});
