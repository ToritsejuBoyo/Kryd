import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export function BrandLogo() {
  const router = useRouter();
  
  return (
    <TouchableOpacity onPress={() => router.push('/(tabs)')} className="flex-row items-center">
      <View className="w-10 h-10 rounded-2xl overflow-hidden items-center justify-center">
        <Image 
          source={require('@/assets/images/kryd-ai-logo.png')} 
          style={{ width: '100%', height: '100%' }} 
          resizeMode="cover"
        />
      </View>
    </TouchableOpacity>
  );
}
