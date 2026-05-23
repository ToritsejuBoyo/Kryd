import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, seedNotifications } from '@/lib/db';
import Skeleton from '@/components/Skeleton';
import { PlatformFooter } from '@/components/PlatformFooter';
import { useTheme } from '@/lib/useTheme';
import { DESIGN } from '@/lib/design';

const getNotificationDetails = (message: string) => {
  const msg = message.toLowerCase();
  if (msg.includes('job match')) return { type: 'job_match', icon: 'briefcase', color: '#60A5FA', bg: 'bg-blue-400/20', route: '/(tabs)/jobs' };
  if (msg.includes('earned')) return { type: 'points_earned', icon: 'zap', color: '#1D9E75', bg: 'bg-[#1D9E75]/20', route: '/wallet' };
  if (msg.includes('application') && msg.includes('viewed')) return { type: 'application_viewed', icon: 'eye', color: '#FBBF24', bg: 'bg-amber-400/20', route: '/(tabs)/jobs' };
  if (msg.includes('application') && msg.includes('rejected')) return { type: 'application_rejected', icon: 'x-circle', color: '#F87171', bg: 'bg-red-400/20', route: '/(tabs)/jobs' };
  if (msg.includes('advanced')) return { type: 'tier_advanced', icon: 'trending-up', color: '#FACC15', bg: 'bg-yellow-400/20', route: '/(tabs)' };
  if (msg.includes('recommends')) return { type: 'course_recommended', icon: 'book', color: '#2DD4BF', bg: 'bg-teal-400/20', route: '/(tabs)/learn' };
  if (msg.includes('challenge')) return { type: 'daily_challenge', icon: 'award', color: '#FB923C', bg: 'bg-orange-400/20', route: '/(tabs)' };
  if (msg.includes('reply')) return { type: 'community_reply', icon: 'message-circle', color: '#C084FC', bg: 'bg-purple-400/20', route: '/(tabs)/community' };
  
  return { type: 'system', icon: 'bell', color: '#9CA3AF', bg: 'bg-gray-400/20', route: '/(tabs)' };
};

const getTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const { colors, mode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) loadData();
  }, [profile?.id]);

  const loadData = async () => {
    if (!profile) return;
    try {
      let data = await getNotifications(profile.id);
      if (data.length === 0) {
        data = await seedNotifications(profile.id);
        data = data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!profile) return;
    try {
      await markAllNotificationsAsRead(profile.id);
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationPress = async (notification: any) => {
    const details = getNotificationDetails(notification.message);
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
        setNotifications(notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
      } catch (err) {
        console.error(err);
      }
    }
    router.push(details.route as any);
  };

  const renderItem = ({ item }: { item: any }) => {
    const details = getNotificationDetails(item.message);
    const parts = item.message.split(' — ');
    const title = parts[0];
    const subtitle = parts.length > 1 ? parts[1] : null;
    const isLight = mode === 'light';
    const isHovered = hoveredId === item.id;

    const cardStyle = {
      backgroundColor: !item.is_read 
        ? (isLight ? '#F9FDFB' : 'rgba(204,223,26,0.05)') 
        : (isLight ? '#FFFFFF' : 'rgba(255,255,255,0.03)'),
      borderRadius: DESIGN.radius.lg,
      borderWidth: 1,
      borderColor: isHovered 
        ? '#CCDF1A' 
        : (isLight ? '#E5E7EB' : 'rgba(255,255,255,0.08)'),
      borderLeftWidth: !item.is_read ? 5 : 1,
      borderLeftColor: !item.is_read ? colors.accent : (isLight ? '#E5E7EB' : 'rgba(255,255,255,0.08)'),
      padding: DESIGN.cardPadding.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isLight ? 0.04 : 0.25,
      shadowRadius: 6,
      elevation: 2,
      marginBottom: 12,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    };

    return (
      <TouchableOpacity 
        style={cardStyle}
        onPress={() => handleNotificationPress(item)}
        {...{
          onMouseEnter: () => setHoveredId(item.id),
          onMouseLeave: () => setHoveredId(null)
        } as any}
      >
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${details.bg}`}>
          <Feather name={details.icon as any} size={20} color={details.color} />
        </View>
        <View className="flex-1 mr-2">
          <Text className={`font-inter-medium text-base ${!item.is_read ? 'font-inter-bold' : ''}`} style={{ color: colors.textPrimary }}>
            {title}
          </Text>
          {subtitle && (
            <Text className="font-inter text-sm mt-1" style={{ color: colors.textSecondary }}>{subtitle}</Text>
          )}
        </View>
        <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>{getTimeAgo(item.created_at)}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <View className="flex-row justify-between items-center p-4 border-b pt-10" style={{ borderBottomColor: colors.border }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text className="font-inter-bold text-xl" style={{ color: colors.textPrimary }}>Notifications</Text>
        </View>
        {notifications.some(n => !n.is_read) && (
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Text className="font-inter-medium text-sm" style={{ color: colors.accent }}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="p-4">
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} className="flex-row items-center p-4 border-b" style={{ borderBottomColor: colors.border }}>
               <Skeleton className="w-12 h-12 rounded-full mr-4" />
               <View className="flex-1">
                 <Skeleton className="w-3/4 h-5 mb-2" />
                 <Skeleton className="w-1/2 h-4" />
               </View>
            </View>
          ))}
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16, maxWidth: 800, width: '100%', alignSelf: 'center', paddingTop: 16 }}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-6 mt-10">
          <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: 'rgba(204,223,26,0.1)' }}>
            <Feather name="bell" size={48} color={colors.accent} />
          </View>
          <Text className="font-inter-bold text-xl mb-2 text-center" style={{ color: colors.textPrimary }}>No notifications yet</Text>
          <Text className="font-inter text-center max-w-xs leading-relaxed" style={{ color: colors.textSecondary }}>
            We will notify you about job matches, points earned, and platform updates.
          </Text>
        </View>
      )}
      <PlatformFooter />
    </SafeAreaView>
  );
}
