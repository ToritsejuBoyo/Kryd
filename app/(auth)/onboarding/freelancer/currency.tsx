import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import Animated, { SlideInRight, SlideOutLeft, FadeIn } from 'react-native-reanimated';
import { useOnboardingStore } from '@/store/onboardingStore';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import Toast from 'react-native-toast-message';

export default function CurrencyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const { 
    setPreferredCurrency,
    fullName, resetOnboarding, role
  } = useOnboardingStore();
  
  const { setProfile, setClientMode } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');

  const handleFinish = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Could not find user session');

      // Core profile upsert — only columns that are guaranteed to exist
      const profileData = {
        user_id: user.id,
        full_name: fullName || user.user_metadata?.full_name || '',
        role: role === 'client' ? 'Employer' : 'IT Support Specialist',
        points: 0,
        coins: 0,
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select()
        .single();

      if (error) throw error;

      // Best-effort: save preferred_currency separately.
      // If the column doesn't exist yet, this fails silently — onboarding still completes.
      await supabase
        .from('profiles')
        .update({ preferred_currency: selectedCurrency })
        .eq('user_id', user.id);

      setClientMode(false);
      setSuccess(true);

      setTimeout(() => {
        setPreferredCurrency(selectedCurrency as any);
        setProfile(data);
        resetOnboarding();
        router.replace('/(tabs)');
      }, 1500);

    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Setup failed', text2: error.message });
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.backgroundPrimary }}>
        <Animated.View entering={FadeIn} className="items-center">
          <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: '#CCDF1A' }}>
            <Feather name="check" size={48} color="#0B2D2C" />
          </View>
          <Text className="font-inter-bold text-2xl text-center" style={{ color: colors.textPrimary }}>
            Welcome to Kryd!
          </Text>
        </Animated.View>
      </View>
    );
  }

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
          <OnboardingProgress currentStep={7} totalSteps={7} onBack={() => router.push('/(auth)/onboarding/freelancer/credentials')} />
          
          <View className="mb-4">
            <Text className="font-inter-bold text-2xl md:text-3xl mb-1.5" style={{ color: colors.textPrimary }}>
              Choose your currency
            </Text>
            <Text className="font-inter text-xs md:text-sm" style={{ color: colors.textSecondary }}>
              Select the currency you want your account to use
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
              <View className="mb-4">
                <View className="flex-col gap-3">
                  <TouchableOpacity
                    onPress={() => setSelectedCurrency('USD')}
                    className="p-4 rounded-xl border flex-row items-center"
                    style={{ 
                      backgroundColor: selectedCurrency === 'USD' ? 'rgba(204, 223, 26, 0.05)' : colors.cardSurface, 
                      borderColor: selectedCurrency === 'USD' ? '#CCDF1A' : colors.border 
                    }}
                  >
                    <View className="w-5 h-5 rounded-full border-2 items-center justify-center mr-3" style={{ borderColor: selectedCurrency === 'USD' ? '#CCDF1A' : colors.border }}>
                      {selectedCurrency === 'USD' && <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#CCDF1A' }} />}
                    </View>
                    <Text className="font-inter text-sm md:text-base" style={{ color: colors.textPrimary }}>Dollar (USD)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setSelectedCurrency('NGN')}
                    className="p-4 rounded-xl border flex-row items-center"
                    style={{ 
                      backgroundColor: selectedCurrency === 'NGN' ? 'rgba(204, 223, 26, 0.05)' : colors.cardSurface, 
                      borderColor: selectedCurrency === 'NGN' ? '#CCDF1A' : colors.border 
                    }}
                  >
                    <View className="w-5 h-5 rounded-full border-2 items-center justify-center mr-3" style={{ borderColor: selectedCurrency === 'NGN' ? '#CCDF1A' : colors.border }}>
                      {selectedCurrency === 'NGN' && <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#CCDF1A' }} />}
                    </View>
                    <Text className="font-inter text-sm md:text-base" style={{ color: colors.textPrimary }}>Naira (NGN)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setSelectedCurrency('GBP')}
                    className="p-4 rounded-xl border flex-row items-center"
                    style={{ 
                      backgroundColor: selectedCurrency === 'GBP' ? 'rgba(204, 223, 26, 0.05)' : colors.cardSurface, 
                      borderColor: selectedCurrency === 'GBP' ? '#CCDF1A' : colors.border 
                    }}
                  >
                    <View className="w-5 h-5 rounded-full border-2 items-center justify-center mr-3" style={{ borderColor: selectedCurrency === 'GBP' ? '#CCDF1A' : colors.border }}>
                      {selectedCurrency === 'GBP' && <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#CCDF1A' }} />}
                    </View>
                    <Text className="font-inter text-sm md:text-base" style={{ color: colors.textPrimary }}>Pounds (GBP)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </Animated.View>
        </View>

        {/* Fixed Footer */}
        <View className="items-center py-2 w-full max-w-md mx-auto px-4">
          <TouchableOpacity
            className="w-full py-3.5 rounded-full items-center mb-4"
            style={{ 
              backgroundColor: colors.accent,
              opacity: loading ? 0.7 : 1 
            }}
            disabled={loading}
            onPress={handleFinish}
          >
            {loading ? (
              <ActivityIndicator color={colors.accentText} />
            ) : (
              <Text className="font-inter-bold text-sm tracking-wider uppercase" style={{ color: colors.accentText }}>
                Take me to Kryd →
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
