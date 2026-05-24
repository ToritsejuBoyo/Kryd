import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@/lib/useTheme';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

export function ThemeToggle() {
  const { mode, colors, setTheme } = useTheme();
  
  // Animated value for switch thumb translation (0 to 28)
  const animatedValue = useRef(new Animated.Value(mode === 'dark' ? 28 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: mode === 'dark' ? 28 : 0,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [mode]);

  const toggleTheme = () => {
    setTheme(mode === 'light' ? 'dark' : 'light');
  };

  const isDark = mode === 'dark';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={toggleTheme}
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#000000' : '#E2E8F0',
          borderColor: isDark ? '#222222' : '#CBD5E1',
        },
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: animatedValue }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          {isDark ? (
            <MaterialCommunityIcons
              name="weather-night"
              size={18}
              color="#000000"
            />
          ) : (
            <Feather
              name="sun"
              size={16}
              color="#D97706"
            />
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 60,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
    position: 'relative',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    left: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2.5,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
});
