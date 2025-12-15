// src/components/progress/AchievementCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModernCard } from '../ui/ModernCard';
import { colors, spacing, textStyles, radius } from '../../theme/design-system';
import { Lock } from 'lucide-react-native';
import { Achievement } from '../../types/workout';

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: () => void;
}

export const AchievementCard = ({ achievement, onPress }: AchievementCardProps) => {
  const isUnlocked = !!achievement.unlockedAt;

  return (
    <TouchableOpacity onPress={onPress} disabled={!isUnlocked}>
      <ModernCard variant="content" style={[styles.card, !isUnlocked && styles.lockedCard]}>
        <View style={styles.content}>
          <View style={[styles.iconContainer, !isUnlocked && styles.lockedIcon]}>
            {isUnlocked ? (
              <Text style={styles.icon}>{achievement.icon}</Text>
            ) : (
              <Lock size={24} color="rgba(255, 255, 255, 0.3)" />
            )}
          </View>
          <View style={styles.textContainer}>
            <Text 
              style={[styles.title, !isUnlocked && styles.lockedText]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {achievement.title}
            </Text>
            <Text 
              style={[styles.description, !isUnlocked && styles.lockedDescription]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {achievement.description}
            </Text>
            {achievement.progress !== undefined && achievement.progress < 100 && (
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${achievement.progress}%` }]} 
                />
              </View>
            )}
          </View>
        </View>
      </ModernCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  lockedCard: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(79, 255, 194, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0, // Prevent icon from shrinking
  },
  lockedIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  icon: {
    fontSize: 28,
  },
  textContainer: {
    flex: 1,
    minWidth: 0, // Allows flex to shrink below content size
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lockedText: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginBottom: 8,
  },
  lockedDescription: {
    color: 'rgba(255, 255, 255, 0.3)',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4fffc2',
    borderRadius: 2,
  },
});
