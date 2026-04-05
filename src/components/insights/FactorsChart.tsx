import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface FactorsChartProps {
  data: { factor: string; count: number }[];
}

export default function FactorsChart({ data }: FactorsChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyHint}>
          Log your mood with factors (exercise, sleep, friends) to see what helps you feel good
        </Text>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.emptyRow}>
            <Text style={styles.emptyLabel}>Awaiting data</Text>
            <View style={styles.emptyBarTrack}>
              <View style={[styles.emptyBarFill, { width: `${90 - i * 18}%` }]} />
            </View>
          </View>
        ))}
      </View>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <View style={styles.container}>
      {data.map((item) => {
        const widthPercent = (item.count / maxCount) * 100;
        return (
          <View key={item.factor} style={styles.row}>
            <Text style={styles.label} numberOfLines={1}>
              {item.factor}
            </Text>
            <View style={styles.barTrack}>
              <View
                style={[styles.barFill, { width: `${widthPercent}%` }]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  label: {
    width: 120,
    fontSize: 13,
    color: '#2C2926',
    lineHeight: 18,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8FA98B',
  },

  emptyContainer: {
    gap: 16,
  },
  emptyHint: {
    fontSize: 13,
    color: '#908981',
    lineHeight: 20,
    marginBottom: 4,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emptyLabel: {
    width: 120,
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#908981',
  },
  emptyBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E6E2DA',
  },
  emptyBarFill: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E6E2DA',
  },
});
