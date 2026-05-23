import React from 'react';
import { View, Text, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/useTheme';

export function PlatformFooter() {
  const router = useRouter();
  const { colors } = useTheme();
  const currentYear = new Date().getFullYear();

  const openSocialLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error("Could not load URL context:", err));
  };

  const handleMockupPress = (feature: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${feature} is currently under development.`);
    } else {
      Alert.alert("Coming Soon", `${feature} is currently under development.`);
    }
  };

  return (
    <View className="w-full border-t mt-12 px-6 py-8 md:py-12" style={{ backgroundColor: colors.backgroundSecondary, borderTopColor: colors.border }}>
      <View className="w-full max-w-5xl mx-auto">
        
        <View className="flex-row flex-wrap justify-between pb-8 border-b" style={{ borderBottomColor: colors.border }}>
          
          <View className="space-y-3 w-[45%] md:w-1/4 mb-6 md:mb-0">
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Platform</Text>
            <TouchableOpacity onPress={() => router.push('/learn')} className="py-1">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Learning Hub</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/jobs')} className="py-1">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Job Marketplace</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/community')} className="py-1">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Community Hub</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-3 w-[45%] md:w-1/4 mb-6 md:mb-0">
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Trust & Safety</Text>
            <TouchableOpacity onPress={() => router.push('/profile')} className="py-1">
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Identity Badge Status</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-1" onPress={() => handleMockupPress("24-Hour Escrow Rules")}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>24-Hour Escrow Rules</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-1" onPress={() => handleMockupPress("Verification Guidelines")}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Verification Guidelines</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-3 w-[45%] md:w-1/4 mb-6 md:mb-0">
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Legal</Text>
            <TouchableOpacity className="py-1" onPress={() => handleMockupPress("Privacy Policy")}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-1" onPress={() => handleMockupPress("Terms of Service")}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-1" onPress={() => handleMockupPress("Cookie Management")}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Cookie Management</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-3 w-[45%] md:w-1/4 mb-6 md:mb-0">
            <Text className="text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textSecondary }}>Organization</Text>
            <TouchableOpacity className="py-1" onPress={() => handleMockupPress("About TorestTech")}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>About TorestTech</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-1" onPress={() => handleMockupPress("Platform Feedback")}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Platform Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-1" onPress={() => handleMockupPress("Release Notes v1.0")}>
              <Text className="text-sm" style={{ color: colors.textSecondary }}>Release Notes v1.0</Text>
            </TouchableOpacity>
          </View>

        </View>

        <View className="pt-6 flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          <View className="flex-row items-center space-x-6">
            <TouchableOpacity onPress={() => openSocialLink('https://facebook.com')} className="p-1">
              <FontAwesome5 name="facebook" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSocialLink('https://linkedin.com')} className="p-1">
              <FontAwesome5 name="linkedin" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSocialLink('https://x.com')} className="p-1">
              <FontAwesome5 name="twitter" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openSocialLink('https://youtube.com')} className="p-1">
              <FontAwesome5 name="youtube" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text className="text-xs tracking-tight text-center md:text-right mt-4 md:mt-0" style={{ color: colors.textSecondary }}>
            © {currentYear} KRYD® System Layout. Proprietary Information of TorestTech. All Rights Reserved.
          </Text>

        </View>

      </View>
    </View>
  );
}
