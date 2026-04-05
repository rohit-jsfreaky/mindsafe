import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Animated shimmer skeleton placeholder.
 * Pulses between two opacity levels to indicate loading.
 */
export function Bone({
  width = '100%',
  height = 14,
  borderRadius = 6,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#E6E2DA',
          opacity,
        },
        style,
      ]}
    />
  );
}

/** Round skeleton (for icons/avatars) */
export function BoneCircle({ size = 44, style }: { size?: number; style?: ViewStyle }) {
  return <Bone width={size} height={size} borderRadius={size / 2} style={style} />;
}

/** Row of bones with a gap */
export function BoneRow({
  children,
  gap = 12,
  style,
}: {
  children: React.ReactNode;
  gap?: number;
  style?: ViewStyle;
}) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}
