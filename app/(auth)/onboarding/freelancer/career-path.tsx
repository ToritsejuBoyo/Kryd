import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/useTheme';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useOnboardingStore } from '@/store/onboardingStore';

const TILES = [
  { label: 'IT Support', icon: '💻' },
  { label: 'Cloud Engineering', icon: '☁️' },
  { label: 'Cybersecurity', icon: '🔒' },
  { label: 'Networking', icon: '🌐' },
  { label: 'System Admin', icon: '🖥️' },
  { label: 'Help Desk / Service Desk', icon: '📱' },
  { label: 'Data Recovery', icon: '💾' },
  { label: 'DevOps', icon: '⚙️' },
  { label: 'SOC Analyst', icon: '🛡️' },
  { label: 'IT Project Management', icon: '📋' },
  { label: 'Hardware & Repair', icon: '🔧' },
  { label: 'IT Training & Consulting', icon: '📊' }
];

export default function CareerPathScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { workTypes, setWorkTypes } = useOnboardingStore();
  
  const [selectedTiles, setSelectedTiles] = useState<string[]>(workTypes);
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    // If workTypes has items not in TILES, it means it was a custom input previously
    const hasCustom = workTypes.some(wt => !TILES.find(t => t.label === wt));
    if (hasCustom && workTypes.length > 0) {
      setCustomInput(workTypes[0]);
      setSelectedTiles([]);
    }
  }, []);

  const toggleTile = (label: string) => {
    setCustomInput(''); // clear custom input
    if (selectedTiles.includes(label)) {
      setSelectedTiles(prev => prev.filter(t => t !== label));
    } else {
      if (selectedTiles.length < 3) {
        setSelectedTiles(prev => [...prev, label]);
      }
    }
  };

  const handleCustomInputChange = (text: string) => {
    setCustomInput(text);
    if (text.length > 0) {
      setSelectedTiles([]);
    }
  };

  const handleContinue = () => {
    const finalSelection = customInput.trim() ? [customInput.trim()] : selectedTiles;
    setWorkTypes(finalSelection);
    router.push('/(auth)/onboarding/freelancer/experience');
  };

  const isNextEnabled = selectedTiles.length > 0 || customInput.trim().length > 0;

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
          <OnboardingProgress currentStep={2} totalSteps={7} onBack={() => router.push('/(auth)/onboarding/freelancer/welcome')} />
          
          <View className="mb-4">
            <Text className="font-inter-bold text-2xl md:text-3xl mb-1.5" style={{ color: colors.textPrimary }}>
              What is your IT specialty?
            </Text>
            <Text className="font-inter text-xs md:text-sm" style={{ color: colors.textSecondary }}>
              Choose up to 3 options or enter your own custom specialty.
            </Text>
          </View>
        </View>

        {/* Scrollable Content Area */}
        <View className="flex-1 w-full max-w-xl mx-auto overflow-hidden px-2 py-2">
          <Animated.View entering={SlideInRight} exiting={SlideOutLeft} className="flex-1">
            <ScrollView 
              className="flex-1 mb-4" 
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View className="flex-row flex-wrap gap-2">
                {TILES.map((tile) => {
                  const isSelected = selectedTiles.includes(tile.label);
                  return (
                    <TouchableOpacity
                      key={tile.label}
                      onPress={() => toggleTile(tile.label)}
                      className="px-3.5 py-2.5 rounded-xl border flex-row items-center"
                      style={{
                        backgroundColor: isSelected ? '#CCDF1A' : colors.cardSurface,
                        borderColor: isSelected ? '#CCDF1A' : colors.border,
                      }}
                    >
                      <Text className="mr-1.5 text-sm">{tile.icon}</Text>
                      <Text 
                        className="font-inter-medium text-xs md:text-sm" 
                        style={{ color: isSelected ? '#0B2D2C' : colors.textPrimary }}
                      >
                        {tile.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            {/* Custom specialty input */}
            <View className="pt-2">
              <TextInput
                className="w-full px-4 py-2.5 rounded-xl font-inter text-sm border"
                style={{ 
                  backgroundColor: customInput ? 'rgba(204, 223, 26, 0.05)' : colors.cardSurface, 
                  borderColor: customInput ? '#CCDF1A' : colors.border,
                  color: colors.textPrimary 
                }}
                placeholder="My specialty is not listed — type it here"
                placeholderTextColor={colors.textSecondary}
                value={customInput}
                onChangeText={handleCustomInputChange}
              />
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
              This is me →
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

