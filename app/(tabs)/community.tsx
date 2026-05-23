import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, RefreshControl, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { getCommunityPosts, getLeaderboard, updatePostLikes, getLiveRooms, getEndedRooms } from '@/lib/db';
import { canMessage, getOrCreateConversation, sendConnectionRequest } from '@/lib/messaging';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import Skeleton from '@/components/Skeleton';
import { PlatformFooter } from '@/components/PlatformFooter';
import { useTheme } from '@/lib/useTheme';
import { DESIGN, getAvatarColour } from '@/lib/design';
import { CURRENCY_CONFIG } from '@/lib/currency';

const GROUPS = ['All', 'IT Support', 'Cloud', 'Security', 'Helpdesk', 'Career', 'Hiring & Projects', 'More'];
const AVATAR_COLORS = ['bg-blue-500', 'bg-teal-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-indigo-500'];

const NAV_LINKS = [
  { id: 'community', icon: 'users', label: 'Community' },
  { id: 'activity', icon: 'clock', label: 'My Activity' },
  { id: 'bookmarks', icon: 'bookmark', label: 'Bookmarks' },
  { id: 'questions', icon: 'help-circle', label: 'My Questions' },
  { id: 'discussions', icon: 'message-square', label: 'My Discussions' },
  { id: 'rooms', icon: 'layout', label: 'My Rooms' },
];

const TRENDING_TOPICS = [
  { title: 'Windows 11 Issues', posts: 124 },
  { title: 'Remote Support', posts: 98 },
  { title: 'Network Troubleshooting', posts: 76 },
  { title: 'Microsoft 365', posts: 65 },
  { title: 'Cybersecurity', posts: 54 },
];

const SUGGESTED_ROOMS = [
  { title: 'IT Support Live Help', members: 126, icon: 'users', color: 'bg-blue-500/20 text-blue-600' },
  { title: 'Cloud & DevOps Talk', members: 89, icon: 'cloud', color: 'bg-teal-500/20 text-teal-600' },
  { title: 'Cybersecurity Hangout', members: 73, icon: 'shield', color: 'bg-amber-500/20 text-amber-600' },
];

const GUIDELINES = [
  'Be respectful and professional',
  'Search before you post',
  'No spam or self-promotion',
  'Help others and share knowledge'
];

const getRelativeTime = (dateString: string) => {
  const diffTime = Math.abs(new Date().getTime() - new Date(dateString).getTime());
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  if (diffHours < 1) return 'just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
};

// Deterministic post type generator for mockup UI variety
const getPostTypeDetails = (id: string) => {
  const charCode = id.charCodeAt(id.length - 1) || 0;
  if (charCode % 3 === 0) return { type: 'QUESTION', icon: 'help-circle', iconBg: 'bg-green-500/20', iconColor: '#10B981', badgeBg: 'bg-green-500/20', badgeText: 'text-green-600' };
  if (charCode % 3 === 1) return { type: 'DISCUSSION', icon: 'message-circle', iconBg: 'bg-purple-500/20', iconColor: '#8B5CF6', badgeBg: 'bg-purple-500/20', badgeText: 'text-purple-600' };
  return { type: 'ROOM', icon: 'users', iconBg: 'bg-blue-500/20', iconColor: '#3B82F6', badgeBg: 'bg-blue-500/20', badgeText: 'text-blue-600' };
};

