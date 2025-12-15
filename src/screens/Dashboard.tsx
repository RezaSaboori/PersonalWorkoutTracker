// src/screens/Dashboard.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { format, addDays, subDays, isSameDay, startOfWeek } from 'date-fns';
import { useRouter } from 'expo-router';
import { ModernCard } from '../components/ui/ModernCard';
import { ModernButton } from '../components/ui/ModernButton';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { MinimalBackground } from '../components/MinimalBackground';
import { useWorkoutStore } from '../store/workoutStore';
import { useNutritionStore } from '../store/nutritionStore';
import { FULL_PROGRAM_DATA } from '../data/fullProgram';
import { getWorkoutForDate as getWorkoutForDateByStart } from '../utils/programSchedule';
import { Droplets, Calendar, Activity, Flame, CheckCircle } from 'lucide-react-native';
import { InsightCard } from '../components/InsightCard';
import { MissedWorkoutsCard } from '../components/MissedWorkoutsCard';
import { generateRecommendations } from '../utils/aiRecommendations';
import { Recommendation } from '../types/workout';
import { WorkoutDay } from '../types/workout';
import { getWorkoutForDate } from '../data/fullProgram';
import { colors, spacing, textStyles, radius } from '../theme/design-system';

export default function Dashboard() {
  const router = useRouter();
  const { 
    currentWeek, 
    completedWorkouts, 
    getStreak, 
    personalRecords,
    programConfig,
    getInProgressWorkout,
    getMissedWorkouts,
    markWorkoutAsMissed,
    setProgramStartDate,
    getCurrentWeekFromStartDate,
    isWorkoutCompleted,
    activeProgramWeeks,
  } = useWorkoutStore();
  const { getTodayCheckIn, updateCheckIn, getHydrationProgress, defaultTargetHydration, getCheckIn } = useNutritionStore();
  
  // Generate AI recommendations using Apple Foundation Kit
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  useEffect(() => {
    const loadRecommendations = async () => {
      const streak = getStreak();
      const recs = await generateRecommendations(completedWorkouts, personalRecords, currentWeek, streak);
      setRecommendations(recs);
    };
    loadRecommendations();
  }, [completedWorkouts, personalRecords, currentWeek]);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);

  // Detect missed workouts (only check, don't modify in useMemo)
  const missedWorkouts = useMemo(() => {
    return getMissedWorkouts();
  }, [completedWorkouts, currentWeek]);

  // Detect and mark missed workouts (separate effect to avoid infinite loops)
  useEffect(() => {
    // Don't check for missed workouts if no program start date is set
    if (!programConfig?.startDate) {
      return;
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const startDate = new Date(programConfig.startDate);
    startDate.setHours(0, 0, 0, 0);
    const programWeeks = activeProgramWeeks || FULL_PROGRAM_DATA;

    // Only check dates from start date onwards, up to 7 days back from today
    // Start checking from the later of: start date OR 7 days ago
    const checkFromDate = new Date(Math.max(startDate.getTime(), subDays(todayDate, 7).getTime()));
    
    // Check each day from start date (or 7 days ago if start date is older) to yesterday
    let checkDate = new Date(checkFromDate);
    while (checkDate < todayDate) {
      // Skip dates before the program start date
      if (checkDate < startDate) {
        checkDate = addDays(checkDate, 1);
        continue;
      }
      
      const dateStr = format(checkDate, 'yyyy-MM-dd');
      
      // Use the new schedule function to get workout for this date
      const scheduledWorkout = getWorkoutForDateByStart(programConfig.startDate, checkDate, programWeeks);
      
      // Only check if there's actually a workout scheduled for this date
      if (scheduledWorkout) {
        const isCompleted = isWorkoutCompleted(dateStr, scheduledWorkout.id);
        const existingMissed = getMissedWorkouts();
        const alreadyMarked = existingMissed.some(
          m => m.scheduledDate === dateStr && m.workoutId === scheduledWorkout.id
        );
        
        // Calculate week number for reference
        const daysSinceStart = Math.floor((checkDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(daysSinceStart / 7) + 1;
        const dayName = format(checkDate, 'EEEE');
        
        if (!isCompleted && !alreadyMarked && weekNumber >= 1 && weekNumber <= programWeeks.length) {
          markWorkoutAsMissed(
            dateStr,
            scheduledWorkout.id,
            scheduledWorkout.title,
            weekNumber,
            dayName
          );
        }
      }
      
      // Move to next day
      checkDate = addDays(checkDate, 1);
    }
  }, [completedWorkouts.length, currentWeek, activeProgramWeeks, programConfig?.startDate]); // Only depend on length to avoid infinite loops

  // Auto-update week based on start date if enabled
  useEffect(() => {
    if (programConfig?.autoAdvance) {
      const calculatedWeek = getCurrentWeekFromStartDate();
      if (calculatedWeek !== currentWeek) {
        // Week will be updated by getCurrentWeekFromStartDate
      }
    }
  }, [programConfig, currentWeek]);
  
  const dayName = format(selectedDate, 'EEEE');
  const dateStr = format(selectedDate, 'MMM dd'); // e.g., "Dec 15"
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isToday = isSameDay(selectedDate, today);
  
  const programWeeks = activeProgramWeeks || FULL_PROGRAM_DATA;
  
  // Get workout based on start date if available, otherwise use current week/day
  let todaysWorkout: WorkoutDay | null = null;
  if (programConfig?.startDate) {
    todaysWorkout = getWorkoutForDateByStart(programConfig.startDate, selectedDate, programWeeks);
  } else {
    // Fallback to old method if no start date
    todaysWorkout = getWorkoutForDate(currentWeek, dayName, programWeeks);
  }
  
  // Calculate current week based on start date
  let effectiveWeek = currentWeek;
  if (programConfig?.startDate) {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const startDate = new Date(programConfig.startDate);
    startDate.setHours(0, 0, 0, 0);
    const daysSinceStart = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    effectiveWeek = Math.floor(daysSinceStart / 7) + 1;
  }
  
  const currentPlan = programWeeks.find(p => p.weekNumber === effectiveWeek);
  const nutritionCheckIn = getCheckIn(selectedDateStr);
  const hydrationProgress = getHydrationProgress(selectedDateStr);
  
  const totalWorkouts = completedWorkouts.length;
  const weekWorkouts = completedWorkouts.filter(w => {
    const workoutDate = new Date(w.date);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (weekStart.getDay() + 6) % 7);
    return workoutDate >= weekStart;
  }).length;
  
  const scheduledWeekWorkouts = currentPlan
    ? Object.values(currentPlan.schedule).filter(w => w !== null).length
    : 0;

  const handlePreviousDay = () => {
    setSelectedDate(prev => subDays(prev, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const handleToday = () => {
    setSelectedDate(today);
  };

  // Format date display: "Today (Monday, Dec 15)" or "Monday, Dec 15"
  const formattedDateDisplay = isToday 
    ? `Today (${dayName}, ${dateStr})`
    : `${dayName}, ${dateStr}`;

  const handleMealCheck = (meal: 'breakfast' | 'lunch' | 'dinner' | 'snacks') => {
    const current = nutritionCheckIn || {
      date: selectedDateStr,
      breakfast: false,
      lunch: false,
      dinner: false,
      snacks: false,
      hydration: 0,
      targetHydration: defaultTargetHydration,
    };
    
    updateCheckIn(selectedDateStr, {
      [meal]: !current[meal],
    });
  };

  const handleHydrationAdd = (amount: number) => {
    const current = nutritionCheckIn || {
      date: selectedDateStr,
      breakfast: false,
      lunch: false,
      dinner: false,
      snacks: false,
      hydration: 0,
      targetHydration: defaultTargetHydration,
    };
    
    updateCheckIn(selectedDateStr, {
      hydration: Math.min(current.hydration + amount, current.targetHydration),
    });
  };

  return (
    <View style={styles.mainContainer}>
      <MinimalBackground />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Date Navigation - Arrows with Date */}
          <View style={styles.dateSection}>
            <View style={styles.dateNavigation}>
              <TouchableOpacity
                onPress={handlePreviousDay}
                style={styles.dateNavButton}
                activeOpacity={0.7}
              >
                <ChevronLeft size={20} color={colors.accent.primary} />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleToday}
                style={styles.dateDisplay}
                activeOpacity={0.7}
              >
                <Text 
                  style={styles.dateText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formattedDateDisplay}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleNextDay}
                style={styles.dateNavButton}
                activeOpacity={0.7}
              >
                <ChevronRight size={20} color={colors.accent.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Program Start Date Setup */}
          {!programConfig && (
            <ModernCard variant="content" style={styles.setupCard}>
              <Text style={styles.setupTitle}>Set Program Start Date</Text>
              <Text style={styles.setupText}>
                Set when you started the program to track your progress accurately.
              </Text>
              <ModernButton
                title="Start Today"
                onPress={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setProgramStartDate(today);
                }}
                variant="primary"
                size="medium"
                active
              />
            </ModernCard>
          )}

          {/* Missed Workouts */}
          {missedWorkouts.length > 0 && (
            <MissedWorkoutsCard missedWorkouts={missedWorkouts} />
          )}

          {/* AI Recommendations */}
          {recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insights & Recommendations</Text>
              {recommendations.slice(0, 2).map((rec) => (
                <InsightCard key={rec.id} recommendation={rec} />
              ))}
            </View>
          )}

          {/* Current Phase Indicator */}
          <ModernCard variant="content" style={styles.phaseCard}>
            <View style={styles.phaseHeader}>
              <Activity size={20} color={colors.accent.secondary} />
              <Text style={styles.phaseLabel}>CURRENT PHASE</Text>
            </View>
            <Text style={styles.phaseTitle}>{currentPlan?.phaseName}</Text>
            <Text style={styles.weekIndicator}>Week {currentWeek} of 6</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(currentWeek/6)*100}%` }]} />
            </View>
          </ModernCard>

          {/* Streak & Quick Stats */}
          <ModernCard variant="compact" style={styles.statsCard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Flame size={24} color={colors.accent.error} />
                <Text style={styles.statValue}>{getStreak().current}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Activity size={24} color={colors.accent.primary} />
                <Text style={styles.statValue}>{weekWorkouts}/{scheduledWeekWorkouts}</Text>
                <Text style={styles.statLabel}>This Week</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <CheckCircle size={24} color={colors.accent.info} />
                <Text style={styles.statValue}>{totalWorkouts}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
            </View>
          </ModernCard>

          {/* Today's Workout - Hero Card */}
          <View style={styles.section}>
            {todaysWorkout ? (
              <ModernCard variant="hero" style={styles.workoutCard} elevated>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{todaysWorkout.duration}</Text>
                </View>
                <Text style={styles.workoutTitle}>{todaysWorkout.title}</Text>
                <Text style={styles.workoutFocus}>{todaysWorkout.focus}</Text>
                
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>{todaysWorkout.exercises.length} Exercises</Text>
                  <Text style={styles.metaText}>•</Text>
                  <Text style={styles.metaText}>High Intensity</Text>
                </View>

                <View style={styles.buttonContainer}>
                  <ModernButton 
                    title={getInProgressWorkout(todaysWorkout.id) ? "Resume Workout" : "Start Workout"}
                    onPress={() => router.push({ 
                      pathname: '/workout-preview', 
                      params: { workoutId: todaysWorkout.id, week: currentWeek.toString(), day: dayName } 
                    })} 
                    variant="primary"
                    size="large"
                    active
                  />
                </View>
              </ModernCard>
            ) : (
              <ModernCard variant="hero">
                <View style={styles.restDayContainer}>
                  <Calendar size={40} color={colors.text.tertiary} />
                  <Text style={styles.restTitle}>Active Recovery Day</Text>
                  <Text style={styles.restDesc}>Focus on gentle movement, stretching, and hitting your protein goals.</Text>
                </View>
              </ModernCard>
            )}
          </View>

          {/* Nutrition Check-ins */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nutrition & Hydration</Text>
            
            <ModernCard variant="content" style={styles.nutritionCard}>
              <View style={styles.mealsRow}>
                <TouchableOpacity
                  style={[styles.mealButton, nutritionCheckIn?.breakfast && styles.mealButtonActive]}
                  onPress={() => handleMealCheck('breakfast')}
                >
                  <Text style={[styles.mealText, nutritionCheckIn?.breakfast && styles.mealTextActive]}>
                    Breakfast
                  </Text>
                  {nutritionCheckIn?.breakfast && <CheckCircle size={16} color={colors.accent.primary} />}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.mealButton, nutritionCheckIn?.lunch && styles.mealButtonActive]}
                  onPress={() => handleMealCheck('lunch')}
                >
                  <Text style={[styles.mealText, nutritionCheckIn?.lunch && styles.mealTextActive]}>
                    Lunch
                  </Text>
                  {nutritionCheckIn?.lunch && <CheckCircle size={16} color={colors.accent.primary} />}
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.mealButton, nutritionCheckIn?.dinner && styles.mealButtonActive]}
                  onPress={() => handleMealCheck('dinner')}
                >
                  <Text style={[styles.mealText, nutritionCheckIn?.dinner && styles.mealTextActive]}>
                    Dinner
                  </Text>
                  {nutritionCheckIn?.dinner && <CheckCircle size={16} color={colors.accent.primary} />}
                </TouchableOpacity>
              </View>

              <View style={styles.hydrationSection}>
                <View style={styles.hydrationHeader}>
                  <Droplets size={20} color={colors.accent.info} />
                  <Text style={styles.hydrationLabel}>Hydration</Text>
                  <Text style={styles.hydrationAmount}>
                    {nutritionCheckIn?.hydration || 0}ml / {defaultTargetHydration}ml
                  </Text>
                </View>
                
                <View style={styles.hydrationBar}>
                  <View 
                    style={[
                      styles.hydrationFill, 
                      { width: `${hydrationProgress}%` }
                    ]} 
                  />
                </View>
                
                <View style={styles.hydrationButtons}>
                  <TouchableOpacity
                    style={styles.hydrationButton}
                    onPress={() => handleHydrationAdd(250)}
                  >
                    <Text style={styles.hydrationButtonText}>+250ml</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.hydrationButton}
                    onPress={() => handleHydrationAdd(500)}
                  >
                    <Text style={styles.hydrationButtonText}>+500ml</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ModernCard>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function getTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
    backgroundColor: colors.bg.app 
  },
  safeArea: { 
    flex: 1 
  },
  scrollContent: { 
    padding: spacing.lg, // 24px
    paddingBottom: 120, // Space for dock
  },
  dateSection: {
    marginBottom: spacing.xl, // 32px gap below date section
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dateNavButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDisplay: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44, // Touch target
  },
  dateText: {
    ...textStyles.h3,
    color: colors.text.primary,
    textAlign: 'center',
  },
  
  section: {
    marginBottom: spacing.xl, // 32px between major sections
  },
  
  setupCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.h2,
    marginBottom: spacing.md,
  },
  
  setupCard: {
    marginBottom: 0,
  },
  setupTitle: {
    ...textStyles.h2,
    marginBottom: spacing.sm,
  },
  setupText: {
    ...textStyles.body,
    marginBottom: spacing.md,
  },
  
  phaseCard: {
    marginBottom: spacing.xl,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  phaseLabel: {
    ...textStyles.tiny,
    color: colors.accent.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  phaseTitle: {
    ...textStyles.h2,
    marginBottom: spacing.xs,
  },
  weekIndicator: {
    ...textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.secondary,
    borderRadius: radius.sm,
  },

  statsCard: {
    marginBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    ...textStyles.h1,
    marginTop: spacing.xs,
  },
  statLabel: {
    ...textStyles.caption,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.subtle,
  },

  workoutCard: {
    marginBottom: spacing.xl,
  },
  badge: {
    backgroundColor: colors.accent.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  badgeText: {
    ...textStyles.tiny,
    color: colors.accent.primary,
  },
  workoutTitle: {
    ...textStyles.h1,
    marginBottom: spacing.sm,
  },
  workoutFocus: {
    ...textStyles.body,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  metaText: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  buttonContainer: {
    marginTop: spacing.md,
  },

  restDayContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  restTitle: {
    ...textStyles.h3,
    marginTop: spacing.md,
  },
  restDesc: {
    ...textStyles.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    color: colors.text.secondary,
  },

  nutritionCard: {
    marginBottom: spacing.xl,
  },
  mealsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  mealButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.subtle,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  mealButtonActive: {
    backgroundColor: colors.accent.primary + '20',
    borderColor: colors.accent.primary + '40',
  },
  mealText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
  mealTextActive: {
    color: colors.accent.primary,
  },
  
  hydrationSection: {
    marginTop: spacing.md,
  },
  hydrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  hydrationLabel: {
    ...textStyles.body,
    flex: 1,
  },
  hydrationAmount: {
    ...textStyles.caption,
    color: colors.text.tertiary,
  },
  hydrationBar: {
    height: 8,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  hydrationFill: {
    height: '100%',
    backgroundColor: colors.accent.info,
    borderRadius: radius.sm,
  },
  hydrationButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hydrationButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.accent.info + '20',
    borderWidth: 1,
    borderColor: colors.accent.info + '40',
    alignItems: 'center',
  },
  hydrationButtonText: {
    ...textStyles.caption,
    color: colors.accent.info,
  },
});
