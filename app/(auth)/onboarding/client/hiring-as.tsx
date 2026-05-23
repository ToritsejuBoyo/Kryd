import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/useTheme';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useOnboardingStore } from '@/store/onboardingStore';

const HIRING_OPTIONS = [
  { id: 'personal', title: 'Myself / Personal project', sub: 'I need IT help for a personal task', icon: '👤' },
  { id: 'business', title: 'My business or company', sub: 'SME, startup, or established firm', icon: '🏢' },
  { id: 'enterprise', title: 'My enterprise / large organisation', sub: 'Corporate IT needs at scale', icon: '🏗️' },
];

export default function HiringAsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { hiringAs, setHiringAs } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/(auth)/onboarding/client/company');
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
        <View className="w-full max-w-xl mx-auto">
          <OnboardingProgress currentStep={3} totalSteps={6} onBack={() => router.push('/(auth)/onboarding/client/needs')} />
          
          <View className="mb-4">
            <Text className="font-inter-bold text-2xl md:text-3xl mb-1.5" style={{ color: colors.textPrimary }}>
              Who are you hiring for?
            </Text>
            <Text className="font-inter text-xs md:text-sm" style={{ color: colors.textSecondary }}>
              This helps us show you the right professionals.
            </Text>
          </View>
        </View>

        {/* Scrollable Content Area */}
        <View className="flex-1 w-full max-w-xl mx-auto overflow-hidden px-2 py-2">
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} className="flex-1">
            <ScrollView 
              className="flex-1" 
              showsVerticalScrollIndicator={false}
            >
              <View className="flex-col gap-3">
                {HIRING_OPTIONS.map((opt) => {
                  const isSelected = hiringAs === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setHiringAs(opt.id)}
                      className="p-4 rounded-2xl flex-row items-center border"
                      style={{
                        backgroundColor: isSelected ? 'rgba(24, 95, 165, 0.05)' : colors.cardSurface,
                        borderColor: isSelected ? '#185FA5' : colors.border,
                        borderLeftWidth: isSelected ? 4 : 1,
                      }}
                    >
                      <Text className="text-2xl mr-4">{opt.icon}</Text>
                      <View className="flex-1">
                        <Text className="font-inter-bold text-sm md:text-base mb-1" style={{ color: colors.textPrimary }}>
                          {opt.title}
                        </Text>
                        <Text className="font-inter text-xs md:text-sm" style={{ color: colors.textSecondary }}>
                          {opt.sub}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        </View>

        {/* Fixed Footer */}
        <View className="items-center py-2 w-full max-w-md mx-auto px-4">
          <TouchableOpacity
            className="w-full py-3.5 rounded-full items-center mb-4"
            style={{ 
              backgroundColor: hiringAs ? colors.accent : colors.border,
              opacity: hiringAs ? 1 : 0.5 
            }}
            disabled={!hiringAs}
            onPress={handleContinue}
          >
            <Text className="font-inter-bold text-sm tracking-wider uppercase" style={{ color: hiringAs ? colors.accentText : colors.textSecondary }}>
              Next →
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

