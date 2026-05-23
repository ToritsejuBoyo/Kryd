import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/useTheme';
import { PlatformFooter } from '@/components/PlatformFooter';
import Skeleton from '@/components/Skeleton';

export default function MessagesScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const { colors, mode } = useTheme();

  const [activeTab, setActiveTab] = useState<'Inbox' | 'Requests'>('Inbox');
  const [conversations, setConversations] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchConversations();
      fetchRequests();
    }
  }, [profile?.id]);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_one_profile:profiles!conversations_participant_one_fkey (id, full_name, role, is_pro, points, avatar_url),
          participant_two_profile:profiles!conversations_participant_two_fkey (id, full_name, role, is_pro, points, avatar_url),
          messages (id, content, created_at, is_read, sender_id)
        `)
        .or(`participant_one.eq.${profile?.id},participant_two.eq.${profile?.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('connection_requests')
        .select(`
          *,
          sender:profiles!connection_requests_sender_id_fkey (id, full_name, role, is_pro, points, avatar_url)
        `)
        .eq('receiver_id', profile?.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptRequest = async (requestId: string, senderId: string) => {
    try {
      await supabase.from('connection_requests').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('id', requestId);
      await supabase.from('connections').insert({ user_one: profile?.id, user_two: senderId });
      
      const { data: conv } = await supabase.from('conversations').insert({
        participant_one: profile?.id,
        participant_two: senderId,
        context: 'connection'
      }).select().single();
      
      fetchRequests();
      if (conv) {
        router.push(`/conversation/${conv.id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await supabase.from('connection_requests').update({ status: 'declined', responded_at: new Date().toISOString() }).eq('id', requestId);
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const getOtherParticipant = (conv: any) => {
    return conv.participant_one === profile?.id ? conv.participant_two_profile : conv.participant_one_profile;
  };

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  return (
    <View className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="w-full max-w-4xl mx-auto px-4 md:px-8 py-8">
          
          <View className="flex-row justify-between items-center mb-8">
            <Text className="font-inter-bold text-3xl" style={{ color: colors.textPrimary }}>Messages</Text>
            <TouchableOpacity 
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.cardSurface, borderColor: colors.border, borderWidth: 1 }}
              onPress={() => router.push('/messages/new' as any)}
            >
              <Feather name="edit" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View className="flex-row border-b mb-6" style={{ borderColor: colors.border }}>
            <TouchableOpacity 
              className="flex-row items-center px-6 py-4 border-b-2"
              style={{ borderColor: activeTab === 'Inbox' ? colors.accent : 'transparent' }}
              onPress={() => setActiveTab('Inbox')}
            >
              <Text className="font-inter-bold text-sm" style={{ color: activeTab === 'Inbox' ? colors.textPrimary : colors.textSecondary }}>Inbox</Text>
              <View className="ml-2 bg-white/10 px-2 py-0.5 rounded-full">
                 <Text className="font-inter-medium text-xs" style={{ color: colors.textSecondary }}>{conversations.length}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center px-6 py-4 border-b-2"
              style={{ borderColor: activeTab === 'Requests' ? colors.accent : 'transparent' }}
              onPress={() => setActiveTab('Requests')}
            >
              <Text className="font-inter-bold text-sm" style={{ color: activeTab === 'Requests' ? colors.textPrimary : colors.textSecondary }}>Requests</Text>
              {requests.length > 0 && (
                <View className="ml-2 px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.accent }}>
                   <Text className="font-inter-bold text-xs" style={{ color: colors.accentText }}>{requests.length}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="gap-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="w-full h-24 rounded-xl" />)}
            </View>
          ) : activeTab === 'Inbox' ? (
            <View className="gap-y-2">
              {conversations.length > 0 ? conversations.map((conv) => {
                const otherUser = getOtherParticipant(conv);
                const lastMessage = conv.messages?.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
                const unreadCount = conv.messages?.filter((m: any) => !m.is_read && m.sender_id !== profile?.id).length || 0;
                
                return (
                  <TouchableOpacity 
                    key={conv.id} 
                    className="flex-row items-center p-4 rounded-xl hover:bg-white/5 transition-colors"
                    onPress={() => router.push(`/conversation/${conv.id}`)}
                  >
                    <View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-emerald-500/20 border border-emerald-500/30">
                      <Text className="font-inter-bold text-sm text-emerald-500">{getInitials(otherUser?.full_name)}</Text>
                    </View>
                    <View className="flex-1 mr-4">
                      <View className="flex-row items-center mb-1">
                        <Text className="font-inter-bold text-base mr-2" style={{ color: colors.textPrimary }}>{otherUser?.full_name}</Text>
                        {otherUser?.is_pro && <Feather name="zap" size={12} color={colors.accent} />}
                      </View>
                      <Text className="font-inter text-sm" style={{ color: colors.textSecondary }} numberOfLines={1}>
                        {lastMessage ? lastMessage.content : 'No messages yet'}
                      </Text>
                    </View>
                    <View className="items-end justify-center">
                      <Text className="font-inter text-xs mb-2" style={{ color: colors.textSecondary }}>
                        {lastMessage ? new Date(lastMessage.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </Text>
                      {unreadCount > 0 && (
                        <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: colors.accent }}>
                          <Text className="font-inter-bold text-[10px]" style={{ color: colors.accentText }}>{unreadCount}</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }) : (
                <View className="py-16 items-center justify-center border border-dashed rounded-xl px-6" style={{ borderColor: colors.border }}>
                  <Feather name="message-square" size={32} color={colors.textSecondary} className="mb-4" />
                  <Text className="font-inter-medium text-center text-sm leading-relaxed" style={{ color: colors.textSecondary }}>
                    No messages yet. Connect with IT professionals in the community or apply to jobs to start conversations.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View className="gap-y-4">
              {requests.length > 0 ? requests.map((req) => (
                <View key={req.id} className="p-5 rounded-xl border flex-col md:flex-row justify-between items-start md:items-center" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                  <View className="flex-row items-center flex-1 mb-4 md:mb-0 mr-4">
                    <View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-blue-500/20 border border-blue-500/30">
                      <Text className="font-inter-bold text-sm text-blue-500">{getInitials(req.sender?.full_name)}</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <Text className="font-inter-bold text-base mr-2" style={{ color: colors.textPrimary }}>{req.sender?.full_name}</Text>
                        <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>• {new Date(req.created_at).toLocaleDateString()}</Text>
                      </View>
                      <Text className="font-inter text-xs mb-1" style={{ color: colors.textSecondary }}>{req.sender?.role}</Text>
                      {req.message && (
                        <Text className="font-inter italic text-sm mt-2 p-3 rounded-lg bg-white/5" style={{ color: colors.textPrimary }}>"{req.message}"</Text>
                      )}
                    </View>
                  </View>
                  
                  <View className="flex-row gap-x-3 w-full md:w-auto">
                    <TouchableOpacity 
                      className="flex-1 md:flex-none px-6 py-2.5 rounded-full items-center border"
                      style={{ borderColor: colors.border }}
                      onPress={() => handleDeclineRequest(req.id)}
                    >
                      <Text className="font-inter-medium text-sm" style={{ color: colors.textPrimary }}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      className="flex-1 md:flex-none px-6 py-2.5 rounded-full items-center"
                      style={{ backgroundColor: colors.accent }}
                      onPress={() => handleAcceptRequest(req.id, req.sender?.id)}
                    >
                      <Text className="font-inter-bold text-sm" style={{ color: colors.accentText }}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )) : (
                <View className="py-16 items-center justify-center border border-dashed rounded-xl" style={{ borderColor: colors.border }}>
                  <Feather name="users" size={32} color={colors.textSecondary} className="mb-4" />
                  <Text className="font-inter-medium text-sm text-center" style={{ color: colors.textSecondary }}>
                    No pending requests.
                  </Text>
                </View>
              )}
            </View>
          )}

        </View>
        <PlatformFooter />
      </ScrollView>
    </View>
  );
}
