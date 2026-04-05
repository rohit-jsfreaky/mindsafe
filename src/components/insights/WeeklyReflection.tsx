import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface WeeklyReflectionProps {
  text: string;
  isLoading?: boolean;
}

export default function WeeklyReflection({
  text,
  isLoading = false,
}: WeeklyReflectionProps) {
  return (
    <View style={styles.card}>
      {/* Green left accent bar */}
      <View style={styles.accentBar} />

      <View style={styles.content}>
        <Text style={styles.text}>
          {isLoading ? 'Generating your weekly reflection...' : text}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerMono}>Generated on-device</Text>
          <View style={styles.privacyRow}>
            <Icon name="lock-outline" size={14} color="#908981" />
            <Text style={styles.privacyText}>Privacy Protected</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226,222,214,0.4)',
    overflow: 'hidden',
    flexDirection: 'row',
    // subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  accentBar: {
    width: 3,
    backgroundColor: '#3D6B4F',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 22.4,
    color: '#414942',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerMono: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#908981',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.6,
  },
  privacyText: {
    fontSize: 11,
    color: '#908981',
  },
});
