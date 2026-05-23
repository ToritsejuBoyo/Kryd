import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';
import { useOnboardingStore } from '@/store/onboardingStore';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';

export default function RoleSelectScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { role, setRole } = useOnboardingStore();

  const handleContinue = () => {
    if (role === 'freelancer') {
      router.push('/(auth)/onboarding/freelancer/welcome');
    } else if (role === 'client') {
      router.push('/(auth)/onboarding/client/pitch');
    }
  };

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
        <View className="items-center py-2 md:py-4">
          <Text className="font-inter-bold text-2xl md:text-3xl text-center mb-1" style={{ color: colors.textPrimary }}>
            How do you want to use Kryd?
          </Text>
          <Text className="font-inter text-center text-xs md:text-sm" style={{ color: colors.textSecondary }}>
            Choose your primary role — you can always switch later.
          </Text>
        </View>

        {/* Fixed Content Area */}
        <View className="flex-1 justify-center w-full max-w-4xl mx-auto px-2 md:px-8">
          <Animated.View 
            entering={SlideInRight} 
            exiting={SlideOutLeft} 
            className="flex-col md:flex-row gap-4 md:gap-6 justify-center w-full"
          >
            {/* Freelancer Card */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setRole('freelancer')}
              className="flex-1 border-2 rounded-2xl p-4 md:p-6 relative flex-row md:flex-col items-center md:items-start"
              style={{ 
                backgroundColor: colors.cardSurface, 
                borderColor: role === 'freelancer' ? '#CCDF1A' : colors.border,
              }}
            >
              {role === 'freelancer' && (
                <View className="absolute top-2 right-2 md:top-4 md:right-4 w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: '#CCDF1A' }}>
                  <Feather name="check" size={12} color="#0B2D2C" />
                </View>
              )}
              
              <View className="w-12 h-12 md:w-14 md:h-14 rounded-full items-center justify-center mr-4 md:mr-0 md:mb-4 flex-shrink-0" style={{ backgroundColor: role === 'freelancer' ? 'rgba(204,223,26,0.1)' : colors.backgroundSecondary }}>
                <Feather name="monitor" size={22} color={role === 'freelancer' ? '#CCDF1A' : colors.textSecondary} />
              </View>
              
              <View className="flex-1 md:flex-initial">
                <Text className="font-inter-bold text-base md:text-lg mb-0.5 md:mb-1" style={{ color: colors.textPrimary }}>
                  I am a Freelancer
                </Text>
                
                <Text className="font-inter-medium text-[8px] uppercase tracking-wider mb-1" style={{ color: colors.textSecondary }}>
                  IT Support · Cloud · Cyber · Net Admin
                </Text>

                <Text className="font-inter text-xs leading-normal hidden sm:flex" style={{ color: colors.textSecondary }}>
                  I want to find IT jobs, earn money, and grow my skills.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Client Card */}
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => setRole('client')}
              className="flex-1 border-2 rounded-2xl p-4 md:p-6 relative flex-row md:flex-col items-center md:items-start"
              style={{ 
                backgroundColor: colors.cardSurface, 
                borderColor: role === 'client' ? '#185FA5' : colors.border,
              }}
            >
              {role === 'client' && (
                <View className="absolute top-2 right-2 md:top-4 md:right-4 w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: '#185FA5' }}>
                  <Feather name="check" size={12} color="white" />
                </View>
              )}
              
              <View className="w-12 h-12 md:w-14 md:h-14 rounded-full items-center justify-center mr-4 md:mr-0 md:mb-4 flex-shrink-0" style={{ backgroundColor: role === 'client' ? 'rgba(24,95,165,0.1)' : colors.backgroundSecondary }}>
                <Feather name="briefcase" size={22} color={role === 'client' ? '#185FA5' : colors.textSecondary} />
              </View>
              
              <View className="flex-1 md:flex-initial">
                <Text className="font-inter-bold text-base md:text-lg mb-0.5 md:mb-1" style={{ color: colors.textPrimary }}>
                  I am a Client
                </Text>

                <Text className="font-inter-medium text-[8px] uppercase tracking-wider mb-1" style={{ color: colors.textSecondary }}>
                  Startup · SME · Enterprise · Individual
                </Text>
                
                <Text className="font-inter text-xs leading-normal hidden sm:flex" style={{ color: colors.textSecondary }}>
                  I represent a business. I want to hire IT professionals.
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Fixed Footer */}
        <View className="items-center py-2 md:py-4 w-full max-w-md mx-auto px-4">
          <TouchableOpacity
            className="w-full py-3 rounded-full items-center mb-4"
            style={{ 
              backgroundColor: role ? colors.accent : colors.border,
              opacity: role ? 1 : 0.5 
            }}
            disabled={!role}
            onPress={handleContinue}
          >
            <Text className="font-inter-bold text-sm tracking-wider uppercase" style={{ color: role ? colors.accentText : colors.textSecondary }}>
              Continue →
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}
