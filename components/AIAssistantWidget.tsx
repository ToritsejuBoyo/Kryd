import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated, Modal, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { addPoints } from '@/lib/db';
import { useTheme } from '@/lib/useTheme';

type Message = {
  id: string;
  role: 'user' | 'ai';
  content: string;
};

const SUGGESTIONS = [
  "How do I configure a VPN on Windows 11?",
  "What certifications should I get for cloud jobs?",
  "How does the Kryd escrow system work?",
  "How do I increase my tier level?"
];

const RESPONSES: Record<string, string> = {
  'vpn': 'To configure a VPN on Windows 11: go to Settings → Network & Internet → VPN → Add VPN. Enter your server address, VPN type (usually IKEv2 or L2TP), and credentials. For corporate VPNs, ask your IT admin for the server details.',
  'certification': 'For IT Support, start with CompTIA A+ then Network+. For cloud roles, target AWS Cloud Practitioner or Google Cloud ACE. For security, CompTIA Security+ is the industry standard. Check the Kryd Learning Hub for courses on all of these.',
  'escrow': 'Kryd escrow holds your payment securely for 24 hours after job completion — much faster than Upwork (5 days) or Fiverr (14 days). The client confirms delivery, funds release automatically after 24 hours.',
  'tier': 'Your tier advances automatically based on: completed jobs, ratings received, learning modules finished, and community engagement. Keep earning points and completing jobs to move from New Talent to Intermediate to Verified Expert.',
  'default': 'Great question! For detailed IT guidance, I recommend checking the Kryd Learning Hub for relevant courses. For platform questions, visit your profile settings or post in the Community Hub where experienced IT professionals can help.'
};

function getResponse(query: string): string {
  const lower = query.toLowerCase();
  for (const [key, response] of Object.entries(RESPONSES)) {
    if (lower.includes(key)) return response;
  }
  return RESPONSES.default;
}

const TypingIndicator = () => {
  const [dots] = useState([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]);
  const { colors } = useTheme();

  useEffect(() => {
    const animate = () => {
      const animations = dots.map((dot, i) => 
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      );
      Animated.loop(Animated.parallel(animations)).start();
    };
    animate();
  }, []);

  return (
    <View className="flex-row items-center space-x-1 h-6">
      {dots.map((dot, i) => (
        <Animated.View 
          key={i} 
          className="w-1.5 h-1.5 rounded-full mx-0.5" 
          style={{ opacity: dot, backgroundColor: colors.textSecondary }}
        />
      ))}
    </View>
  );
};

