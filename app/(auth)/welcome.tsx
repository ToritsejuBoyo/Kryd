import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/useTheme';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <View className="flex-1 justify-between px-6 py-12 max-w-md w-full mx-auto">
        
        {/* Top: Logo */}
        <View className="items-center mt-8">
          <Text className="font-inter-bold text-3xl tracking-wider" style={{ color: colors.textPrimary }}>
            KRYD
          </Text>
        </View>

        {/* Middle: Abstract Graphic & Copy */}
        <View className="items-center flex-1 justify-center">
          {/* Abstract Graphic */}
          <View className="w-64 h-64 mb-12 relative items-center justify-center">
            {/* Geometric shapes using borders and colors */}
            <View className="w-40 h-40 rounded-full absolute" style={{ backgroundColor: '#0B2D2C', opacity: 0.8 }} />
            <View className="w-48 h-48 rounded-full absolute border-2" style={{ borderColor: '#CCDF1A', opacity: 0.3 }} />
            <View className="w-24 h-24 absolute right-8 top-8 rounded-2xl rotate-12" style={{ backgroundColor: '#CCDF1A' }} />
            <View className="w-16 h-16 absolute left-12 bottom-12 rounded-full" style={{ backgroundColor: '#185FA5' }} />
          </View>

          <Text className="font-inter-bold text-3xl md:text-4xl text-center mb-4 leading-tight" style={{ color: colors.textPrimary }}>
            The IT career platform built for you.
          </Text>
          <Text className="font-inter text-base text-center leading-relaxed" style={{ color: colors.textSecondary }}>
            Learn. Earn. Connect. Grow. All in one place.
          </Text>
        </View>

        {/* Bottom: Buttons */}
        <View className="w-full gap-4 mt-8 items-center">
          <TouchableOpacity
            className="w-full py-4 rounded-full items-center mb-4"
            style={{ backgroundColor: colors.accent }}
            onPress={() => router.push('/(auth)/onboarding/role-select')}
          >
            <Text className="font-inter-bold text-base uppercase tracking-wider" style={{ color: colors.accentText }}>
              Get Started
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="font-inter text-xs" style={{ color: colors.textSecondary, textDecorationLine: 'underline' }}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}
