import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';

export default function ClientPitchScreen() {
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
          <OnboardingProgress currentStep={1} totalSteps={6} onBack={() => router.push('/(auth)/onboarding/role-select')} />
        </View>

        {/* Fixed Content Area */}
        <View className="flex-1 justify-center w-full max-w-xl mx-auto px-2">
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} className="w-full">
            <Text className="font-inter-bold text-2xl md:text-3.5xl text-center mb-6" style={{ color: colors.textPrimary }}>
              Hire verified IT professionals. Fast.
            </Text>

            <View className="flex-col gap-5 mb-4">
              <View className="flex-row items-start">
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: 'rgba(24,95,165,0.1)' }}>
                  <Feather name="check" size={16} color="#185FA5" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-bold text-sm md:text-base mb-0.5" style={{ color: colors.textPrimary }}>AI-matched to your exact needs</Text>
                  <Text className="font-inter text-xs md:text-sm" style={{ color: colors.textSecondary }}>Tell us what you need, we find who fits.</Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: 'rgba(24,95,165,0.1)' }}>
                  <Feather name="check" size={16} color="#185FA5" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-bold text-sm md:text-base mb-0.5" style={{ color: colors.textPrimary }}>Every professional is verified</Text>
                  <Text className="font-inter text-xs md:text-sm" style={{ color: colors.textSecondary }}>Real skills, real experience, real results.</Text>
                </View>
              </View>

              <View className="flex-row items-start">
                <View className="w-8 h-8 rounded-full items-center justify-center mr-3 mt-0.5" style={{ backgroundColor: 'rgba(24,95,165,0.1)' }}>
                  <Feather name="check" size={16} color="#185FA5" />
                </View>
                <View className="flex-1">
                  <Text className="font-inter-bold text-sm md:text-base mb-0.5" style={{ color: colors.textPrimary }}>24-hour escrow protection</Text>
                  <Text className="font-inter text-xs md:text-sm" style={{ color: colors.textSecondary }}>Pay safely. Release when the job is done.</Text>
                </View>
              </View>
            </View>

            <Text className="font-inter-medium text-xs md:text-sm text-center" style={{ color: colors.textSecondary }}>
              Trusted by IT teams across Nigeria and beyond.
            </Text>
          </Animated.View>
        </View>

        {/* Fixed Footer */}
        <View className="items-center py-2 w-full max-w-md mx-auto px-4">
          <TouchableOpacity
            className="w-full py-3 rounded-full items-center mb-3"
            style={{ backgroundColor: colors.accent }}
            onPress={() => router.push('/(auth)/onboarding/client/needs')}
          >
            <Text className="font-inter-bold text-sm tracking-wider uppercase" style={{ color: colors.accentText }}>
              Find my IT professional →
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="w-full py-2.5 rounded-full items-center border mb-4"
            style={{ borderColor: colors.border }}
          >
            <Text className="font-inter-medium text-xs md:text-sm" style={{ color: colors.textPrimary }}>
              Learn more about Kryd
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

