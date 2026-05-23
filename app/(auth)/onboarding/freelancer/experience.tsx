import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/useTheme';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useOnboardingStore } from '@/store/onboardingStore';

const EXPERIENCE_OPTIONS = [
  { id: 'just_starting', title: 'I am just starting out', sub: 'No experience yet — learning now', icon: '🌱' },
  { id: 'less_than_1', title: 'Less than 1 year', sub: 'I have some hands-on experience', icon: '📚' },
  { id: '1_to_3', title: '1 to 3 years', sub: 'I have completed real projects', icon: '⚡' },
  { id: '3_to_5', title: '3 to 5 years', sub: 'I handle complex environments', icon: '🚀' },
  { id: '5_plus', title: '5+ years', sub: 'Senior level, I mentor others', icon: '🏆' },
];

export default function ExperienceScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { experienceYears, setExperienceYears } = useOnboardingStore();

  const handleContinue = () => {
    router.push('/(auth)/onboarding/freelancer/goal');
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
          padding: Platform.OS === 'web' ? 20 : 12
        }}
      >
        {/* Fixed Header */}
        <View className="w-full max-w-xl mx-auto">
          <OnboardingProgress currentStep={3} totalSteps={7} onBack={() => router.push('/(auth)/onboarding/freelancer/career-path')} />
          
          <View className="mb-2">
            <Text className="font-inter-bold text-xl md:text-2xl mb-1" style={{ color: colors.textPrimary }}>
              How long have you been working in IT?
            </Text>
            <Text className="font-inter text-[11px] md:text-xs" style={{ color: colors.textSecondary }}>
              Be honest — Kryd works for every level, from day one to decade ten.
            </Text>
          </View>
        </View>

        {/* Scrollable Content Area */}
        <View className="flex-1 w-full max-w-xl mx-auto overflow-hidden px-2 py-1">
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} className="flex-1">
            <ScrollView 
              className="flex-1" 
              contentContainerStyle={{ paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            >
              <View className="flex-col gap-2">
                {EXPERIENCE_OPTIONS.map((opt) => {
                  const isSelected = experienceYears === opt.id;
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => setExperienceYears(opt.id)}
                      className="p-3 rounded-2xl flex-row items-center border"
                      style={{
                        backgroundColor: isSelected ? 'rgba(204, 223, 26, 0.05)' : colors.cardSurface,
                        borderColor: isSelected ? '#CCDF1A' : colors.border,
                        borderLeftWidth: isSelected ? 4 : 1,
                      }}
                    >
                      <Text className="text-xl mr-3">{opt.icon}</Text>
                      <View className="flex-1">
                        <Text className="font-inter-bold text-xs md:text-sm mb-0.5" style={{ color: colors.textPrimary }}>
                          {opt.title}
                        </Text>
                        <Text className="font-inter text-[10px] md:text-xs" style={{ color: colors.textSecondary }}>
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
        <View className="items-center py-1 w-full max-w-md mx-auto px-4">
          <TouchableOpacity
            className="w-full py-3 rounded-full items-center mb-2"
            style={{ 
              backgroundColor: experienceYears ? colors.accent : colors.border,
              opacity: experienceYears ? 1 : 0.5 
            }}
            disabled={!experienceYears}
            onPress={handleContinue}
          >
            <Text className="font-inter-bold text-sm tracking-wider uppercase" style={{ color: experienceYears ? colors.accentText : colors.textSecondary }}>
              Next →
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

