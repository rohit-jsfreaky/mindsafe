import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface PrivacyBadgeProps {
  text?: string;
}

export default function PrivacyBadge({
  text = 'Everything stays on your device',
}: PrivacyBadgeProps) {
  return (
    <View style={styles.container}>
      <Icon name="lock-outline" size={14} color="#908981" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  text: {
    fontSize: 11,
    color: '#908981',
  },
});
