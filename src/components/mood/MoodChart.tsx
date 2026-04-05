import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WeeklyMoodData, MoodLevel } from '../../types/mood';
import { DAYS_OF_WEEK } from '../../utils/constants';

interface MoodChartProps {
  data: WeeklyMoodData[];
}

// Bar colors based on mood level averages
// HTML design: awful/bad=#BF7A5B, okay=#C9B67E, good/great=#8FA98B
function getBarColor(level: number): string {
  if (level <= 1.5) return '#BF7A5B';
  if (level <= 2.5) return '#BF7A5B';
  if (level <= 3.5) return '#C9B67E';
  return '#8FA98B';
}

// Map mood level to bar height (out of 80px max)
function getBarHeight(level: number): number {
  // Scale: 1=20px, 2=35px, 3=50px, 4=65px, 5=80px
  return Math.round(20 + (level - 1) * 15);
}

export default function MoodChart({ data }: MoodChartProps) {
  return (
    <View>
      {/* Section header with line */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>This week</Text>
        <View style={styles.headerLine} />
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        {DAYS_OF_WEEK.map((day, index) => {
          const dayData = data[index];
          const levels = dayData?.levels ?? [];
          // Average of all moods for the day, or 0 if none
          const avgLevel =
            levels.length > 0
              ? levels.reduce((a, b) => a + b, 0) / levels.length
              : 0;

          return (
            <View key={day} style={styles.barColumn}>
              <View style={styles.barSpace}>
                {avgLevel > 0 && (
                  <View
                    style={[
                      styles.bar,
                      {
                        height: getBarHeight(avgLevel),
                        backgroundColor: getBarColor(avgLevel),
                      },
                    ]}
                  />
                )}
              </View>
              <Text style={styles.dayLabel}>{day}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Header row: "This week" + horizontal line
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  headerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2C2926',
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2DED6',
  },

  // Chart
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: 8,
  },
  barColumn: {
    alignItems: 'center',
    gap: 8,
  },
  barSpace: {
    height: 80,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 6,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  dayLabel: {
    fontSize: 11,
    color: '#908981',
    fontFamily: 'monospace',
  },
});
