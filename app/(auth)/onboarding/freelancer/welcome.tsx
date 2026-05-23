import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/useTheme';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { Feather } from '@expo/vector-icons';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';

export default function FreelancerWelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <View 
        style={{ 
          height: (Platform.OS === 'web' ? '100vh' : '100%') as any,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: Platform.OS === 'web' ? 32 : 16
        }}
      >
        {/* Fixed Header */}
        <View className="w-full max-w-xl mx-auto">
          <OnboardingProgress currentStep={1} totalSteps={7} onBack={() => router.push('/(auth)/onboarding/role-select')} />
        </View>

        {/* Fixed Content Area */}
        <View className="flex-1 justify-center w-full max-w-xl mx-auto px-2">
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} className="w-full">
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: 'rgba(204,223,26,0.1)' }}>
                <Feather name="monitor" size={32} color={colors.accent} />
              </View>
              <Text className="font-inter-bold text-2xl md:text-3xl text-center mb-3" style={{ color: colors.textPrimary }}>
                Let's get you set up.
              </Text>
              <Text className="font-inter text-sm md:text-base text-center leading-relaxed" style={{ color: colors.textSecondary }}>
                Kryd is where IT professionals like you find work, earn money, and grow with a professional community. This takes under 2 minutes.
              </Text>
            </View>

            <View className="rounded-2xl p-5 mb-2 border" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
              <View className="flex-row items-center mb-4">
                <View className="w-6 h-6 rounded-full mr-3 items-center justify-center" style={{ backgroundColor: 'rgba(204,223,26,0.15)' }}>
                  <Feather name="check" size={12} color={colors.accent} />
                </View>
                <Text className="font-inter-medium text-sm md:text-base" style={{ color: colors.textPrimary }}>Pick your IT specialty</Text>
              </View>
              
              <View className="flex-row items-center mb-4">
                <View className="w-6 h-6 rounded-full mr-3 items-center justify-center" style={{ backgroundColor: 'rgba(204,223,26,0.15)' }}>
                  <Feather name="check" size={12} color={colors.accent} />
                </View>
                <Text className="font-inter-medium text-sm md:text-base" style={{ color: colors.textPrimary }}>Tell us about your experience</Text>
              </View>
              
              <View className="flex-row items-center">
                <View className="w-6 h-6 rounded-full mr-3 items-center justify-center" style={{ backgroundColor: 'rgba(204,223,26,0.15)' }}>
                  <Feather name="check" size={12} color={colors.accent} />
                </View>
                <Text className="font-inter-medium text-sm md:text-base" style={{ color: colors.textPrimary }}>Set up your credentials</Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Fixed Footer */}
        <View className="items-center py-2 w-full max-w-md mx-auto px-4">
          <TouchableOpacity
            className="w-full py-3.5 rounded-full items-center mb-4"
            style={{ backgroundColor: colors.accent }}
            onPress={() => router.push('/(auth)/onboarding/freelancer/career-path')}
          >
            <Text className="font-inter-bold text-sm tracking-wider uppercase" style={{ color: colors.accentText }}>
              Let's go →
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

