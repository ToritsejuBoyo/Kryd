import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { getUserCourses, getPointTransactions, addPoints, getJobs, getLeaderboard, getUnreadNotificationCount } from '@/lib/db';
import Skeleton from '@/components/Skeleton';
import CountUpText from '@/components/CountUpText';
import { PlatformFooter } from '@/components/PlatformFooter';
import { useTheme } from '@/lib/useTheme';
import { formatDual, CURRENCY_CONFIG } from '@/lib/currency';
import { DESIGN, getAvatarColour } from '@/lib/design';

const DAILY_CHALLENGES = [
  { q: "What does SSD stand for?", a: "Solid State Drive", wrong: ["Secure Storage Disk", "System State Drive"] },
  { q: "What does DNS stand for?", a: "Domain Name System", wrong: ["Dynamic Network Server", "Digital Naming Service"] },
  { q: "Which port does HTTPS use by default?", a: "443", wrong: ["80", "22"] },
  { q: "What does RAID stand for?", a: "Redundant Array of Independent Disks", wrong: ["Random Access Information Drive", "Rapid Array of Internal Disks"] },
  { q: "What OSI layer does a switch operate at?", a: "Layer 2 — Data Link", wrong: ["Layer 3 — Network", "Layer 1 — Physical"] },
  { q: "What command shows active network connections on Windows?", a: "netstat", wrong: ["ipconfig", "ping"] },
  { q: "What does DHCP assign to devices on a network?", a: "IP addresses", wrong: ["MAC addresses", "Port numbers"] },
];

const AI_TIPS = [
  "Updating your skills section increases profile views by 30%.",
  "A personalized cover letter significantly boosts your interview chances.",
  "Consider getting Azure certified to unlock more remote opportunities.",
  "Networking on Kryd Community can lead to unlisted job offers.",
  "Make sure your availability status is up to date for recruiters.",
  "A 100% complete profile ranks higher in client searches.",
  "Practicing the daily challenge keeps your technical knowledge sharp."
];

