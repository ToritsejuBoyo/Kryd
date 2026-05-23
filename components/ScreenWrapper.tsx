import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { useUserStore } from '../store/userStore';
import { useRouter } from 'expo-router';
import { useTheme } from '@/lib/useTheme';
import { FontAwesome5 } from '@expo/vector-icons';
import { PlatformFooter } from './PlatformFooter';

interface ScreenWrapperProps {
  children: React.ReactNode;
  title?: string;
  isTabRoot?: boolean; // True for index, learn, jobs, community pages
  headerLeft?: React.ReactNode; // Optional custom element replacing standard back+title
  headerRight?: React.ReactNode; // Optional custom element on the right
}

export function ScreenWrapper({ children, title, isTabRoot = false, headerLeft, headerRight }: ScreenWrapperProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScrollView 
      className="flex-1"
      style={{ backgroundColor: colors.backgroundPrimary }} 
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Universal Header Navigation Block Section */}
      <View className="w-full border-b py-4 px-6 flex-row items-center z-50 sticky top-0" style={{ backgroundColor: colors.backgroundPrimary, borderBottomColor: colors.border }}>
        <View className="w-full max-w-5xl mx-auto flex-row items-center justify-between">
          
          <View className="flex-row items-center space-x-4 flex-1">
            {headerLeft ? headerLeft : (
              <>
                {/* Standard Back Chevron Link: Completely hidden on root tabs, explicit on inner details */}
                {!isTabRoot && (
                  <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="w-10 h-10 rounded-lg items-center justify-center mr-2 active:opacity-80"
                    style={{ backgroundColor: colors.backgroundSecondary }}
                  >
                    <FontAwesome5 name="chevron-left" size={14} color={colors.textPrimary} />
                  </TouchableOpacity>
                )}
                {title && <Text className="text-xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>{title}</Text>}
              </>
            )}
          </View>

          {/* Right Slot: Custom header right element, or placeholder for symmetry */}
          {headerRight ? headerRight : (
            <View className="w-10 h-10 items-center justify-center opacity-0" />
          )}
        </View>
      </View>

      {/* 2. Constrained Max-Width Screen Canvas Body Frame */}
      <View className="w-full max-w-5xl mx-auto px-4 md:px-8 flex-1 py-6">
        {children}
      </View>

      {/* 3. Global Footer Component mounted persistently at the layout trail base */}
      <PlatformFooter />
    </ScrollView>
  );
}
