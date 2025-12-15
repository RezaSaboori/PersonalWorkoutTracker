// app/customize-workout.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Save, RotateCcw, Plus, X, ChevronUp, ChevronDown, Edit2, Trash2 } from 'lucide-react-native';
import { ModernCard } from '../src/components/ui/ModernCard';
import { ModernButton } from '../src/components/ui/ModernButton';
import { GlassSlider } from '../src/components/ui/GlassSlider';
import { MinimalBackground } from '../src/components/MinimalBackground';
import { colors, spacing, textStyles, radius } from '../src/theme/design-system';
import { FULL_PROGRAM_DATA, getWorkoutForDate } from '../src/data/fullProgram';
import { useWorkoutStore } from '../src/store/workoutStore';
import { WorkoutDay, Exercise, WorkoutCustomization } from '../src/types/workout';
import { format } from 'date-fns';

export default function CustomizeWorkout() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    currentWeek, 
    getCustomizedWorkout, 
    updateWorkoutCustomization, 
    resetWorkoutCustomization,
    activeProgramWeeks,
  } = useWorkoutStore();
  
  // Get workout
  const workoutId = params.workoutId as string;
  const weekNum = params.week ? parseInt(params.week as string) : currentWeek;
  const dayName = params.day as string || format(new Date(), 'EEEE');
  
  // Use active program weeks if available, otherwise fall back to FULL_PROGRAM_DATA
  const programWeeks = activeProgramWeeks || FULL_PROGRAM_DATA;
  
  let baseWorkout: WorkoutDay | null = null;
  
  if (workoutId) {
    // Search in active program weeks first
    for (const week of programWeeks) {
      const found = Object.values(week.schedule).find(w => w?.id === workoutId);
      if (found) {
        baseWorkout = found;
        break;
      }
    }
  } else {
    baseWorkout = getWorkoutForDate(weekNum, dayName, programWeeks);
  }

  const existingCustomization = baseWorkout ? getCustomizedWorkout(baseWorkout.id) : null;
  
  // State for editing
  const [exercises, setExercises] = useState<Exercise[]>(
    baseWorkout ? [...baseWorkout.exercises] : []
  );
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [showAddExercise, setShowAddExercise] = useState(false);

  useEffect(() => {
    if (baseWorkout) {
      // Merge existing customizations
      const merged = mergeCustomizations(baseWorkout, existingCustomization);
      setExercises(merged.exercises);
    }
  }, [baseWorkout, existingCustomization]);

  if (!baseWorkout) {
    return (
      <View style={styles.container}>
        <MinimalBackground />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.errorText}>Workout not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  const handleSave = () => {
    const customization: WorkoutCustomization = {
      workoutId: baseWorkout!.id,
      exerciseCustomizations: {},
    };

    // Build customization object
    exercises.forEach((exercise, index) => {
      const original = baseWorkout!.exercises[index];
      if (!original || original.id !== exercise.id) {
        // Exercise was modified or reordered
        if (original) {
          const custom: any = {};
          if (exercise.type === 'reps' && 'reps' in exercise) {
            custom.reps = exercise.reps;
            custom.sets = exercise.sets;
            custom.rest = exercise.rest;
          } else if (exercise.type === 'time' && 'duration' in exercise) {
            custom.duration = exercise.duration;
            custom.sets = exercise.sets;
            custom.rest = exercise.rest;
          } else if (exercise.type === 'hiit' && 'workInterval' in exercise) {
            custom.workInterval = exercise.workInterval;
            custom.restInterval = exercise.restInterval;
            custom.sets = exercise.rounds;
          }
          customization.exerciseCustomizations[original.id] = custom;
        }
      } else {
        // Check if values changed
        if (exercise.type === 'reps' && original.type === 'reps') {
          if (exercise.reps !== original.reps || exercise.sets !== original.sets || exercise.rest !== original.rest) {
            customization.exerciseCustomizations[exercise.id] = {
              reps: exercise.reps,
              sets: exercise.sets,
              rest: exercise.rest,
            };
          }
        } else if (exercise.type === 'time' && original.type === 'time') {
          if (exercise.duration !== original.duration || exercise.sets !== original.sets || exercise.rest !== original.rest) {
            customization.exerciseCustomizations[exercise.id] = {
              duration: exercise.duration,
              sets: exercise.sets,
              rest: exercise.rest,
            };
          }
        } else if (exercise.type === 'hiit' && original.type === 'hiit') {
          if (exercise.workInterval !== original.workInterval || exercise.restInterval !== original.restInterval || exercise.rounds !== original.rounds) {
            customization.exerciseCustomizations[exercise.id] = {
              workInterval: exercise.workInterval,
              restInterval: exercise.restInterval,
              sets: exercise.rounds,
            };
          }
        }
      }
    });

    updateWorkoutCustomization(customization);
    Alert.alert('Saved', 'Your workout customizations have been saved!');
    router.back();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Customizations',
      'This will remove all customizations and restore the original workout. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetWorkoutCustomization(baseWorkout!.id);
            setExercises([...baseWorkout!.exercises]);
            Alert.alert('Reset', 'Workout restored to original');
          },
        },
      ]
    );
  };

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const newExercises = [...exercises];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < exercises.length) {
      [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
      setExercises(newExercises);
    }
  };

  const handleRemoveExercise = (index: number) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setExercises(exercises.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  const handleUpdateExercise = (index: number, updates: Partial<Exercise>) => {
    const newExercises = [...exercises];
    const currentExercise = newExercises[index];
    // Type-safe update based on exercise type
    if (currentExercise.type === 'reps' && 'reps' in updates) {
      newExercises[index] = { ...currentExercise, ...updates } as Exercise;
    } else if (currentExercise.type === 'time' && 'duration' in updates) {
      newExercises[index] = { ...currentExercise, ...updates } as Exercise;
    } else if (currentExercise.type === 'hiit' && 'workInterval' in updates) {
      newExercises[index] = { ...currentExercise, ...updates } as Exercise;
    } else {
      newExercises[index] = { ...currentExercise, ...updates } as Exercise;
    }
    setExercises(newExercises);
    setEditingExercise(null);
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
          <Text style={styles.headerTitle}>Customize Workout</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Workout Info */}
          <ModernCard variant="content" style={styles.infoCard}>
            <Text style={styles.workoutTitle}>{baseWorkout.title}</Text>
            <Text style={styles.workoutFocus}>{baseWorkout.focus}</Text>
            {existingCustomization && (
              <View style={styles.customizedBadge}>
                <Text style={styles.customizedText}>Customized</Text>
              </View>
            )}
          </ModernCard>

          {/* Exercises */}
          <Text style={styles.sectionTitle}>Exercises</Text>
          
          {exercises.map((exercise, index) => (
            <ExerciseEditor
              key={`${exercise.id}-${index}`}
              exercise={exercise}
              index={index}
              isEditing={editingExercise === exercise.id}
              onEdit={() => setEditingExercise(exercise.id)}
              onSave={(updates) => handleUpdateExercise(index, updates)}
              onCancel={() => setEditingExercise(null)}
              onMoveUp={() => handleMoveExercise(index, 'up')}
              onMoveDown={() => handleMoveExercise(index, 'down')}
              onRemove={() => handleRemoveExercise(index)}
              canMoveUp={index > 0}
              canMoveDown={index < exercises.length - 1}
            />
          ))}

          {/* Add Exercise Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddExercise(true)}
          >
            <Plus size={20} color="#4fffc2" />
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
            >
              <RotateCcw size={18} color="#ff6b6b" />
              <Text style={styles.resetButtonText}>Reset to Default</Text>
            </TouchableOpacity>
            
            <ModernButton
              title="Save Customizations"
              onPress={handleSave}
              active
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Add Exercise Modal */}
      <Modal
        visible={showAddExercise}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddExercise(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Exercise</Text>
            <Text style={styles.modalText}>
              Exercise library coming soon. For now, you can customize existing exercises.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowAddExercise(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ExerciseEditor({
  exercise,
  index,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onMoveUp,
  onMoveDown,
  onRemove,
  canMoveUp,
  canMoveDown,
}: {
  exercise: Exercise;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updates: Partial<Exercise>) => void;
  onCancel: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const [localExercise, setLocalExercise] = useState(exercise);

  useEffect(() => {
    setLocalExercise(exercise);
  }, [exercise]);

  if (!isEditing) {
    return (
      <ModernCard variant="content" style={styles.exerciseCard}>
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseNumber}>
            <Text style={styles.exerciseNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            {exercise.type === 'reps' && (
              <Text style={styles.exerciseDetails}>
                {exercise.sets} sets × {exercise.reps} reps • {exercise.rest}s rest
              </Text>
            )}
            {exercise.type === 'time' && (
              <Text style={styles.exerciseDetails}>
                {exercise.sets} sets × {exercise.duration}s • {exercise.rest}s rest
              </Text>
            )}
            {exercise.type === 'hiit' && (
              <Text style={styles.exerciseDetails}>
                {exercise.rounds} rounds × {exercise.workInterval}s work / {exercise.restInterval}s rest
              </Text>
            )}
          </View>
          <View style={styles.exerciseActions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Edit2 size={18} color="#4fffc2" />
            </TouchableOpacity>
            {canMoveUp && (
              <TouchableOpacity onPress={onMoveUp} style={styles.actionButton}>
                <ChevronUp size={18} color="#60a5fa" />
              </TouchableOpacity>
            )}
            {canMoveDown && (
              <TouchableOpacity onPress={onMoveDown} style={styles.actionButton}>
                <ChevronDown size={18} color="#60a5fa" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onRemove} style={styles.actionButton}>
              <Trash2 size={18} color="#ff6b6b" />
            </TouchableOpacity>
          </View>
        </View>
      </ModernCard>
    );
  }

  return (
    <ModernCard variant="content" style={styles.exerciseCard}>
      <Text style={styles.exerciseName}>{exercise.name}</Text>
      
      {exercise.type === 'reps' && 'reps' in localExercise && (
        <>
          <GlassSlider
            label="Sets"
            value={localExercise.sets}
            minimumValue={1}
            maximumValue={10}
            step={1}
            onValueChange={(val) => setLocalExercise({ ...localExercise, sets: val } as Exercise)}
            unit="sets"
            style={styles.slider}
          />
          <GlassSlider
            label="Rest"
            value={localExercise.rest}
            minimumValue={0}
            maximumValue={180}
            step={5}
            onValueChange={(val) => setLocalExercise({ ...localExercise, rest: val } as Exercise)}
            unit="sec"
            style={styles.slider}
          />
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Reps:</Text>
            <TextInput
              style={styles.input}
              value={localExercise.reps}
              onChangeText={(text) => setLocalExercise({ ...localExercise, reps: text } as Exercise)}
              placeholder="12-15"
            />
          </View>
        </>
      )}

      {exercise.type === 'time' && 'duration' in localExercise && (
        <>
          <GlassSlider
            label="Duration"
            value={localExercise.duration}
            minimumValue={10}
            maximumValue={300}
            step={5}
            onValueChange={(val) => setLocalExercise({ ...localExercise, duration: val } as Exercise)}
            unit="sec"
            style={styles.slider}
          />
          <GlassSlider
            label="Sets"
            value={localExercise.sets}
            minimumValue={1}
            maximumValue={10}
            step={1}
            onValueChange={(val) => setLocalExercise({ ...localExercise, sets: val } as Exercise)}
            unit="sets"
            style={styles.slider}
          />
          <GlassSlider
            label="Rest"
            value={localExercise.rest}
            minimumValue={0}
            maximumValue={180}
            step={5}
            onValueChange={(val) => setLocalExercise({ ...localExercise, rest: val } as Exercise)}
            unit="sec"
            style={styles.slider}
          />
        </>
      )}

      {exercise.type === 'hiit' && 'workInterval' in localExercise && (
        <>
          <GlassSlider
            label="Work Interval"
            value={localExercise.workInterval}
            minimumValue={10}
            maximumValue={120}
            step={5}
            onValueChange={(val) => setLocalExercise({ ...localExercise, workInterval: val } as Exercise)}
            unit="sec"
            style={styles.slider}
          />
          <GlassSlider
            label="Rest Interval"
            value={localExercise.restInterval}
            minimumValue={5}
            maximumValue={60}
            step={5}
            onValueChange={(val) => setLocalExercise({ ...localExercise, restInterval: val } as Exercise)}
            unit="sec"
            style={styles.slider}
          />
          <GlassSlider
            label="Rounds"
            value={localExercise.rounds}
            minimumValue={1}
            maximumValue={20}
            step={1}
            onValueChange={(val) => setLocalExercise({ ...localExercise, rounds: val } as Exercise)}
            unit="rounds"
            style={styles.slider}
          />
        </>
      )}

      <View style={styles.editActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => onSave(localExercise)}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ModernCard>
  );
}

function mergeCustomizations(workout: WorkoutDay, customization: WorkoutCustomization | null): WorkoutDay {
  if (!customization) return workout;

  const mergedExercises = workout.exercises.map(exercise => {
    const custom = customization.exerciseCustomizations[exercise.id];
    if (!custom) return exercise;

    if (exercise.type === 'reps') {
      return {
        ...exercise,
        reps: custom.reps ?? exercise.reps,
        sets: custom.sets ?? exercise.sets,
        rest: custom.rest ?? exercise.rest,
      };
    } else if (exercise.type === 'time') {
      return {
        ...exercise,
        duration: custom.duration ?? exercise.duration,
        sets: custom.sets ?? exercise.sets,
        rest: custom.rest ?? exercise.rest,
      };
    } else {
      return {
        ...exercise,
        workInterval: custom.workInterval ?? exercise.workInterval,
        restInterval: custom.restInterval ?? exercise.restInterval,
        rounds: custom.sets ?? exercise.rounds,
      };
    }
  });

  return {
    ...workout,
    exercises: mergedExercises,
  };
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  safeArea: { flex: 1 },
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  placeholder: { width: 40 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  infoCard: { marginBottom: 20 },
  workoutTitle: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 6 },
  workoutFocus: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 14 },
  customizedBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  customizedText: { color: '#c084fc', fontSize: 10, fontWeight: '600' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  exerciseCard: { marginBottom: 12 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: { color: '#4fffc2', fontSize: 14, fontWeight: '700' },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  exerciseDetails: { color: 'rgba(255, 255, 255, 0.6)', fontSize: 13 },
  exerciseActions: { flexDirection: 'row', gap: 8 },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  inputLabel: { color: '#fff', fontSize: 14, width: 120 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  editActions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  cancelButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    borderWidth: 1,
    borderColor: '#4fffc2',
    alignItems: 'center',
  },
  saveButtonText: { color: '#4fffc2', fontSize: 14, fontWeight: '600' },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 255, 194, 0.3)',
    marginBottom: 20,
  },
  addButtonText: { color: '#4fffc2', fontSize: 14, fontWeight: '600' },
  actionsContainer: { marginTop: 8, gap: 12 },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  resetButtonText: { color: '#ff6b6b', fontSize: 14, fontWeight: '600' },
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
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  modalText: { color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, lineHeight: 20, marginBottom: 20 },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    borderWidth: 1,
    borderColor: '#4fffc2',
    alignItems: 'center',
  },
  modalButtonText: { color: '#4fffc2', fontSize: 14, fontWeight: '600' },
  errorText: { color: '#fff', fontSize: 18, marginBottom: 20 },
  backText: { color: '#4fffc2', fontSize: 16 },
  slider: { marginVertical: 16 },
});
