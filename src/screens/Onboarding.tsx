// src/screens/Onboarding.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GlassCard, GlassButton } from '../components/GlassUI';
import { LiquidBackground } from '../components/LiquidBackground';
import { useUserStore } from '../store/userStore';
import { CheckCircle } from 'lucide-react-native';

const GOALS = [
  { id: 'strength', label: 'Build Strength' },
  { id: 'endurance', label: 'Improve Endurance' },
  { id: 'weight_loss', label: 'Weight Loss' },
  { id: 'general_fitness', label: 'General Fitness' },
  { id: 'muscle_gain', label: 'Muscle Gain' },
];

export default function Onboarding() {
  const router = useRouter();
  const { updateProfile } = useUserStore();
  const [step, setStep] = useState(1);
  const [fitnessLevel, setFitnessLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleComplete = () => {
    updateProfile({
      fitnessLevel,
      goals: selectedGoals,
      onboardingComplete: true,
    });
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    updateProfile({
      fitnessLevel: 'beginner',
      goals: [],
      onboardingComplete: true,
    });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Step 1: Welcome */}
          {step === 1 && (
            <>
              <Text style={styles.title}>Welcome to Workout Tracker!</Text>
              <Text style={styles.subtitle}>
                Your personal fitness companion to help you achieve your goals.
              </Text>
              <GlassCard style={styles.infoCard}>
                <Text style={styles.infoText}>
                  • Track your workouts and progress{'\n'}
                  • Follow structured programs{'\n'}
                  • Create custom workouts{'\n'}
                  • Get insights and recommendations
                </Text>
              </GlassCard>
            </>
          )}

          {/* Step 2: Fitness Level */}
          {step === 2 && (
            <>
              <Text style={styles.title}>What's your fitness level?</Text>
              <Text style={styles.subtitle}>
                This helps us personalize your experience.
              </Text>
              <View style={styles.optionsContainer}>
                {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.optionCard,
                      fitnessLevel === level && styles.optionCardActive,
                    ]}
                    onPress={() => setFitnessLevel(level)}
                  >
                    {fitnessLevel === level && (
                      <CheckCircle size={20} color="#4fffc2" style={styles.checkIcon} />
                    )}
                    <Text
                      style={[
                        styles.optionText,
                        fitnessLevel === level && styles.optionTextActive,
                      ]}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <>
              <Text style={styles.title}>What are your goals?</Text>
              <Text style={styles.subtitle}>
                Select all that apply. You can change this later.
              </Text>
              <View style={styles.goalsContainer}>
                {GOALS.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalCard,
                      selectedGoals.includes(goal.id) && styles.goalCardActive,
                    ]}
                    onPress={() => handleGoalToggle(goal.id)}
                  >
                    {selectedGoals.includes(goal.id) && (
                      <CheckCircle size={20} color="#4fffc2" style={styles.checkIcon} />
                    )}
                    <Text
                      style={[
                        styles.goalText,
                        selectedGoals.includes(goal.id) && styles.goalTextActive,
                      ]}
                    >
                      {goal.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <GlassButton
              title={step === 3 ? 'Get Started' : 'Next'}
              onPress={handleNext}
              active
            />
          </View>

          {/* Progress Indicators */}
          <View style={styles.progressDots}>
            {[1, 2, 3].map((dot) => (
              <View
                key={dot}
                style={[
                  styles.dot,
                  step === dot && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  infoCard: {
    padding: 24,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 16,
    marginTop: 20,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  optionCardActive: {
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    borderColor: '#4fffc2',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#4fffc2',
  },
  goalsContainer: {
    gap: 12,
    marginTop: 20,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  goalCardActive: {
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    borderColor: '#4fffc2',
  },
  goalText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  goalTextActive: {
    color: '#4fffc2',
  },
  checkIcon: {
    marginRight: 12,
  },
  navigation: {
    marginTop: 40,
    gap: 12,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dotActive: {
    backgroundColor: '#4fffc2',
    width: 24,
  },
});
