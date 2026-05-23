import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Platform } from 'react-native';
import { useTheme } from '@/lib/useTheme';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { mode, colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // We want to fade out and fade in the content on theme switch to make it less jarring
  // However, actually a simpler approach is to just fade IN on mount, or simply pass the background color 
  // without a heavy re-render transition if it causes lag. Let's do a subtle background color animation instead.
  // React Native's Animated doesn't easily interpolate dynamic hex strings without string manipulation on native side,
  // so we'll just fade opacity from 0.8 to 1 quickly when theme changes to simulate a "refresh" feel.

  useEffect(() => {
    fadeAnim.setValue(0.8);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [mode]);

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.backgroundPrimary, opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: (Platform.OS === 'web' ? '100vh' : '100%') as any,
  },
});
