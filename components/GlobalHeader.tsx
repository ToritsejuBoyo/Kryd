import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { BrandLogo } from '@/components/BrandLogo';
import { AvatarDropdown } from '@/components/AvatarDropdown';
import { useUserStore } from '@/store/userStore';
import { getUnreadNotificationCount } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/useTheme';
import { ThemeToggle } from '@/components/ThemeToggle';

export function GlobalHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const profile = useUserStore((state) => state.profile);
  const isClientMode = useUserStore((state) => state.isClientMode);
  const setClientMode = useUserStore((state) => state.setClientMode);
  const { colors, mode, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    if (profile) {
      getUnreadNotificationCount(profile.id).then(setUnreadCount);
      fetchUnreadMessages();
    }
  }, [profile?.id]);

  const fetchUnreadMessages = async () => {
    if (!profile?.id) return;
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('is_read', false)
        .neq('sender_id', profile.id)
        .in('conversation_id', (
          await supabase.from('conversations').select('id').or(`participant_one.eq.${profile.id},participant_two.eq.${profile.id}`)
        ).data?.map(c => c.id) || []);
        
      if (!error && data) {
        setUnreadMessages(data.length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'K';

  return (
    <>
      <View 
        className={`w-full z-50 ${mode === 'light' ? 'border-b-0 shadow-sm' : 'border-b'}`} 
        style={{ 
          backgroundColor: colors.headerBackground, 
          borderBottomColor: mode === 'light' ? 'transparent' : colors.border,
          shadowColor: mode === 'light' ? '#000' : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: mode === 'light' ? 0.02 : 0,
          shadowRadius: 8,
          elevation: mode === 'light' ? 2 : 0
        }}
      >
        <View className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex-row justify-between items-center w-full">
          <View className="flex-row items-center gap-x-6">
            <BrandLogo />

            {/* Upwork style nav links (hidden on mobile) */}
            <View className="hidden md:flex flex-row items-center gap-x-6 ml-4">
              <TouchableOpacity onPress={() => router.push('/(tabs)')}>
                <Text className={`font-inter-medium text-sm transition-colors hover:opacity-80 ${(pathname === '/' || pathname === '/index') ? 'font-bold' : ''}`} style={{ color: (pathname === '/' || pathname === '/index') ? colors.accent : colors.textPrimary }}>Dashboard</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/jobs')}>
                <Text className={`font-inter-medium text-sm transition-colors hover:opacity-80 ${pathname === '/jobs' ? 'font-bold' : ''}`} style={{ color: pathname === '/jobs' ? colors.accent : colors.textPrimary }}>Get Jobs</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/learn')}>
                <Text className={`font-inter-medium text-sm transition-colors hover:opacity-80 ${pathname === '/learn' ? 'font-bold' : ''}`} style={{ color: pathname === '/learn' ? colors.accent : colors.textPrimary }}>Learn</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/wallet')}>
                <Text className={`font-inter-medium text-sm transition-colors hover:opacity-80 ${pathname === '/wallet' ? 'font-bold' : ''}`} style={{ color: pathname === '/wallet' ? colors.accent : colors.textPrimary }}>Wallet</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(tabs)/community')}>
                <Text className={`font-inter-medium text-sm transition-colors hover:opacity-80 ${pathname === '/community' ? 'font-bold' : ''}`} style={{ color: pathname === '/community' ? colors.accent : colors.textPrimary }}>Community</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View className="flex-row items-center gap-x-4">
            
            {/* Theme Toggle */}
            <View className="hidden md:flex mr-2">
              <ThemeToggle />
            </View>
            
            <TouchableOpacity onPress={() => router.push('/(tabs)/messages' as any)} className="relative p-2">
              <Feather name="message-circle" size={20} color={colors.textPrimary} />
              {unreadMessages > 0 && (
                <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2" style={{ borderColor: colors.backgroundPrimary }} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/notifications' as any)} className="relative p-2">
              <Feather name="bell" size={20} color={colors.textPrimary} />
              {unreadCount > 0 && (
                <View className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2" style={{ borderColor: colors.backgroundPrimary }} />
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDropdownOpen(!dropdownOpen)}>
              <View className="w-9 h-9 rounded-full justify-center items-center" style={{ backgroundColor: colors.success }}>
                <Text className="font-inter-bold text-sm" style={{ color: '#FFFFFF' }}>{initials}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Ensure the dropdown renders below the header in the z-index stack */}
      <AvatarDropdown isOpen={dropdownOpen} onClose={() => setDropdownOpen(false)} />
    </>
  );
}
