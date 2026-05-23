import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/useTheme';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  showBack?: boolean;
  onBack?: () => void;
}

export function OnboardingProgress({ currentStep, totalSteps, showBack = true, onBack }: OnboardingProgressProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <View className="flex-row items-center justify-between mb-8 w-full">
      {/* Back Button */}
      {showBack ? (
        <TouchableOpacity 
          onPress={onBack ? onBack : () => router.back()}
          className="w-10 h-10 rounded-full items-center justify-center bg-white/5"
        >
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View className="w-10 h-10" />
      )}

      {/* Progress Dots */}
      <View className="flex-row items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <View 
              key={idx}
              className={`h-2 rounded-full ${isCurrent ? 'w-6' : 'w-2'}`}
              style={{ 
                backgroundColor: isCompleted || isCurrent ? colors.accent : colors.border,
                opacity: isCompleted ? 1 : isCurrent ? 1 : 0.3
              }}
            />
          );
        })}
      </View>

      {/* Step Text */}
      <Text className="font-inter-medium text-xs w-10 text-right" style={{ color: colors.textSecondary }}>
        {currentStep}/{totalSteps}
      </Text>
    </View>
  );
}
