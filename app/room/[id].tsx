import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Modal, TouchableWithoutFeedback } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { getRoomById, endRoom, addPoints } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/useTheme';
import Toast from 'react-native-toast-message';
import Skeleton from '@/components/Skeleton';

const AVATAR_COLORS = ['bg-blue-500', 'bg-teal-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-indigo-500'];

export default function RoomDetailScreen() {
  const { id } = useLocalSearchParams();
  const roomId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const updatePoints = useUserStore((state) => state.updatePoints);
  const { colors, mode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [messagesSentToday, setMessagesSentToday] = useState(0); // Track to limit points
  const [menuVisible, setMenuVisible] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    if (!profile || !roomId) return;
    
    let channel: any;

    const setupRoom = async () => {
      try {
        const roomData = await getRoomById(roomId);
        setRoom(roomData);
        setIsHost(roomData.created_by === profile.id);

        // Join room
        await supabase.from('room_members').upsert({
          room_id: roomId,
          user_id: profile.id,
          is_host: roomData.created_by === profile.id
        }, { onConflict: 'room_id, user_id' });

        // Load existing active members
        const { data: memberData } = await supabase
          .from('room_members')
          .select('*, profiles:user_id(id, full_name, role, points)')
          .eq('room_id', roomId);
        
        if (memberData) setMembers(memberData);

        // Subscriptions
        channel = supabase.channel(`room:${roomId}`);

        // Messages subscription
        channel.on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'room_messages',
          filter: `room_id=eq.${roomId}`
        }, async (payload: any) => {
          // Fetch sender profile details to display
          const { data: senderData } = await supabase.from('profiles').select('full_name, role').eq('user_id', payload.new.user_id).single();
          const enrichedMsg = { ...payload.new, profiles: senderData };
          
          setMessages(prev => [...prev, enrichedMsg]);
          
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 100);
        });

        // Members subscription (Join/Leave)
        channel.on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'room_members',
          filter: `room_id=eq.${roomId}`
        }, async () => {
          // Refresh members
          const { data: newMembers } = await supabase
            .from('room_members')
            .select('*, profiles:user_id(id, full_name, role, points)')
            .eq('room_id', roomId);
          if (newMembers) setMembers(newMembers);
        });

        channel.subscribe();

      } catch (error) {
        console.error(error);
        Toast.show({ type: 'error', text1: 'Error loading room' });
      } finally {
        setLoading(false);
      }
    };

    setupRoom();

    return () => {
      // Leave room
      if (roomId && profile.id) {
        supabase.from('room_members').delete().eq('room_id', roomId).eq('user_id', profile.id).then();
      }
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [roomId, profile?.id]);

  const handleSend = async () => {
    if (!newMessage.trim() || !profile || !roomId || isSending) return;
    
    setIsSending(true);
    const textToSend = newMessage.trim();
    setNewMessage('');
    
    try {
      await supabase.from('room_messages').insert({
        room_id: roomId,
        user_id: profile.id,
        content: textToSend
      });

      // Award Points (max 10 msgs per room)
      if (messagesSentToday < 10) {
        await addPoints(profile.id, 2, 'community_post'); // Using existing reason for simplicity
        updatePoints(2);
        setMessagesSentToday(prev => prev + 1);
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Failed to send message' });
    } finally {
      setIsSending(false);
    }
  };

  const handleEndRoom = async () => {
    if (!roomId) return;
    Alert.alert('End Room', 'Are you sure you want to end this live room?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Room', style: 'destructive', onPress: async () => {
        try {
          await endRoom(roomId);
          Toast.show({ type: 'success', text1: 'Room ended' });
          router.replace('/(tabs)/community');
        } catch (error) {
          Toast.show({ type: 'error', text1: 'Failed to end room' });
        }
      }}
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.backgroundPrimary }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!room) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.backgroundPrimary }}>
        <Text style={{ color: colors.textPrimary }}>Room not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 px-4 py-2 border rounded-lg" style={{ borderColor: colors.border }}>
          <Text style={{ color: colors.textPrimary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 md:px-8 py-4 border-b z-10" style={{ borderColor: colors.border, backgroundColor: colors.backgroundPrimary }}>
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-lg items-center justify-center border mr-4" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
            <Feather name="chevron-left" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              {room.is_live && <View className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2" />}
              <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }} numberOfLines={1}>{room.title}</Text>
            </View>
            <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>{members.length} online</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} className="p-2">
          <Feather name="more-vertical" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        {/* Dropdown Menu */}
        {menuVisible && (
          <View className="absolute top-16 right-4 border rounded-xl shadow-lg z-50 w-48" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
            {isHost ? (
              <TouchableOpacity onPress={() => { setMenuVisible(false); handleEndRoom(); }} className="px-4 py-3 flex-row items-center">
                <Feather name="power" size={16} color="#EF4444" className="mr-3" />
                <Text className="font-inter-medium text-[#EF4444]">End Room</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => { setMenuVisible(false); router.back(); }} className="px-4 py-3 flex-row items-center">
                <Feather name="log-out" size={16} color={colors.textPrimary} className="mr-3" />
                <Text className="font-inter-medium" style={{ color: colors.textPrimary }}>Leave Room</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Members Strip */}
      <View className="border-b py-3 px-4 md:px-8" style={{ borderColor: colors.border, backgroundColor: colors.cardSurface }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {members.map(member => {
            const authorName = member.profiles?.full_name || 'U';
            const initials = authorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            const avatarColor = AVATAR_COLORS[authorName.charCodeAt(0) % 6];
            
            return (
              <TouchableOpacity key={member.id} className="mr-3 items-center relative">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${avatarColor}`}>
                  <Text className="text-white font-inter-bold text-xs">{initials}</Text>
                </View>
                <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white bg-green-500" style={{ borderColor: colors.cardSurface }} />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Messages Area */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4 md:px-8 py-6"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <Text className="text-center font-inter text-xs mb-8" style={{ color: colors.textSecondary }}>
          ── Room started ──
        </Text>
        
        {messages.map(msg => {
          const isMe = msg.user_id === profile?.id;
          const authorName = msg.profiles?.full_name || 'Anonymous';
          const initials = authorName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
          const avatarColor = AVATAR_COLORS[authorName.charCodeAt(0) % 6];

          return (
            <View key={msg.id} className={`flex-row mb-6 ${isMe ? 'pl-2 border-l-2 border-lime-500' : ''}`}>
              <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 mt-1 ${avatarColor}`}>
                <Text className="text-white font-inter-bold text-[10px]">{initials}</Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-baseline mb-1">
                  <Text className="font-inter-bold text-sm mr-2" style={{ color: colors.textPrimary }}>{authorName}</Text>
                  <Text className="font-inter text-[10px]" style={{ color: colors.textSecondary }}>{msg.profiles?.role}</Text>
                </View>
                <Text className="font-inter text-sm leading-relaxed" style={{ color: colors.textPrimary }}>
                  {msg.content}
                </Text>
                <Text className="font-inter text-[9px] mt-1" style={{ color: colors.textSecondary }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Area */}
      {room.is_live ? (
        <View className="p-4 border-t" style={{ borderColor: colors.border, backgroundColor: colors.cardSurface }}>
          <View className="flex-row items-end">
            <TextInput
              className="flex-1 border rounded-2xl px-4 py-3 font-inter min-h-[48px] max-h-32"
              style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border, color: colors.textPrimary }}
              placeholder="Say something..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={newMessage}
              onChangeText={setNewMessage}
            />
            <TouchableOpacity 
              className="w-12 h-12 ml-3 rounded-full items-center justify-center"
              style={{ backgroundColor: newMessage.trim() ? '#84cc16' : colors.border }}
              onPress={handleSend}
              disabled={!newMessage.trim() || isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="send" size={18} color="#fff" style={{ marginLeft: -2, marginTop: 2 }} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View className="p-6 items-center justify-center border-t" style={{ borderColor: colors.border, backgroundColor: colors.cardSurface }}>
          <Text className="font-inter-bold text-red-500">This room has ended</Text>
        </View>
      )}

    </KeyboardAvoidingView>
  );
}
