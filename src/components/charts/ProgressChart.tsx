// src/components/charts/ProgressChart.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { ModernCard } from '../ui/ModernCard';
import { colors, spacing, textStyles, radius } from '../../theme/design-system';

const screenWidth = Dimensions.get('window').width;

interface ProgressChartProps {
  data: number[];
  labels: string[];
  title: string;
  color?: string;
}

export const ProgressChart = ({ data, labels, title, color = colors.accent.primary }: ProgressChartProps) => {
  const chartData = {
    labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => color,
        strokeWidth: 2,
      },
    ],
  };

  // Calculate 100% width: screen width - screen padding (24px each side) - card padding (16px each side)
  // Total: screenWidth - 48px (screen) - 32px (card) = screenWidth - 80px
  const chartWidth = screenWidth - (spacing.lg * 2) - (spacing.md * 2);

  return (
    <ModernCard variant="content" style={styles.card}>
      <Text 
        style={styles.title}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={chartData}
          width={chartWidth}
          height={220}
          chartConfig={{
            backgroundColor: 'transparent',
            backgroundGradientFrom: 'transparent',
            backgroundGradientTo: 'transparent',
            decimalPlaces: 0,
            color: (opacity = 1) => color.replace(')', `, ${opacity})`).replace('rgb', 'rgba'),
            labelColor: (opacity = 1) => `rgba(245, 245, 245, ${opacity})`,
            style: {
              borderRadius: radius.md,
            },
            propsForDots: {
              r: '4',
              strokeWidth: '2',
              stroke: color,
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>
    </ModernCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.xl,
  },
  title: {
    ...textStyles.h3,
    marginBottom: spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
    overflow: 'hidden',
  },
  chart: {
    marginVertical: spacing.xs,
    borderRadius: radius.md,
  },
});
