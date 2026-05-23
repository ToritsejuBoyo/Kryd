import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';
import { canMessage, getOrCreateConversation, sendConnectionRequest } from '@/lib/messaging';
import { useTheme } from '@/lib/useTheme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { PlatformFooter } from '@/components/PlatformFooter';

export default function NewMessageScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const { colors, mode } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userStatuses, setUserStatuses] = useState<Record<string, any>>({});
  
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [connectNote, setConnectNote] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (searchQuery.length > 2) {
      const delay = setTimeout(() => searchUsers(), 500);
      return () => clearTimeout(delay);
    } else {
      setResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', `%${searchQuery}%`)
        .neq('user_id', profile.id)
        .limit(20);

      if (error) throw error;
      
      setResults(data || []);
      
      // Fetch statuses
      const statuses: Record<string, any> = {};
      for (const user of (data || [])) {
        const status = await canMessage(profile.id, user.user_id);
        statuses[user.user_id] = status;
      }
      setUserStatuses(statuses);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (user: any) => {
    const status = userStatuses[user.user_id];
    if (!status || !profile?.id) return;

    if (status.canMessage) {
      try {
        const conv = await getOrCreateConversation(profile.id, user.user_id);
        router.replace(`/conversation/${conv.id}`);
      } catch (err) {
        console.error(err);
      }
    } else if (status.reason === 'not_connected') {
      setSelectedUser(user);
      setConnectModalVisible(true);
      setErrorMsg('');
      setConnectNote('');
    }
  };

  const handleConnect = async () => {
    if (!profile?.id || !selectedUser) return;
    setConnecting(true);
    setErrorMsg('');
    try {
      await sendConnectionRequest(profile.id, selectedUser.user_id, connectNote.trim());
      setUserStatuses(prev => ({ ...prev, [selectedUser.user_id]: { canMessage: false, reason: 'request_pending' } }));
      setConnectModalVisible(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send request');
    } finally {
      setConnecting(false);
    }
  };

  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  return (
    <View className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <GlobalHeader />
      <View className="w-full max-w-4xl mx-auto flex-1">
        <View className="flex-row items-center px-4 py-4 border-b" style={{ borderColor: colors.border }}>
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full hover:bg-white/10">
          <Feather name="arrow-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="font-inter-bold text-xl" style={{ color: colors.textPrimary }}>New Message</Text>
      </View>

      <View className="p-4 border-b" style={{ borderColor: colors.border }}>
        <View className="flex-row items-center border rounded-xl px-4 py-3" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
          <Feather name="search" size={20} color={colors.textSecondary} className="mr-3" />
          <TextInput
            className="flex-1 font-inter text-base"
            style={{ color: colors.textPrimary }}
            placeholder="Search by name..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      <ScrollView className="flex-1 px-4 py-2">
        {loading ? (
          <ActivityIndicator size="large" color={colors.accent} className="mt-8" />
        ) : results.length > 0 ? (
          results.map((user) => {
            const status = userStatuses[user.user_id];
            if (status?.reason === 'blocked') return null; // hide blocked users
            
            return (
              <View key={user.id} className="flex-row items-center py-4 border-b" style={{ borderColor: colors.border }}>
                <View className="w-12 h-12 rounded-full items-center justify-center mr-4 bg-emerald-500/20 border border-emerald-500/30">
                  <Text className="font-inter-bold text-sm text-emerald-500">{getInitials(user.full_name)}</Text>
                </View>
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center mb-1">
                    <Text className="font-inter-bold text-base mr-2" style={{ color: colors.textPrimary }}>{user.full_name}</Text>
                    {user.is_pro && <Feather name="zap" size={12} color={colors.accent} />}
                  </View>
                  <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>{user.role}</Text>
                </View>
                
                {status && (
                  <TouchableOpacity 
                    className={`px-4 py-2 rounded-full border ${status.reason === 'request_pending' ? 'opacity-50' : ''}`}
                    style={{ 
                      backgroundColor: status.canMessage ? colors.accent : 'transparent',
                      borderColor: status.canMessage ? colors.accent : colors.border
                    }}
                    disabled={status.reason === 'request_pending'}
                    onPress={() => handleAction(user)}
                  >
                    <Text className={`font-inter-bold text-xs`} style={{ color: status.canMessage ? colors.accentText : colors.textPrimary }}>
                      {status.canMessage ? 'Message' : status.reason === 'request_pending' ? 'Request sent ✓' : 'Connect'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        ) : searchQuery.length > 2 ? (
          <Text className="font-inter text-center mt-8" style={{ color: colors.textSecondary }}>No users found.</Text>
        ) : null}
      </ScrollView>
      </View>
      <PlatformFooter />

      {/* Connect Modal */}
      <Modal visible={connectModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/80 px-4">
          <View className="w-full max-w-md rounded-2xl p-6 border" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
            <Text className="font-inter-bold text-xl mb-2" style={{ color: colors.textPrimary }}>Connect with {selectedUser?.full_name?.split(' ')[0]}</Text>
            <Text className="font-inter text-sm mb-6 leading-relaxed" style={{ color: colors.textSecondary }}>
              Send a connection request to start messaging. You can optionally include a short personal note.
            </Text>

            <TextInput
              className="w-full rounded-xl p-4 border font-inter text-base mb-2 min-h-[100px]"
              style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border, color: colors.textPrimary }}
              placeholder="Send a personal note (optional)"
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={120}
              value={connectNote}
              onChangeText={setConnectNote}
            />
            <Text className="font-inter text-xs text-right mb-6" style={{ color: colors.textSecondary }}>{connectNote.length}/120</Text>
            
            {errorMsg ? (
              <View className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <Text className="font-inter-medium text-xs text-red-500 text-center">{errorMsg}</Text>
              </View>
            ) : null}

            <View className="flex-row gap-x-3">
              <TouchableOpacity 
                className="flex-1 py-3 rounded-xl items-center border"
                style={{ borderColor: colors.border }}
                onPress={() => setConnectModalVisible(false)}
              >
                <Text className="font-inter-medium text-sm" style={{ color: colors.textPrimary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: colors.accent }}
                disabled={connecting}
                onPress={handleConnect}
              >
                {connecting ? <ActivityIndicator size="small" color={colors.accentText} /> : <Text className="font-inter-bold text-sm" style={{ color: colors.accentText }}>Send Request</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
