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

export default function ClientLocationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const { 
    preferredCurrency, setPreferredCurrency,
    fullName, resetOnboarding, role
  } = useOnboardingStore();
  
  const { setProfile, setClientMode } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFinish = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Could not find user session");

      const profileData: Record<string, any> = {
        user_id: user.id,
        full_name: fullName || user.user_metadata?.full_name || '',
        role: role === 'client' ? 'Employer' : 'IT Support Specialist',
        default_mode: role,
        preferred_currency: preferredCurrency || 'USD',
        points: 0,
        coins: 0
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData)
        .select()
        .single();

      if (error) throw error;

      setClientMode(true); // Client mode
      setSuccess(true);
      
      // Delay navigation for celebration animation
      setTimeout(() => {
        setProfile(data);
        resetOnboarding();
        router.replace('/(tabs)');
      }, 2000);

    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Setup failed', text2: error.message });
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.backgroundPrimary }}>
        <Animated.View entering={FadeIn} className="items-center px-8">
          <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: colors.accent }}>
            <Feather name="check" size={48} color={colors.accentText} />
          </View>
          <Text className="font-inter-bold text-2xl text-center mb-4" style={{ color: colors.textPrimary }}>
            Welcome to Kryd.
          </Text>
          <Text className="font-inter text-base text-center" style={{ color: colors.textSecondary }}>
            Your first great hire is one post away.
          </Text>
        </Animated.View>
      </View>
    );
  }

  // Calculate active background color based on current accent
  const activeBgColor = `${colors.accent}15`;

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
          <OnboardingProgress currentStep={6} totalSteps={6} onBack={() => router.push('/(auth)/onboarding/client/credentials')} />
          
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
              keyboardShouldPersistTaps="handled"
            >
              <View className="mb-4">
                <Text className="font-inter-medium text-xs md:text-sm mb-2.5" style={{ color: colors.textPrimary }}>Currency</Text>
                <View className="flex-col gap-3">
                  <TouchableOpacity
                    onPress={() => setPreferredCurrency('USD' as any)}
                    className="p-4 rounded-xl border flex-row items-center"
                    style={{ 
                      backgroundColor: preferredCurrency === 'USD' ? activeBgColor : colors.cardSurface, 
                      borderColor: preferredCurrency === 'USD' ? colors.accent : colors.border 
                    }}
                  >
                    <View className="w-5 h-5 rounded-full border-2 items-center justify-center mr-3" style={{ borderColor: preferredCurrency === 'USD' ? colors.accent : colors.border }}>
                      {preferredCurrency === 'USD' && <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.accent }} />}
                    </View>
                    <Text className="font-inter text-sm md:text-base" style={{ color: colors.textPrimary }}>Dollar (USD)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setPreferredCurrency('NGN' as any)}
                    className="p-4 rounded-xl border flex-row items-center"
                    style={{ 
                      backgroundColor: preferredCurrency === 'NGN' ? activeBgColor : colors.cardSurface, 
                      borderColor: preferredCurrency === 'NGN' ? colors.accent : colors.border 
                    }}
                  >
                    <View className="w-5 h-5 rounded-full border-2 items-center justify-center mr-3" style={{ borderColor: preferredCurrency === 'NGN' ? colors.accent : colors.border }}>
                      {preferredCurrency === 'NGN' && <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.accent }} />}
                    </View>
                    <Text className="font-inter text-sm md:text-base" style={{ color: colors.textPrimary }}>Naira (NGN)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setPreferredCurrency('GBP' as any)}
                    className="p-4 rounded-xl border flex-row items-center"
                    style={{ 
                      backgroundColor: preferredCurrency === 'GBP' ? activeBgColor : colors.cardSurface, 
                      borderColor: preferredCurrency === 'GBP' ? colors.accent : colors.border 
                    }}
                  >
                    <View className="w-5 h-5 rounded-full border-2 items-center justify-center mr-3" style={{ borderColor: preferredCurrency === 'GBP' ? colors.accent : colors.border }}>
                      {preferredCurrency === 'GBP' && <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.accent }} />}
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
                Start hiring on Kryd →
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

