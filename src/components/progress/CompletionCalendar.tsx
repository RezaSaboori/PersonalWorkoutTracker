// src/components/progress/CompletionCalendar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useWorkoutStore } from '../../store/workoutStore';
import { ModernCard } from '../ui/ModernCard';
import { colors, spacing, radius, textStyles } from '../../theme/design-system';
import { CheckCircle } from 'lucide-react-native';

export const CompletionCalendar = () => {
  const { completedWorkouts } = useWorkoutStore();

  // Create marked dates from completed workouts with modern design
  const markedDates: Record<string, any> = {};
  const uniqueDates = new Set(completedWorkouts.map(w => w.date));
  const today = new Date().toISOString().split('T')[0];
  
  uniqueDates.forEach(date => {
    const isToday = date === today;
    markedDates[date] = {
      customStyles: {
        container: {
          backgroundColor: isToday 
            ? colors.accent.primary + '30' 
            : colors.accent.primary + '20',
          borderRadius: radius.sm,
          borderWidth: isToday ? 2 : 1,
          borderColor: colors.accent.primary,
        },
        text: {
          color: colors.text.primary,
          fontWeight: '700',
        },
      },
      marked: true,
      dotColor: colors.accent.primary,
      selected: false,
    };
  });

  return (
    <ModernCard variant="content" style={styles.container}>
      <Text style={styles.title}>Workout Calendar</Text>
      <Calendar
        markingType="custom"
        markedDates={markedDates}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: 'transparent',
          textSectionTitleColor: colors.text.secondary,
          selectedDayBackgroundColor: colors.accent.primary,
          selectedDayTextColor: colors.bg.app,
          todayTextColor: colors.accent.primary,
          dayTextColor: colors.text.primary,
          textDisabledColor: colors.text.disabled,
          dotColor: colors.accent.primary,
          selectedDotColor: colors.bg.app,
          arrowColor: colors.accent.primary,
          monthTextColor: colors.text.primary,
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          textDayFontSize: 15,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 12,
          'stylesheet.calendar.header': {
            week: {
              marginTop: spacing.sm,
              flexDirection: 'row',
              justifyContent: 'space-around',
              paddingBottom: spacing.sm,
            },
          },
          'stylesheet.day.basic': {
            today: {
              backgroundColor: colors.accent.primary + '15',
              borderRadius: radius.sm,
            },
          },
        }}
        style={styles.calendar}
      />
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent.primary + '20', borderColor: colors.accent.primary }]}>
            <CheckCircle size={10} color={colors.accent.primary} fill={colors.accent.primary} />
          </View>
          <Text style={styles.legendText}>Completed</Text>
        </View>
      </View>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  title: {
    ...textStyles.h3,
    marginBottom: spacing.md,
  },
  calendar: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendText: {
    ...textStyles.caption,
    color: colors.text.secondary,
  },
});
