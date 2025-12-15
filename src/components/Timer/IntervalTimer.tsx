// src/components/Timer/IntervalTimer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CircularProgress } from './CircularProgress';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import { voiceCues } from '../../utils/voiceGuidance';
import { hapticPatterns } from '../../utils/hapticFeedback';

interface IntervalTimerProps {
  workInterval: number; // seconds
  restInterval: number; // seconds
  rounds: number;
  onComplete?: () => void;
  onRoundComplete?: (round: number) => void;
  autoStart?: boolean;
}

type TimerState = 'idle' | 'work' | 'rest' | 'paused' | 'completed';

export const IntervalTimer = ({
  workInterval,
  restInterval,
  rounds,
  onComplete,
  onRoundComplete,
  autoStart = false,
}: IntervalTimerProps) => {
  const [state, setState] = useState<TimerState>(autoStart ? 'work' : 'idle');
  const [currentRound, setCurrentRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(workInterval);
  const [isWorkPhase, setIsWorkPhase] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnnouncementRef = useRef<number>(0);

  useEffect(() => {
    if (state === 'work' || state === 'rest') {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Clear interval before state changes
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            
            // Use setTimeout to handle state transitions after interval is cleared
            setTimeout(() => {
              if (isWorkPhase) {
                // Work phase done, switch to rest
                setIsWorkPhase(false);
                setTimeRemaining(restInterval);
                setState('rest');
                hapticPatterns.setComplete();
                voiceCues.rest();
              } else {
                // Rest phase done, check if round is complete
                if (currentRound >= rounds) {
                  // All rounds complete
                  setState('completed');
                  hapticPatterns.workoutComplete();
                  voiceCues.workoutComplete();
                  onComplete?.();
                } else {
                  // Next round
                  const nextRound = currentRound + 1;
                  setCurrentRound(nextRound);
                  setIsWorkPhase(true);
                  setTimeRemaining(workInterval);
                  setState('work');
                  hapticPatterns.restOver();
                  voiceCues.start();
                  onRoundComplete?.(nextRound - 1);
                }
              }
            }, 100);
            
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
          } else if (prev === 3 && now - lastAnnouncementRef.current > 1000) {
            voiceCues.threeSeconds();
            hapticPatterns.timerTick();
            lastAnnouncementRef.current = now;
          } else if (prev === 2 && now - lastAnnouncementRef.current > 1000) {
            voiceCues.twoSeconds();
            hapticPatterns.timerTick();
            lastAnnouncementRef.current = now;
          } else if (prev === 1 && now - lastAnnouncementRef.current > 1000) {
            voiceCues.oneSecond();
            hapticPatterns.timerTick();
            lastAnnouncementRef.current = now;
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
        intervalRef.current = null;
      }
    };
  }, [state, isWorkPhase, currentRound, rounds, workInterval, restInterval]);

  const handlePlayPause = () => {
    if (state === 'idle') {
      setState('work');
      setIsWorkPhase(true);
      setTimeRemaining(workInterval);
      voiceCues.start();
      hapticPatterns.medium();
    } else if (state === 'paused') {
      setState(isWorkPhase ? 'work' : 'rest');
      hapticPatterns.selection();
    } else if (state === 'work' || state === 'rest') {
      setState('paused');
      hapticPatterns.selection();
    }
  };

  const handleSkip = () => {
    if (state === 'work' || state === 'rest' || state === 'paused') {
      if (isWorkPhase) {
        setIsWorkPhase(false);
        setTimeRemaining(restInterval);
        setState('rest');
      } else {
        if (currentRound >= rounds) {
          setState('completed');
          onComplete?.();
        } else {
          const nextRound = currentRound + 1;
          setCurrentRound(nextRound);
          setIsWorkPhase(true);
          setTimeRemaining(workInterval);
          setState('work');
          onRoundComplete?.(nextRound - 1);
        }
      }
      hapticPatterns.medium();
    }
  };

  const currentDuration = isWorkPhase ? workInterval : restInterval;
  const progress = ((currentDuration - timeRemaining) / currentDuration) * 100;

  if (state === 'completed') {
    return (
      <View style={styles.container}>
        <Text style={styles.completeText}>All rounds complete! 🎉</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.roundInfo}>
        <Text style={styles.roundText}>Round {currentRound} / {rounds}</Text>
        <Text style={styles.phaseText}>
          {isWorkPhase ? 'WORK' : 'REST'}
        </Text>
      </View>

      <CircularProgress
        progress={progress}
        duration={currentDuration}
        currentTime={timeRemaining}
        size={220}
        width={16}
      />

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handlePlayPause}
        >
          {state === 'idle' || state === 'paused' ? (
            <Play size={32} color="#4fffc2" />
          ) : (
            <Pause size={32} color="#4fffc2" />
          )}
        </TouchableOpacity>

        {(state === 'work' || state === 'rest' || state === 'paused') && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleSkip}
          >
            <SkipForward size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  roundInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  roundText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  phaseText: {
    color: '#4fffc2',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  controls: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  completeText: {
    color: '#4fffc2',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
});