export default function Dashboard() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const updatePoints = useUserStore((state) => state.updatePoints);
  const isClientMode = useUserStore((state) => state.isClientMode);
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { colors, mode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  
  const [availability, setAvailability] = useState<'available' | 'open' | 'unavailable'>('available');
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [challengeSuccess, setChallengeSuccess] = useState(false);

  const todayIndex = new Date().getDay();
  const todayChallenge = DAILY_CHALLENGES[todayIndex];
  const todayTip = AI_TIPS[todayIndex];

  const shuffledAnswers = useMemo(() => {
    return [todayChallenge.a, ...todayChallenge.wrong].sort(() => Math.random() - 0.5);
  }, [todayIndex]);

  useEffect(() => {
    if (profile) fetchData();
  }, [profile?.id]);

  const fetchData = async () => {
    if (!profile) return;
    try {
      const [userCoursesData, txData, jobsData, boardData, notifCount] = await Promise.all([
        getUserCourses(profile.id),
        getPointTransactions(profile.id),
        getJobs(),
        getLeaderboard(),
        getUnreadNotificationCount(profile.id)
      ]);
      setCourses(userCoursesData);
      setTransactions(txData);
      const enrichedJobs = jobsData.map((job: any, index: number) => {
        const isVerifiedClient = index % 3 !== 0;
        const aiMatch = 80 + (index * 7 % 16);
        const applicantCount = 5 + (index * 3 % 20);
        const timePosted = `${index + 2} hours ago`;
        const experience_level = index % 2 === 0 ? 'Mid-level' : 'Entry-level';
        return {
          ...job,
          isVerifiedClient,
          aiMatch,
          applicantCount,
          timePosted,
          experience_level
        };
      });
      setJobs(enrichedJobs);
      setLeaderboard(boardData);
      setUnreadCount(notifCount);

      const todayString = new Date().toISOString().split('T')[0];
      const hasCompletedToday = (txData || []).some((tx: any) => 
        tx.reason?.startsWith('daily_challenge') && tx.created_at.startsWith(todayString)
      );
      setChallengeCompleted(hasCompletedToday);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (answer: string) => {
    setSelectedAnswer(answer);
    if (answer === todayChallenge.a && profile) {
      setChallengeSuccess(true);
      try {
        await addPoints(profile.id, 50, 'daily_challenge');
        updatePoints(50);
        fetchData(); 
      } catch (err) {
        console.error(err);
      }
    } else if (profile) {
      setChallengeSuccess(false);
      try {
        await addPoints(profile.id, 0, 'daily_challenge_failed');
        fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const activeCourses = (courses || []).filter((c) => c.progress_percent < 100);
  const totalPointsEarned = (transactions || []).filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
  const earnedDollars = totalPointsEarned * CURRENCY_CONFIG.COIN_TO_USD;

  const firstName = profile?.full_name?.split(' ')[0] || 'User';
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'K';

  const TIERS = [
    { name: 'New Talent', min: 0, max: 499, color: '#9CA3AF', bg: 'rgba(156,163,175,0.2)' },
    { name: 'Intermediate', min: 500, max: 1999, color: '#60A5FA', bg: 'rgba(96,165,250,0.2)' },
    { name: 'Rising Pro', min: 2000, max: 4999, color: '#A78BFA', bg: 'rgba(167,139,250,0.2)' },
    { name: 'Verified Expert', min: 5000, max: 99999, color: '#CCDF1A', bg: 'rgba(204,223,26,0.2)' },
  ];
  const pts = (transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
  const currentTier = TIERS.find(t => pts >= t.min && pts <= t.max) || TIERS[0];
  const progress = (pts - currentTier.min) / (currentTier.max - currentTier.min);
  const nextTierIndex = TIERS.findIndex(t => t.name === currentTier.name) + 1;
  const nextTier = nextTierIndex < TIERS.length ? TIERS[nextTierIndex] : null;

  const topMatchJobs = useMemo(() => {
    return [...(jobs || [])].sort((a, b) => (b.aiMatch || 0) - (a.aiMatch || 0)).slice(0, 3);
  }, [jobs]);

  const cycleAvailability = () => {
    if (availability === 'available') setAvailability('open');
    else if (availability === 'open') setAvailability('unavailable');
    else setAvailability('available');
  };

  const getAvailStatus = () => {
    if (availability === 'available') return { color: colors.success, text: 'Available now' };
    if (availability === 'open') return { color: '#F59E0B', text: 'Open to opportunities' };
    return { color: colors.textSecondary, text: 'Not available' };
  };

  const getStandardCardStyle = () => {
    const isLight = mode === 'light';
    return {
      backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
      borderRadius: DESIGN.radius.lg,
      borderWidth: 1,
      borderColor: isLight ? '#F0F0F0' : 'rgba(255,255,255,0.1)',
      padding: DESIGN.cardPadding.md,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isLight ? 0.08 : 0.4,
      shadowRadius: 8,
      elevation: 4,
    };
  };

  if (loading) {
    return (
      <View className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
        <ScrollView className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-8 flex-col lg:flex-row gap-8" showsVerticalScrollIndicator={false}>
           <View className="w-full lg:w-64">
              <Skeleton className="w-full h-40 rounded-2xl mb-8" />
           </View>
           <View className="flex-1">
              <Skeleton className="w-full h-40 rounded-2xl mb-8" />
              {[1, 2, 3].map(i => <Skeleton key={i} className="w-full h-48 rounded-xl mb-4" />)}
           </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        <View className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 flex-col lg:flex-row gap-8 relative">
          
          {/* ================= LEFT SIDEBAR ================= */}
          <View 
            className={`flex-col gap-6 transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-20' : 'w-full lg:w-64 flex-shrink-0'}`}
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
                  {!isClientMode && (
                    <TouchableOpacity 
                      onPress={cycleAvailability} 
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
                          backgroundColor: availability === 'available' ? '#1D9E75' : availability === 'open' ? '#B47800' : '#888888',
                          marginRight: 6
                        }} 
                      />
                      <Text className="font-inter text-xs text-white">
                        {availability === 'available' ? 'Available now' : availability === 'open' ? 'Open to opportunities' : 'Not available'}
                      </Text>
                    </TouchableOpacity>
                  )}

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

            {/* Daily Challenge */}
            {!isSidebarCollapsed && !isClientMode && (
              <View>
                <Text className="font-inter-bold text-[10px] uppercase mb-2" style={{ color: colors.textSecondary }}>Daily Challenge</Text>
                <TouchableOpacity 
                  onPress={() => !challengeCompleted && setChallengeModalVisible(true)}
                  style={{
                    backgroundColor: colors.cardSurface,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: !challengeCompleted ? 'rgba(204,223,26,0.3)' : colors.border,
                    borderLeftWidth: !challengeCompleted ? 4 : 1,
                    borderLeftColor: !challengeCompleted ? '#CCDF1A' : colors.border,
                    padding: 16,
                  }}
                >
                  <View className="flex-row items-center mb-3">
                    <Text className="text-2xl mr-3">🏆</Text>
                    <View className="flex-1">
                      <Text className="font-inter-bold text-sm mb-0.5" style={{ color: colors.textPrimary }}>Question of the Day</Text>
                      <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Earn +50 pts</Text>
                    </View>
                  </View>
                  {challengeCompleted ? (
                    <View className="flex-row items-center py-2">
                      <Feather name="check-circle" size={14} color={colors.success} className="mr-2" />
                      <Text className="font-inter text-xs" style={{ color: colors.success }}>Completed</Text>
                    </View>
                  ) : (
                    <View className="flex-row justify-between items-center mt-2 pt-3 border-t" style={{ borderColor: 'rgba(204,223,26,0.2)' }}>
                      <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>Answer now</Text>
                      <Feather name="arrow-right" size={14} color={colors.accent} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* 3. Status Summary (Borderless rows with dividers) */}
            {!isSidebarCollapsed && !isClientMode && (
              <View className="px-2">
                <Text className="font-inter-bold text-[10px] uppercase mb-2" style={{ color: colors.textSecondary }}>Status Summary</Text>
                <View className="w-full h-[1px] mb-3" style={{ backgroundColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)' }} />
                <View className="flex-col gap-y-3">
                  <View className="flex-row justify-between items-center py-1 border-b" style={{ borderBottomColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)' }}>
                    <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Applications</Text>
                    <Text className="font-inter-bold text-[13px]" style={{ color: colors.textPrimary }}>4 Active</Text>
                  </View>
                  <View className="flex-row justify-between items-center py-1 border-b" style={{ borderBottomColor: mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)' }}>
                    <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Profile Views</Text>
                    <Text className="font-inter-bold text-[13px]" style={{ color: colors.textPrimary }}>12 this week</Text>
                  </View>
                  <View className="flex-row justify-between items-center py-1">
                    <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Courses</Text>
                    <Text className="font-inter-bold text-[13px]" style={{ color: colors.textPrimary }}>2 In Progress</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* ================= MIDDLE COLUMN (flex-1) ================= */}
          <View className="w-full lg:flex-1 min-w-0 flex-col gap-6">
            
            {/* Hello Bar */}
            <View className="flex-row justify-between items-end border-b pb-4 mb-2" style={{ borderColor: colors.border }}>
              <View>
                <Text className="font-inter-bold text-3xl mb-1" style={{ color: colors.textPrimary }}>HEllo, {firstName} 👋</Text>
                <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</Text>
              </View>
            </View>

            {/* Jobs/Listings Feed */}
            <View>
              <View className="flex-row items-center mb-4 gap-2">
                <View 
                  className="flex-1 flex-row items-center px-4 py-3 border" 
                  style={{ 
                    backgroundColor: colors.backgroundSecondary, 
                    borderColor: searchFocused ? '#CCDF1A' : colors.border,
                    borderRadius: 12,
                    borderWidth: 1,
                    shadowColor: '#CCDF1A',
                    shadowOpacity: searchFocused ? 0.2 : 0,
                    shadowRadius: searchFocused ? 4 : 0,
                  }}
                >
                  <Feather name="search" size={16} color={colors.textSecondary} className="mr-2" />
                  <TextInput 
                    placeholder={!isClientMode ? "Search for jobs..." : "Search candidates..."} 
                    placeholderTextColor={colors.textSecondary}
                    style={{ flex: 1, color: colors.textPrimary, fontFamily: 'Inter_400Regular', fontSize: 14, outlineStyle: 'none' } as any}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                  />
                </View>
                <TouchableOpacity className="p-3 rounded-xl border items-center justify-center" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                  <Feather name="sliders" size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <View className="flex-row gap-2 mb-6 flex-wrap">
                {(!isClientMode ? ['All', 'Remote', 'Contract'] : ['All', 'Active', 'Drafts']).map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => setActiveFilter(filter)}
                      style={{
                        backgroundColor: isActive ? (mode === 'dark' ? '#CCDF1A' : '#0B2D2C') : 'transparent',
                        borderWidth: isActive ? 0 : 1.5,
                        borderColor: isActive ? 'transparent' : colors.border,
                        borderRadius: 9999,
                        paddingHorizontal: 16,
                        paddingVertical: 7,
                      }}
                    >
                      <Text
                        className="font-inter"
                        style={{
                          color: isActive ? (mode === 'dark' ? '#0B2D2C' : '#FFFFFF') : colors.textSecondary,
                          fontSize: 13,
                          fontWeight: isActive ? '600' : '400',
                        }}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View className="flex-col gap-4">
                {!isClientMode ? (
                  topMatchJobs.map(job => {
                    const isHovered = hoveredJobId === job.id;
                    const isLight = mode === 'light';
                    const cardStyle = {
                      backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.06)',
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: isHovered ? '#CCDF1A' : (isLight ? '#F0F0F0' : 'rgba(255,255,255,0.1)'),
                      padding: 20,
                      marginBottom: 12,
                      shadowColor: '#000',
                      shadowOffset: isHovered ? { width: 0, height: 4 } : { width: 0, height: 2 },
                      shadowOpacity: isHovered ? 0.10 : 0.06,
                      shadowRadius: isHovered ? 20 : 12,
                      elevation: isHovered ? 8 : 4,
                    };
                    const skills = job.skills_required || ['Windows Server', 'Active Directory', 'Networking'];
                    const displayedSkills = skills.slice(0, 3);
                    const remainingCount = skills.length - displayedSkills.length;
                    const compInitials = job.company ? job.company[0].toUpperCase() : 'T';

                    return (
                      <TouchableOpacity 
                        key={job.id} 
                        style={cardStyle}
                        onPress={() => router.push(`/job/${job.id}` as any)}
                        {...{
                          onMouseEnter: () => setHoveredJobId(job.id),
                          onMouseLeave: () => setHoveredJobId(null)
                        } as any}
                      >
                        {/* Header Row: Title & Bookmark */}
                        <View className="flex-row justify-between items-start mb-2">
                          <Text className="font-inter-bold text-xl flex-1 mr-4" style={{ color: colors.textPrimary }}>
                            {job.title}
                          </Text>
                          <TouchableOpacity className="p-1 -mr-1 -mt-1">
                            <Feather name="bookmark" size={20} color={colors.textSecondary} />
                          </TouchableOpacity>
                        </View>

                        {/* Client Row: Avatar, Name, Verified Badge, Location */}
                        <View className="flex-row items-center mb-4 flex-wrap gap-y-2">
                          <View 
                            className="w-6 h-6 rounded-full items-center justify-center mr-2"
                            style={{ backgroundColor: getAvatarColour(job.company || 'T') }}
                          >
                            <Text className="text-white font-inter-bold text-[10px]">{compInitials}</Text>
                          </View>
                          <Text className="font-inter-medium text-sm mr-2" style={{ color: colors.textPrimary }}>
                            {job.company}
                          </Text>
                          {job.isVerifiedClient !== false && (
                            <View className="flex-row items-center px-2 py-0.5 rounded-full mr-2" style={{ backgroundColor: 'rgba(29, 158, 117, 0.1)', borderColor: 'rgba(29, 158, 117, 0.2)', borderWidth: 1 }}>
                              <Ionicons name="checkmark-circle-outline" size={12} color="#1D9E75" style={{ marginRight: 2 }} />
                              <Text className="font-inter-bold text-[10px] text-[#1D9E75]">Verified</Text>
                            </View>
                          )}
                          <Text className="font-inter text-xs text-gray-400 mr-2">•</Text>
                          <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={13} color={colors.textSecondary} style={{ marginRight: 2 }} />
                            <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>
                              {job.location || 'Remote'}
                            </Text>
                          </View>
                        </View>

                        {/* Tags Row: Type, Experience, Urgent */}
                        <View className="flex-row gap-2 mb-4 flex-wrap">
                          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)', borderWidth: 1 }}>
                            <Text className="font-inter-medium text-xs text-blue-600">
                              {job.type || 'Full-time'}
                            </Text>
                          </View>
                          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)', borderWidth: 1 }}>
                            <Text className="font-inter-medium text-xs text-amber-600">
                              {job.experience_level || 'Mid-level'}
                            </Text>
                          </View>
                          <View className="px-3 py-1 rounded-full" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1 }}>
                            <Text className="font-inter-medium text-xs text-red-600">Urgent</Text>
                          </View>
                        </View>

                        {/* Skills Row */}
                        <View className="flex-row flex-wrap gap-2 mb-4">
                          {displayedSkills.map((skill: string) => (
                            <View key={skill} className="rounded-md px-2.5 py-1 border" style={{ backgroundColor: isLight ? '#F9FAFB' : 'rgba(255,255,255,0.02)', borderColor: colors.border }}>
                              <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>
                                {skill}
                              </Text>
                            </View>
                          ))}
                          {remainingCount > 0 && (
                            <View className="rounded-md px-2.5 py-1 border" style={{ backgroundColor: isLight ? '#F9FAFB' : 'rgba(255,255,255,0.02)', borderColor: colors.border }}>
                              <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>
                                +{remainingCount} more
                              </Text>
                            </View>
                          )}
                        </View>

                        {/* Divider Line */}
                        <View className="w-full h-[1px] mb-4" style={{ backgroundColor: colors.border }} />

                        {/* Bottom Row: Salary, Applicants & Match/Apply */}
                        <View className="flex-row justify-between items-end flex-wrap gap-y-3">
                          <View>
                            <Text className="font-inter-bold text-lg mb-0.5" style={{ color: '#0a2e2e' }}>
                              {formatDual(job.salary_max || job.salary_min, { showMonthly: true })}
                            </Text>
                            <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>
                              {job.applicantCount || 14} applicants • {job.timePosted || '2 hours ago'}
                            </Text>
                          </View>

                          <View className="flex-row items-center gap-3">
                            <View className="flex-row items-center px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(132, 204, 22, 0.1)', borderColor: 'rgba(132, 204, 22, 0.3)', borderWidth: 1 }}>
                              <View className="w-1.5 h-1.5 rounded-full bg-lime-500" style={{ marginRight: 6 }} />
                              <Text className="font-inter-bold text-xs text-lime-700 dark:text-lime-400">
                                {job.aiMatch || 95}% match
                              </Text>
                            </View>

                            <TouchableOpacity 
                              className="px-4 py-1.5 rounded-lg border bg-white dark:bg-transparent items-center justify-center"
                              style={{ borderColor: colors.border }}
                              onPress={() => router.push(`/job/${job.id}` as any)}
                            >
                              <Text className="font-inter-bold text-sm" style={{ color: colors.textPrimary }}>
                                Apply
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  [1, 2].map((_, idx) => (
                    <View key={idx} style={getStandardCardStyle()}>
                      <View className="flex-row justify-between items-start mb-4">
                        <View>
                          <Text className="font-inter-bold text-lg mb-1" style={{ color: colors.textPrimary }}>Senior React Developer</Text>
                          <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>Posted 2 days ago</Text>
                        </View>
                        <View className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                          <Text className="font-inter-bold text-xs text-green-500">Active</Text>
                        </View>
                      </View>
                      <View className="flex-row items-center justify-between pt-4 border-t" style={{ borderColor: colors.border }}>
                        <Text className="font-inter-medium text-sm" style={{ color: colors.textPrimary }}>12 Applicants</Text>
                        <TouchableOpacity><Text className="font-inter-bold text-sm" style={{ color: colors.accent }}>Review Candidates →</Text></TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>



          </View>

          {/* ================= RIGHT SIDEBAR (w-[280px]) ================= */}
          <View className="hidden xl:flex w-[280px] flex-shrink-0 flex-col gap-6 pt-16">
            
            {/* AI Career Tip */}
            <View 
              style={{ 
                backgroundColor: colors.cardSurface, 
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(204,223,26,0.25)', 
                borderLeftWidth: 4,
                borderLeftColor: '#CCDF1A',
                padding: 16,
              }}
            >
              <View className="flex-row items-center mb-2">
                <Text className="text-sm mr-2">💡</Text>
                <Text className="font-inter-bold text-[10px] uppercase tracking-widest" style={{ color: '#CCDF1A' }}>Tip of the day</Text>
              </View>
              <Text className="font-inter text-sm leading-[1.6]" style={{ color: colors.textPrimary }}>
                {todayTip}
              </Text>
            </View>

            {/* Upcoming on Kryd */}
            <View style={getStandardCardStyle()}>
              <Text className="font-inter-bold text-xs uppercase mb-4" style={{ color: colors.textSecondary }}>Upcoming Events</Text>
              <View className="flex-col gap-y-2">
                
                <View className="flex-row items-start p-3 rounded-xl" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <View 
                    style={{ 
                      backgroundColor: '#0B2D2C', 
                      borderRadius: 8, 
                      width: 44, 
                      height: 44, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight: 12
                    }}
                  >
                    <Text className="font-inter-bold text-[9px] uppercase text-white/70">May</Text>
                    <Text className="font-inter-bold text-lg text-white" style={{ marginTop: -2 }}>24</Text>
                  </View>
                  <View className="flex-1 mt-0.5">
                    <Text className="font-inter-bold text-xs mb-1" style={{ color: colors.textPrimary }}>React Native Workshop</Text>
                    <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>Live Webinar · 2pm</Text>
                  </View>
                </View>

                <View className="flex-row items-start p-3 rounded-xl" style={{ backgroundColor: colors.backgroundSecondary }}>
                  <View 
                    style={{ 
                      backgroundColor: '#0B2D2C', 
                      borderRadius: 8, 
                      width: 44, 
                      height: 44, 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginRight: 12
                    }}
                  >
                    <Text className="font-inter-bold text-[9px] uppercase text-white/70">Jun</Text>
                    <Text className="font-inter-bold text-lg text-white" style={{ marginTop: -2 }}>02</Text>
                  </View>
                  <View className="flex-1 mt-0.5">
                    <Text className="font-inter-bold text-xs mb-1" style={{ color: colors.textPrimary }}>Cybersecurity AMA</Text>
                    <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>Community Chat · 6pm</Text>
                  </View>
                </View>

              </View>
            </View>

          </View>

        </View>

        <PlatformFooter />
      </ScrollView>

      {/* Daily Challenge Modal */}
      <Modal visible={challengeModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center p-4 bg-black/80">
          <View className="w-full max-w-md p-8 rounded-3xl border" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
            <TouchableOpacity onPress={() => setChallengeModalVisible(false)} className="absolute top-4 right-4 p-2 z-10">
              <Feather name="x" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-2xl bg-accent/20 items-center justify-center mb-4 border border-accent/30">
                <Text className="text-3xl">🏆</Text>
              </View>
              <Text className="font-inter-bold text-xl text-center mb-2" style={{ color: colors.textPrimary }}>Daily Challenge</Text>
              <Text className="font-inter text-sm text-center" style={{ color: colors.textSecondary }}>Answer correctly to earn 50 points!</Text>
            </View>

            <View className="p-5 rounded-2xl border mb-6" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border }}>
              <Text className="font-inter-medium text-base text-center" style={{ color: colors.textPrimary }}>
                {todayChallenge.q}
              </Text>
            </View>

            <View className="flex-col gap-y-3">
              {shuffledAnswers.map((ans, idx) => {
                const isSelected = selectedAnswer === ans;
                const isCorrect = ans === todayChallenge.a;
                
                let bgColor = colors.backgroundSecondary;
                let borderColor = colors.border;
                let textColor = colors.textPrimary;
                
                if (selectedAnswer) {
                  if (isCorrect) {
                    bgColor = 'rgba(34,197,94,0.1)';
                    borderColor = 'rgba(34,197,94,0.5)';
                    textColor = '#22C55E';
                  } else if (isSelected) {
                    bgColor = 'rgba(239,68,68,0.1)';
                    borderColor = 'rgba(239,68,68,0.5)';
                    textColor = '#EF4444';
                  }
                }

                return (
                  <TouchableOpacity 
                    key={idx}
                    disabled={!!selectedAnswer}
                    onPress={() => handleAnswerSubmit(ans)}
                    className="p-4 rounded-xl border flex-row justify-between items-center transition-colors"
                    style={{ backgroundColor: bgColor, borderColor }}
                  >
                    <Text className="font-inter-medium text-sm" style={{ color: textColor }}>{ans}</Text>
                    {selectedAnswer && isCorrect && <Feather name="check-circle" size={16} color="#22C55E" />}
                    {selectedAnswer && isSelected && !isCorrect && <Feather name="x-circle" size={16} color="#EF4444" />}
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedAnswer && (
              <View className="mt-6">
                {challengeSuccess ? (
                  <Text className="font-inter-bold text-center text-green-500 mb-4">Correct! +50 Points added.</Text>
                ) : (
                  <Text className="font-inter-bold text-center text-red-500 mb-4">Incorrect. Try again tomorrow!</Text>
                )}
                <TouchableOpacity 
                  onPress={() => setChallengeModalVisible(false)}
                  className="w-full py-4 rounded-xl items-center"
                  style={{ backgroundColor: colors.accent }}
                >
                  <Text className="font-inter-bold text-sm uppercase" style={{ color: colors.accentText }}>Continue</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}
