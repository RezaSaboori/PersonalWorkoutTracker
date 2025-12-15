// src/screens/AnalyticsDashboard.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../components/GlassUI';
import { LiquidBackground } from '../components/LiquidBackground';
import { VolumeChart } from '../components/charts/VolumeChart';
import { useWorkoutStore } from '../store/workoutStore';
import { useProgressStore } from '../store/progressStore';
import { calculateVolume, calculateTrainingLoad, getMuscleGroupBalance } from '../utils/analytics';
import { format, startOfWeek, subWeeks } from 'date-fns';
import { Activity, TrendingUp, Target } from 'lucide-react-native';

export default function AnalyticsDashboard() {
  const { completedWorkouts, getStreak } = useWorkoutStore();
  const { getVolumeData, getTrainingLoad } = useProgressStore();

  const streak = getStreak();

  // Calculate volume data for last 4 weeks
  const volumeData = useMemo(() => {
    const fourWeeksAgo = subWeeks(new Date(), 4);
    const startDate = format(fourWeeksAgo, 'yyyy-MM-dd');
    const endDate = format(new Date(), 'yyyy-MM-dd');
    return getVolumeData(startDate, endDate);
  }, [completedWorkouts]);

  // Calculate training load for current week
  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
  const trainingLoad = useMemo(() => {
    return getTrainingLoad(currentWeekStart);
  }, [completedWorkouts, currentWeekStart]);

  // Muscle group balance
  const muscleBalance = useMemo(() => {
    return getMuscleGroupBalance(completedWorkouts);
  }, [completedWorkouts]);

  const totalVolume = volumeData.reduce((sum, item) => sum + item.volume, 0);
  const averageVolume = volumeData.length > 0 ? totalVolume / volumeData.length : 0;

  return (
    <View style={styles.container}>
      <LiquidBackground />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Analytics</Text>

          {/* Key Metrics */}
          <View style={styles.metricsRow}>
            <GlassCard style={styles.metricCard}>
              <Activity size={24} color="#4fffc2" />
              <Text style={styles.metricValue}>{completedWorkouts.length}</Text>
              <Text style={styles.metricLabel}>Total Workouts</Text>
            </GlassCard>
            <GlassCard style={styles.metricCard}>
              <TrendingUp size={24} color="#60a5fa" />
              <Text style={styles.metricValue}>{Math.round(averageVolume)}</Text>
              <Text style={styles.metricLabel}>Avg Volume</Text>
            </GlassCard>
            <GlassCard style={styles.metricCard}>
              <Target size={24} color="#c084fc" />
              <Text style={styles.metricValue}>{streak.current}</Text>
              <Text style={styles.metricLabel}>Day Streak</Text>
            </GlassCard>
          </View>

          {/* Volume Chart */}
          <VolumeChart data={volumeData} title="Volume Trends" />

          {/* Training Load */}
          <GlassCard style={styles.loadCard}>
            <Text style={styles.cardTitle}>Training Load</Text>
            <View style={styles.loadInfo}>
              <View style={styles.loadItem}>
                <Text style={styles.loadLabel}>This Week</Text>
                <Text style={styles.loadValue}>{trainingLoad.load}</Text>
              </View>
              <View style={styles.loadItem}>
                <Text style={styles.loadLabel}>Intensity</Text>
                <View style={[styles.intensityBadge, styles[`intensity${trainingLoad.intensity}`]]}>
                  <Text style={styles.intensityText}>{trainingLoad.intensity.toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.loadItem}>
                <Text style={styles.loadLabel}>Workouts</Text>
                <Text style={styles.loadValue}>{trainingLoad.workoutsCompleted}</Text>
              </View>
            </View>
          </GlassCard>

          {/* Muscle Group Balance */}
          <GlassCard style={styles.balanceCard}>
            <Text style={styles.cardTitle}>Training Distribution</Text>
            <View style={styles.balanceInfo}>
              {Object.entries(muscleBalance).map(([group, count]) => (
                <View key={group} style={styles.balanceItem}>
                  <Text style={styles.balanceLabel}>
                    {group.charAt(0).toUpperCase() + group.slice(1).replace('_', ' ')}
                  </Text>
                  <Text style={styles.balanceValue}>{count}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
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
    paddingBottom: 100,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  metricValue: {
    color: '#4fffc2',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  metricLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  loadCard: {
    marginBottom: 20,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  loadInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  loadItem: {
    alignItems: 'center',
  },
  loadLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 8,
  },
  loadValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  intensityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  intensitylow: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
  },
  intensitymoderate: {
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
  },
  intensityhigh: {
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
  },
  intensityvery_high: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
  },
  intensityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  balanceCard: {
    marginBottom: 20,
  },
  balanceInfo: {
    gap: 12,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
