// src/components/InsightCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ModernCard } from './ui/ModernCard';
import { Recommendation } from '../types/workout';
import { TrendingUp, Target, AlertCircle, Lightbulb, X } from 'lucide-react-native';
import { colors, spacing, radius, textStyles, calculateNestedRadius } from '../theme/design-system';

interface InsightCardProps {
  recommendation: Recommendation;
  onDismiss?: () => void;
  onAction?: () => void;
}

export const InsightCard = ({ recommendation, onDismiss, onAction }: InsightCardProps) => {
  const getIcon = () => {
    switch (recommendation.type) {
      case 'workout_suggestion':
        return <Lightbulb size={20} color={colors.accent.primary} />;
      case 'progressive_overload':
        return <TrendingUp size={20} color={colors.accent.info} />;
      case 'recovery':
        return <AlertCircle size={20} color={colors.accent.error} />;
      case 'goal_guidance':
        return <Target size={20} color={colors.accent.secondary} />;
      default:
        return <Lightbulb size={20} color={colors.accent.primary} />;
    }
  };

  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'high':
        return colors.accent.error;
      case 'medium':
        return colors.accent.info;
      default:
        return colors.accent.primary;
    }
  };

  // Card: 24px radius, 16px padding → inner radius for icon: 24 - 16 = 8px
  const iconRadius = calculateNestedRadius(radius.lg, spacing.md);

  return (
    <ModernCard variant="content" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { borderRadius: iconRadius }]}>
          {getIcon()}
        </View>
        <View style={styles.content}>
          <Text style={styles.title}>{recommendation.title}</Text>
          <Text style={styles.message}>{recommendation.message}</Text>
        </View>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <X size={16} color={colors.text.tertiary} />
          </TouchableOpacity>
        )}
      </View>
      {recommendation.actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: getPriorityColor() }]}
          onPress={onAction}
        >
          <Text style={[styles.actionText, { color: getPriorityColor() }]}>
            {recommendation.actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: colors.accent.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    ...textStyles.h3,
    marginBottom: spacing.xs,
  },
  message: {
    ...textStyles.body,
    color: colors.text.secondary,
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionText: {
    ...textStyles.caption,
    fontWeight: '600',
  },
});
