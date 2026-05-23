import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { getCourses, getUserCourses, getLeaderboard, getPointTransactions } from '@/lib/db';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import Skeleton from '@/components/Skeleton';
import { PlatformFooter } from '@/components/PlatformFooter';
import { useTheme } from '@/lib/useTheme';
import { DESIGN, getAvatarColour } from '@/lib/design';
import { CURRENCY_CONFIG } from '@/lib/currency';

const CATEGORIES = ['Recommended', 'Career Path', 'Trending', 'Free', 'Pro', 'Discounted', 'Certificates'];

// Mock images for courses based on IDs or deterministic logic
const getCourseImage = (id: string, color: string) => {
  return `https://placehold.co/400x225/${color.replace('#', '')}/FFFFFF/png?text=Course+Cover`;
};

const TIERS = [
  { level: 1, name: 'Novice', minPoints: 0, color: '#9CA3AF' },
  { level: 2, name: 'Intermediate', minPoints: 500, color: '#3B82F6' },
  { level: 3, name: 'Advanced', minPoints: 2000, color: '#8B5CF6' },
  { level: 4, name: 'Expert', minPoints: 5000, color: '#F59E0B' },
  { level: 5, name: 'Master', minPoints: 10000, color: '#EF4444' },
];

export default function LearnScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { colors, mode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [userCourses, setUserCourses] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Recommended');
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);

  const pts = profile?.points || 0;
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'K';
  const earnedDollars = pts * CURRENCY_CONFIG.COIN_TO_USD;

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile?.id]);

  const fetchData = async () => {
    if (!profile) return;
    try {
      const [allCourses, enrolledCourses, lbData] = await Promise.all([
        getCourses(),
        getUserCourses(profile.id),
        getLeaderboard()
      ]);
      setCourses(allCourses);
      setUserCourses(enrolledCourses);
      setLeaderboard(lbData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const currentTier = useMemo(() => {
    const pts = profile?.points || 0;
    return TIERS.slice().reverse().find(t => pts >= t.minPoints) || TIERS[0];
  }, [profile?.points]);

  const nextTier = useMemo(() => {
    return TIERS.find(t => t.level === currentTier.level + 1);
  }, [currentTier]);

  const tierProgress = useMemo(() => {
    if (!nextTier) return 100;
    const pointsInCurrentTier = (profile?.points || 0) - currentTier.minPoints;
    const pointsNeededForNext = nextTier.minPoints - currentTier.minPoints;
    return Math.min(100, Math.max(0, (pointsInCurrentTier / pointsNeededForNext) * 100));
  }, [profile?.points, currentTier, nextTier]);

  const getStandardCardStyle = () => {
    const isLight = mode === 'light';
    return {
      backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
      borderRadius: DESIGN.radius.lg,
      borderWidth: 1,
      borderColor: isLight ? '#F0F0F0' : 'rgba(255,255,255,0.1)',
      padding: DESIGN.cardPadding.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isLight ? 0.08 : 0.4,
      shadowRadius: 8,
      elevation: 4,
    };
  };

  const filteredCourses = useMemo(() => {
    let filtered = courses;
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(query) || 
        (c.skills && c.skills.some((s: string) => s.toLowerCase().includes(query)))
      );
    }
    // Limit to just a few for the grid
    return filtered.slice(0, 4);
  }, [courses, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.backgroundPrimary }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* Main Grid Wrapper */}
        <View className="w-full max-w-[1500px] mx-auto px-4 md:px-8 py-8 flex-col lg:flex-row gap-8">
          
          {/* ================= LEFT SIDEBAR ================= */}
          <View 
            className={`flex-col gap-6 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:w-20' : 'w-full lg:w-64 flex-shrink-0'}`}
            style={{ position: 'relative' }}
          >
            {/* Collapse Toggle */}
            <View className="hidden lg:flex" style={{ position: 'absolute', right: -12, top: '50%', transform: [{ translateY: -12 }], zIndex: 50 }}>
              <TouchableOpacity 
                onPress={toggleSidebar} 
                className="items-center justify-center" 
                style={{ 
                  width: 24, 
                  height: 24, 
                  borderRadius: 9999, 
                  borderWidth: 1, 
                  borderColor: colors.border, 
                  backgroundColor: colors.backgroundPrimary,
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3 
                }}
              >
                <Feather name={isSidebarCollapsed ? "chevron-right" : "chevron-left"} size={12} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* 1. User Identity Card */}
            <View 
              className="shadow-xl items-center" 
              style={{ 
                backgroundColor: '#0B2D2C', 
                borderRadius: 20, 
                borderWidth: 0,
                padding: isSidebarCollapsed ? 12 : 20,
                shadowColor: '#0B2D2C',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 16,
                elevation: 8 
              }}
            >
              <TouchableOpacity onPress={() => router.push('/(tabs)/profile' as any)}>
                <View 
                  className="rounded-full justify-center items-center mb-2 border-2" 
                  style={{ 
                    width: isSidebarCollapsed ? 40 : 48, 
                    height: isSidebarCollapsed ? 40 : 48, 
                    backgroundColor: '#CCDF1A',
                    borderColor: 'rgba(255,255,255,0.1)'
                  }}
                >
                  <Text className="font-inter-bold text-[#0B2D2C]" style={{ fontSize: isSidebarCollapsed ? 14 : 16 }}>{initials}</Text>
                </View>
              </TouchableOpacity>
              
              {!isSidebarCollapsed && (
                <>
                  <Text className="font-inter-bold text-sm mb-1 text-center text-white">{profile?.full_name}</Text>
                  
                  {/* Availability Pill inside the dark card */}
                  <View 
                    className="flex-row items-center px-3.5 py-1.5 rounded-full border mb-3 mt-1" 
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.08)', 
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderWidth: 1
                    }}
                  >
                    <View 
                      style={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: 9999, 
                        backgroundColor: '#1D9E75',
                        marginRight: 6
                      }} 
                    />
                    <Text className="font-inter text-xs text-white">Available now</Text>
                  </View>

                  <View className="px-3 py-1 rounded-full mb-4 bg-[#CCDF1A]">
                    <Text className="font-inter-bold text-[10px] text-[#0B2D2C]">{currentTier.name}</Text>
                  </View>
                  
                  <View className="w-full border-t pt-3 flex-row justify-between" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                    <View className="items-center flex-1">
                      <Text className="font-inter text-[10px] mb-1 text-white/60">Points</Text>
                      <Text className="font-inter-bold text-xs text-[#CCDF1A]">{pts.toLocaleString()}</Text>
                    </View>
                    <View className="w-[1px] h-full" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
                    <View className="items-center flex-1">
                      <Text className="font-inter text-[10px] mb-1 text-white/60">Balance</Text>
                      <Text className="font-inter-bold text-xs text-[#CCDF1A]">{earnedDollars.toFixed(2)}</Text>
                    </View>
                  </View>
                </>
              )}
            </View>

            {!isSidebarCollapsed && (
              <>
            
            {/* Career Path Box */}
            <View style={getStandardCardStyle()}>
              <Text className="font-inter-bold text-[10px] uppercase mb-4" style={{ color: colors.textSecondary }}>Your Career Path</Text>
              
              <View className="flex-row items-center mb-6">
                <View className="w-10 h-10 rounded-lg items-center justify-center mr-3 bg-purple-500/20 border border-purple-500/30">
                  <Feather name="shield" size={18} color="#A855F7" />
                </View>
                <View>
                  <Text className="font-inter-bold text-sm" style={{ color: colors.textPrimary }}>IT Support Specialist</Text>
                  <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Tier {currentTier.level || 1} / {currentTier.name}</Text>
                </View>
              </View>

              <View className="mb-6">
                <View className="flex-row justify-between mb-2">
                  <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Progress to Tier {nextTier?.level || (currentTier.level || 1)}</Text>
                  <Text className="font-inter-bold text-xs" style={{ color: colors.textPrimary }}>{Math.round(tierProgress)}%</Text>
                </View>
                <View className="w-full h-1.5 rounded-full overflow-hidden bg-gray-500/20">
                  <View className="h-full rounded-full" style={{ width: `${tierProgress}%`, backgroundColor: colors.accent }} />
                </View>
              </View>

              <Text className="font-inter-medium text-xs mb-3" style={{ color: colors.textPrimary }}>Recommended focus</Text>
              <View className="flex-row flex-wrap gap-2 mb-6">
                {['Networking', 'Active Directory', 'Microsoft 365'].map(tag => (
                  <View key={tag} className="px-2.5 py-1 rounded-md border" style={{ borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                    <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>{tag}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity className="w-full py-2.5 rounded-lg items-center border" style={{ borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <Text className="font-inter-medium text-xs" style={{ color: colors.textPrimary }}>View Roadmap  {'>'}</Text>
              </TouchableOpacity>
            </View>

            {/* Learning XP */}
            <View style={{ ...getStandardCardStyle(), flexDirection: 'row', alignItems: 'center' }}>
              <View className="w-10 h-10 rounded-full items-center justify-center mr-4 bg-yellow-500/20 border border-yellow-500/30">
                <Feather name="award" size={18} color="#F59E0B" />
              </View>
              <View>
                <Text className="font-inter-bold text-[10px] uppercase mb-1" style={{ color: colors.textSecondary }}>Learning XP</Text>
                <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>{(profile?.points || 0).toLocaleString()} pts</Text>
                <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>Total XP Earned</Text>
              </View>
            </View>

            {/* Next Badge */}
            <View style={getStandardCardStyle()}>
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-4 bg-indigo-500/20 border border-indigo-500/30">
                  <Feather name="shield" size={18} color="#6366F1" />
                </View>
                <View>
                  <Text className="font-inter-bold text-[10px] uppercase mb-1" style={{ color: colors.textSecondary }}>Next Badge</Text>
                  <Text className="font-inter-bold text-sm" style={{ color: colors.textPrimary }}>Cloud Associate</Text>
                  <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>+150 pts to unlock</Text>
                </View>
              </View>
              <View className="w-full h-1.5 rounded-full overflow-hidden bg-gray-500/20">
                <View className="h-full rounded-full" style={{ width: `65%`, backgroundColor: colors.accent }} />
              </View>
            </View>

            {/* Streak */}
            <View style={getStandardCardStyle()}>
              <View className="flex-row items-center mb-4">
                <View className="mr-3">
                  <Text className="font-inter-bold text-2xl text-orange-500">🔥</Text>
                </View>
                <View>
                  <Text className="font-inter-bold text-[10px] uppercase mb-1" style={{ color: colors.textSecondary }}>Streak</Text>
                  <Text className="font-inter-bold text-base" style={{ color: colors.textPrimary }}>7 days</Text>
                  <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>Great job!</Text>
                </View>
              </View>
              <Text className="font-inter-medium text-xs mb-3" style={{ color: colors.textPrimary }}>Complete 1 lesson today{"\n"}to maintain your streak</Text>
              <View className="flex-row justify-between mb-1 mt-2">
                {['M','T','W','T','F','S','S'].map((day, i) => (
                  <View key={i} className="items-center">
                    <View className={`w-5 h-5 rounded-full items-center justify-center mb-1 ${i < 5 ? 'bg-accent' : 'bg-white/10'}`}>
                      {i < 5 && <Feather name="check" size={12} color={colors.accentText} />}
                    </View>
                    <Text className="font-inter-bold text-[10px]" style={{ color: colors.textSecondary }}>{day}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Bookmarked Courses */}
            <View style={getStandardCardStyle()}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-inter-bold text-[10px] uppercase" style={{ color: colors.textSecondary }}>Bookmarked Courses</Text>
                <Text className="font-inter text-[10px]" style={{ color: colors.accent }}>View all</Text>
              </View>
              <View className="flex-col gap-4">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-md items-center justify-center mr-3 bg-blue-500/20">
                     <Text className="font-inter-bold text-xs text-blue-500">A</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs" style={{ color: colors.textPrimary }}>Azure Fundamentals</Text>
                    <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>Microsoft Learn</Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-md items-center justify-center mr-3 bg-red-500/20">
                     <Text className="font-inter-bold text-xs text-red-500">C</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-bold text-xs" style={{ color: colors.textPrimary }}>CompTIA Network+</Text>
                    <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>CompTIA</Text>
                  </View>
                </View>
              </View>
            </View>

              </>
            )}
          </View>

          {/* ================= MIDDLE COLUMN (Feed) ================= */}
          <View className="w-full lg:flex-1 min-w-0">
            <View className="mb-6">
              <Text className="font-inter-bold text-3xl mb-1" style={{ color: colors.textPrimary }}>Learning Hub</Text>
              <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>Learn skills, earn points, and grow your career</Text>
            </View>

            {/* Search Bar */}
            <View 
              className="flex-row items-center border px-5 py-3 mb-6" 
              style={{ 
                backgroundColor: colors.cardSurface, 
                borderColor: searchFocused ? '#CCDF1A' : colors.border,
                borderRadius: 12,
                borderWidth: 1,
                shadowColor: '#CCDF1A',
                shadowOpacity: searchFocused ? 0.2 : 0,
                shadowRadius: searchFocused ? 4 : 0,
              }}
            >
              <Feather name="search" size={18} color={colors.textSecondary} className="mr-3" />
              <TextInput 
                className="flex-1 font-inter text-sm outline-none"
                style={{ color: colors.textPrimary, outlineStyle: 'none' } as any}
                placeholder="Search skills, certifications, careers, technologies..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </View>

            {/* Category Pills */}
            <View className="mb-8">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {CATEGORIES.map(cat => {
                  const isActive = selectedCategory === cat;
                  return (
                    <TouchableOpacity 
                      key={cat}
                      onPress={() => setSelectedCategory(cat)}
                      style={{
                        backgroundColor: isActive ? (mode === 'dark' ? '#CCDF1A' : '#0B2D2C') : 'transparent',
                        borderWidth: isActive ? 0 : 1.5,
                        borderColor: isActive ? 'transparent' : colors.border,
                        borderRadius: 9999,
                        paddingHorizontal: 16,
                        paddingVertical: 7,
                        marginRight: 8,
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                    >
                      {isActive && <Feather name="star" size={12} color={isActive ? (mode === 'dark' ? '#0B2D2C' : '#FFFFFF') : colors.textSecondary} className="mr-2" />}
                      <Text 
                        className="font-inter-medium" 
                        style={{ 
                          color: isActive ? (mode === 'dark' ? '#0B2D2C' : '#FFFFFF') : colors.textSecondary,
                          fontSize: 13,
                          fontWeight: isActive ? '600' : '400'
                        }}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>

            {/* Continue Learning Card */}
            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>Continue Learning</Text>
                <Text className="font-inter-medium text-xs" style={{ color: colors.accent }}>View all</Text>
              </View>
              
              <View style={{ ...getStandardCardStyle(), flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 24, padding: 24, marginBottom: 0 }}>
                <View className="w-full md:w-64 h-36 rounded-xl bg-blue-600 items-center justify-center overflow-hidden relative">
                  {/* Decorative background */}
                  <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-10 -mr-10" />
                  <View className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full -mb-8 -ml-8" />
                  <View className="flex-row items-center mb-2">
                    <Feather name="grid" size={16} color="white" className="mr-2" />
                    <Text className="font-inter-bold text-white text-xs">Microsoft</Text>
                  </View>
                  <Text className="font-inter-bold text-white text-xl text-center leading-tight">Azure Fundamentals</Text>
                </View>
                
                <View className="flex-1 min-w-[200px] w-full">
                  <Text className="font-inter-bold text-xl mb-1" style={{ color: colors.textPrimary }}>Microsoft Azure Fundamentals (AZ-900)</Text>
                  <Text className="font-inter text-sm mb-6" style={{ color: colors.textSecondary }}>Microsoft Learn</Text>
                  
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>35% Completed</Text>
                    <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>2 of 6 modules</Text>
                  </View>
                  <View className="w-full h-1.5 rounded-full overflow-hidden bg-white/10 mb-6">
                    <View className="h-full rounded-full" style={{ width: `35%`, backgroundColor: colors.accent }} />
                  </View>
                  
                  <TouchableOpacity className="px-6 py-2.5 rounded-lg self-start" style={{ backgroundColor: colors.accent }}>
                    <Text className="font-inter-bold text-sm" style={{ color: colors.accentText }}>Resume Learning</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Recommended for your career path */}
            <View className="mb-10">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>Recommended for your career path</Text>
                <Text className="font-inter-medium text-xs" style={{ color: colors.accent }}>View all</Text>
              </View>
              
              <View className="flex-row flex-wrap gap-4">
                {[
                  { title: 'CompTIA A+ Core 1 & 2', provider: 'Coursera', tag: 'IT SUPPORT', badge: 'FREE', rating: 4.8, count: '2.5k', color: '#10B981', action: 'Enroll Free', btnColor: colors.accent, imgColor: '#FFFFFF', icon: 'monitor', textColor: '#000000', id: 'course_1' },
                  { title: 'CCNA: Introduction to Networks', provider: 'Cisco', tag: 'NETWORKING', badge: 'PRO', rating: 4.7, count: '1.8k', color: '#3B82F6', action: 'Go Pro to Enroll', btnColor: '#8B5CF6', imgColor: '#1E3A8A', icon: 'share-2', textColor: '#FFFFFF', id: 'course_2' },
                  { title: 'Cybersecurity Fundamentals', provider: 'Udemy', tag: 'SECURITY', badge: '-30%', rating: 4.6, count: '3.1k', color: '#F59E0B', action: 'View Course', btnColor: 'transparent', btnBorder: true, imgColor: '#0F172A', icon: 'shield', textColor: '#FFFFFF', id: 'course_3' },
                  { title: 'Windows Server 2022 Essentials', provider: 'Microsoft Learn', tag: 'SYSTEMS', badge: 'FREE', rating: 4.5, count: '1.2k', color: '#3B82F6', action: 'Enroll Free', btnColor: colors.accent, imgColor: '#0284C7', icon: 'server', textColor: '#FFFFFF', id: 'course_4' }
                ].map((course, i) => {
                  const isHovered = hoveredCourseId === course.id;
                  const baseCardStyle = getStandardCardStyle();
                  const cardStyle = {
                    ...baseCardStyle,
                    flex: 1,
                    minWidth: 200,
                    maxWidth: 280,
                    marginBottom: 0,
                    borderColor: isHovered ? '#CCDF1A' : baseCardStyle.borderColor,
                    shadowOpacity: isHovered ? (mode === 'light' ? 0.14 : 0.5) : baseCardStyle.shadowOpacity,
                  };
                  return (
                    <TouchableOpacity 
                      key={i} 
                      style={cardStyle}
                      {...{
                        onMouseEnter: () => setHoveredCourseId(course.id),
                        onMouseLeave: () => setHoveredCourseId(null)
                      } as any}
                    >
                      {/* Course Image Header */}
                      <View className="w-full h-32 rounded-xl mb-4 items-center justify-center relative overflow-hidden" style={{ backgroundColor: course.imgColor }}>
                        {/* Top Badges overlay */}
                        <View className="absolute top-2 left-2 px-2 py-0.5 rounded border" style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.2)' }}>
                          <Text className="font-inter-bold text-[8px] text-white">{course.tag}</Text>
                        </View>
                        <View className="absolute top-2 right-2 px-2 py-0.5 rounded" style={{ backgroundColor: course.badge === 'FREE' ? '#10B981' : course.badge === 'PRO' ? '#8B5CF6' : '#F97316' }}>
                          <Text className="font-inter-bold text-[8px] text-white">{course.badge}</Text>
                        </View>
                        <Feather name={course.icon as any} size={32} color={course.textColor} className="opacity-80" />
                        <Text className="font-inter-bold mt-2 text-center px-4 leading-tight text-sm" style={{ color: course.textColor }}>{course.title}</Text>
                      </View>
                      
                      <Text className="font-inter-bold text-sm mb-1" style={{ color: colors.textPrimary }} numberOfLines={2}>{course.title}</Text>
                      <Text className="font-inter text-[10px] mb-3" style={{ color: colors.textSecondary }}>Beginner • 18 hrs • {course.provider}</Text>
                      
                      <View className="flex-row items-center justify-between mb-4 pb-4 border-b" style={{ borderColor: colors.border }}>
                        <View className="flex-row items-center">
                          <View className="flex-row mr-1">
                            {[1,2,3,4,5].map(s => <Feather key={s} name="star" size={10} color={s <= Math.floor(course.rating) ? "#FBBF24" : colors.textSecondary} />)}
                          </View>
                          <Text className="font-inter-bold text-[10px]" style={{ color: colors.textPrimary }}>{course.rating}</Text>
                          <Text className="font-inter text-[10px] ml-1" style={{ color: colors.textSecondary }}>({course.count})</Text>
                        </View>
                        <Text className="font-inter-bold text-[10px]" style={{ color: course.badge === 'FREE' ? '#10B981' : colors.accent }}>+50 XP</Text>
                      </View>
                      
                      <TouchableOpacity 
                        className={`w-full py-2.5 rounded-lg items-center ${course.btnBorder ? 'border' : ''}`}
                        style={{ 
                          backgroundColor: course.btnColor !== 'transparent' ? course.btnColor : 'transparent',
                          borderColor: course.btnBorder ? colors.accent : 'transparent'
                        }}
                      >
                        <Text className="font-inter-bold text-xs" style={{ color: course.btnBorder ? colors.accentText : (course.btnColor === colors.accent ? colors.accentText : '#FFFFFF') }}>
                          {course.action}
                        </Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Career Roadmap */}
            <View style={getStandardCardStyle()}>
              <View className="flex-row justify-between items-center mb-8">
                <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>Career Roadmap</Text>
                <Text className="font-inter-medium text-xs" style={{ color: colors.accent }}>View full roadmap</Text>
              </View>

              <View className="flex-row items-center justify-between px-2">
                {[
                  { label: 'IT Intern', status: 'Completed', icon: 'check', color: '#10B981' },
                  { label: 'IT Support Technician', status: 'Completed', icon: 'check', color: '#10B981' },
                  { label: 'Mid-Level Support', status: 'In Progress', icon: 'clock', color: '#F59E0B' },
                  { label: 'Senior Support Specialist', status: 'Locked', icon: 'lock', color: colors.textSecondary },
                  { label: 'System Administrator', status: 'Locked', icon: 'lock', color: colors.textSecondary },
                  { label: 'Cloud Engineer', status: 'Locked', icon: 'lock', color: colors.textSecondary }
                ].map((node, i, arr) => (
                  <View key={i} className="flex-1 items-center relative">
                    {/* Connecting Line */}
                    {i < arr.length - 1 && (
                      <View className="absolute top-4 left-[50%] right-[-50%] h-0.5 z-0" style={{ backgroundColor: i < 2 ? '#10B981' : colors.border }} />
                    )}
                    
                    <View className="w-8 h-8 rounded-full items-center justify-center mb-3 z-10" style={{ backgroundColor: colors.backgroundPrimary, borderWidth: 2, borderColor: node.color }}>
                      <Feather name={node.icon as any} size={12} color={node.color} />
                    </View>
                    
                    <Text className="font-inter-medium text-[10px] text-center mb-1" style={{ color: colors.textPrimary }}>{node.label}</Text>
                    <Text className="font-inter text-[9px] text-center" style={{ color: node.status === 'In Progress' ? '#F59E0B' : colors.textSecondary }}>{node.status}</Text>
                  </View>
                ))}
              </View>
            </View>

          </View>

          {/* ================= RIGHT SIDEBAR ================= */}
          <View className="w-full lg:w-[320px] flex-shrink-0 flex-col gap-6">
            
            {/* Your Progress */}
            <View style={getStandardCardStyle()}>
              <Text className="font-inter-bold text-[10px] uppercase mb-4" style={{ color: colors.textSecondary }}>Your Progress</Text>
              
              <View className="flex-row items-center mb-6">
                <View className="w-20 h-20 rounded-full border-[6px] items-center justify-center mr-6" style={{ borderColor: colors.accent, borderRightColor: colors.border }}>
                  <Text className="font-inter-bold text-xl" style={{ color: colors.textPrimary }}>82%</Text>
                  <Text className="font-inter text-[8px]" style={{ color: colors.textSecondary }}>Profile Complete</Text>
                </View>
                
                <View className="flex-1 gap-y-2">
                  <View className="flex-row items-center">
                    <Feather name="check-circle" size={12} color="#10B981" className="mr-2" />
                    <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>Add Skills</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Feather name="check-circle" size={12} color="#10B981" className="mr-2" />
                    <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>Take Assessment</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Feather name="check-circle" size={12} color="#10B981" className="mr-2" />
                    <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>Complete Courses</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Feather name="circle" size={12} color={colors.textSecondary} className="mr-2" />
                    <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Earn Certificate</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity className="w-full py-2.5 rounded-lg flex-row items-center justify-center border" style={{ borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <Text className="font-inter-medium text-xs mr-2" style={{ color: colors.textPrimary }}>Complete Profile</Text>
                <Feather name="chevron-right" size={14} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Skills to Improve */}
            <View style={getStandardCardStyle()}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-inter-bold text-[10px] uppercase" style={{ color: colors.textSecondary }}>Skills to Improve</Text>
                <Text className="font-inter text-[10px]" style={{ color: colors.accent }}>View all</Text>
              </View>
              
              <View className="flex-col gap-y-4">
                {[
                  { skill: 'Linux', icon: 'terminal', val: 60 },
                  { skill: 'PowerShell', icon: 'command', val: 45 },
                  { skill: 'Azure', icon: 'cloud', val: 30 },
                  { skill: 'Networking', icon: 'globe', val: 70 },
                ].map(item => (
                  <View key={item.skill}>
                    <View className="flex-row items-center justify-between mb-1">
                      <View className="flex-row items-center">
                        <View className="w-5 h-5 rounded border items-center justify-center mr-2" style={{ borderColor: colors.border }}>
                          <Feather name={item.icon as any} size={10} color={colors.textPrimary} />
                        </View>
                        <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>{item.skill}</Text>
                      </View>
                      <Text className="font-inter-bold text-[10px]" style={{ color: colors.textPrimary }}>{item.val}%</Text>
                    </View>
                    <View className="w-full h-1 rounded-full bg-white/10 ml-7 w-auto flex-1 mt-1">
                      <View className="h-full rounded-full" style={{ width: `${item.val}%`, backgroundColor: colors.accent }} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Weekly Goal */}
            <View style={getStandardCardStyle()}>
              <Text className="font-inter-bold text-[10px] uppercase mb-4" style={{ color: colors.textSecondary }}>Weekly Goal</Text>
              <View className="flex-row justify-between items-end mb-2">
                <Text className="font-inter-bold text-sm" style={{ color: colors.textPrimary }}>2/3 modules completed</Text>
                <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>3d</Text>
              </View>
              <View className="w-full h-1.5 rounded-full overflow-hidden bg-white/10 mb-3">
                <View className="h-full rounded-full" style={{ width: `66%`, backgroundColor: colors.accent }} />
              </View>
              <View className="flex-row items-center">
                <Feather name="award" size={12} color="#F59E0B" className="mr-1.5" />
                <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>Complete 1 more module to earn 100 XP</Text>
              </View>
            </View>

            {/* Top Learners */}
            <View style={getStandardCardStyle()}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-inter-bold text-[10px] uppercase" style={{ color: colors.textSecondary }}>Top Learners</Text>
                <View className="flex-row items-center">
                  <Text className="font-inter text-[10px] mr-1" style={{ color: colors.textSecondary }}>This Week</Text>
                  <Feather name="chevron-down" size={10} color={colors.textSecondary} />
                </View>
              </View>
              
              <View className="flex-col gap-y-4 mb-4">
                {leaderboard.slice(0, 3).map((user, idx) => (
                  <View key={user.id} className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Text className="font-inter-bold text-[10px] w-4 text-center mr-2" style={{ color: idx === 0 ? '#F59E0B' : colors.textSecondary }}>{idx + 1}</Text>
                      <View className="w-6 h-6 rounded-full bg-blue-500/20 items-center justify-center mr-2">
                        <Text className="font-inter-bold text-[8px] text-blue-500">
                          {user.full_name?.split(' ').map((n:string)=>n[0]).join('').substring(0,2)}
                        </Text>
                      </View>
                      <Text className="font-inter-medium text-xs" style={{ color: colors.textPrimary }}>{user.full_name}</Text>
                    </View>
                    <Text className="font-inter-bold text-[10px]" style={{ color: colors.textSecondary }}>{user.points.toLocaleString()} XP</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity className="w-full py-2.5 rounded-lg flex-row items-center justify-center border" style={{ borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <Text className="font-inter-medium text-xs" style={{ color: colors.textPrimary }}>View Leaderboard</Text>
              </TouchableOpacity>
            </View>

            {/* Learning Partners */}
            <View style={getStandardCardStyle()}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-inter-bold text-[10px] uppercase" style={{ color: colors.textSecondary }}>Learning Partners</Text>
                <Text className="font-inter text-[10px]" style={{ color: colors.accent }}>View all</Text>
              </View>
              <View className="flex-row flex-wrap gap-4 items-center justify-between">
                <Text className="font-inter-bold text-xs" style={{ color: colors.textSecondary }}>Coursera</Text>
                <Text className="font-inter-bold text-xs" style={{ color: colors.textSecondary }}>Udemy</Text>
                <Text className="font-inter-bold text-xs" style={{ color: colors.textSecondary }}>Microsoft Learn</Text>
                <Text className="font-inter-bold text-xs" style={{ color: colors.textSecondary }}>Cisco</Text>
                <Text className="font-inter-bold text-xs" style={{ color: colors.textSecondary }}>Google</Text>
                <Text className="font-inter-bold text-xs" style={{ color: colors.textSecondary }}>CompTIA</Text>
              </View>
            </View>

          </View>
          
        </View>
      </ScrollView>
    </View>
  );
}
