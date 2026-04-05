import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Bone, BoneRow } from '../common/Skeleton';

/** Skeleton that mirrors InsightsScreen layout exactly */
export default function InsightsSkeleton() {
  return (
    <View style={styles.container}>
      {/* Hero title */}
      <View style={styles.heroSection}>
        <Bone width={110} height={28} borderRadius={8} />
        <Bone width={180} height={14} style={{ marginTop: 6 }} />
      </View>

      {/* Mood Trend section */}
      <View style={styles.section}>
        <Bone width={110} height={13} />
        {/* Chart placeholder */}
        <Bone width="100%" height={100} borderRadius={8} style={{ marginTop: 16 }} />
        <BoneRow gap={0} style={{ justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 4 }}>
          {['W1', 'W2', 'W3', 'W4'].map((w) => (
            <Bone key={w} width={20} height={11} />
          ))}
        </BoneRow>
      </View>

      {/* Factors section */}
      <View style={styles.section}>
        <Bone width={220} height={13} />
        <View style={{ gap: 20, marginTop: 16 }}>
          {[100, 85, 60, 35].map((pct, i) => (
            <BoneRow key={i} gap={16}>
              <Bone width={120} height={13} />
              <View style={{ flex: 1 }}>
                <Bone width={`${pct}%`} height={8} borderRadius={4} />
              </View>
            </BoneRow>
          ))}
        </View>
      </View>

      {/* Weekly reflection section */}
      <View style={styles.section}>
        <Bone width={160} height={13} />
        <View style={styles.reflectionCard}>
          <Bone width="100%" height={14} style={{ marginBottom: 6 }} />
          <Bone width="90%" height={14} style={{ marginBottom: 6 }} />
          <Bone width="70%" height={14} style={{ marginBottom: 16 }} />
          <BoneRow gap={0} style={{ justifyContent: 'space-between' }}>
            <Bone width={120} height={10} />
            <Bone width={100} height={10} />
          </BoneRow>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
  heroSection: {
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  reflectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(226,222,214,0.4)',
    marginTop: 16,
  },
});
