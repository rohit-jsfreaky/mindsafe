import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../utils/theme';
import { MoodLevel } from '../../types/mood';

interface MoodSelectorProps {
  selected?: MoodLevel | null;
  onSelect: (level: MoodLevel) => void;
}

const MOODS: {
  level: MoodLevel;
  label: string;
  icon: string;
}[] = [
  { level: 1, label: 'Awful', icon: 'emoticon-dead-outline' },
  { level: 2, label: 'Bad', icon: 'emoticon-sad-outline' },
  { level: 3, label: 'Okay', icon: 'emoticon-neutral-outline' },
  { level: 4, label: 'Good', icon: 'emoticon-happy-outline' },
  { level: 5, label: 'Great', icon: 'emoticon-excited-outline' },
];

export default function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      {MOODS.map((mood) => {
        const isSelected = selected === mood.level;
        return (
          <Pressable
            key={mood.level}
            style={styles.moodItem}
            onPress={() => onSelect(mood.level)}
          >
            <View
              style={[
                styles.circle,
                isSelected && styles.circleSelected,
              ]}
            >
              <Icon
                name={mood.icon}
                size={24}
                color={isSelected ? colors.primary : '#908981'}
              />
            </View>
            <Text
              style={[
                styles.label,
                isSelected && styles.labelSelected,
              ]}
            >
              {mood.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodItem: {
    alignItems: 'center',
    gap: 10,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2DED6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(61,107,79,0.04)',
  },
  label: {
    fontSize: 11,
    color: '#908981',
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
});