export function AIAssistantWidget() {
  const profile = useUserStore((state) => state.profile);
  const updatePoints = useUserStore((state) => state.updatePoints);
  const { colors } = useTheme();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    if (profile) {
      try {
        await addPoints(profile.id, 5, 'ai_assistant_query');
        updatePoints(5);
      } catch (err) {
        console.error("Could not add points for query", err);
      }
    }

    setTimeout(() => {
      const aiResponse: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: getResponse(trimmed) 
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);
  };

  const clearChat = () => setMessages([]);

  if (!profile) return null;

  return (
    <>
      <TouchableOpacity 
        onPress={() => setIsOpen(true)}
        className="absolute bottom-6 right-6 w-16 h-16 rounded-2xl items-center justify-center shadow-lg border z-50 elevation-5 overflow-hidden"
        style={{ backgroundColor: colors.cardSurface, borderColor: colors.border, shadowColor: '#000' }}
      >
        <Image 
          source={require('@/assets/images/kryd-ai-logo.png')} 
          style={{ width: '100%', height: '100%' }} 
          resizeMode="cover"
        />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <View className="flex-1 justify-end sm:justify-end md:p-6 md:items-end">
          <TouchableOpacity 
            className="absolute inset-0 bg-black/60 hidden md:flex" 
            activeOpacity={1} 
            onPress={() => setIsOpen(false)} 
          />
          
          <KeyboardAvoidingView 
            className="w-full h-full md:w-[400px] md:h-[600px] md:max-h-[80vh] md:rounded-3xl md:border overflow-hidden shadow-2xl z-10"
            style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View className="flex-row justify-between items-center p-4 border-b pt-12 md:pt-4" style={{ backgroundColor: colors.backgroundPrimary, borderBottomColor: colors.border }}>
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3 border" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                  <Image source={require('@/assets/images/kryd-ai-logo.png')} style={{ width: 24, height: 24 }} resizeMode="contain" />
                </View>
                <View>
                  <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>Kryd AI</Text>
                  <Text className="font-inter text-xs" style={{ color: colors.accent }}>Always here to help</Text>
                </View>
              </View>
              <View className="flex-row items-center">
                {messages.length > 0 && (
                  <TouchableOpacity onPress={clearChat} className="px-3 py-1.5 mr-3 border rounded-lg" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                    <Text className="font-inter text-xs" style={{ color: colors.textSecondary }}>Clear</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setIsOpen(false)} className="w-8 h-8 items-center justify-center rounded-full" style={{ backgroundColor: colors.cardSurface }}>
                  <Feather name="x" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView 
              ref={scrollViewRef}
              className="flex-1 px-4 py-6"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            >
              {messages.length === 0 ? (
                <View className="flex-1 justify-center py-6">
                  <View className="items-center mb-8">
                    <View className="w-20 h-20 rounded-full items-center justify-center mb-4 border" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                      <Image source={require('@/assets/images/kryd-ai-logo.png')} style={{ width: 48, height: 48 }} resizeMode="contain" />
                    </View>
                    <Text className="font-inter-bold text-xl mb-2 text-center" style={{ color: colors.textPrimary }}>How can I help you today?</Text>
                    <Text className="font-inter text-center max-w-[280px] leading-relaxed" style={{ color: colors.textSecondary }}>
                      Ask me anything about IT troubleshooting, career growth, or how to use the Kryd platform.
                    </Text>
                  </View>

                  <View className="gap-y-3">
                    <Text className="font-inter-bold text-xs uppercase tracking-wider ml-1 mb-1" style={{ color: colors.textSecondary }}>Suggested Questions</Text>
                    {SUGGESTIONS.map((sug, idx) => (
                      <TouchableOpacity 
                        key={idx}
                        className="border p-4 rounded-xl flex-row items-center justify-between"
                        style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}
                        onPress={() => sendMessage(sug)}
                      >
                        <Text className="font-inter text-sm flex-1 pr-4" style={{ color: colors.textPrimary }}>{sug}</Text>
                        <Feather name="arrow-up-right" size={16} color={colors.accent} />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : (
                <View className="gap-y-6">
                  {messages.map((msg) => (
                    <View key={msg.id} className={`flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'ai' && (
                        <View className="w-8 h-8 rounded-full border items-center justify-center mr-2 mt-1" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                          <Image source={require('@/assets/images/kryd-ai-logo.png')} style={{ width: 16, height: 16 }} resizeMode="contain" />
                        </View>
                      )}
                      <View className={`max-w-[85%] p-3.5 ${
                        msg.role === 'user' 
                          ? 'rounded-2xl rounded-tr-sm' 
                          : 'border rounded-2xl rounded-tl-sm'
                      }`} style={{ 
                        backgroundColor: msg.role === 'user' ? colors.accent : colors.cardSurface,
                        borderColor: msg.role === 'user' ? 'transparent' : colors.border
                      }}>
                        <Text className="font-inter text-sm leading-relaxed" style={{ color: msg.role === 'user' ? colors.accentText : colors.textPrimary }}>
                          {msg.content}
                        </Text>
                      </View>
                    </View>
                  ))}

                  {isTyping && (
                    <View className="flex-row justify-start">
                      <View className="w-8 h-8 rounded-full border items-center justify-center mr-2 mt-1" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                        <Image source={require('@/assets/images/kryd-ai-logo.png')} style={{ width: 16, height: 16 }} resizeMode="contain" />
                      </View>
                      <View className="max-w-[80%] p-4 border rounded-2xl rounded-tl-sm items-center justify-center" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                        <TypingIndicator />
                      </View>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            <View className="p-4 border-t" style={{ backgroundColor: colors.backgroundPrimary, borderTopColor: colors.border }}>
              <View className="flex-row items-end border rounded-2xl p-1.5" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                <TextInput
                  className="flex-1 font-inter text-sm min-h-[40px] max-h-32 px-3 pt-2.5 pb-2.5"
                  style={{ color: colors.textPrimary }}
                  placeholder="Ask anything..."
                  placeholderTextColor={colors.textSecondary}
                  value={input}
                  onChangeText={setInput}
                  multiline
                  textAlignVertical="center"
                />
                <TouchableOpacity 
                  className={`w-9 h-9 rounded-full items-center justify-center ml-2 mb-0.5`}
                  style={{ backgroundColor: input.trim() ? colors.accent : colors.border }}
                  disabled={!input.trim()}
                  onPress={() => sendMessage(input)}
                >
                  <Feather name="arrow-up" size={16} color={input.trim() ? colors.accentText : colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}
