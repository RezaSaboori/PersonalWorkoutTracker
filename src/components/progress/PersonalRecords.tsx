// src/components/progress/PersonalRecords.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ModernCard } from '../ui/ModernCard';
import { colors, spacing, textStyles, radius } from '../../theme/design-system';
import { Trophy } from 'lucide-react-native';
import { useWorkoutStore } from '../../store/workoutStore';

export const PersonalRecords = () => {
  const { personalRecords } = useWorkoutStore();

  if (personalRecords.length === 0) {
    return (
      <ModernCard variant="content">
        <View style={styles.emptyContainer}>
          <Trophy size={40} color="rgba(255, 255, 255, 0.3)" />
          <Text style={styles.emptyText}>No personal records yet</Text>
          <Text style={styles.emptySubtext}>Complete workouts to set PRs!</Text>
        </View>
      </ModernCard>
    );
  }

  return (
    <View style={styles.container}>
      {personalRecords.map((record) => (
        <ModernCard key={record.exerciseId} variant="compact" style={styles.recordCard}>
          <View style={styles.recordHeader}>
            <Trophy size={20} color="#fbbf24" />
            <Text 
              style={styles.exerciseName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {record.exerciseName}
            </Text>
          </View>
          <View style={styles.recordValue}>
            <Text style={styles.value}>
              {record.type === 'reps' ? `${record.value} reps` : `${record.value}s`}
            </Text>
            <Text style={styles.date}>
              {new Date(record.date).toLocaleDateString()}
            </Text>
          </View>
        </ModernCard>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  recordCard: {
    padding: 16,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexShrink: 1,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    minWidth: 0, // Allows flex to shrink below content size
  },
  recordValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  value: {
    color: '#fbbf24',
    fontSize: 24,
    fontWeight: '700',
  },
  date: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
});
