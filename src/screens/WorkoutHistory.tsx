// src/screens/WorkoutHistory.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Filter, Calendar, Clock, CheckCircle, Download, X } from 'lucide-react-native';
import { ModernCard } from '../components/ui/ModernCard';
import { MinimalBackground } from '../components/MinimalBackground';
import { colors, spacing, textStyles, radius } from '../theme/design-system';
import { useWorkoutStore } from '../store/workoutStore';
import { useProgressStore } from '../store/progressStore';
import { WorkoutCompletion, WorkoutHistoryFilters } from '../types/workout';
import { format, subDays, subWeeks, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export default function WorkoutHistory() {
  const router = useRouter();
  const { completedWorkouts } = useWorkoutStore();
  const { getWorkoutHistory, searchWorkouts, exportWorkoutData } = useProgressStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<WorkoutHistoryFilters>({});
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutCompletion | null>(null);

  // Get filtered workouts
  const filteredWorkouts = useMemo(() => {
    if (searchQuery.trim()) {
      return searchWorkouts(searchQuery);
    }
    return getWorkoutHistory(filters);
  }, [searchQuery, filters, completedWorkouts]);

  const handleDateRangeSelect = (range: 'week' | 'month' | '3months' | 'all') => {
    const today = new Date();
    let start: Date;
    let end = today;

    switch (range) {
      case 'week':
        start = subWeeks(today, 1);
        break;
      case 'month':
        start = subMonths(today, 1);
        break;
      case '3months':
        start = subMonths(today, 3);
        break;
      default:
        start = new Date(0); // All time
    }

    setFilters({
      ...filters,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
      },
    });
    setShowFilters(false);
  };

  const handleExport = async () => {
    try {
      const data = exportWorkoutData();
      await Share.share({
        message: data,
        title: 'Workout Data Export',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to export workout data');
    }
  };

  const getCompletionPercentage = (workout: WorkoutCompletion) => {
    // This would need workout definition to calculate accurately
    // For now, estimate based on exercises completed
    return workout.exercises.length > 0 ? 100 : 0;
  };

  return (
    <View style={styles.container}>
      <MinimalBackground />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout History</Text>
          <TouchableOpacity onPress={handleExport} style={styles.exportButton}>
            <Download size={20} color="#4fffc2" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="rgba(255, 255, 255, 0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts or exercises..."
            placeholderTextColor="rgba(255, 255, 255, 0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color="rgba(255, 255, 255, 0.6)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Filter size={16} color="#4fffc2" />
            <Text style={styles.filterButtonText}>Filters</Text>
          </TouchableOpacity>
          
          <Text style={styles.resultCount}>
            {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {/* Workout List */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredWorkouts.length === 0 ? (
            <ModernCard variant="content" style={styles.emptyCard}>
              <Text style={styles.emptyText}>No workouts found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery ? 'Try a different search term' : 'Complete your first workout to see it here!'}
              </Text>
            </ModernCard>
          ) : (
            filteredWorkouts.map((workout, index) => (
              <WorkoutHistoryCard
                key={`${workout.date}-${workout.workoutId}-${index}`}
                workout={workout}
                onPress={() => setSelectedWorkout(workout)}
              />
            ))
          )}
        </ScrollView>

        {/* Filter Modal */}
        <Modal
          visible={showFilters}
          transparent
          animationType="slide"
          onRequestClose={() => setShowFilters(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Workouts</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={styles.filterSectionTitle}>Date Range</Text>
              <View style={styles.filterOptions}>
                {[
                  { label: 'Last Week', value: 'week' },
                  { label: 'Last Month', value: 'month' },
                  { label: 'Last 3 Months', value: '3months' },
                  { label: 'All Time', value: 'all' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.filterOption}
                    onPress={() => handleDateRangeSelect(option.value as any)}
                  >
                    <Text style={styles.filterOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setFilters({});
                  setShowFilters(false);
                }}
              >
                <Text style={styles.clearFiltersText}>Clear All Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Workout Detail Modal */}
        <Modal
          visible={selectedWorkout !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedWorkout(null)}
        >
          {selectedWorkout && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Workout Details</Text>
                  <TouchableOpacity onPress={() => setSelectedWorkout(null)}>
                    <X size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Date</Text>
                    <Text style={styles.detailValue}>
                      {format(new Date(selectedWorkout.date), 'EEEE, MMMM dd, yyyy')}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Workout ID</Text>
                    <Text style={styles.detailValue}>{selectedWorkout.workoutId}</Text>
                  </View>

                  {selectedWorkout.duration && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Duration</Text>
                      <Text style={styles.detailValue}>
                        {Math.floor(selectedWorkout.duration / 60)}m {selectedWorkout.duration % 60}s
                      </Text>
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Exercises Completed</Text>
                    <Text style={styles.detailValue}>{selectedWorkout.exercises.length}</Text>
                  </View>

                  <Text style={styles.exercisesTitle}>Exercise Details</Text>
                  {selectedWorkout.exercises.map((exercise, idx) => (
                    <ModernCard variant="content" key={idx} style={styles.exerciseDetailCard}>
                      <Text style={styles.exerciseDetailName}>Exercise {idx + 1}</Text>
                      <Text style={styles.exerciseDetailId}>ID: {exercise.exerciseId}</Text>
                      <Text style={styles.exerciseDetailSets}>
                        Sets: {exercise.sets.length}
                      </Text>
                      {exercise.repsCompleted && (
                        <Text style={styles.exerciseDetailReps}>
                          Reps: {exercise.repsCompleted.join(', ')}
                        </Text>
                      )}
                      {exercise.timeCompleted && (
                        <Text style={styles.exerciseDetailTime}>
                          Times: {exercise.timeCompleted.map(t => `${t}s`).join(', ')}
                        </Text>
                      )}
                    </ModernCard>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}
        </Modal>
      </SafeAreaView>
    </View>
  );
}

function WorkoutHistoryCard({
  workout,
  onPress,
}: {
  workout: WorkoutCompletion;
  onPress: () => void;
}) {
  const duration = workout.duration
    ? `${Math.floor(workout.duration / 60)}m ${workout.duration % 60}s`
    : 'N/A';

  return (
    <TouchableOpacity onPress={onPress}>
      <ModernCard variant="content" style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutDate}>
              {format(new Date(workout.date), 'MMM dd, yyyy')}
            </Text>
            <Text style={styles.workoutId}>{workout.workoutId}</Text>
          </View>
          <CheckCircle size={24} color="#4fffc2" />
        </View>

        <View style={styles.workoutMeta}>
          <View style={styles.metaItem}>
            <Clock size={14} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.metaText}>{duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Calendar size={14} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.metaText}>{workout.exercises.length} exercises</Text>
          </View>
        </View>
      </ModernCard>
    </TouchableOpacity>
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
    fontSize: 20,
    fontWeight: '700',
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 255, 194, 0.3)',
  },
  filterButtonText: {
    color: '#4fffc2',
    fontSize: 14,
    fontWeight: '600',
  },
  resultCount: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  workoutCard: {
    marginBottom: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutDate: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  workoutId: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(20, 20, 20, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  filterSectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    gap: 12,
    marginBottom: 24,
  },
  filterOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  clearFiltersButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    alignItems: 'center',
  },
  clearFiltersText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exercisesTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 12,
  },
  exerciseDetailCard: {
    marginBottom: 12,
  },
  exerciseDetailName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseDetailId: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  exerciseDetailSets: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginBottom: 2,
  },
  exerciseDetailReps: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginBottom: 2,
  },
  exerciseDetailTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
  },
});
