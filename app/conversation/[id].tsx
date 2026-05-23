import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { supabase } from '@/lib/supabase';
import { sendMessage } from '@/lib/messaging';
import { useTheme } from '@/lib/useTheme';

export default function ConversationScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const { colors, mode } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile?.id && id) {
      fetchConversation();
    }
  }, [profile?.id, id]);

  useEffect(() => {
    if (!id || !profile?.id) return;
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
        // Auto scroll on new message
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, profile?.id]);

  const fetchConversation = async () => {
    try {
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          participant_one_profile:profiles!conversations_participant_one_fkey (id, full_name, role, is_pro, points, avatar_url),
          participant_two_profile:profiles!conversations_participant_two_fkey (id, full_name, role, is_pro, points, avatar_url),
          job:jobs (id, title, salary_min, company)
        `)
        .eq('id', id)
        .single();

      if (convError) throw convError;
      setConversation(convData);
      
      const other = convData.participant_one === profile?.id ? convData.participant_two_profile : convData.participant_one_profile;
      setOtherUser(other);

      const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', id)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;
      setMessages(msgData || []);
      
      // Mark as read
      await supabase.from('messages').update({ is_read: true }).eq('conversation_id', id).neq('sender_id', profile?.id);

      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: false }), 200);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !profile?.id || sending) return;
    setSending(true);
    setErrorMsg('');

    try {
      await sendMessage(profile.id, id as string, inputText.trim());
      setInputText('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleBlock = async () => {
    try {
      await supabase.from('blocked_users').insert({
        blocker_id: profile?.id,
        blocked_id: otherUser?.id
      });
      setMenuVisible(false);
      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.backgroundPrimary }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Check unanswered limit
  let unansweredCount = 0;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender_id === profile?.id) unansweredCount++;
    else break;
  }
  const isLimitReached = unansweredCount >= 10;
  const isFirstMessage = messages.length === 0;

  return (
    <KeyboardAvoidingView 
      className="flex-1" 
      style={{ backgroundColor: colors.backgroundPrimary }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 border-b z-20" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full hover:bg-white/10">
            <Feather name="arrow-left" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 items-center justify-center mr-3 relative">
            <Text className="font-inter-bold text-sm text-emerald-500">
              {otherUser?.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || '?'}
            </Text>
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2" style={{ borderColor: colors.backgroundPrimary }} />
          </View>
          <View>
            <Text className="font-inter-bold text-base" style={{ color: colors.textPrimary }}>{otherUser?.full_name}</Text>
            <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Active now</Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} className="p-2 rounded-full hover:bg-white/10">
          <Feather name="more-vertical" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        {menuVisible && (
          <View className="absolute top-16 right-4 rounded-xl border p-2 w-48 shadow-lg" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
            <TouchableOpacity className="px-4 py-3 border-b" style={{ borderColor: colors.border }} onPress={() => setMenuVisible(false)}>
              <Text className="font-inter-medium text-sm" style={{ color: colors.textPrimary }}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-3 border-b" style={{ borderColor: colors.border }} onPress={() => setMenuVisible(false)}>
              <Text className="font-inter-medium text-sm" style={{ color: colors.textPrimary }}>Report User</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-4 py-3" onPress={handleBlock}>
              <Text className="font-inter-bold text-sm text-red-500">Block</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Job Banner (If context is job) */}
      {conversation?.context === 'job' && conversation?.job && (
        <TouchableOpacity 
          className="px-4 py-3 border-b flex-row items-center justify-between"
          style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border }}
          onPress={() => router.push(`/job/${conversation.job.id}` as any)}
        >
          <View className="flex-row items-center flex-1 pr-4">
            <Feather name="briefcase" size={16} color={colors.textSecondary} className="mr-3" />
            <Text className="font-inter-medium text-sm flex-1" style={{ color: colors.textPrimary }} numberOfLines={1}>
              {conversation.job.title} — ${conversation.job.salary_min} · {conversation.job.company}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4 py-6"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, index) => {
          const isMine = msg.sender_id === profile?.id;
          const showDate = index === 0 || new Date(msg.created_at).getDate() !== new Date(messages[index - 1].created_at).getDate();
          
          return (
            <View key={msg.id} className="mb-4">
              {showDate && (
                <View className="items-center mb-6 mt-2">
                  <View className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <Text className="font-inter-medium text-xs" style={{ color: colors.textSecondary }}>
                      {new Date(msg.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              )}
              
              <View className={`flex-row ${isMine ? 'justify-end' : 'justify-start'}`}>
                <View 
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${isMine ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
                  style={{ 
                    backgroundColor: isMine ? colors.accent : colors.cardSurface,
                    borderWidth: isMine ? 0 : 1,
                    borderColor: isMine ? 'transparent' : colors.border
                  }}
                >
                  <Text className="font-inter text-sm leading-relaxed" style={{ color: isMine ? colors.accentText : colors.textPrimary }}>
                    {msg.content}
                  </Text>
                  <Text className={`font-inter text-[10px] mt-1 text-right ${isMine ? 'opacity-70 text-current' : 'opacity-50 text-white'}`} style={{ color: isMine ? colors.accentText : colors.textSecondary }}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
        {isTyping && (
          <View className="flex-row justify-start mb-4">
             <View className="rounded-2xl rounded-tl-sm px-4 py-3 border" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                <Text className="font-inter font-bold" style={{ color: colors.textSecondary }}>...</Text>
             </View>
          </View>
        )}
        <View className="h-4" />
      </ScrollView>

      {/* Input Area */}
      <View className="border-t p-4 pb-6" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
        {errorMsg ? (
          <View className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <Text className="font-inter-medium text-xs text-red-500 text-center">{errorMsg}</Text>
          </View>
        ) : null}

        {isLimitReached ? (
          <View className="p-4 rounded-xl items-center border" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
            <Feather name="clock" size={24} color={colors.textSecondary} className="mb-2" />
            <Text className="font-inter-medium text-sm text-center" style={{ color: colors.textSecondary }}>
              You have sent 10 messages without a reply. Waiting for {otherUser?.full_name?.split(' ')[0]} to respond before you can send more.
            </Text>
          </View>
        ) : (
          <View>
            {isFirstMessage && (
              <Text className="font-inter text-xs text-center mb-2" style={{ color: colors.textSecondary }}>
                🔒 Links are not allowed in first messages
              </Text>
            )}
            <View className="flex-row items-end">
              <TextInput
                className="flex-1 min-h-[44px] max-h-32 rounded-2xl px-4 py-3 border font-inter text-base"
                style={{ backgroundColor: colors.cardSurface, borderColor: colors.border, color: colors.textPrimary }}
                placeholder="Type a message..."
                placeholderTextColor={colors.textSecondary}
                multiline
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity 
                className={`w-11 h-11 rounded-full items-center justify-center ml-3 ${inputText.trim() ? '' : 'opacity-50'}`}
                style={{ backgroundColor: colors.accent }}
                disabled={!inputText.trim() || sending}
                onPress={handleSend}
              >
                {sending ? <ActivityIndicator size="small" color={colors.accentText} /> : <Feather name="send" size={16} color={colors.accentText} />}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
