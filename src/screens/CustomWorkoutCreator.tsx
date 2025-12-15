// src/screens/CustomWorkoutCreator.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Save, Plus, X, ChevronUp, ChevronDown, Trash2 } from 'lucide-react-native';
import { GlassCard, GlassButton } from '../components/GlassUI';
import { LiquidBackground } from '../components/LiquidBackground';
import { useWorkoutStore } from '../store/workoutStore';
import { CustomWorkout, Exercise } from '../types/workout';
import { EXERCISE_LIBRARY, searchExercises, getExercisesByCategory } from '../data/exerciseLibrary';
import { WORKOUT_TEMPLATES } from '../data/workoutTemplates';

export default function CustomWorkoutCreator() {
  const router = useRouter();
  const { addCustomWorkout, updateCustomWorkout, getCustomWorkout } = useWorkoutStore();
  
  const [workoutName, setWorkoutName] = useState('');
  const [workoutFocus, setWorkoutFocus] = useState('');
  const [warmup, setWarmup] = useState('5 mins: Dynamic stretching');
  const [cooldown, setCooldown] = useState('5 mins: Static stretching');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleAddExercise = (exerciseDef: typeof EXERCISE_LIBRARY[0]) => {
    let newExercise: Exercise;

    if (exerciseDef.defaultDuration) {
      newExercise = {
        id: `${exerciseDef.id}-${Date.now()}`,
        type: 'time',
        name: exerciseDef.name,
        duration: exerciseDef.defaultDuration,
        sets: exerciseDef.defaultSets || 3,
        rest: exerciseDef.defaultRest || 60,
      };
    } else {
      newExercise = {
        id: `${exerciseDef.id}-${Date.now()}`,
        type: 'reps',
        name: exerciseDef.name,
        reps: exerciseDef.defaultReps || '10-12',
        sets: exerciseDef.defaultSets || 3,
        rest: exerciseDef.defaultRest || 60,
      };
    }

    setExercises([...exercises, newExercise]);
    setShowExercisePicker(false);
    setSearchQuery('');
    setSelectedCategory(null);
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

  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const newExercises = [...exercises];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < exercises.length) {
      [newExercises[index], newExercises[newIndex]] = [newExercises[newIndex], newExercises[index]];
      setExercises(newExercises);
    }
  };

  const handleLoadTemplate = (template: CustomWorkout) => {
    setWorkoutName(template.name);
    setWorkoutFocus(template.focus);
    setWarmup(template.warmup);
    setCooldown(template.cooldown);
    setExercises([...template.exercises]);
    setShowTemplatePicker(false);
  };

  const handleSave = () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }

    if (exercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }

    // Calculate estimated duration
    let estimatedMinutes = 10; // Warmup + cooldown
    exercises.forEach(ex => {
      if (ex.type === 'reps') {
        estimatedMinutes += ex.sets * 2; // ~2 min per set
      } else if (ex.type === 'time') {
        estimatedMinutes += (ex.sets * ex.duration) / 60;
      } else {
        estimatedMinutes += ex.rounds * (ex.workInterval + ex.restInterval) / 60;
      }
      estimatedMinutes += (ex.sets - 1) * (ex.rest / 60); // Rest time
    });

    const customWorkout: CustomWorkout = {
      id: `custom-${Date.now()}`,
      name: workoutName,
      focus: workoutFocus || 'Custom Workout',
      duration: `~${Math.round(estimatedMinutes)} min`,
      warmup,
      exercises,
      cooldown,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      difficulty: 'intermediate',
    };

    addCustomWorkout(customWorkout);
    Alert.alert('Saved', 'Your custom workout has been saved!');
    router.back();
  };

  const filteredExercises = selectedCategory
    ? getExercisesByCategory(selectedCategory)
    : searchQuery
    ? searchExercises(searchQuery)
    : EXERCISE_LIBRARY.slice(0, 20); // Show first 20 by default

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Custom Workout</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Workout Info */}
          <GlassCard style={styles.infoCard}>
            <Text style={styles.label}>Workout Name *</Text>
            <TextInput
              style={styles.input}
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder="e.g., Upper Body Blast"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />

            <Text style={styles.label}>Focus / Goal</Text>
            <TextInput
              style={styles.input}
              value={workoutFocus}
              onChangeText={setWorkoutFocus}
              placeholder="e.g., Build upper body strength"
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />

            <Text style={styles.label}>Warmup</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={warmup}
              onChangeText={setWarmup}
              multiline
              numberOfLines={2}
              placeholder="Warmup instructions..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />

            <Text style={styles.label}>Cooldown</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={cooldown}
              onChangeText={setCooldown}
              multiline
              numberOfLines={2}
              placeholder="Cooldown instructions..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
            />
          </GlassCard>

          {/* Templates */}
          <TouchableOpacity
            style={styles.templateButton}
            onPress={() => setShowTemplatePicker(true)}
          >
            <Text style={styles.templateButtonText}>Start from Template</Text>
          </TouchableOpacity>

          {/* Exercises */}
          <Text style={styles.sectionTitle}>Exercises ({exercises.length})</Text>
          
          {exercises.map((exercise, index) => (
            <GlassCard key={exercise.id} style={styles.exerciseCard}>
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
                  {index > 0 && (
                    <TouchableOpacity
                      onPress={() => handleMoveExercise(index, 'up')}
                      style={styles.actionButton}
                    >
                      <ChevronUp size={18} color="#60a5fa" />
                    </TouchableOpacity>
                  )}
                  {index < exercises.length - 1 && (
                    <TouchableOpacity
                      onPress={() => handleMoveExercise(index, 'down')}
                      style={styles.actionButton}
                    >
                      <ChevronDown size={18} color="#60a5fa" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemoveExercise(index)}
                    style={styles.actionButton}
                  >
                    <Trash2 size={18} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          ))}

          {/* Add Exercise Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowExercisePicker(true)}
          >
            <Plus size={20} color="#4fffc2" />
            <Text style={styles.addButtonText}>Add Exercise</Text>
          </TouchableOpacity>

          {/* Save Button */}
          <GlassButton
            title="Save Workout"
            onPress={handleSave}
            active
          />
        </ScrollView>

        {/* Exercise Picker Modal */}
        <Modal
          visible={showExercisePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowExercisePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Exercise</Text>
                <TouchableOpacity onPress={() => setShowExercisePicker(false)}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* Search */}
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor="rgba(255, 255, 255, 0.4)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              {/* Category Filters */}
              <ScrollView horizontal style={styles.categoryFilters}>
                {['all', 'strength', 'cardio', 'hiit', 'flexibility'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryFilter,
                      (selectedCategory === cat || (cat === 'all' && !selectedCategory)) && styles.categoryFilterActive,
                    ]}
                    onPress={() => {
                      setSelectedCategory(cat === 'all' ? null : cat);
                      setSearchQuery('');
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryFilterText,
                        (selectedCategory === cat || (cat === 'all' && !selectedCategory)) && styles.categoryFilterTextActive,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Exercise List */}
              <ScrollView style={styles.exerciseList}>
                {filteredExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseOption}
                    onPress={() => handleAddExercise(exercise)}
                  >
                    <View style={styles.exerciseOptionInfo}>
                      <Text style={styles.exerciseOptionName}>{exercise.name}</Text>
                      <Text style={styles.exerciseOptionCategory}>
                        {exercise.category} • {exercise.difficulty}
                      </Text>
                    </View>
                    <Plus size={20} color="#4fffc2" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Template Picker Modal */}
        <Modal
          visible={showTemplatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTemplatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Template</Text>
                <TouchableOpacity onPress={() => setShowTemplatePicker(false)}>
                  <X size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.exerciseList}>
                {WORKOUT_TEMPLATES.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={styles.templateOption}
                    onPress={() => handleLoadTemplate(template)}
                  >
                    <View style={styles.templateOptionInfo}>
                      <Text style={styles.templateOptionName}>{template.name}</Text>
                      <Text style={styles.templateOptionFocus}>{template.focus}</Text>
                      <Text style={styles.templateOptionMeta}>
                        {template.duration} • {template.exercises.length} exercises • {template.difficulty}
                      </Text>
                    </View>
                    <Plus size={20} color="#4fffc2" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  placeholder: { width: 40 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  infoCard: { marginBottom: 20 },
  label: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  exerciseCard: { marginBottom: 12 },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
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
  templateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(192, 132, 252, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
    marginBottom: 20,
  },
  templateButtonText: { color: '#c084fc', fontSize: 14, fontWeight: '600' },
  templateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  templateOptionInfo: {
    flex: 1,
  },
  templateOptionName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateOptionFocus: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 4,
  },
  templateOptionMeta: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
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
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  categoryFilters: {
    marginBottom: 16,
  },
  categoryFilter: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8,
  },
  categoryFilterActive: {
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    borderColor: 'rgba(79, 255, 194, 0.3)',
  },
  categoryFilterText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryFilterTextActive: {
    color: '#4fffc2',
  },
  exerciseList: {
    maxHeight: 400,
  },
  exerciseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  exerciseOptionInfo: {
    flex: 1,
  },
  exerciseOptionName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  exerciseOptionCategory: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
});
