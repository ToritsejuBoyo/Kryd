import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';
import { useTheme } from '@/lib/useTheme';

interface SkeletonProps {
  style?: ViewStyle;
  className?: string;
}

export default function Skeleton({ style, className }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const { colors } = useTheme();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[{ opacity, backgroundColor: colors.border }, style]}
      className={`rounded ${className || ''}`}
    />
  );
}
