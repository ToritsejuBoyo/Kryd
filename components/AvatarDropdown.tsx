import React from 'react';
import { View, Text, TouchableOpacity, Pressable, Image } from 'react-native';
import { useUserStore } from '../store/userStore';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { useTheme } from '../lib/useTheme';

interface AvatarDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarDropdown({ isOpen, onClose }: AvatarDropdownProps) {
  if (!isOpen) return null;

  const router = useRouter();
  const { profile, isClientMode, setClientMode } = useUserStore();
  const { colors } = useTheme();

  const fullName = profile?.full_name || 'User';
  // Use a fallback image or initials for avatar
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'K';

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onClose();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout processing error:', error);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path as any);
    onClose();
  };

  return (
    <>
      <Pressable onPress={onClose} className="absolute inset-0 z-40 bg-black/10 web:fixed" />

      <View 
        className="absolute right-6 top-16 z-50 w-72 rounded-xl border py-2 shadow-2xl web:fixed"
        style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border }}
      >
        {/* Header section with Avatar and Name */}
        <View className="px-4 py-3 flex-row items-center">
          <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: colors.success }}>
             <Text className="font-inter-bold text-sm text-white">{initials}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-base font-inter-bold tracking-tight" style={{ color: colors.textPrimary }}>{fullName}</Text>
            <Text className="text-xs font-inter" style={{ color: colors.textSecondary }}>{!isClientMode ? 'Freelancer' : 'Client'}</Text>
          </View>
        </View>

        {/* Progress Bar Section (Freelancer Only) */}
        {!isClientMode && (
          <>
            <View className="px-4 pb-4">
              <View className="flex-row justify-between text-center items-center mb-1.5">
                <Text className="text-[10px] uppercase font-inter-bold tracking-wider" style={{ color: colors.success }}>Profile Completeness</Text>
                <Text className="text-[10px] font-inter-bold" style={{ color: colors.textPrimary }}>75%</Text>
              </View>
              <View className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                <View className="h-full w-[75%]" style={{ backgroundColor: colors.success }} />
              </View>
            </View>

            <View className="h-[1px] w-full my-1" style={{ backgroundColor: colors.border }} />
          </>
        )}

        {/* Menu Items */}
        <View className="py-1">
          <TouchableOpacity onPress={() => handleNavigate('/(tabs)')} className="px-4 py-2.5 flex-row items-center">
            <Text className="text-sm font-inter" style={{ color: colors.textPrimary }}>Dashboard</Text>
          </TouchableOpacity>

          {/* View Toggle */}
          <TouchableOpacity onPress={() => { setClientMode(!isClientMode); onClose(); }} className="px-4 py-2.5 flex-row items-center justify-between">
            <Text className="text-sm font-inter" style={{ color: colors.textPrimary }}>View as {isClientMode ? 'Freelancer' : 'Client'}</Text>
            <FontAwesome5 name="exchange-alt" size={12} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNavigate('/profile')} className="px-4 py-2.5 flex-row items-center">
            <Text className="text-sm font-inter" style={{ color: colors.textPrimary }}>Profile Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNavigate('/wallet')} className="px-4 py-2.5 flex-row items-center">
            <Text className="text-sm font-inter" style={{ color: colors.textPrimary }}>My Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNavigate('/(tabs)/community')} className="px-4 py-2.5 flex-row items-center">
            <Text className="text-sm font-inter" style={{ color: colors.textPrimary }}>My Community</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleNavigate('/messages')} className="px-4 py-2.5 flex-row items-center">
            <Text className="text-sm font-inter" style={{ color: colors.textPrimary }}>Messages</Text>
          </TouchableOpacity>

        </View>

        <View className="h-[1px] w-full my-1" style={{ backgroundColor: colors.border }} />

        {/* Logout */}
        <TouchableOpacity onPress={handleSignOut} className="px-4 py-2.5 mt-1 mb-1 flex-row items-center">
          <Text className="text-sm font-inter-medium" style={{ color: '#EF4444' }}>Logout</Text>
        </TouchableOpacity>

      </View>
    </>
  );
}
