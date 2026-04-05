import React from 'react';
import { ScrollView, Text, StyleSheet, Pressable } from 'react-native';
import { QUICK_PROMPTS } from '../../utils/constants';

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
}

export default function QuickPrompts({ onSelect }: QuickPromptsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {QUICK_PROMPTS.map((prompt) => (
        <Pressable
          key={prompt}
          style={({ pressed }) => [
            styles.chip,
            pressed && styles.chipPressed,
          ]}
          onPress={() => onSelect(prompt)}
        >
          <Text style={styles.chipText}>{prompt}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(226,222,214,0.4)',
  },
  chipPressed: {
    backgroundColor: '#F7F3EB',
    transform: [{ scale: 0.96 }],
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#908981',
  },
});
