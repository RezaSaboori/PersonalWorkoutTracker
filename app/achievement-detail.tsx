// app/achievement-detail.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { ModernCard } from '../src/components/ui/ModernCard';
import { MinimalBackground } from '../src/components/MinimalBackground';
import { colors, spacing, textStyles, radius } from '../src/theme/design-system';
import { useAchievementsStore, ACHIEVEMENTS_DEFINITIONS } from '../src/store/achievementsStore';

export default function AchievementDetail() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { getAllAchievements } = useAchievementsStore();
  
  const achievementId = params.id as string;
  const achievements = getAllAchievements();
  const achievement = achievements.find(a => a.id === achievementId);

  if (!achievement) {
    return (
      <View style={styles.container}>
        <MinimalBackground />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color="#FFF" size={24} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Achievement</Text>
          </View>
          <View style={styles.content}>
            <Text style={styles.errorText}>Achievement not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const isUnlocked = !!achievement.unlockedAt;

  return (
    <View style={styles.container}>
      <MinimalBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color="#FFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Achievement</Text>
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <ModernCard variant="hero" style={styles.achievementCard}>
            <View style={styles.iconContainer}>
              {isUnlocked ? (
                <Text style={styles.icon}>{achievement.icon}</Text>
              ) : (
                <Text style={styles.lockedIcon}>🔒</Text>
              )}
            </View>
            <Text style={styles.title}>{achievement.title}</Text>
            <Text style={styles.description}>{achievement.description}</Text>
            
            {isUnlocked && achievement.unlockedAt && (
              <View style={styles.unlockedInfo}>
                <Text style={styles.unlockedLabel}>Unlocked on:</Text>
                <Text style={styles.unlockedDate}>
                  {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            )}
            
            {!isUnlocked && achievement.progress !== undefined && (
              <View style={styles.progressContainer}>
                <Text style={styles.progressLabel}>Progress: {achievement.progress}%</Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${achievement.progress}%` }]} 
                  />
                </View>
              </View>
            )}
          </ModernCard>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  achievementCard: {
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(79, 255, 194, 0.3)',
  },
  icon: {
    fontSize: 64,
  },
  lockedIcon: {
    fontSize: 48,
    opacity: 0.5,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  unlockedInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  unlockedLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 4,
  },
  unlockedDate: {
    color: '#4fffc2',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4fffc2',
    borderRadius: 4,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

