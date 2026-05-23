import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { createRoom, addPoints } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/useTheme';
import Toast from 'react-native-toast-message';

const TOPICS = ['IT Support', 'Cloud', 'Security', 'Helpdesk', 'Career', 'Hiring & Projects', 'General'];

export default function CreateRoomScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const updatePoints = useUserStore((state) => state.updatePoints);
  const { colors, mode } = useTheme();

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('IT Support');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showTopicDropdown, setShowTopicDropdown] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      Toast.show({ type: 'error', text1: 'Room title is required' });
      return;
    }
    if (!profile) return;

    setIsSubmitting(true);
    try {
      // 1. Create Room
      const newRoom = await createRoom({
        title: title.trim(),
        description: description.trim(),
        topic,
        is_private: isPrivate,
        created_by: profile.id
      });

      // 2. Join Room as Host
      await supabase.from('room_members').insert({
        room_id: newRoom.id,
        user_id: profile.id,
        is_host: true
      });

      // 3. Award Points (+20 for creating room)
      await addPoints(profile.id, 20, 'room_created');
      updatePoints(20);

      Toast.show({ type: 'success', text1: 'Room created!', text2: '+20 points awarded' });
      
      // Navigate to the room directly
      router.replace(`/room/${newRoom.id}`);

    } catch (error: any) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Failed to create room', text2: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <View className="flex-row items-center px-4 md:px-8 py-4 border-b" style={{ borderColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-lg items-center justify-center border" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
          <Feather name="chevron-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text className="font-inter-bold text-lg ml-4" style={{ color: colors.textPrimary }}>Create a Room</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        <View className="max-w-2xl mx-auto w-full">
          
          <Text className="font-inter-medium mb-2" style={{ color: colors.textPrimary }}>Room Title *</Text>
          <TextInput
            className="border rounded-xl px-4 py-3 font-inter mb-6"
            style={{ backgroundColor: colors.cardSurface, borderColor: colors.border, color: colors.textPrimary }}
            placeholder="e.g. AWS Certification Study Group"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />

          <Text className="font-inter-medium mb-2" style={{ color: colors.textPrimary }}>Topic *</Text>
          <View className="relative mb-6 z-10">
            <TouchableOpacity 
              className="border rounded-xl px-4 py-3 flex-row justify-between items-center"
              style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}
              onPress={() => setShowTopicDropdown(!showTopicDropdown)}
            >
              <Text className="font-inter text-base" style={{ color: colors.textPrimary }}>{topic}</Text>
              <Feather name={showTopicDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {showTopicDropdown && (
              <View className="absolute top-14 left-0 right-0 border rounded-xl shadow-lg overflow-hidden" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                {TOPICS.map((t) => (
                  <TouchableOpacity 
                    key={t}
                    className="px-4 py-3 border-b border-white/5 hover:bg-white/5"
                    onPress={() => { setTopic(t); setShowTopicDropdown(false); }}
                  >
                    <Text className="font-inter text-base" style={{ color: colors.textPrimary }}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View className="-z-10">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-inter-medium" style={{ color: colors.textPrimary }}>Description</Text>
              <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>{description.length}/120</Text>
            </View>
            <TextInput
              className="border rounded-xl px-4 py-3 font-inter mb-6 min-h-[100px]"
              style={{ backgroundColor: colors.cardSurface, borderColor: colors.border, color: colors.textPrimary }}
              placeholder="What will you discuss?"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              maxLength={120}
            />

            <View className="flex-row items-center justify-between border rounded-xl p-4 mb-8" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
              <View className="flex-1 mr-4">
                <Text className="font-inter-bold text-base mb-1" style={{ color: colors.textPrimary }}>Private Room</Text>
                <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>Only people with the link can join.</Text>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#FFF"
              />
            </View>

            <TouchableOpacity 
              className="w-full py-4 rounded-xl items-center flex-row justify-center"
              style={{ backgroundColor: isSubmitting || !title.trim() ? 'rgba(59, 130, 246, 0.5)' : '#3B82F6' }}
              onPress={handleCreate}
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text className="font-inter-bold text-lg text-white">Create Room</Text>
              )}
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
