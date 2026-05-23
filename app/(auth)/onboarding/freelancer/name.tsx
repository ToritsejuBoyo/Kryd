import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function NameScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { fullName, setFullName } = useOnboardingStore();
  
  const [name, setName] = useState(fullName);

  const handleContinue = () => {
    setFullName(name.trim());
    router.push('/(auth)/onboarding/freelancer/credentials');
  };

  const isNextEnabled = name.trim().length >= 2;

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
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
            <OnboardingProgress currentStep={5} totalSteps={7} onBack={() => router.push('/(auth)/onboarding/freelancer/goal')} />
            
            <View className="mb-4">
              <Text className="font-inter-bold text-2xl md:text-3xl mb-1.5" style={{ color: colors.textPrimary }}>
                What should we call you?
              </Text>
              <Text className="font-inter text-xs md:text-sm" style={{ color: colors.textSecondary }}>
                This is how you'll appear to clients and the community.
              </Text>
            </View>
          </View>

          {/* Fixed Content Area */}
          <View className="flex-1 justify-center w-full max-w-xl mx-auto px-2">
            <Animated.View entering={SlideInRight} exiting={SlideOutLeft} className="w-full">
              <View className="mb-4">
                <Text className="font-inter-medium text-xs md:text-sm mb-2" style={{ color: colors.textPrimary }}>Full Name</Text>
                <TextInput
                  className="w-full px-4 py-3 rounded-xl font-inter-bold text-lg md:text-xl border"
                  style={{ 
                    backgroundColor: colors.cardSurface, 
                    borderColor: colors.border,
                    color: colors.textPrimary 
                  }}
                  placeholder="e.g. Toritseju Boyo"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoFocus
                />
              </View>

              <View className="flex-row items-center">
                <Feather name="lock" size={12} color={colors.textSecondary} className="mr-2" />
                <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>
                  Your name is visible to other Kryd members.
                </Text>
              </View>
            </Animated.View>
          </View>

          {/* Fixed Footer */}
          <View className="items-center py-2 w-full max-w-md mx-auto px-4">
            <TouchableOpacity
              className="w-full py-3.5 rounded-full items-center mb-4"
              style={{ 
                backgroundColor: isNextEnabled ? colors.accent : colors.border,
                opacity: isNextEnabled ? 1 : 0.5 
              }}
              disabled={!isNextEnabled}
              onPress={handleContinue}
            >
              <Text className="font-inter-bold text-sm tracking-wider uppercase" style={{ color: isNextEnabled ? colors.accentText : colors.textSecondary }}>
                That's me →
              </Text>
            </TouchableOpacity>

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

