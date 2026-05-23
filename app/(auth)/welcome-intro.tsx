import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp, ZoomIn } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

export default function WelcomeIntroScreen() {
  const router = useRouter();

  const handleOAuthPress = (provider: string) => {
    Toast.show({
      type: 'info',
      text1: 'Coming Soon',
      text2: `${provider} sign-in launching soon. Please use email for now.`,
    });
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: '#0B2D2C' }}>
      <View 
        className="flex-grow justify-center items-center px-6 md:px-12 py-12 w-full mx-auto"
        style={{ 
          height: (Platform.OS === 'web' ? '100vh' : '100%') as any, 
          overflow: 'hidden' 
        }}
      >
        <View className="w-full max-w-[500px] flex-col justify-between items-center py-4 flex-grow max-h-[720px]">
          
          {/* 1. Kryd logo */}
          <Animated.View entering={FadeIn.duration(600)} className="flex-row items-center justify-center">
            <Text className="font-inter-bold text-white text-4xl md:text-5xl tracking-widest text-center">
              <Text style={{ color: '#CCDF1A' }}>K</Text>ryd
            </Text>
          </Animated.View>

          {/* 2 & 3. Headline & Subtitle */}
          <View className="items-center w-full my-4">
            <Animated.Text 
              entering={FadeInUp.delay(150).duration(600)} 
              className="font-inter-bold text-center text-white text-3xl md:text-5xl leading-tight mb-4"
            >
              Your IT career,{"\n"}elevated.
            </Animated.Text>
            
            <Animated.Text 
              entering={FadeIn.delay(300).duration(600)} 
              className="font-inter text-center text-sm md:text-base leading-relaxed max-w-sm"
              style={{ color: 'rgba(255,255,255,0.7)' }}
            >
              Join thousands of IT professionals learning, earning, and growing on Kryd.
            </Animated.Text>
          </View>

          {/* 4. Three horizontal feature pills */}
          <Animated.View 
            entering={FadeIn.delay(450).duration(600)} 
            className="flex-row justify-center gap-x-2 md:gap-x-3 w-full mb-6 flex-wrap gap-y-2"
          >
            <View className="flex-row items-center px-3.5 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Text className="text-xs mr-1">⚡</Text>
              <Text className="font-inter-medium text-xs text-white">Learn</Text>
            </View>
            <View className="flex-row items-center px-3.5 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Text className="text-xs mr-1">💰</Text>
              <Text className="font-inter-medium text-xs text-white">Earn</Text>
            </View>
            <View className="flex-row items-center px-3.5 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <Text className="text-xs mr-1">🌍</Text>
              <Text className="font-inter-medium text-xs text-white">Connect</Text>
            </View>
          </Animated.View>

          {/* Google / Apple Sign In Placeholders */}
          <Animated.View 
            entering={FadeIn.delay(520).duration(600)} 
            className="flex-row gap-x-3 w-full max-w-[360px] mb-4"
          >
            <TouchableOpacity 
              onPress={() => handleOAuthPress('Google')} 
              className="flex-1 flex-row justify-center items-center py-2.5 border rounded-xl" 
              style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <FontAwesome5 name="google" size={12} color="white" />
              <Text className="font-inter-medium text-[11px] text-white ml-2">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleOAuthPress('Apple')} 
              className="flex-1 flex-row justify-center items-center py-2.5 border rounded-xl" 
              style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <FontAwesome5 name="apple" size={12} color="white" />
              <Text className="font-inter-medium text-[11px] text-white ml-2">Apple</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* 5. Get Started button */}
          <Animated.View 
            entering={ZoomIn.delay(600).duration(600)} 
            className="w-full max-w-[360px] items-center mb-6"
          >
            <TouchableOpacity
              className="w-full py-3.5 rounded-full items-center justify-center"
              style={{ backgroundColor: '#CCDF1A' }}
              onPress={() => router.push('/(auth)/onboarding/role-select')}
            >
              <Text className="font-inter-bold text-sm tracking-wider uppercase text-[#0B2D2C]">
                Get Started →
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* 6 & 7. Sign in link & Bottom footer strip */}
          <Animated.View 
            entering={FadeIn.delay(750).duration(600)} 
            className="items-center w-full mt-2"
          >
            <View className="flex-row justify-center items-center mb-6">
              <Text className="font-inter text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text className="font-inter-bold text-xs" style={{ color: '#CCDF1A' }}>
                  Sign in
                </Text>
              </TouchableOpacity>
            </View>

            <Text className="font-inter text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 0.5 }}>
              Free to join  ·  No credit card required
            </Text>
          </Animated.View>

        </View>
      </View>
    </SafeAreaView>
  );
}
