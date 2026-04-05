import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChatBubbleProps {
  content: string;
  isUser: boolean;
  /** For streaming: show partial text for the AI message currently being generated */
  isStreaming?: boolean;
}

export default function ChatBubble({
  content,
  isUser,
  isStreaming = false,
}: ChatBubbleProps) {
  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{content}</Text>
        </View>
      </View>
    );
  }

  // AI message
  return (
    <View style={styles.aiRow}>
      <Text style={styles.aiLabel}>MINDSAFE</Text>
      <View style={styles.aiBorderContainer}>
        <Text style={styles.aiText}>
          {content}
          {isStreaming && <Text style={styles.cursor}>|</Text>}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // User message — right-aligned bubble
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  userBubble: {
    maxWidth: '85%',
    backgroundColor: '#F0ECE4',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderBottomRightRadius: 4,
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2C2926',
  },

  // AI message — left-aligned with green border
  aiRow: {
    width: '100%',
    maxWidth: '90%',
  },
  aiLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: '#908981',
    marginBottom: 8,
    marginLeft: 16,
  },
  aiBorderContainer: {
    borderLeftWidth: 3,
    borderLeftColor: '#8FA98B',
    paddingLeft: 16,
    paddingVertical: 4,
  },
  aiText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#5C5650',
  },
  cursor: {
    color: '#8FA98B',
    fontWeight: '300',
  },
});
