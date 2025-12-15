// src/screens/ProgressTab.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModernCard } from '../components/ui/ModernCard';
import { MinimalBackground } from '../components/MinimalBackground';
import { colors, spacing, textStyles, radius } from '../theme/design-system';
import { CompletionCalendar } from '../components/progress/CompletionCalendar';
import { AchievementCard } from '../components/progress/AchievementCard';
import { PersonalRecords } from '../components/progress/PersonalRecords';
import { ProgressChart } from '../components/charts/ProgressChart';
import { useWorkoutStore } from '../store/workoutStore';
import { useAchievementsStore } from '../store/achievementsStore';
import { useProgressStore } from '../store/progressStore';
import { Trophy, TrendingUp, Calendar as CalendarIcon, History, BarChart3 } from 'lucide-react-native';
import { format, subWeeks } from 'date-fns';
import { useRouter } from 'expo-router';

export default function ProgressTab() {
  const router = useRouter();
  const { completedWorkouts, getStreak } = useWorkoutStore();
  const { getAllAchievements } = useAchievementsStore();
  const { getExerciseProgression } = useProgressStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'records' | 'analytics'>('overview');

  const streak = getStreak();
  const achievements = getAllAchievements();
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  // Generate chart data for last 4 weeks
  const weeks = Array.from({ length: 4 }, (_, i) => {
    const weekDate = subWeeks(new Date(), 3 - i);
    return format(weekDate, 'MMM dd');
  });
  
  const weeklyWorkouts = weeks.map((_, i) => {
    const weekStart = subWeeks(new Date(), 3 - i);
    return completedWorkouts.filter(w => {
      const workoutDate = new Date(w.date);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return workoutDate >= weekStart && workoutDate < weekEnd;
    }).length;
  });

  return (
    <View style={styles.container}>
      <MinimalBackground />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Progress</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue} numberOfLines={1}>{streak.current}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Day Streak</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue} numberOfLines={1}>{unlockedCount}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Achievements</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue} numberOfLines={1}>{completedWorkouts.length}</Text>
                <Text style={styles.statLabel} numberOfLines={1}>Total</Text>
              </View>
            </View>
          </View>

          {/* Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
            style={styles.tabsWrapper}
          >
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
              onPress={() => setActiveTab('overview')}
            >
              <CalendarIcon size={16} color={activeTab === 'overview' ? '#4fffc2' : 'rgba(255, 255, 255, 0.6)'} />
              <Text 
                style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Overview
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
              onPress={() => setActiveTab('achievements')}
            >
              <Trophy size={16} color={activeTab === 'achievements' ? '#4fffc2' : 'rgba(255, 255, 255, 0.6)'} />
              <Text 
                style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Achievements
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'records' && styles.tabActive]}
              onPress={() => setActiveTab('records')}
            >
              <TrendingUp size={16} color={activeTab === 'records' ? '#4fffc2' : 'rgba(255, 255, 255, 0.6)'} />
              <Text 
                style={[styles.tabText, activeTab === 'records' && styles.tabTextActive]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Records
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'analytics' && styles.tabActive]}
              onPress={() => setActiveTab('analytics')}
            >
              <BarChart3 size={16} color={activeTab === 'analytics' ? '#4fffc2' : 'rgba(255, 255, 255, 0.6)'} />
              <Text 
                style={[styles.tabText, activeTab === 'analytics' && styles.tabTextActive]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Analytics
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Content */}
          {activeTab === 'overview' && (
            <>
              <CompletionCalendar />
              <ProgressChart
                data={weeklyWorkouts}
                labels={weeks}
                title="Weekly Workouts"
              />
              <TouchableOpacity
                style={styles.historyButton}
                onPress={() => router.push('/workout-history')}
              >
                <History size={18} color="#4fffc2" />
                <Text style={styles.historyButtonText}>View Full Workout History</Text>
              </TouchableOpacity>
            </>
          )}

          {activeTab === 'achievements' && (
            <View style={styles.achievementsContainer}>
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </View>
          )}

          {activeTab === 'records' && (
            <PersonalRecords />
          )}

          {activeTab === 'analytics' && (
            <View>
              <TouchableOpacity
                style={styles.analyticsButton}
                onPress={() => router.push('/analytics')}
              >
                <BarChart3 size={18} color="#4fffc2" />
                <Text style={styles.analyticsButtonText}>View Full Analytics Dashboard</Text>
              </TouchableOpacity>
            </View>
          )}
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
  header: {
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  statItem: {
    flex: 1,
    minWidth: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#4fffc2',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
  tabsWrapper: {
    marginBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 0,
  },
  tab: {
    minWidth: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabActive: {
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#4fffc2',
  },
  achievementsContainer: {
    gap: 12,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 255, 194, 0.3)',
    marginTop: 12,
  },
  historyButtonText: {
    color: '#4fffc2',
    fontSize: 14,
    fontWeight: '600',
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 255, 194, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(79, 255, 194, 0.3)',
    marginTop: 12,
  },
  analyticsButtonText: {
    color: '#4fffc2',
    fontSize: 14,
    fontWeight: '600',
  },
});