export default function CommunityScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  const isClientMode = useUserStore((state) => state.isClientMode);
  const { colors, mode } = useTheme();

  const [activeTab, setActiveTab] = useState('Feed');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [activeNav, setActiveNav] = useState('community');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [posts, setPosts] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const [endedRooms, setEndedRooms] = useState<any[]>([]);

  // Profile Card Modal States
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userStatus, setUserStatus] = useState<any>(null);
  const [connectNote, setConnectNote] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Hover and Focus States
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);
  const [hoveredRoomId, setHoveredRoomId] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  const pts = profile?.points || 0;
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'K';
  const earnedDollars = pts * CURRENCY_CONFIG.COIN_TO_USD;

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

  const handleUserTap = async (user: any) => {
    if (!profile?.id || user.user_id === profile.id) return;
    
    setSelectedUser(user);
    setProfileModalVisible(true);
    setShowConnectForm(false);
    setErrorMsg('');
    setConnectNote('');
    setUserStatus(null);
    
    try {
      const status = await canMessage(profile.id, user.user_id);
      setUserStatus(status);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async () => {
    if (!userStatus || !profile?.id || !selectedUser) return;

    if (userStatus.canMessage) {
      try {
        setProfileModalVisible(false);
        const conv = await getOrCreateConversation(profile.id, selectedUser.user_id);
        router.push(`/conversation/${conv.id}`);
      } catch (err) {
        console.error(err);
      }
    } else if (userStatus.reason === 'not_connected') {
      setShowConnectForm(true);
    }
  };

  const submitConnectionRequest = async () => {
    if (!profile?.id || !selectedUser) return;
    setConnecting(true);
    setErrorMsg('');
    try {
      await sendConnectionRequest(profile.id, selectedUser.user_id, connectNote.trim());
      setUserStatus({ canMessage: false, reason: 'request_pending' });
      setShowConnectForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send request');
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedGroup]);

  const fetchData = async () => {
    try {
      const data = await getCommunityPosts(selectedGroup === 'All' ? undefined : selectedGroup);
      setPosts(data);
      const lbData = await getLeaderboard();
      setLeaderboard(lbData);
      
      const liveData = await getLiveRooms();
      const endedData = await getEndedRooms();
      setLiveRooms(liveData);
      setEndedRooms(endedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [selectedGroup]);

  const toggleLike = async (post: any) => {
    const isLiked = !!likedPosts[post.id];
    const newCount = isLiked ? post.likes_count - 1 : post.likes_count + 1;
    
    setLikedPosts(prev => ({ ...prev, [post.id]: !isLiked }));
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: newCount } : p));
    
    try {
      await updatePostLikes(post.id, newCount);
    } catch (error) {
      setLikedPosts(prev => ({ ...prev, [post.id]: isLiked }));
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes_count: post.likes_count } : p));
    }
  };

  const renderPost = ({ item }: { item: any }) => {
    const isLiked = !!likedPosts[item.id];
    const authorName = item.profiles?.full_name || 'Anonymous User';
    const initials = authorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
    const typeDetails = getPostTypeDetails(item.id);

    const isHovered = hoveredPostId === item.id;
    const baseStyle = getStandardCardStyle();
    const cardStyle = {
      ...baseStyle,
      borderColor: isHovered ? '#CCDF1A' : baseStyle.borderColor,
      shadowOpacity: isHovered ? (mode === 'light' ? 0.14 : 0.5) : baseStyle.shadowOpacity,
      marginBottom: 16,
      flexDirection: 'row' as const,
    };

    return (
      <View 
        style={cardStyle}
        {...{
          onMouseEnter: () => setHoveredPostId(item.id),
          onMouseLeave: () => setHoveredPostId(null)
        } as any}
      >
        
        {/* Left Icon */}
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${typeDetails.iconBg}`}>
          <Feather name={typeDetails.icon as any} size={22} color={typeDetails.iconColor} />
        </View>

        {/* Center Content */}
        <View className="flex-1 mr-4">
          <View className={`self-start px-2 py-0.5 rounded text-[10px] font-inter-bold tracking-wider mb-2 ${typeDetails.badgeBg}`}>
            <Text className={`text-[10px] font-inter-bold ${typeDetails.badgeText}`}>{typeDetails.type}</Text>
          </View>
          
          <Text className="font-inter-bold text-lg mb-2" style={{ color: colors.textPrimary }}>
            {item.title || item.content.substring(0, 50) + (item.content.length > 50 ? '...' : '')}
          </Text>
          
          <Text className="font-inter text-sm leading-relaxed mb-4" style={{ color: colors.textSecondary }} numberOfLines={2}>
            {item.content}
          </Text>

          {/* Tags */}
          <View className="flex-row items-center mb-4 space-x-2">
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.backgroundSecondary }}>
              <Text className="text-xs font-inter-medium" style={{ color: colors.textSecondary }}>{item.group_name || 'General'}</Text>
            </View>
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.backgroundSecondary }}>
              <Text className="text-xs font-inter-medium" style={{ color: colors.textSecondary }}>Discussion</Text>
            </View>
          </View>

          {/* Author info */}
          <TouchableOpacity 
            className="flex-row items-center mt-2 p-1 -ml-1 rounded hover:bg-white/5" 
            onPress={() => handleUserTap({ ...item.profiles, user_id: item.user_id })}
          >
            <View 
              className="rounded-full items-center justify-center mr-2" 
              style={{ width: 24, height: 24, backgroundColor: getAvatarColour(authorName) }}
            >
              <Text className="text-white font-inter-bold text-[10px]">{initials}</Text>
            </View>
            <Text className="font-inter-bold text-xs mr-2 hover:underline" style={{ color: colors.textPrimary }}>{authorName}</Text>
            <Text className="font-inter text-xs mr-2" style={{ color: colors.textSecondary }}>•</Text>
            <Text className="font-inter text-xs mr-2" style={{ color: colors.textSecondary }}>{getRelativeTime(item.created_at)}</Text>
            <Text className="font-inter text-xs mr-2" style={{ color: colors.textSecondary }}>•</Text>
            <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>{item.profiles?.role || 'IT Support'}</Text>
          </TouchableOpacity>
        </View>

        {/* Right Actions */}
        <View className="w-12 items-center justify-between py-1">
          <TouchableOpacity className="items-center" onPress={() => toggleLike(item)}>
            <Feather name="arrow-up" size={20} color={isLiked ? colors.accent : colors.textSecondary} />
            <Text className="font-inter-bold text-sm my-1" style={{ color: colors.textPrimary }}>{item.likes_count}</Text>
            <Feather name="arrow-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <View className="items-center mt-4">
            <Text className="font-inter-bold text-xs" style={{ color: colors.textPrimary }}>12</Text>
            <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>answers</Text>
          </View>

          <TouchableOpacity className="mt-4">
            <Feather name="bookmark" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >
        <View className="max-w-[1400px] mx-auto w-full flex-row px-4 md:px-8 py-8 gap-x-8">
          
          {/* LEFT SIDEBAR (Hidden on mobile) */}
          <View 
            className={`hidden md:flex flex-col gap-6 transition-all duration-500 ease-in-out ${isSidebarCollapsed ? 'lg:w-20' : 'w-full lg:w-64 flex-shrink-0'}`}
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
                    <Text className="font-inter-bold text-[10px] text-[#0B2D2C]">
                      {profile?.points && profile.points >= 10000 ? 'Master' : profile?.points && profile.points >= 5000 ? 'Expert' : profile?.points && profile.points >= 2000 ? 'Advanced' : profile?.points && profile.points >= 500 ? 'Intermediate' : 'Novice'}
                    </Text>
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
            {/* Nav Links */}
            <View className="space-y-1 mb-2">
              {NAV_LINKS.map(link => (
                <TouchableOpacity 
                  key={link.id}
                  onPress={() => setActiveNav(link.id)}
                  className={`flex-row items-center px-4 py-3 rounded-xl`}
                  style={{ backgroundColor: activeNav === link.id ? `${colors.accent}15` : 'transparent' }}
                >
                  <Feather name={link.icon as any} size={18} color={activeNav === link.id ? colors.accent : colors.textSecondary} />
                  <Text className={`font-inter-medium ml-3`} style={{ color: activeNav === link.id ? colors.textPrimary : colors.textSecondary }}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Top Contributors */}
            <View className="mb-2">
              <View className="flex-row justify-between items-center mb-4 px-2">
                <Text className="font-inter-bold text-sm" style={{ color: colors.textPrimary }}>Top Contributors</Text>
                <TouchableOpacity><Text className="font-inter text-xs" style={{ color: colors.accent }}>See all</Text></TouchableOpacity>
              </View>
              <View style={getStandardCardStyle()}>
                {leaderboard.slice(0, 5).map((user, index) => {
                  const rankColors = ['#FBBF24', '#9CA3AF', '#D97706'];
                  const rankColor = index < 3 ? rankColors[index] : colors.textSecondary;
                  const initials = user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

                  return (
                    <TouchableOpacity 
                      key={user.id} 
                      className="flex-row items-center mb-3 last:mb-0 hover:bg-white/5 p-1 -ml-1 rounded"
                      onPress={() => handleUserTap({ ...user, user_id: user.user_id || user.id })} // Assuming user object has user_id or id
                    >
                      <View className="w-5 h-5 rounded-full items-center justify-center mr-2 border" style={{ backgroundColor: rankColor, borderColor: 'rgba(0,0,0,0.1)' }}>
                        <Text className="text-white font-inter-bold text-[10px]">{index + 1}</Text>
                      </View>
                      <View 
                        className="rounded-full items-center justify-center mr-2" 
                        style={{ width: 32, height: 32, backgroundColor: getAvatarColour(user.full_name) }}
                      >
                        <Text className="text-white font-inter-bold text-[10px]">{initials}</Text>
                      </View>
                      <Text className="font-inter-bold text-xs flex-1 truncate hover:underline" style={{ color: colors.textPrimary }} numberOfLines={1}>{user.full_name}</Text>
                      <Text className="font-inter-bold text-[10px]" style={{ color: colors.textSecondary }}>{(user.points/1000).toFixed(1)}k pts</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Promo Widget */}
            <View style={getStandardCardStyle()}>
              <Text className="font-inter-bold text-base mb-2" style={{ color: colors.textPrimary }}>Join live rooms</Text>
              <Text className="font-inter text-xs mb-4 leading-relaxed" style={{ color: colors.textSecondary }}>
                Have real-time conversations with experts and get help instantly.
              </Text>
              <TouchableOpacity onPress={() => setActiveTab('Rooms')} className="border py-2.5 rounded-lg items-center" style={{ borderColor: colors.border }}>
                <Text className="font-inter-bold text-sm" style={{ color: colors.textPrimary }}>Explore Rooms</Text>
              </TouchableOpacity>
            </View>
              </>
            )}
          </View>

          {/* MIDDLE COLUMN (Main Feed) */}
          <View className="flex-1 w-full max-w-4xl min-w-0">
            {/* Header */}
            <View className="flex-row justify-between items-start mb-6">
              <View>
                <Text className="font-inter-bold text-3xl mb-1" style={{ color: colors.textPrimary }}>Community</Text>
                <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>Connect, learn and grow with IT professionals</Text>
              </View>
              {(!isClientMode || selectedGroup === 'Hiring & Projects') && (
                <TouchableOpacity className="flex-row items-center px-4 py-2.5 rounded-lg" style={{ backgroundColor: '#0B2D2C' }}>
                  <Text className="font-inter-bold text-sm text-white mr-2">+ Create Post</Text>
                  <Feather name="chevron-down" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Bar */}
            <View 
              className="flex-row items-center border px-4 py-3.5 mb-6" 
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
              <TextInput 
                className="flex-1 font-inter text-base outline-none"
                style={{ color: colors.textPrimary, outlineStyle: 'none' } as any}
                placeholder="Ask or search IT questions..."
                placeholderTextColor={colors.textSecondary}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <Feather name="search" size={20} color={colors.textSecondary} />
            </View>

            {/* Group Filters */}
            <View className="mb-6">
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {GROUPS.map((group, idx) => {
                  const icons = ['grid', 'monitor', 'cloud', 'shield', 'life-buoy', 'briefcase', 'chevron-down'];
                  const isActive = selectedGroup === group;
                  return (
                    <TouchableOpacity 
                      key={group}
                      onPress={() => group !== 'More' && setSelectedGroup(group)}
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
                      <Feather name={icons[idx] as any} size={14} color={isActive ? (mode === 'dark' ? '#0B2D2C' : '#FFFFFF') : colors.textSecondary} className="mr-2" />
                      <Text className={`font-inter-medium text-sm ml-2`} style={{ color: isActive ? (mode === 'dark' ? '#0B2D2C' : '#FFFFFF') : colors.textPrimary }}>
                        {group}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Inner Tabs */}
            <View className="flex-row border-b mb-6" style={{ borderColor: colors.border }}>
              {['Feed', 'Questions', 'Discussions', 'Rooms'].map((tab) => {
                const icons = ['layout', 'help-circle', 'message-square', 'users'];
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity 
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    className="flex-row items-center px-6 py-4 border-b-2"
                    style={{ borderColor: isActive ? colors.accent : 'transparent' }}
                  >
                    <Feather name={icons[['Feed', 'Questions', 'Discussions', 'Rooms'].indexOf(tab)] as any} size={16} color={isActive ? colors.textPrimary : colors.textSecondary} />
                    <Text className="font-inter-bold text-sm ml-2" style={{ color: isActive ? colors.textPrimary : colors.textSecondary }}>{tab}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {activeTab === 'Rooms' ? (
              <View>
                <View className="flex-row justify-between items-center mb-6">
                  <View>
                    <Text className="font-inter-bold text-xl mb-1" style={{ color: colors.textPrimary }}>Live Rooms</Text>
                    <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>Real-time conversations with IT professionals</Text>
                  </View>
                  <TouchableOpacity onPress={() => router.push('/room/create')} className="px-4 py-2 rounded-lg bg-blue-500">
                    <Text className="font-inter-bold text-sm text-white">+ Create Room</Text>
                  </TouchableOpacity>
                </View>

                {liveRooms.length === 0 ? (
                  <View className="py-12 items-center border rounded-2xl px-6 mb-8" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                    <Text className="font-inter-bold text-lg mb-2" style={{ color: colors.textPrimary }}>No live rooms right now.</Text>
                    <Text className="font-inter text-sm mb-4" style={{ color: colors.textSecondary }}>Be the first to start a conversation.</Text>
                    <TouchableOpacity onPress={() => router.push('/room/create')} className="px-6 py-3 rounded-lg bg-blue-500">
                      <Text className="font-inter-bold text-sm text-white">Start a Room</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="space-y-4 mb-8 gap-y-4">
                    {liveRooms.map(room => {
                      const isHovered = hoveredRoomId === room.id;
                      const baseStyle = getStandardCardStyle();
                      const cardStyle = {
                        ...baseStyle,
                        borderColor: isHovered ? '#CCDF1A' : baseStyle.borderColor,
                        shadowOpacity: isHovered ? (mode === 'light' ? 0.14 : 0.5) : baseStyle.shadowOpacity,
                      };
                      return (
                        <View 
                          key={room.id} 
                          style={cardStyle}
                          {...{
                            onMouseEnter: () => setHoveredRoomId(room.id),
                            onMouseLeave: () => setHoveredRoomId(null)
                          } as any}
                        >
                          <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-row items-center">
                              <View className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" />
                              <Text className="font-inter-bold text-xs text-red-500 uppercase tracking-wider">LIVE</Text>
                            </View>
                            <View className="px-3 py-1 rounded-full bg-blue-500/10">
                              <Text className="font-inter-medium text-xs text-blue-500">{room.topic}</Text>
                            </View>
                          </View>
                          
                          <Text className="font-inter-bold text-xl mb-2" style={{ color: colors.textPrimary }}>{room.title}</Text>
                          <Text className="font-inter text-sm mb-4" style={{ color: colors.textSecondary }} numberOfLines={1}>{room.description}</Text>
                          
                          <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                              <Feather name="users" size={14} color={colors.textSecondary} className="mr-2" />
                              <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>0 members online</Text>
                            </View>
                            
                            <TouchableOpacity onPress={() => router.push(`/room/${room.id}` as any)} className="px-5 py-2 rounded-lg bg-blue-500">
                              <Text className="font-inter-bold text-sm text-white">Join Room</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {endedRooms.length > 0 && (
                  <View>
                    <Text className="font-inter-bold text-base mb-4" style={{ color: colors.textPrimary }}>Ended Recently</Text>
                    <View className="space-y-3 gap-y-3">
                      {endedRooms.map(room => (
                        <View 
                          key={room.id} 
                          className="flex-row items-center justify-between" 
                          style={getStandardCardStyle()}
                        >
                          <View>
                            <View className="flex-row items-center mb-1">
                              <View className="px-2 py-0.5 rounded text-[10px] bg-gray-500/20 mr-2">
                                <Text className="text-[10px] text-gray-500 font-inter-bold uppercase">ENDED</Text>
                              </View>
                              <Text className="font-inter-bold text-sm" style={{ color: colors.textPrimary }}>{room.title}</Text>
                            </View>
                            <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Ended • {new Date(room.ended_at).toLocaleDateString()}</Text>
                          </View>
                          <Text className="font-inter-medium text-xs" style={{ color: colors.textSecondary }}>0 messages</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : (
              loading && !refreshing ? (
                <View className="gap-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="w-full h-40 rounded-2xl" />)}
                </View>
              ) : (
                <FlatList
                  data={posts}
                  keyExtractor={item => item.id}
                  renderItem={renderPost}
                  scrollEnabled={false}
                  ListEmptyComponent={
                    <View className="py-12 items-center border rounded-2xl px-6" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                      <Text className="font-inter-bold text-lg mb-2" style={{ color: colors.textPrimary }}>No posts found</Text>
                    </View>
                  }
                />
              )
            )}
            
            <View className="h-20" />
          </View>

          {/* RIGHT SIDEBAR (Hidden on mobile) */}
          <View className="hidden lg:flex w-[300px] flex-shrink-0 flex-col gap-6">
            {/* Trending Topics */}
            <View style={getStandardCardStyle()}>
              <View className="flex-row items-center mb-4">
                <Text className="font-inter-bold text-base mr-2" style={{ color: colors.textPrimary }}>🔥 Trending Topics</Text>
              </View>
              <View className="space-y-4 gap-y-4">
                {TRENDING_TOPICS.map((topic, idx) => (
                  <View key={idx} className="flex-row items-center justify-between">
                    <View>
                      <Text className="font-inter-bold text-sm mb-0.5" style={{ color: colors.textPrimary }}>{topic.title}</Text>
                      <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>{topic.posts} posts</Text>
                    </View>
                    <Feather name="trending-up" size={16} color={colors.accent} />
                  </View>
                ))}
              </View>
              <TouchableOpacity className="w-full mt-6 py-2.5 border rounded-lg items-center" style={{ borderColor: colors.border }}>
                <Text className="font-inter-bold text-xs" style={{ color: colors.textPrimary }}>View all topics</Text>
              </TouchableOpacity>
            </View>

            {/* Suggested Rooms */}
            <View style={getStandardCardStyle()}>
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-inter-bold text-sm" style={{ color: colors.textPrimary }}>Suggested Rooms</Text>
                <TouchableOpacity><Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>See all</Text></TouchableOpacity>
              </View>
              <View className="space-y-4 gap-y-4">
                {SUGGESTED_ROOMS.map((room, idx) => (
                  <View key={idx} className="flex-row items-center">
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${room.color.split(' ')[0]}`}>
                       <Feather name={room.icon as any} size={16} className={room.color.split(' ')[1]} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-inter-bold text-xs mb-0.5" style={{ color: colors.textPrimary }}>{room.title}</Text>
                      <Text className="font-inter text-[10px]" style={{ color: colors.accent }}>{room.members} members online</Text>
                    </View>
                    <TouchableOpacity className="border px-3 py-1.5 rounded-md ml-2" style={{ borderColor: colors.border }}>
                      <Text className="font-inter-bold text-xs" style={{ color: colors.textPrimary }}>Join</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Community Guidelines */}
            <View style={getStandardCardStyle()}>
              <Text className="font-inter-bold text-sm mb-4" style={{ color: colors.textPrimary }}>Community Guidelines</Text>
              <View className="space-y-3 gap-y-3">
                {GUIDELINES.map((rule, idx) => (
                  <View key={idx} className="flex-row items-start">
                    <Feather name="check-circle" size={14} color={colors.textSecondary} style={{ marginTop: 2 }} />
                    <Text className="font-inter text-xs ml-2 flex-1" style={{ color: colors.textSecondary }}>{rule}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity className="w-full mt-6 py-2.5 border rounded-lg items-center" style={{ borderColor: colors.border }}>
                <Text className="font-inter-bold text-xs" style={{ color: colors.textPrimary }}>Read full guidelines</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>

      {/* Profile Card Popup */}
      {profileModalVisible && selectedUser && (
        <View className="absolute inset-0 z-50 justify-end bg-black/60">
          <TouchableOpacity className="absolute inset-0" onPress={() => setProfileModalVisible(false)} />
          <View 
            className="w-full max-w-lg mx-auto rounded-t-3xl p-6 border-t shadow-2xl" 
            style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}
          >
            <View className="w-12 h-1.5 rounded-full bg-gray-500/30 self-center mb-6" />
            
            <View className="flex-row items-center mb-6">
              <View 
                className="rounded-full items-center justify-center mr-4 border" 
                style={{ 
                  width: 64, 
                  height: 64, 
                  backgroundColor: getAvatarColour(selectedUser.full_name || ''), 
                  borderColor: 'rgba(255,255,255,0.1)' 
                }}
              >
                <Text className="font-inter-bold text-xl text-white">
                  {selectedUser.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="font-inter-bold text-2xl mr-2" style={{ color: colors.textPrimary }}>{selectedUser.full_name}</Text>
                  {selectedUser.is_pro && <Feather name="zap" size={16} color={colors.accent} />}
                </View>
                <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>{selectedUser.role} • Global</Text>
              </View>
            </View>

            <Text className="font-inter text-sm mb-6 leading-relaxed" style={{ color: colors.textPrimary }} numberOfLines={2}>
              {selectedUser.bio || 'IT Professional looking to connect and grow within the community.'}
            </Text>

            <View className="flex-row flex-wrap gap-2 mb-6">
              {['Network Administration', 'Technical Support', 'Cloud Computing'].map((skill, i) => (
                <View key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  <Text className="font-inter-medium text-xs" style={{ color: colors.textSecondary }}>{skill}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row justify-between mb-8 pb-6 border-b" style={{ borderColor: colors.border }}>
              <View className="items-center flex-1">
                <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>12</Text>
                <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Posts</Text>
              </View>
              <View className="items-center flex-1 border-x" style={{ borderColor: colors.border }}>
                <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>4</Text>
                <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Jobs Done</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>{(selectedUser.points || 0)}</Text>
                <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Points</Text>
              </View>
            </View>

            {showConnectForm ? (
              <View>
                <Text className="font-inter-medium text-sm mb-3" style={{ color: colors.textPrimary }}>Add a personal note (optional)</Text>
                <TextInput
                  className="w-full rounded-xl p-4 border font-inter text-sm mb-2 min-h-[80px]"
                  style={{ backgroundColor: colors.cardSurface, borderColor: colors.border, color: colors.textPrimary }}
                  placeholder="Hi! I'd like to connect..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  maxLength={120}
                  value={connectNote}
                  onChangeText={setConnectNote}
                />
                
                {errorMsg ? (
                  <View className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Text className="font-inter-medium text-xs text-red-500 text-center">{errorMsg}</Text>
                  </View>
                ) : null}

                <View className="flex-row gap-x-3 mt-4">
                  <TouchableOpacity 
                    className="flex-1 py-3.5 rounded-xl items-center border"
                    style={{ borderColor: colors.border }}
                    onPress={() => setShowConnectForm(false)}
                  >
                    <Text className="font-inter-medium text-sm" style={{ color: colors.textPrimary }}>Back</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-1 py-3.5 rounded-xl items-center"
                    style={{ backgroundColor: colors.accent }}
                    disabled={connecting}
                    onPress={submitConnectionRequest}
                  >
                    {connecting ? <ActivityIndicator size="small" color={colors.accentText} /> : <Text className="font-inter-bold text-sm" style={{ color: colors.accentText }}>Send Request</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="flex-row gap-x-4">
                <TouchableOpacity 
                  className="flex-1 py-3.5 rounded-xl items-center border"
                  style={{ borderColor: colors.border }}
                >
                  <Text className="font-inter-bold text-sm" style={{ color: colors.textPrimary }}>View Profile</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className={`flex-1 py-3.5 rounded-xl items-center flex-row justify-center ${(!userStatus || userStatus.reason === 'request_pending' || userStatus.reason === 'blocked') ? 'opacity-50' : ''}`}
                  style={{ backgroundColor: (userStatus?.canMessage || userStatus?.reason === 'not_connected') ? colors.accent : colors.cardSurface }}
                  disabled={!userStatus || userStatus.reason === 'request_pending' || userStatus.reason === 'blocked'}
                  onPress={handleAction}
                >
                  {!userStatus ? (
                    <ActivityIndicator size="small" color={colors.accentText} />
                  ) : (
                    <>
                      <Feather 
                        name={userStatus.canMessage ? 'message-circle' : userStatus.reason === 'request_pending' ? 'check' : 'user-plus'} 
                        size={16} 
                        color={userStatus.canMessage || userStatus.reason === 'not_connected' ? colors.accentText : colors.textPrimary} 
                        className="mr-2"
                      />
                      <Text className="font-inter-bold text-sm" style={{ color: userStatus.canMessage || userStatus.reason === 'not_connected' ? colors.accentText : colors.textPrimary }}>
                        {userStatus.canMessage ? 'Message' : userStatus.reason === 'request_pending' ? 'Request Sent' : 'Connect'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
            
            <View className="h-6" />
          </View>
        </View>
      )}
    </View>
  );
}
