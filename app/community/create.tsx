import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { createCommunityPost, addPoints } from '@/lib/db';
import { PlatformFooter } from '@/components/PlatformFooter';

const GROUPS = ['IT Support', 'Cloud', 'Security', 'Helpdesk', 'Career'];

export default function CreatePostScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const updatePoints = useUserStore((state) => state.updatePoints);

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charCount = content.length;
  const remainingChars = 500 - charCount;
  const isValid = selectedGroup !== null && charCount >= 20 && charCount <= 500;

  const handlePost = async () => {
    if (!profile || !isValid) return;

    setIsSubmitting(true);
    try {
      // 1. Create post
      await createCommunityPost({
        user_id: profile.id,
        group_name: selectedGroup!,
        content: content.trim()
      });

      // 2. Add points
      await addPoints(profile.id, 10, 'community_post');

      // 3. Update Zustand store
      updatePoints(10);

      // 4. Navigate back
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-background" 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
            <View className="w-full max-w-5xl mx-auto px-4 md:px-8 flex-1 pt-4">
              {/* Header */}
              <View className="flex-row items-center justify-between py-4 mb-6 border-b border-white/5">
                <View className="flex-row items-center space-x-4">
                  <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="w-10 h-10 rounded-lg bg-white/5 items-center justify-center border border-white/10 active:bg-white/10"
                  >
                    <FontAwesome5 name="chevron-left" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text className="text-xl font-bold text-white tracking-tight">New Post</Text>
                </View>
                <TouchableOpacity 
                  onPress={handlePost}
                  disabled={!isValid || isSubmitting}
                  className={`px-4 py-2 rounded-full ${isValid && !isSubmitting ? 'bg-primary' : 'bg-surface border border-surfaceBorder'}`}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#0B2D2C" />
                  ) : (
                    <Text className={`font-inter-bold ${isValid ? 'text-background' : 'text-textSecondary'}`}>
                      Post
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
        {/* Group Selector */}
        <View className="pt-6 pb-4">
          <Text className="px-4 text-textSecondary font-inter-medium mb-3">Post to</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 flex-row">
            {GROUPS.map(group => (
              <TouchableOpacity 
                key={group}
                onPress={() => setSelectedGroup(group)}
                className={`mr-3 px-4 py-2.5 rounded-full border ${selectedGroup === group ? 'bg-primary/20 border-primary' : 'bg-surface border-surfaceBorder'}`}
              >
                <Text className={`font-inter-medium ${selectedGroup === group ? 'text-primary' : 'text-textPrimary'}`}>
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
            <View className="w-4" /> {/* Right padding spacer */}
          </ScrollView>
        </View>

        {/* Text Input */}
        <View className="px-4 pt-2">
          <TextInput
            className="text-textPrimary font-inter text-lg min-h-[150px]"
            placeholder="Share something with the IT community..."
            placeholderTextColor="#9CA3AF"
            multiline
            autoFocus
            textAlignVertical="top"
            value={content}
            onChangeText={setContent}
            maxLength={500}
          />
          
          <View className="flex-row justify-between items-center mt-2 pb-6">
            <View>
              {charCount > 0 && charCount < 20 && (
                <Text className="text-red-400 font-inter text-xs">
                  Minimum 20 characters
                </Text>
              )}
            </View>
            <Text className={`font-inter-medium text-xs ${remainingChars <= 50 ? 'text-red-400' : 'text-textSecondary'}`}>
              {charCount} / 500
            </Text>
          </View>
              </View>
            </View>
            <PlatformFooter />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
