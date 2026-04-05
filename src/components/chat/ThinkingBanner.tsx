import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ThinkingBannerProps {
  label?: string;
}

/** Shows an animated "Thinking..." banner while AI is reasoning */
export default function ThinkingBanner({ label }: ThinkingBannerProps) {
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Animated.View style={{ opacity: pulse }}>
          <Icon name="circle-outline" size={16} color="#8FA98B" />
        </Animated.View>
        <Text style={styles.text}>{label || 'Thinking...'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: '90%',
    marginBottom: 32,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(143,169,139,0.08)',
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#8FA98B',
  },
  text: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8FA98B',
  },
});
