import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useOnboardingStore } from '@/store/onboardingStore';

const GOAL_OPTIONS = [
  { id: 'freelance_work', title: 'Find freelance IT work', sub: 'Short-term contracts and gigs', icon: '💼' },
  { id: 'fulltime_job', title: 'Find a full-time IT job', sub: 'Permanent employment opportunities', icon: '🏢' },
  { id: 'learn_skills', title: 'Learn new IT skills', sub: 'Courses, certifications, resources', icon: '📚' },
  { id: 'network', title: 'Build my professional network', sub: 'Connect with IT professionals globally', icon: '🌍' },
  { id: 'earn', title: 'Earn while I grow', sub: 'Points, coins, and real income', icon: '💰' },
];

export default function GoalScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { goals, setGoals } = useOnboardingStore();
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>(goals);

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(prev => prev.filter(g => g !== id));
    } else {
      setSelectedGoals(prev => [...prev, id]);
    }
  };

  const handleContinue = () => {
    setGoals(selectedGoals);
    router.push('/(auth)/onboarding/freelancer/name');
  };

  const isNextEnabled = selectedGoals.length > 0;

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
          <OnboardingProgress currentStep={4} totalSteps={7} onBack={() => router.push('/(auth)/onboarding/freelancer/experience')} />
          
          <View className="mb-2">
            <Text className="font-inter-bold text-xl md:text-2xl mb-1" style={{ color: colors.textPrimary }}>
              What brings you to Kryd?
            </Text>
            <Text className="font-inter text-[11px] md:text-xs" style={{ color: colors.textSecondary }}>
              Pick everything that applies to you.
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
                {GOAL_OPTIONS.map((opt) => {
                  const isSelected = selectedGoals.includes(opt.id);
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => toggleGoal(opt.id)}
                      className="p-3 rounded-2xl flex-row items-center border relative"
                      style={{
                        backgroundColor: isSelected ? 'rgba(204, 223, 26, 0.05)' : colors.cardSurface,
                        borderColor: isSelected ? '#CCDF1A' : colors.border,
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
                      {isSelected && (
                        <View className="absolute right-4 w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: '#CCDF1A' }}>
                          <Feather name="check" size={12} color="#0B2D2C" />
                        </View>
                      )}
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
              backgroundColor: isNextEnabled ? colors.accent : colors.border,
              opacity: isNextEnabled ? 1 : 0.5 
            }}
            disabled={!isNextEnabled}
            onPress={handleContinue}
          >
            <Text className="font-inter-bold text-sm tracking-wider uppercase" style={{ color: isNextEnabled ? colors.accentText : colors.textSecondary }}>
              Almost there →
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

