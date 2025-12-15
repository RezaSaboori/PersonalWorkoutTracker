// app/plans.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, Target, TrendingUp, CheckCircle } from 'lucide-react-native';
import { ModernCard } from '../src/components/ui/ModernCard';
import { ModernButton } from '../src/components/ui/ModernButton';
import { MinimalBackground } from '../src/components/MinimalBackground';
import { colors, spacing, textStyles, radius } from '../src/theme/design-system';
import { AVAILABLE_PROGRAMS, WorkoutProgram } from '../src/data/workoutPrograms';
import { useWorkoutStore } from '../src/store/workoutStore';
import { WeekPlan } from '../src/types/workout';
import { format } from 'date-fns';

export default function PlansScreen() {
  const router = useRouter();
  const { programConfig, setProgramStartDate, updateProgramConfig, setWeek, setActiveProgramWeeks, clearAllMissedWorkouts } = useWorkoutStore();
  const [selectedProgram, setSelectedProgram] = useState<WorkoutProgram | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());

  const handleSelectProgram = (program: WorkoutProgram) => {
    setSelectedProgram(program);
    setShowDatePicker(true);
  };

  const handleConfirmStartDate = () => {
    if (!selectedProgram) return;

    const dateStr = format(selectedStartDate, 'yyyy-MM-dd');
    
    // Clear all existing missed workouts when starting a new program
    clearAllMissedWorkouts();
    
    // Set program start date
    setProgramStartDate(dateStr);
    
    // Set active program weeks
    setActiveProgramWeeks(selectedProgram.weeks as WeekPlan[]);
    
    // Set active program
    updateProgramConfig({
      activeProgramId: selectedProgram.id,
      currentWeek: 1,
      autoAdvance: true,
    });
    
    // Reset to week 1
    setWeek(1);

    Alert.alert(
      'Program Started!',
      `You've started the ${selectedProgram.name}. Your schedule is now set!`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowDatePicker(false);
            setSelectedProgram(null);
            router.back();
          },
        },
      ]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#4fffc2';
      case 'intermediate':
        return '#60a5fa';
      case 'advanced':
        return '#c084fc';
      default:
        return '#94a3b8';
    }
  };

  const getFocusIcons = (focus: string[]) => {
    return focus.map((f, i) => {
      if (f.toLowerCase().includes('strength') || f.toLowerCase().includes('body')) {
        return <TrendingUp key={i} size={14} color="#4fffc2" />;
      }
      if (f.toLowerCase().includes('hiit') || f.toLowerCase().includes('cardio')) {
        return <Target key={i} size={14} color="#ff6b6b" />;
      }
      return <CheckCircle key={i} size={14} color="#60a5fa" />;
    });
  };

  return (
    <View style={styles.container}>
      <MinimalBackground />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Plans</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.description}>
            Choose a workout program that fits your goals and schedule. Each program includes structured workouts with clear progression.
          </Text>

          {/* Active Program Indicator */}
          {programConfig?.activeProgramId && (
            <ModernCard variant="content" style={styles.activeCard}>
              <View style={styles.activeHeader}>
                <CheckCircle size={20} color="#4fffc2" />
                <Text style={styles.activeTitle}>Active Program</Text>
              </View>
              <Text style={styles.activeProgramName}>
                {AVAILABLE_PROGRAMS.find(p => p.id === programConfig.activeProgramId)?.name || 'Unknown'}
              </Text>
              <Text style={styles.activeInfo}>
                Week {programConfig.currentWeek} of {AVAILABLE_PROGRAMS.find(p => p.id === programConfig.activeProgramId)?.totalWeeks || 0}
              </Text>
            </ModernCard>
          )}

          {/* Programs List */}
          <Text style={styles.sectionTitle}>Available Programs</Text>
          
          {AVAILABLE_PROGRAMS.map((program) => {
            const isActive = programConfig?.activeProgramId === program.id;
            const difficultyColor = getDifficultyColor(program.difficulty);
            const isDefault = program.id === 'foundation-6-week'; // Default foundation program
            const isCurrentlyDefault = !programConfig?.activeProgramId && isDefault;
            
            return (
              <ModernCard variant="content"
                key={program.id}
                style={[
                  styles.programCard,
                  (isActive || isCurrentlyDefault) && styles.programCardActive,
                ]}
              >
                {/* Program Header */}
                <View style={styles.programHeader}>
                  <View style={styles.programTitleRow}>
                    <Text style={styles.programName}>{program.name}</Text>
                    {isActive && (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>Active</Text>
                      </View>
                    )}
                    {isCurrentlyDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Current</Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.difficultyBadge, { backgroundColor: `${difficultyColor}20`, borderColor: difficultyColor }]}>
                    <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                      {program.difficulty.charAt(0).toUpperCase() + program.difficulty.slice(1)}
                    </Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.programDescription}>{program.description}</Text>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Clock size={16} color="rgba(255, 255, 255, 0.6)" />
                    <Text style={styles.statText}>{program.duration}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Calendar size={16} color="rgba(255, 255, 255, 0.6)" />
                    <Text style={styles.statText}>{program.workoutsPerWeek} workouts/week</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Target size={16} color="rgba(255, 255, 255, 0.6)" />
                    <Text style={styles.statText}>{program.estimatedTimePerWorkout}</Text>
                  </View>
                </View>

                {/* Focus Tags */}
                <View style={styles.focusRow}>
                  {program.focus.map((f, index) => (
                    <View key={index} style={styles.focusTag}>
                      {getFocusIcons([f])[0]}
                      <Text style={styles.focusText}>{f}</Text>
                    </View>
                  ))}
                </View>

                {/* Select Button */}
                {!isActive && (
                  <ModernButton
                    title={isCurrentlyDefault ? "Continue with Default" : "Select This Program"}
                    onPress={() => handleSelectProgram(program)}
                    variant="primary"
                    size="medium"
                    active
                  />
                )}
                {(isActive || isCurrentlyDefault) && (
                  <View style={styles.selectedIndicator}>
                    <CheckCircle size={20} color="#4fffc2" />
                    <Text style={styles.selectedText}>
                      {isActive ? "Currently Active" : "Currently Using"}
                    </Text>
                  </View>
                )}
              </ModernCard>
            );
          })}
        </ScrollView>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Start Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedProgram && (
                <>
                  <Text style={styles.modalProgramName}>{selectedProgram.name}</Text>
                  <Text style={styles.modalDescription}>
                    When would you like to start this program?
                  </Text>

                  {/* Simple Date Selection */}
                  <View style={styles.dateOptions}>
                    <TouchableOpacity
                      style={styles.dateOption}
                      onPress={() => setSelectedStartDate(new Date())}
                    >
                      <Text style={styles.dateOptionText}>Today</Text>
                      <Text style={styles.dateOptionDate}>
                        {format(new Date(), 'MMM dd, yyyy')}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.dateOption}
                      onPress={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        setSelectedStartDate(tomorrow);
                      }}
                    >
                      <Text style={styles.dateOptionText}>Tomorrow</Text>
                      <Text style={styles.dateOptionDate}>
                        {format(new Date(Date.now() + 86400000), 'MMM dd, yyyy')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.selectedDateContainer}>
                    <Calendar size={20} color="#4fffc2" />
                    <Text style={styles.selectedDateText}>
                      Starting: {format(selectedStartDate, 'EEEE, MMMM dd, yyyy')}
                    </Text>
                  </View>

                  <ModernButton
                    title="Start Program"
                    onPress={handleConfirmStartDate}
                    active
                    style={styles.startButton}
                  />
                </>
              )}
            </View>
          </View>
        </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  activeCard: {
    marginBottom: 24,
    borderColor: 'rgba(79, 255, 194, 0.3)',
    backgroundColor: 'rgba(79, 255, 194, 0.05)',
  },
  activeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  activeTitle: {
    color: '#4fffc2',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  activeProgramName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  activeInfo: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  programCard: {
    marginBottom: 20,
  },
  programCardActive: {
    borderColor: 'rgba(79, 255, 194, 0.3)',
    backgroundColor: 'rgba(79, 255, 194, 0.05)',
  },
  programHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  programTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  programName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  activeBadge: {
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#4fffc2',
    fontSize: 10,
    fontWeight: '700',
  },
  defaultBadge: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    color: '#c084fc',
    fontSize: 10,
    fontWeight: '700',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  programDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  focusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  focusText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  selectButton: {
    marginTop: 8,
  },
  selectedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 255, 194, 0.3)',
  },
  selectedText: {
    color: '#4fffc2',
    fontSize: 14,
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
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  modalClose: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
  },
  modalProgramName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  dateOptions: {
    gap: 12,
    marginBottom: 20,
  },
  dateOption: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateOptionDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 255, 194, 0.3)',
    marginBottom: 20,
  },
  selectedDateText: {
    color: '#4fffc2',
    fontSize: 14,
    fontWeight: '600',
  },
  startButton: {
    marginTop: 8,
  },
});
