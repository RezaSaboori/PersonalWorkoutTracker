// src/components/charts/VolumeChart.tsx
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { VolumeData } from '../../types/workout';
import { format, parseISO } from 'date-fns';

interface VolumeChartProps {
  data: VolumeData[];
  title?: string;
}

const screenWidth = Dimensions.get('window').width;

export const VolumeChart = ({ data, title = 'Volume Trends' }: VolumeChartProps) => {
  if (data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No volume data available</Text>
        </View>
      </View>
    );
  }

  // Group data by date and sum volume
  const volumeByDate = data.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += item.volume;
    return acc;
  }, {} as Record<string, number>);

  const sortedDates = Object.keys(volumeByDate).sort();
  const chartData = sortedDates.map(date => volumeByDate[date]);
  const labels = sortedDates.map(date => format(parseISO(date), 'MMM dd'));

  // Limit to last 7 data points for readability
  const displayData = chartData.slice(-7);
  const displayLabels = labels.slice(-7);

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'rgba(20, 20, 20, 0.8)',
    backgroundGradientTo: 'rgba(20, 20, 20, 0.8)',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 255, 194, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#4fffc2',
    },
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: displayLabels,
            datasets: [
              {
                data: displayData,
                color: (opacity = 1) => `rgba(79, 255, 194, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={screenWidth - 80}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLabels={true}
          withHorizontalLabels={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  chart: {
    borderRadius: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
});
