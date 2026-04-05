import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bone, BoneCircle, BoneRow } from '../common/Skeleton';

/** Skeleton that mirrors HomeScreen layout exactly */
export default function HomeSkeleton() {
  return (
    <View style={styles.container}>
      {/* Greeting */}
      <View style={styles.greetingSection}>
        <Bone width={100} height={14} />
        <Bone width={80} height={28} borderRadius={8} style={{ marginTop: 4 }} />
      </View>

      {/* Mood selector — 5 circles */}
      <View style={styles.moodSection}>
        <BoneRow gap={20} style={{ justifyContent: 'space-between' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View key={i} style={{ alignItems: 'center', gap: 10 }}>
              <BoneCircle size={44} />
              <Bone width={32} height={10} />
            </View>
          ))}
        </BoneRow>
      </View>

      {/* "This week" header + chart */}
      <View style={styles.chartSection}>
        <BoneRow gap={16}>
          <Bone width={70} height={13} />
          <Bone height={1} />
        </BoneRow>
        <BoneRow gap={0} style={{ justifyContent: 'space-between', marginTop: 24, paddingHorizontal: 8 }}>
          {[40, 60, 30, 80, 70, 50, 80].map((h, i) => (
            <View key={i} style={{ alignItems: 'center', gap: 8 }}>
              <Bone width={6} height={h} borderRadius={3} />
              <Bone width={24} height={10} />
            </View>
          ))}
        </BoneRow>
      </View>

      {/* Action cards — 2 */}
      <View style={styles.cardsSection}>
        {[1, 2].map((i) => (
          <View key={i} style={styles.cardSkeleton}>
            <BoneCircle size={40} />
            <View style={{ flex: 1, gap: 6 }}>
              <Bone width="70%" height={15} />
              <Bone width="90%" height={12} />
            </View>
          </View>
        ))}
      </View>

      {/* Privacy badge */}
      <BoneRow gap={8} style={{ justifyContent: 'center', marginTop: 16 }}>
        <Bone width={14} height={14} borderRadius={7} />
        <Bone width={180} height={11} />
      </BoneRow>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  greetingSection: {
    marginBottom: 32,
    gap: 4,
  },
  moodSection: {
    marginBottom: 40,
  },
  chartSection: {
    marginBottom: 40,
  },
  cardsSection: {
    gap: 16,
  },
  cardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226,222,214,0.4)',
  },
});
