import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/lib/useTheme';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useOnboardingStore } from '@/store/onboardingStore';
import { supabase } from '@/lib/supabase';

export default function ClientCredentialsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { email, setEmail, fullName, setFullName } = useOnboardingStore();
  
  const [localName, setLocalName] = useState(fullName);
  const [localEmail, setLocalEmail] = useState(email);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPasswordStrength = () => {
    const len = password.length;
    if (len === 0) return 0;
    if (len < 6) return 1;
    if (len < 8) return 2;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return 4;
    return 3;
  };

  const strength = getPasswordStrength();
  const strengthText = strength === 0 ? '' : strength === 1 ? 'Weak' : strength === 2 ? 'Fair' : strength === 3 ? 'Strong' : 'Very Strong';
  const strengthColor = strength < 2 ? '#EF4444' : strength === 2 ? '#F59E0B' : '#10B981';

  const handleContinue = async () => {
    const trimmedEmail = localEmail.trim().toLowerCase();
    const trimmedName = localName.trim();
    
    setEmail(trimmedEmail);
    setFullName(trimmedName);
    
    if (!trimmedName || !trimmedEmail || password.length < 8) {
      setError('Please fill in all fields and ensure password is at least 8 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: trimmedName,
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      router.push('/(auth)/onboarding/client/currency');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const isNextEnabled = localName.trim().length > 1 && localEmail.trim().length > 0 && password.length >= 8;

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
            <OnboardingProgress currentStep={5} totalSteps={6} onBack={() => router.push('/(auth)/onboarding/client/company')} />
            
            <View className="mb-4">
              <Text className="font-inter-bold text-2xl md:text-3xl mb-1.5" style={{ color: colors.textPrimary }}>
                Create your Kryd account
              </Text>
              <Text className="font-inter text-xs md:text-sm" style={{ color: colors.textSecondary }}>
                Set up your login details so you can start finding IT professionals.
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
                {error && (
                  <View className="bg-red-500/20 p-3 rounded-xl mb-4 border border-red-500/50">
                    <Text className="text-red-400 font-inter text-xs md:text-sm">{error}</Text>
                  </View>
                )}

                <View className="mb-4">
                  <Text className="font-inter-medium text-xs md:text-sm mb-2" style={{ color: colors.textPrimary }}>Your full name</Text>
                  <TextInput
                    className="w-full px-4 py-2.5 rounded-xl font-inter text-sm border"
                    style={{ 
                      backgroundColor: colors.cardSurface, 
                      borderColor: colors.border,
                      color: colors.textPrimary 
                    }}
                    placeholder="e.g. Jane Doe"
                    placeholderTextColor={colors.textSecondary}
                    value={localName}
                    onChangeText={setLocalName}
                    autoCapitalize="words"
                  />
                </View>

                <View className="mb-4">
                  <Text className="font-inter-medium text-xs md:text-sm mb-2" style={{ color: colors.textPrimary }}>Email address</Text>
                  <TextInput
                    className="w-full px-4 py-2.5 rounded-xl font-inter text-sm border"
                    style={{ 
                      backgroundColor: colors.cardSurface, 
                      borderColor: colors.border,
                      color: colors.textPrimary 
                    }}
                    placeholder="e.g. name@company.com"
                    placeholderTextColor={colors.textSecondary}
                    value={localEmail}
                    onChangeText={setLocalEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View className="mb-3">
                  <Text className="font-inter-medium text-xs md:text-sm mb-2" style={{ color: colors.textPrimary }}>Password</Text>
                  <View className="w-full relative justify-center">
                    <TextInput
                      className="w-full px-4 py-2.5 rounded-xl font-inter text-sm border pr-12"
                      style={{ 
                        backgroundColor: colors.cardSurface, 
                        borderColor: colors.border,
                        color: colors.textPrimary 
                      }}
                      placeholder="Create a password"
                      placeholderTextColor={colors.textSecondary}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      className="absolute right-4" 
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>8 characters minimum</Text>
                    {strength > 0 && <Text className="font-inter-bold text-xs" style={{ color: strengthColor }}>{strengthText}</Text>}
                  </View>
                  
                  <View className="flex-row gap-1.5">
                    <View className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: strength >= 1 ? strengthColor : colors.border }} />
                    <View className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: strength >= 2 ? strengthColor : colors.border }} />
                    <View className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: strength >= 3 ? strengthColor : colors.border }} />
                    <View className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: strength >= 4 ? strengthColor : colors.border }} />
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
                backgroundColor: isNextEnabled ? colors.accent : colors.border,
                opacity: isNextEnabled ? (loading ? 0.7 : 1) : 0.5 
              }}
              disabled={!isNextEnabled || loading}
              onPress={handleContinue}
            >
              {loading ? (
                <ActivityIndicator color={colors.accentText} />
              ) : (
                <Text className="font-inter-bold text-sm tracking-wider uppercase" style={{ color: isNextEnabled ? colors.accentText : colors.textSecondary }}>
                  Create my account →
                </Text>
              )}
            </TouchableOpacity>

          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

