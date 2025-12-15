// src/components/MissedWorkoutsCard.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModernCard } from './ui/ModernCard';
import { BottomSheet } from './ui/BottomSheet';
import { MissedWorkout } from '../types/workout';
import { format, parseISO } from 'date-fns';
import { AlertCircle, Calendar, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useWorkoutStore } from '../store/workoutStore';
import { colors, spacing, radius, textStyles } from '../theme/design-system';

interface MissedWorkoutsCardProps {
  missedWorkouts: MissedWorkout[];
  onReschedule?: (missed: MissedWorkout, newDate: string) => void;
  onDismiss?: (missed: MissedWorkout) => void;
}

export const MissedWorkoutsCard = ({ missedWorkouts, onReschedule, onDismiss }: MissedWorkoutsCardProps) => {
  const router = useRouter();
  const { rescheduleMissedWorkout, clearMissedWorkout } = useWorkoutStore();
  const [selectedMissed, setSelectedMissed] = useState<MissedWorkout | null>(null);

  if (missedWorkouts.length === 0) {
    return null;
  }

  const handleReschedule = (missed: MissedWorkout) => {
    // For now, reschedule to today
    const today = new Date().toISOString().split('T')[0];
    rescheduleMissedWorkout(`${missed.scheduledDate}-${missed.workoutId}`, today);
    onReschedule?.(missed, today);
  };

  const handleStartWorkout = (missed: MissedWorkout) => {
    router.push({
      pathname: '/workout-preview',
      params: {
        workoutId: missed.workoutId,
        week: missed.week.toString(),
        day: missed.day,
      },
    });
  };

  return (
    <>
      <ModernCard variant="content" style={styles.card}>
        <View style={styles.header}>
          <AlertCircle size={20} color={colors.accent.error} />
          <Text style={styles.title}>Missed Workouts</Text>
          <View style={styles.countBadge}>
            <Text style={styles.count}>{missedWorkouts.length}</Text>
          </View>
        </View>
        
        <View style={styles.workoutsList}>
          {missedWorkouts.slice(0, 3).map((missed, index) => (
            <View key={`${missed.scheduledDate}-${missed.workoutId}`} style={styles.missedItem}>
              <View style={styles.missedInfo}>
                <Text style={styles.missedName}>{missed.workoutName}</Text>
                <Text style={styles.missedDate}>
                  {format(parseISO(missed.scheduledDate), 'MMM dd, yyyy')}
                </Text>
              </View>
              <View style={styles.missedActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleStartWorkout(missed)}
                >
                  <Text style={styles.actionButtonText}>Start</Text>
                </TouchableOpacity>
                {onDismiss && (
                  <TouchableOpacity
                    style={styles.dismissButton}
                    onPress={() => {
                      clearMissedWorkout(`${missed.scheduledDate}-${missed.workoutId}`);
                      onDismiss(missed);
                    }}
                  >
                    <X size={16} color={colors.text.tertiary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {missedWorkouts.length > 3 && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => setSelectedMissed(missedWorkouts[0])}
          >
            <Text style={styles.viewAllText}>View All ({missedWorkouts.length})</Text>
          </TouchableOpacity>
        )}
      </ModernCard>

      {/* Detail Bottom Sheet */}
      <BottomSheet
        visible={selectedMissed !== null}
        onClose={() => setSelectedMissed(null)}
      >
        {selectedMissed && (
          <>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Missed Workout</Text>
              <TouchableOpacity onPress={() => setSelectedMissed(null)}>
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalWorkoutName}>{selectedMissed.workoutName}</Text>
            <Text style={styles.modalDate}>
              Scheduled: {format(parseISO(selectedMissed.scheduledDate), 'EEEE, MMMM dd, yyyy')}
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={() => {
                  handleStartWorkout(selectedMissed);
                  setSelectedMissed(null);
                }}
              >
                <Text style={styles.modalActionText}>Start Workout Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalActionButton, styles.rescheduleButton]}
                onPress={() => {
                  handleReschedule(selectedMissed);
                  setSelectedMissed(null);
                }}
              >
                <Calendar size={16} color={colors.accent.primary} />
                <Text style={[styles.modalActionText, styles.rescheduleText]}>Reschedule to Today</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </BottomSheet>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.xl,
    borderColor: colors.accent.error + '40',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  title: {
    ...textStyles.h3,
    color: colors.accent.error,
    flex: 1,
  },
  countBadge: {
    backgroundColor: colors.accent.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  count: {
    ...textStyles.caption,
    color: colors.accent.error,
    fontWeight: '700',
  },
  workoutsList: {
    gap: spacing.md,
  },
  missedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.accent.error + '10',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent.error + '30',
  },
  missedInfo: {
    flex: 1,
  },
  missedName: {
    ...textStyles.body,
    marginBottom: spacing.xs,
  },
  missedDate: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  missedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.accent.primary + '20',
    borderWidth: 1,
    borderColor: colors.accent.primary + '40',
  },
  actionButtonText: {
    ...textStyles.caption,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  viewAllText: {
    ...textStyles.caption,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...textStyles.h1,
  },
  modalWorkoutName: {
    ...textStyles.h2,
    marginBottom: spacing.sm,
  },
  modalDate: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  modalActions: {
    gap: spacing.md,
  },
  modalActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent.primary + '20',
    borderWidth: 1,
    borderColor: colors.accent.primary + '40',
  },
  rescheduleButton: {
    backgroundColor: colors.accent.secondary + '20',
    borderColor: colors.accent.secondary + '40',
  },
  modalActionText: {
    ...textStyles.body,
    color: colors.accent.primary,
    fontWeight: '600',
  },
  rescheduleText: {
    color: colors.accent.secondary,
  },
});
