// src/screens/ProfileTab.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ModernCard } from '../components/ui/ModernCard';
import { MinimalBackground } from '../components/MinimalBackground';
import { colors, spacing, textStyles, radius } from '../theme/design-system';
import { useWorkoutStore } from '../store/workoutStore';
import { Settings, User, Calendar, Clock } from 'lucide-react-native';
import { format, parseISO, addDays } from 'date-fns';
import { FULL_PROGRAM_DATA, getWorkoutForDate } from '../data/fullProgram';

export default function ProfileTab() {
  const router = useRouter();
  const { 
    currentWeek, 
    setWeek, 
    completedWorkouts, 
    getStreak,
    programConfig,
    setProgramStartDate,
    updateProgramConfig,
    clearAllMissedWorkouts,
    activeProgramWeeks,
  } = useWorkoutStore();
  const streak = getStreak();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <View style={styles.container}>
      <MinimalBackground />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Profile Header */}
          <ModernCard variant="content" style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={32} color="#4fffc2" />
              </View>
              <Text style={styles.userName}>Workout Tracker</Text>
              <Text style={styles.userStats}>
                {completedWorkouts.length} workouts • {streak.current} day streak
              </Text>
            </View>
          </ModernCard>

          {/* Program Start Date */}
          <ModernCard variant="content" style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color="#4fffc2" />
              <Text style={styles.sectionTitle}>Program Start Date</Text>
            </View>
            {programConfig?.startDate ? (
              <>
                <Text style={styles.sectionDescription}>
                  Started: {format(parseISO(programConfig.startDate), 'MMMM dd, yyyy')}
                </Text>
                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>Auto-advance weeks</Text>
                  <TouchableOpacity
                    style={[
                      styles.toggle,
                      programConfig.autoAdvance && styles.toggleActive,
                    ]}
                    onPress={() => updateProgramConfig({ autoAdvance: !programConfig.autoAdvance })}
                  >
                    <View style={[
                      styles.toggleThumb,
                      programConfig.autoAdvance && styles.toggleThumbActive,
                    ]} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.changeDateButton}
                  onPress={() => {
                    setSelectedDate(programConfig.startDate ? parseISO(programConfig.startDate) : new Date());
                    setShowDatePicker(true);
                  }}
                >
                  <Text style={styles.changeDateButtonText}>Change Start Date</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.sectionDescription}>
                  Set when you started the program to track progress accurately.
                </Text>
                <TouchableOpacity
                  style={styles.setDateButton}
                  onPress={() => {
                    const today = new Date().toISOString().split('T')[0];
                    setProgramStartDate(today);
                  }}
                >
                  <Text style={styles.setDateButtonText}>Set Start Date to Today</Text>
                </TouchableOpacity>
              </>
            )}
          </ModernCard>

          {/* Week Navigation */}
          <ModernCard variant="content" style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color="#4fffc2" />
              <Text style={styles.sectionTitle}>Week Selection</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Currently on Week {currentWeek} of 6
            </Text>
            <View style={styles.weekButtons}>
              {[1, 2, 3, 4, 5, 6].map((week) => (
                <TouchableOpacity
                  key={week}
                  style={[
                    styles.weekButton,
                    currentWeek === week && styles.weekButtonActive,
                  ]}
                  onPress={() => setWeek(week)}
                >
                  <Text
                    style={[
                      styles.weekButtonText,
                      currentWeek === week && styles.weekButtonTextActive,
                    ]}
                  >
                    {week}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ModernCard>

          {/* Workout Plans */}
          <ModernCard variant="content" style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Calendar size={20} color="#c084fc" />
              <Text style={styles.sectionTitle}>Workout Plans</Text>
            </View>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/plans')}
            >
              <Text style={styles.settingText}>Browse Workout Plans</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => {
                // Get today's workout to customize
                const today = new Date();
                const dayName = format(today, 'EEEE');
                const programWeeks = activeProgramWeeks || FULL_PROGRAM_DATA;
                const workout = getWorkoutForDate(currentWeek, dayName, programWeeks);
                
                if (workout) {
                  router.push({
                    pathname: '/customize-workout',
                    params: {
                      workoutId: workout.id,
                      week: currentWeek.toString(),
                      day: dayName,
                    },
                  });
                } else {
                  Alert.alert('No Workout', 'There is no workout scheduled for today to customize.');
                }
              }}
            >
              <Text style={styles.settingText}>Customize Today's Workout</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </ModernCard>

          {/* Settings */}
          <ModernCard variant="content" style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Settings size={20} color="#4fffc2" />
              <Text style={styles.sectionTitle}>Settings</Text>
            </View>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.settingText}>App Settings</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
          </ModernCard>

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
                <Text style={styles.modalTitle}>Change Start Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalDescription}>
                Changing the start date will reset your program progress and restart from the new date. The program will begin from Week 1 on the selected date.
              </Text>

              {/* Simple Date Selection */}
              <View style={styles.dateOptions}>
                <TouchableOpacity
                  style={styles.dateOption}
                  onPress={() => setSelectedDate(new Date())}
                >
                  <Text style={styles.dateOptionText}>Today</Text>
                  <Text style={styles.dateOptionDate}>
                    {format(new Date(), 'MMM dd, yyyy')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.dateOption}
                  onPress={() => {
                    const tomorrow = addDays(new Date(), 1);
                    setSelectedDate(tomorrow);
                  }}
                >
                  <Text style={styles.dateOptionText}>Tomorrow</Text>
                  <Text style={styles.dateOptionDate}>
                    {format(addDays(new Date(), 1), 'MMM dd, yyyy')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.selectedDateContainer}>
                <Calendar size={20} color="#4fffc2" />
                <Text style={styles.selectedDateText}>
                  New Start Date: {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={() => {
                    const dateStr = format(selectedDate, 'yyyy-MM-dd');
                    setProgramStartDate(dateStr);
                    setWeek(1);
                    updateProgramConfig({ currentWeek: 1 });
                    clearAllMissedWorkouts();
                    setShowDatePicker(false);
                    Alert.alert('Start Date Changed', 'Your program will restart from the new start date.');
                  }}
                >
                  <Text style={styles.modalConfirmText}>Confirm Change</Text>
                </TouchableOpacity>
              </View>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  profileCard: {
    marginBottom: 20,
    padding: 24,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(79, 255, 194, 0.3)',
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  userStats: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  sectionCard: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sectionDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  weekButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weekButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  weekButtonActive: {
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    borderColor: '#4fffc2',
  },
  weekButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: '600',
  },
  weekButtonTextActive: {
    color: '#4fffc2',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingText: {
    color: '#fff',
    fontSize: 14,
  },
  settingArrow: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  toggleLabel: {
    color: '#fff',
    fontSize: 14,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: 'rgba(79, 255, 194, 0.3)',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
    backgroundColor: '#4fffc2',
  },
  setDateButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(79, 255, 194, 0.3)',
    alignItems: 'center',
  },
  setDateButtonText: {
    color: '#4fffc2',
    fontSize: 14,
    fontWeight: '600',
  },
  changeDateButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    alignItems: 'center',
  },
  changeDateButtonText: {
    color: '#c084fc',
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
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#c084fc',
    fontSize: 14,
    fontWeight: '600',
  },
});
