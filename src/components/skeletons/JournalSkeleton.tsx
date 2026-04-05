import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bone } from '../common/Skeleton';

/** Skeleton that mirrors JournalScreen layout exactly */
export default function JournalSkeleton() {
  return (
    <View style={styles.container}>
      {/* Quote card */}
      <View style={styles.quoteCard}>
        <Bone width={120} height={10} style={{ marginBottom: 10 }} />
        <Bone width="100%" height={20} style={{ marginBottom: 6 }} />
        <Bone width="85%" height={20} style={{ marginBottom: 6 }} />
        <Bone width="60%" height={20} />
      </View>

      {/* Journal entry rows — 5 */}
      {Array.from({ length: 5 }).map((_, i) => (
        <View key={i} style={styles.entryRow}>
          {/* Date column */}
          <View style={styles.dateCol}>
            <Bone width={38} height={12} />
            <Bone width={6} height={6} borderRadius={3} style={{ marginTop: 8 }} />
          </View>
          {/* Content */}
          <View style={styles.contentCol}>
            <View style={styles.titleRow}>
              <Bone width="65%" height={15} />
              <Bone width={48} height={10} />
            </View>
            <Bone width="90%" height={12} style={{ marginTop: 4 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  quoteCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED6',
    backgroundColor: '#FFFFFF',
  },
  dateCol: {
    alignItems: 'center',
    width: 48,
    paddingTop: 2,
  },
  contentCol: {
    flex: 1,
    marginLeft: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});
