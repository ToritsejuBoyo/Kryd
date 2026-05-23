import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { getJobs, getUserApplications, getLeaderboard } from '@/lib/db';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import Skeleton from '@/components/Skeleton';
import { PlatformFooter } from '@/components/PlatformFooter';
import { useTheme } from '@/lib/useTheme';
import { formatDual, formatSalaryRange, CURRENCY_CONFIG } from '@/lib/currency';
import { DESIGN, getAvatarColour } from '@/lib/design';
const FILTERS = ['Recommended', 'Trending', 'Remote', 'Verified Clients', 'High Paying', 'Beginner Friendly'];
const QUICK_TAGS = ['Windows', 'Networking', 'Azure', 'Cybersecurity', 'Cloud', 'Remote Support', 'Microsoft 365'];

const TIERS = [
  { level: 1, name: 'Novice', minPoints: 0 },
  { level: 2, name: 'Intermediate', minPoints: 500 },
  { level: 3, name: 'Advanced', minPoints: 2000 },
  { level: 4, name: 'Expert', minPoints: 5000 },
  { level: 5, name: 'Master', minPoints: 10000 },
];

export default function JobsScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const isClientMode = useUserStore((state) => state.isClientMode);
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const { colors, mode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Recommended');
  const [searchFocused, setSearchFocused] = useState(false);
  const [hoveredJobId, setHoveredJobId] = useState<string | null>(null);

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
      const [jobsData, appsData, lbData] = await Promise.all([
        getJobs(),
        getUserApplications(profile.id),
        getLeaderboard()
      ]);

      const enrichedJobs = jobsData.map((job: any, index: number) => {
        const isVerifiedClient = index % 3 !== 0;
        const prefersNewTalent = index % 4 === 0;
        const aiMatch = 75 + (index * 7 % 24);
        return {
          ...job,
          aiMatch,
          isVerifiedClient,
          prefersNewTalent,
          applicantCount: 5 + (index * 3 % 45),
          duration: index % 2 === 0 ? 'Less than 1 month' : '1 to 3 months'
        };
      });

      setJobs(enrichedJobs);
      setApplications(appsData);
      setLeaderboard(lbData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const currentTier = useMemo(() => {
    const pts = profile?.points || 0;
    return TIERS.slice().reverse().find(t => pts >= t.minPoints) || TIERS[0];
  }, [profile?.points]);

  const formatSalary = (job: any) => {
    if (job.type === 'Freelance' || job.salary_min === job.salary_max) {
      return `${formatDual(job.salary_min)} fixed`;
    }
    return formatSalaryRange(job.salary_min, job.salary_max);
  };

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

  const filteredJobs = useMemo(() => {
    let filtered = jobs;
    if (selectedFilter === 'Remote') {
      filtered = filtered.filter(j => j.type === 'Remote' || j.location.toLowerCase().includes('remote'));
    } else if (selectedFilter === 'Verified Clients') {
      filtered = filtered.filter(j => j.isVerifiedClient);
    } else if (selectedFilter === 'Beginner Friendly' || selectedFilter === 'New Talent Friendly') {
      filtered = filtered.filter(j => j.prefersNewTalent);
    }
    
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(query) || 
        j.company.toLowerCase().includes(query) ||
        (j.skills_required && j.skills_required.some((s: string) => s.toLowerCase().includes(query)))
      );
    }
    return filtered;
  }, [jobs, searchQuery, selectedFilter]);

  const topMatchJobs = useMemo(() => {
    return [...jobs].sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 2);
  }, [jobs]);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.backgroundPrimary }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
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

            {!isClientMode ? (
              <>
              {/* Career Match Card */}
              {!isSidebarCollapsed && (
                <View style={getStandardCardStyle()}>
                  <View className="w-12 h-12 rounded-full items-center justify-center mb-2 bg-purple-500/20 border border-purple-500/30 self-center">
                    <Feather name="user" size={16} color="#A855F7" />
                  </View>
                  <Text className="font-inter-bold text-sm text-center" style={{ color: colors.textPrimary }}>{profile?.role || 'IT Professional'}</Text>
                  <Text className="font-inter text-[10px] text-center mb-4" style={{ color: colors.textSecondary }}>Tier {currentTier.level || 1} / {currentTier.name}</Text>
                  
                  <View className="w-full mb-4">
                    <View className="flex-row justify-between mb-1">
                      <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>Marketplace Readiness</Text>
                      <Text className="font-inter-bold text-[10px]" style={{ color: colors.success }}>87%</Text>
                    </View>
                    <View className="w-full h-1.5 rounded-full overflow-hidden bg-white/10">
                      <View className="h-full rounded-full" style={{ width: `87%`, backgroundColor: colors.success }} />
                    </View>
                  </View>

                  <Text className="font-inter-medium text-[10px] uppercase mb-2 w-full" style={{ color: colors.textSecondary }}>Recommended Skills</Text>
                  <View className="flex-row flex-wrap gap-1 mb-4 w-full justify-center">
                    {['Networking', 'Microsoft 365', 'Azure'].map(tag => (
                      <View key={tag} className="px-2 py-1 rounded border" style={{ borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                  
                  <TouchableOpacity className="w-full py-2 rounded-lg items-center border" style={{ borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                    <Text className="font-inter-medium text-[10px]" style={{ color: colors.textPrimary }}>Improve Match Score</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 2. Application Tracker */}
              {!isSidebarCollapsed && (
                <View style={getStandardCardStyle()}>
                  <Text className="font-inter-bold text-[10px] uppercase mb-4" style={{ color: colors.textSecondary }}>Application Tracker</Text>
                  <View className="flex-row flex-wrap">
                    <View className="w-1/2 mb-4">
                      <Text className="font-inter-bold text-xl" style={{ color: colors.textPrimary }}>{applications.length}</Text>
                      <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>Sent</Text>
                    </View>
                    <View className="w-1/2 mb-4 pl-4 border-l" style={{ borderColor: colors.border }}>
                      <Text className="font-inter-bold text-xl" style={{ color: colors.accent }}>2</Text>
                      <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>Interviews</Text>
                    </View>
                    <View className="w-1/2">
                      <Text className="font-inter-bold text-xl" style={{ color: colors.textPrimary }}>1</Text>
                      <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>Pending</Text>
                    </View>
                    <View className="w-1/2 pl-4 border-l" style={{ borderColor: colors.border }}>
                      <Text className="font-inter-bold text-xl" style={{ color: colors.success }}>0</Text>
                      <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>Hired</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* 3. Saved Jobs */}
              {!isSidebarCollapsed && (
                <View style={getStandardCardStyle()}>
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="font-inter-bold text-[10px] uppercase" style={{ color: colors.textSecondary }}>Saved Jobs (2)</Text>
                    <Feather name="bookmark" size={12} color={colors.accent} />
                  </View>
                  <View className="flex-col gap-y-3">
                    <View>
                      <Text className="font-inter-medium text-xs" style={{ color: colors.textPrimary }} numberOfLines={1}>Helpdesk Tier 1 Support</Text>
                      <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>TechCorp • $25/hr</Text>
                    </View>
                    <View>
                      <Text className="font-inter-medium text-xs" style={{ color: colors.textPrimary }} numberOfLines={1}>Azure Cloud Migration</Text>
                      <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>CloudBase • Fixed $800</Text>
                    </View>
                  </View>
                </View>
              )}
              </>
            ) : (
              <>
                {!isSidebarCollapsed && (
                  <View style={getStandardCardStyle()}>
                    <View className="flex-row items-center mb-4 pb-4 border-b" style={{ borderColor: colors.border }}>
                      <View className="w-12 h-12 mr-3 rounded-full items-center justify-center bg-blue-500/20 border border-blue-500/30">
                        <Feather name="briefcase" size={16} color="#3B82F6" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-inter-bold text-sm" style={{ color: colors.textPrimary }}>Kryd Tech Inc.</Text>
                        <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Enterprise Client</Text>
                      </View>
                    </View>
                    
                    <View className="flex-row justify-between mb-4">
                      <View>
                        <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Active Jobs</Text>
                        <Text className="font-inter-bold text-sm" style={{ color: colors.textPrimary }}>3</Text>
                      </View>
                      <View>
                        <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Total Hired</Text>
                        <Text className="font-inter-bold text-sm" style={{ color: colors.textPrimary }}>12</Text>
                      </View>
                    </View>
                    <TouchableOpacity className="w-full py-2.5 rounded-lg items-center border" style={{ borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                      <Text className="font-inter-medium text-xs" style={{ color: colors.textPrimary }}>Edit Company Profile</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>

          {/* ================= CENTER COLUMN ================= */}
          <View className="w-full lg:flex-1 min-w-0 flex-col gap-6">
            
            {/* Smart Search Bar (Absolute First Element) */}
            <View>
              <View 
                className="flex-row items-center border rounded-2xl px-5 py-4 mb-4" 
                style={{ 
                  backgroundColor: colors.cardSurface, 
                  borderColor: searchFocused ? '#CCDF1A' : colors.border,
                  shadowColor: '#CCDF1A',
                  shadowOpacity: searchFocused ? 0.2 : 0,
                  shadowRadius: searchFocused ? 4 : 0,
                }}
              >
                <Feather name="search" size={20} color={colors.textSecondary} className="mr-3" />
                <TextInput 
                  className="flex-1 font-inter text-base"
                  style={{ color: colors.textPrimary, outlineStyle: 'none' } as any}
                  placeholder="Search jobs, skills, technologies..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                {searchQuery.length > 0 ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')} className="ml-2 bg-white/10 p-1.5 rounded-full">
                    <Feather name="x" size={14} color={colors.textSecondary} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity className="ml-2 bg-accent/20 p-2 rounded-lg">
                    <Feather name="sliders" size={16} color={colors.accent} />
                  </TouchableOpacity>
                )}
              </View>
              
              <View className="flex-row flex-wrap gap-2">
                <Text className="font-inter text-xs py-1.5 mr-1" style={{ color: colors.textSecondary }}>Suggested:</Text>
                {QUICK_TAGS.map(tag => (
                  <TouchableOpacity key={tag} onPress={() => setSearchQuery(tag)} className="px-3 py-1.5 rounded-full border" style={{ borderColor: colors.border, backgroundColor: 'transparent' }}>
                    <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Job Filter Tabs */}
            <View className="mb-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {FILTERS.map(filter => {
                  const isActive = selectedFilter === filter;
                  return (
                    <TouchableOpacity 
                      key={filter}
                      onPress={() => setSelectedFilter(filter)}
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
                      <Text 
                        className="font-inter-medium" 
                        style={{ 
                          color: isActive ? (mode === 'dark' ? '#0B2D2C' : '#FFFFFF') : colors.textSecondary,
                          fontSize: 13,
                          fontWeight: isActive ? '600' : '400'
                        }}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </ScrollView>
            </View>

            {/* Recommended AI Matched Jobs Section (Only for Freelancers) */}
            {!isClientMode && searchQuery === '' && selectedFilter === 'Recommended' && topMatchJobs.length > 0 && (
              <View className="mb-4">
                <View className="flex-row items-center mb-4">
                  <Feather name="zap" size={18} color={colors.accent} className="mr-2" />
                  <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>Recommended For You</Text>
                </View>
                <View className="flex-col md:flex-row gap-4">
                  {topMatchJobs.map(job => {
                    const isHovered = hoveredJobId === `rec-${job.id}`;
                    const baseStyle = getStandardCardStyle();
                    const cardStyle = {
                      ...baseStyle,
                      borderColor: isHovered ? '#CCDF1A' : baseStyle.borderColor,
                      shadowOpacity: isHovered ? (mode === 'light' ? 0.14 : 0.5) : baseStyle.shadowOpacity,
                    };
                    return (
                      <View 
                        key={`rec-${job.id}`} 
                        style={cardStyle}
                        {...{
                          onMouseEnter: () => setHoveredJobId(`rec-${job.id}`),
                          onMouseLeave: () => setHoveredJobId(null)
                        } as any}
                      >
                        <View className="flex-row justify-between items-start mb-3">
                          <Text className="font-inter-bold text-lg flex-1 mr-2" style={{ color: colors.textPrimary }} numberOfLines={2}>{job.title}</Text>
                          <View className="bg-accent/10 px-2 py-1 rounded border border-accent/20 flex-row items-center">
                            <Text className="font-inter-bold text-[10px]" style={{ color: colors.accent }}>{job.aiMatch}% Match</Text>
                          </View>
                        </View>
                        
                        <View className="bg-white/5 rounded-lg p-3 mb-4">
                          <Text className="font-inter-medium text-[10px] uppercase mb-1" style={{ color: colors.textSecondary }}>Recommended because:</Text>
                          <View className="flex-row items-center mb-1">
                            <Feather name="check" size={10} color={colors.success} className="mr-2" />
                            <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>Strong networking skills</Text>
                          </View>
                          <View className="flex-row items-center">
                            <Feather name="check" size={10} color={colors.success} className="mr-2" />
                            <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>Matches Tier {currentTier.level}</Text>
                          </View>
                        </View>

                        <Text className="font-inter-bold text-lg mb-4" style={{ color: colors.success }}>{formatSalary(job)}</Text>
                        
                        <View className="flex-row gap-2 mt-auto">
                          <TouchableOpacity className="flex-1 py-2.5 rounded-lg items-center" style={{ backgroundColor: colors.accent }}>
                            <Text className="font-inter-bold text-xs" style={{ color: colors.accentText }}>Apply</Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="px-3 py-2.5 rounded-lg items-center border justify-center" style={{ borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <Feather name="bookmark" size={14} color={colors.textPrimary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Main Job Feed */}
            <View className="flex-col gap-4">
              {filteredJobs.length === 0 ? (
                <View className="py-12 items-center border rounded-2xl px-6" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                  <Feather name="briefcase" size={48} color={colors.textSecondary} className="mb-4 opacity-50" />
                  <Text className="font-inter-bold text-lg mb-2 text-center" style={{ color: colors.textPrimary }}>No jobs found</Text>
                  <Text className="font-inter text-center leading-relaxed mb-6" style={{ color: colors.textSecondary }}>
                    Try adjusting your search criteria or switching filters.
                  </Text>
                </View>
              ) : (
                filteredJobs.map((job) => {
                  const hasApplied = applications.some(app => app.job_id === job.id);
                  const isHovered = hoveredJobId === job.id;
                  const baseStyle = getStandardCardStyle();
                  const cardStyle = {
                    ...baseStyle,
                    borderColor: isHovered ? '#CCDF1A' : baseStyle.borderColor,
                    shadowOpacity: isHovered ? (mode === 'light' ? 0.14 : 0.5) : baseStyle.shadowOpacity,
                    opacity: hasApplied ? 0.75 : 1,
                  };

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
                      <View className="flex-row justify-between items-start mb-2">
                        <View className="flex-1 mr-4">
                          <Text className="font-inter-bold text-xl mb-1 hover:underline" style={{ color: colors.textPrimary }}>{job.title}</Text>
                          <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>{job.type} • Posted {Math.floor(Math.random() * 23 + 1)} hours ago</Text>
                        </View>
                        <TouchableOpacity className="p-2 -mr-2 -mt-2">
                          <Feather name="bookmark" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                      </View>

                      <View className="flex-row items-center flex-wrap gap-y-2 mb-4">
                        <Text className="font-inter-bold text-base mr-4" style={{ color: colors.textPrimary }}>{formatSalary(job)}</Text>
                        <Text className="font-inter text-sm mr-4" style={{ color: colors.textSecondary }}>{job.duration}</Text>
                        <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>Entry/Intermediate</Text>
                      </View>

                      <Text className="font-inter text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: colors.textPrimary }}>
                        {job.description}
                      </Text>

                      <View className="flex-row flex-wrap mb-5 gap-2">
                        {job.skills_required?.map((skill: string) => (
                          <View key={skill} className="bg-white/5 rounded-full px-3 py-1">
                            <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>{skill}</Text>
                          </View>
                        ))}
                      </View>

                      <View className="flex-row justify-between items-center pt-4 border-t" style={{ borderColor: colors.border }}>
                        <View className="flex-row flex-wrap items-center gap-x-4 gap-y-2">
                          {job.isVerifiedClient ? (
                            <View className="flex-row items-center">
                              <Feather name="check-circle" size={14} color="#3B82F6" className="mr-1.5" />
                              <Text className="font-inter-medium text-xs" style={{ color: colors.textPrimary }}>Payment Verified</Text>
                            </View>
                          ) : (
                            <View className="flex-row items-center">
                              <Feather name="help-circle" size={14} color={colors.textSecondary} className="mr-1.5" />
                              <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Payment Unverified</Text>
                            </View>
                          )}
                          
                          <View className="flex-row items-center">
                            <View className="flex-row mr-1">
                              {[1,2,3,4,5].map(s => <Feather key={s} name="star" size={10} color={s <= 4 ? "#FBBF24" : colors.textSecondary} />)}
                            </View>
                            <Text className="font-inter-bold text-[10px]" style={{ color: colors.textPrimary }}>4.8</Text>
                          </View>

                          <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>
                            <Text className="font-inter-medium" style={{ color: colors.textPrimary }}>$10k+</Text> spent
                          </Text>
                          <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>
                            <Text className="font-inter-medium" style={{ color: colors.textPrimary }}>{job.location}</Text>
                          </Text>
                        </View>
                        
                        <View className="flex-row items-center">
                          <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Applicants: <Text className="font-inter-medium" style={{ color: colors.textPrimary }}>{job.applicantCount}</Text></Text>
                        </View>
                      </View>
                      
                      {(job.prefersNewTalent || job.isVerifiedClient) && (
                        <View className="flex-row gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.02)' }}>
                          {job.prefersNewTalent && (
                            <View className="flex-row items-center px-2 py-1 rounded bg-[#10B981]/10 border border-[#10B981]/20">
                              <Text className="font-inter-bold text-[9px] text-[#10B981] uppercase">🟢 New Talent Friendly</Text>
                            </View>
                          )}
                          {job.isVerifiedClient && !job.prefersNewTalent && (
                            <View className="flex-row items-center px-2 py-1 rounded bg-[#3B82F6]/10 border border-[#3B82F6]/20">
                              <Text className="font-inter-bold text-[9px] text-[#3B82F6] uppercase">🔵 Verified Professionals Preferred</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>

          {/* ================= RIGHT SIDEBAR ================= */}
          <View className="hidden xl:flex w-[280px] flex-shrink-0 flex-col gap-6 pt-16">
            {!isClientMode ? (
              <>
              {/* Marketplace Insights */}
              <View style={getStandardCardStyle()}>
                <Text className="font-inter-bold text-[10px] uppercase mb-4" style={{ color: colors.textSecondary }}>Marketplace Insights</Text>
                
                <View className="flex-col gap-y-4 mb-5">
                  <View>
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>Profile Strength</Text>
                      <Text className="font-inter-bold text-xs" style={{ color: colors.success }}>High</Text>
                    </View>
                    <View className="w-full h-1.5 rounded-full bg-white/10">
                      <View className="h-full rounded-full" style={{ width: '85%', backgroundColor: colors.success }} />
                    </View>
                  </View>
                  <View>
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>Avg. Job Match</Text>
                      <Text className="font-inter-bold text-xs" style={{ color: colors.accent }}>78%</Text>
                    </View>
                    <View className="w-full h-1.5 rounded-full bg-white/10">
                      <View className="h-full rounded-full" style={{ width: '78%', backgroundColor: colors.accent }} />
                    </View>
                  </View>
                </View>
              </View>

              {/* Top Performers */}
              <View style={getStandardCardStyle()}>
                <Text className="font-inter-bold text-[10px] uppercase mb-4" style={{ color: colors.textSecondary }}>Top Techs This Week</Text>
                <View className="flex-col gap-y-4">
                  {leaderboard.slice(0, 3).map((user, idx) => {
                    const medalColor = idx === 0 ? '#F59E0B' : idx === 1 ? '#9CA3AF' : '#D97706';
                    return (
                      <View key={user.id} className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                          <Text className="font-inter-bold text-[10px] w-4 text-center mr-2" style={{ color: medalColor }}>{idx + 1}</Text>
                          <View className="w-6 h-6 rounded-full bg-blue-500/20 items-center justify-center mr-2">
                            <Text className="font-inter-bold text-[8px] text-blue-500">
                              {user.full_name?.split(' ').map((n:string)=>n[0]).join('').substring(0,2) || '?'}
                            </Text>
                          </View>
                          <View>
                            <Text className="font-inter-medium text-xs" style={{ color: colors.textPrimary }}>{user.full_name}</Text>
                            <View className="flex-row">
                              {[1,2,3,4,5].map(s => <Feather key={s} name="star" size={8} color="#FBBF24" />)}
                            </View>
                          </View>
                        </View>
                        <Text className="font-inter-bold text-[10px]" style={{ color: colors.textSecondary }}>{user.points} pts</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
              </>
            ) : (
              <>
                <View style={getStandardCardStyle()}>
                  <Text className="font-inter-bold text-[10px] uppercase mb-4" style={{ color: colors.textSecondary }}>Hiring Insights</Text>
                  
                  <View className="flex-col gap-y-4 mb-5">
                    <View>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>Avg Time to Hire</Text>
                        <Text className="font-inter-bold text-xs" style={{ color: colors.success }}>48 hrs</Text>
                      </View>
                      <View className="w-full h-1.5 rounded-full bg-white/10">
                        <View className="h-full rounded-full" style={{ width: '85%', backgroundColor: colors.success }} />
                      </View>
                    </View>
                    <View>
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>Offer Acceptance Rate</Text>
                        <Text className="font-inter-bold text-xs" style={{ color: colors.accent }}>92%</Text>
                      </View>
                      <View className="w-full h-1.5 rounded-full bg-white/10">
                        <View className="h-full rounded-full" style={{ width: '92%', backgroundColor: colors.accent }} />
                      </View>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
}
