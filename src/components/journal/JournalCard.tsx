import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { JournalEntry } from '../../types/journal';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { MoodLevel } from '../../types/mood';

interface JournalCardProps {
  entry: JournalEntry;
  onPress: () => void;
}

// Mood dot colors: same palette as chart bars
function getMoodDotColor(level?: MoodLevel): string {
  if (!level) return '#C9B67E';
  if (level <= 2) return '#BF7A5B'; // Terracotta
  if (level === 3) return '#C9B67E'; // Sand
  return '#8FA98B'; // Sage green
}

export default function JournalCard({ entry, onPress }: JournalCardProps) {
  const title =
    entry.content.length > 42
      ? entry.content.slice(0, 42) + '...'
      : entry.content;
  const preview =
    entry.content.length > 70
      ? entry.content.slice(0, 70) + '...'
      : entry.content;

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      {/* Date column */}
      <View style={styles.dateCol}>
        <Text style={styles.dateText}>{formatDate(entry.createdAt)}</Text>
        <View
          style={[
            styles.moodDot,
            { backgroundColor: getMoodDotColor(entry.moodLevel) },
          ]}
        />
      </View>

      {/* Content */}
      <View style={styles.contentCol}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.time}>{formatTime(entry.createdAt)}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {preview}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED6',
    backgroundColor: '#FFFFFF',
  },
  rowPressed: {
    backgroundColor: '#FAFAF7',
  },

  // Date column
  dateCol: {
    alignItems: 'center',
    width: 48,
    paddingTop: 2,
  },
  dateText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#908981',
  },
  moodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
  },

  // Content column
  contentCol: {
    flex: 1,
    marginLeft: 16,
    overflow: 'hidden',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#2C2926',
    paddingRight: 16,
  },
  time: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#908981',
    paddingTop: 2,
  },
  preview: {
    fontSize: 13,
    color: '#908981',
    marginTop: 2,
  },
});
