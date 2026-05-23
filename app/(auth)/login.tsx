import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import Toast from 'react-native-toast-message';
import { useTheme } from '@/lib/useTheme';
import { useUserStore } from '@/store/userStore';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    console.log('[LOGIN_PAGE] handleLogin called', { email });
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    
    setLoading(true);
    setError(null);
    useUserStore.getState().setIsLoggingIn(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        setError('Email or password is incorrect. Please try again.');
        useUserStore.getState().setIsLoggingIn(false);
      }
    } catch (e: any) {
      setError('An unexpected error occurred. Please try again.');
      useUserStore.getState().setIsLoggingIn(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthPress = (provider: string) => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: `${provider} sign-in launching soon. Please use email for now.`,
    });
  };

  const handleForgotPassword = () => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: 'Password reset coming soon',
    });
  };

  return (
    <SafeAreaView 
      style={{ 
        flex: 1, 
        backgroundColor: colors.backgroundPrimary,
        height: Platform.OS === 'web' ? '100vh' : '100%'
      } as any}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1, height: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View 
          style={{ 
            flex: 1,
            flexDirection: 'row', 
            height: '100%',
            overflow: 'hidden' 
          }}
        >
          {/* Left Visual/Brand Panel (Only on large screens) */}
          {isLargeScreen && (
            <View 
              style={{ 
                width: '50%',
                height: '100%',
                backgroundColor: '#0B2D2C',
                padding: 48,
                position: 'relative',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
                overflow: 'hidden'
              }}
            >
              {/* Logo top-left */}
              <View style={{ position: 'absolute', top: 32, left: 32, flexDirection: 'row', alignItems: 'center' }}>
                <Text className="font-inter-bold text-white text-2xl tracking-wider">
                  <Text style={{ color: '#CCDF1A' }}>K</Text>ryd
                </Text>
              </View>

              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                {/* Abstract Circuit / Network Graphic Visual */}
                <View className="w-80 h-80 relative items-center justify-center mb-6">
                  {/* Outer decorative ring */}
                  <View 
                    className="w-72 h-72 rounded-full absolute border" 
                    style={{ borderColor: 'rgba(255,255,255,0.05)' }} 
                  />
                  <View 
                    className="w-60 h-60 rounded-full absolute border border-dashed" 
                    style={{ borderColor: 'rgba(204, 223, 26, 0.15)' }} 
                  />

                  {/* Central circuit hub */}
                  <View 
                    className="w-32 h-32 rounded-full absolute items-center justify-center" 
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1 }}
                  >
                    <View 
                      className="w-16 h-16 rounded-full items-center justify-center" 
                      style={{ backgroundColor: 'rgba(204, 223, 26, 0.08)' }}
                    >
                      <Feather name="cpu" size={32} color="#CCDF1A" />
                    </View>
                  </View>

                  {/* Network nodes & connectors */}
                  <View className="absolute top-10 left-20 items-center justify-center">
                    <View className="w-4 h-4 rounded-full" style={{ backgroundColor: '#CCDF1A' }} />
                    <View className="w-px h-16 bg-white/20 absolute top-4" />
                  </View>
                  <View className="absolute bottom-10 right-20 items-center justify-center">
                    <View className="w-5 h-5 rounded-full border-2" style={{ borderColor: '#CCDF1A', backgroundColor: '#0B2D2C' }} />
                    <View className="w-px h-16 bg-white/20 absolute bottom-5" />
                  </View>
                  <View className="absolute top-1/2 left-6 items-center justify-center">
                    <View className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }} />
                    <View className="w-20 h-px bg-white/20 absolute left-3.5" />
                  </View>
                  <View className="absolute top-1/2 right-6 items-center justify-center">
                    <View className="w-4 h-4 rounded-full" style={{ backgroundColor: '#CCDF1A' }} />
                    <View className="w-20 h-px bg-white/20 absolute right-4" />
                  </View>

                  {/* Angular paths */}
                  <View 
                    className="w-40 h-40 absolute border-l border-t rounded-tl-3xl rotate-45" 
                    style={{ borderColor: 'rgba(204, 223, 26, 0.2)' }} 
                  />
                  <View 
                    className="w-24 h-24 absolute border-r border-b rounded-br-3xl -rotate-45" 
                    style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} 
                  />
                </View>

                {/* Taglines */}
                <Text className="font-inter-bold text-2xl text-white text-center mb-1">
                  The IT career platform
                </Text>
                <Text className="font-inter text-sm text-center tracking-wider" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Learn · Earn · Connect · Grow
                </Text>
              </View>
            </View>
          )}

          {/* Right Form Panel */}
          <View 
            style={{ 
              width: isLargeScreen ? '50%' : '100%',
              height: '100%',
              backgroundColor: colors.backgroundPrimary,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <View 
              style={{
                width: '100%',
                maxWidth: 420,
                paddingHorizontal: isLargeScreen ? 48 : 24,
                justifyContent: 'center',
              }}
            >
              {/* App Brand Header */}
              <View className="items-center md:items-start mb-6">
                <Text className="font-inter-bold text-2xl tracking-wider mb-2 md:mb-4" style={{ color: colors.textPrimary }}>
                  KRYD
                </Text>
                <Text className="font-inter-bold text-xl md:text-2xl mb-1" style={{ color: colors.textPrimary }}>
                  Sign in
                </Text>
                <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>
                  Enter your details below
                </Text>
              </View>

              {error && (
                <View className="bg-red-500/10 p-3 rounded-xl mb-4 border border-red-500/20">
                  <Text className="text-red-400 font-inter text-center text-xs">{error}</Text>
                </View>
              )}

              {/* Form Input fields */}
              <View className="gap-y-3 mb-2">
                <View>
                  <Text className="font-inter-medium text-xs mb-1.5" style={{ color: colors.textPrimary }}>Email Address</Text>
                  <TextInput
                    className="px-4 py-2.5 rounded-xl font-inter text-sm border"
                    style={{ backgroundColor: colors.cardSurface, color: colors.textPrimary, borderColor: colors.border }}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.textSecondary}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View>
                  <Text className="font-inter-medium text-xs mb-1.5" style={{ color: colors.textPrimary }}>Password</Text>
                  <TextInput
                    className="px-4 py-2.5 rounded-xl font-inter text-sm border"
                    style={{ backgroundColor: colors.cardSurface, color: colors.textPrimary, borderColor: colors.border }}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                  />
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity className="self-end mb-4" onPress={handleForgotPassword}>
                <Text className="font-inter-medium text-xs" style={{ color: colors.accent }}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                className="w-full py-3.5 rounded-xl items-center mb-4"
                style={{ backgroundColor: colors.accent, opacity: loading ? 0.7 : 1 }}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.accentText} size="small" />
                ) : (
                  <Text className="font-inter-bold text-sm tracking-wider uppercase" style={{ color: colors.accentText }}>
                    Sign In
                  </Text>
                )}
              </TouchableOpacity>

              {/* OAuth divider */}
              <View className="flex-row items-center mb-4">
                <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
                <Text className="px-3 font-inter text-[11px]" style={{ color: colors.textSecondary }}>Or continue with</Text>
                <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
              </View>

              {/* Social Login Placeholders */}
              <View className="flex-row gap-x-3 mb-6">
                <TouchableOpacity 
                  onPress={() => handleOAuthPress('Google')} 
                  className="flex-1 flex-row justify-center items-center py-2.5 border rounded-xl" 
                  style={{ borderColor: colors.border, backgroundColor: colors.cardSurface }}
                >
                  <FontAwesome5 name="google" size={14} color={colors.textPrimary} />
                  <Text className="font-inter-medium text-xs ml-2" style={{ color: colors.textPrimary }}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleOAuthPress('Apple')} 
                  className="flex-1 flex-row justify-center items-center py-2.5 border rounded-xl" 
                  style={{ borderColor: colors.border, backgroundColor: colors.cardSurface }}
                >
                  <FontAwesome5 name="apple" size={14} color={colors.textPrimary} />
                  <Text className="font-inter-medium text-xs ml-2" style={{ color: colors.textPrimary }}>Apple</Text>
                </TouchableOpacity>
              </View>

              {/* Navigation to Welcome-Intro */}
              <View className="flex-row justify-center items-center mt-2">
                <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/welcome-intro')}>
                  <Text className="font-inter-bold text-xs" style={{ color: colors.accent }}>Sign up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
