import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { getCourseById, getUserCourses, enrollCourse, updateCourseProgress, addPoints } from '@/lib/db';
import { useUserStore } from '@/store/userStore';
import Toast from 'react-native-toast-message';
import { PlatformFooter } from '@/components/PlatformFooter';
import { GlobalHeader } from '@/components/GlobalHeader';
import { useTheme } from '@/lib/useTheme';
import { DESIGN } from '@/lib/design';

const MODULES = [
  { id: 1, title: 'Introduction', duration: '20 min', desc: 'Welcome to the course. Learn the basics and what you will achieve.' },
  { id: 2, title: 'Core Concepts', duration: '20 min', desc: 'Dive deep into the core concepts and methodologies.' },
  { id: 3, title: 'Practice & Assessment', duration: '20 min', desc: 'Test your knowledge with hands-on practice and a final assessment.' },
];

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const updatePoints = useUserStore((state) => state.updatePoints);
  const { colors, mode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);

  // Modals
  const [activeModule, setActiveModule] = useState<any>(null);
  const [moduleModalVisible, setModuleModalVisible] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  
  const [proModalVisible, setProModalVisible] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  // Design system additions
  const [hoveredModuleId, setHoveredModuleId] = useState<number | null>(null);

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

  useEffect(() => {
    if (showCelebration) {
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    } else {
      scaleValue.setValue(0);
    }
  }, [showCelebration]);

  useEffect(() => {
    if (profile && id) {
      fetchData();
    }
  }, [profile?.id, id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const courseData = await getCourseById(id as string);
      setCourse(courseData);

      const userCoursesData = await getUserCourses(profile!.id);
      const userEnrollment = userCoursesData.find((uc: any) => uc.course_id === id);
      setEnrollment(userEnrollment || null);
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Failed to load course' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!profile || !course || enrolling) return;
    
    if (!course.is_free) {
      setProModalVisible(true);
      return;
    }

    try {
      setEnrolling(true);
      const newEnrollment = await enrollCourse(profile.id, course.id);
      setEnrollment(newEnrollment);
      Toast.show({ type: 'success', text1: 'Successfully enrolled!' });
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Could not enroll. Please try again.' });
    } finally {
      setEnrolling(false);
    }
  };

  const handleModulePress = (mod: any, status: 'locked' | 'available' | 'completed') => {
    if (status === 'locked') return;
    setActiveModule({ ...mod, status });
    setShowCelebration(false);
    setModuleModalVisible(true);
  };

  const handleMarkComplete = async () => {
    if (!profile || !course || !enrollment || !activeModule) return;
    if (activeModule.status === 'completed') {
      setModuleModalVisible(false);
      return;
    }

    try {
      const currentProgress = enrollment.progress_percent || 0;
      let newProgress = currentProgress + 33;
      if (activeModule.id === 3) newProgress = 100; // Force 100 on last module

      await updateCourseProgress(profile.id, course.id, newProgress);
      await addPoints(profile.id, 50, 'module_completed');
      
      updatePoints(50);
      setEnrollment({ ...enrollment, progress_percent: newProgress });
      setShowCelebration(true);
      
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Could not save progress.' });
    }
  };

  const handleUpgradeToPro = () => {
    setProModalVisible(false);
    Toast.show({
      type: 'info',
      text1: 'Payment integration coming soon',
      text2: 'We\'ll notify you when Pro launches!',
    });
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'IT Support': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Cloud': return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
      case 'Security': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Fundamentals': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  if (loading || !course) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.backgroundPrimary }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress_percent || 0;
  
  // Calculate which module is currently active
  const completedModulesCount = Math.floor(progress / 33);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <GlobalHeader />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View className="w-full max-w-4xl mx-auto px-4 md:px-8 flex-1 pt-8">
          
          {/* Navigation Bar */}
          <View className="flex-row items-center space-x-4 py-4 mb-6 border-b" style={{ borderBottomColor: colors.border }}>
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="w-10 h-10 rounded-lg items-center justify-center border"
              style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}
            >
              <FontAwesome5 name="chevron-left" size={14} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text className="text-xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>Course Details</Text>
          </View>

          {/* Course Header */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4 gap-3">
              <View className={`border rounded-full px-3 py-1 ${getCategoryColor(course.category)}`}>
                <Text className="font-inter-bold text-xs uppercase">{course.category}</Text>
              </View>
              <View className="border rounded-full px-3 py-1" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                <Text className="font-inter-bold text-xs uppercase" style={{ color: colors.textSecondary }}>{course.level}</Text>
              </View>
            </View>
            
            <Text className="font-inter-bold text-3xl mb-3" style={{ color: colors.textPrimary }}>{course.title}</Text>
            <Text className="font-inter mb-5" style={{ color: colors.textSecondary }}>{course.duration_hrs} hrs · {course.skills?.length || 0} skills</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {course.skills?.map((skill: string) => (
                <View key={skill} className="border rounded-full px-4 py-2 mr-2" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                  <Text className="font-inter text-sm" style={{ color: colors.textPrimary }}>{skill}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Enrollment Section */}
          <View className="mb-8">
            {!isEnrolled ? (
              <View style={{ ...getStandardCardStyle(), alignItems: 'center' }}>
                <Text className="font-inter-bold text-lg mb-2" style={{ color: colors.textPrimary }}>Ready to start?</Text>
                <Text className="font-inter text-center mb-6" style={{ color: colors.textSecondary }}>Earn points, unlock achievements, and master new skills.</Text>
                
                <TouchableOpacity 
                  className={`w-full py-4 rounded-xl items-center ${!course.is_free ? 'bg-purple-600' : ''}`}
                  style={course.is_free ? { backgroundColor: colors.accent } : {}}
                  onPress={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <ActivityIndicator color={colors.accentText} />
                  ) : (
                    <Text className="font-inter-bold text-lg" style={{ color: course.is_free ? colors.accentText : '#fff' }}>
                      {course.is_free ? 'Enrol for Free' : 'Unlock with Pro'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={getStandardCardStyle()}>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="font-inter-bold text-base" style={{ color: colors.textPrimary }}>Course Progress</Text>
                  <Text className="font-inter-bold text-base" style={{ color: colors.accent }}>{progress}%</Text>
                </View>
                <Text className="font-inter text-sm mb-4" style={{ color: colors.textSecondary }}>
                  {progress === 100 ? 'All modules complete!' : `Module ${completedModulesCount + 1} of 3 in progress`}
                </Text>
                
                <View className="w-full h-3 rounded-full overflow-hidden border" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
                  <View className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: colors.accent }} />
                </View>
              </View>
            )}
          </View>

          {/* Module List */}
          <View className="pb-12">
            <Text className="font-inter-bold text-xl mb-4" style={{ color: colors.textPrimary }}>Course Content</Text>
            
            <View className="gap-y-3">
              {MODULES.map((mod, index) => {
                let status: 'locked' | 'available' | 'completed' = 'locked';
                
                if (isEnrolled) {
                  if (index < completedModulesCount) status = 'completed';
                  else if (index === completedModulesCount) status = 'available';
                }

                const isLocked = status === 'locked';
                const isAvailable = status === 'available';
                const isCompleted = status === 'completed';

                const isHovered = hoveredModuleId === mod.id;
                const baseStyle = getStandardCardStyle();
                const cardStyle = {
                  ...baseStyle,
                  backgroundColor: isAvailable 
                    ? (mode === 'light' ? '#FCFEEB' : 'rgba(204,223,26,0.12)') 
                    : baseStyle.backgroundColor,
                  borderColor: isHovered 
                    ? '#CCDF1A' 
                    : (isAvailable ? 'rgba(204,223,26,0.4)' : baseStyle.borderColor),
                  shadowOpacity: isHovered ? (mode === 'light' ? 0.14 : 0.5) : baseStyle.shadowOpacity,
                  flexDirection: 'row' as const,
                  alignItems: 'center' as const,
                  opacity: isLocked ? 0.6 : 1,
                };

                return (
                  <TouchableOpacity 
                    key={mod.id} 
                    style={cardStyle}
                    disabled={isLocked}
                    onPress={() => handleModulePress(mod, status)}
                    {...{
                      onMouseEnter: () => setHoveredModuleId(mod.id),
                      onMouseLeave: () => setHoveredModuleId(null)
                    } as any}
                  >
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-4 border`}
                      style={{
                        backgroundColor: isCompleted ? 'rgba(29,158,117,0.2)' : isAvailable ? colors.accent : colors.backgroundPrimary,
                        borderColor: isCompleted || isAvailable ? 'transparent' : colors.border
                      }}
                    >
                      {isCompleted ? (
                        <Feather name="check" size={20} color={colors.success} />
                      ) : isAvailable ? (
                        <Feather name="play" size={18} color={colors.accentText} style={{ marginLeft: 2 }} />
                      ) : (
                        <Feather name="lock" size={18} color={colors.textSecondary} />
                      )}
                    </View>
                    
                    <View className="flex-1">
                      <Text className={`font-inter-bold text-base mb-1`} style={{ color: isLocked ? colors.textSecondary : colors.textPrimary }}>
                        {mod.id}. {mod.title}
                      </Text>
                      <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>{mod.duration}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
        <PlatformFooter />
      </ScrollView>

      {/* Module Completion Modal */}
      <Modal visible={moduleModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="rounded-t-3xl p-6 border-t min-h-[50%]" style={{ backgroundColor: colors.backgroundPrimary, borderTopColor: colors.border }}>
            <View className="flex-row justify-between items-center mb-8">
              <Text className="font-inter-bold text-xl" style={{ color: colors.textPrimary }}>Module {activeModule?.id}</Text>
              <TouchableOpacity onPress={() => setModuleModalVisible(false)}>
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {showCelebration ? (
              <View className="items-center justify-center flex-1 py-8">
                <Animated.View style={{ transform: [{ scale: scaleValue }], backgroundColor: 'rgba(29,158,117,0.2)' }} className="w-24 h-24 rounded-full items-center justify-center mb-6">
                  <Feather name="check" size={48} color={colors.success} />
                </Animated.View>
                <Animated.Text style={{ transform: [{ scale: scaleValue }], opacity: scaleValue, color: colors.accent }} className="font-inter-bold text-2xl mb-2">+50 points earned!</Animated.Text>
                <Text className="font-inter text-lg mb-8" style={{ color: colors.textPrimary }}>Module complete — keep going!</Text>
                
                <TouchableOpacity 
                  className="w-full py-4 rounded-xl items-center"
                  style={{ backgroundColor: colors.accent }}
                  onPress={() => setModuleModalVisible(false)}
                >
                  <Text className="font-inter-bold text-lg" style={{ color: colors.accentText }}>Continue</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-1 justify-between">
                <View>
                  <Text className="font-inter-bold text-2xl mb-4" style={{ color: colors.textPrimary }}>{activeModule?.title}</Text>
                  <Text className="font-inter text-base leading-relaxed mb-8" style={{ color: colors.textSecondary }}>
                    {activeModule?.desc}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  className={`w-full py-4 rounded-xl items-center border`}
                  style={{ 
                    backgroundColor: activeModule?.status === 'completed' ? colors.cardSurface : colors.accent,
                    borderColor: activeModule?.status === 'completed' ? colors.border : colors.accent 
                  }}
                  onPress={handleMarkComplete}
                >
                  <Text className={`font-inter-bold text-lg`} style={{ color: activeModule?.status === 'completed' ? colors.textPrimary : colors.accentText }}>
                    {activeModule?.status === 'completed' ? 'Completed ✓' : 'Mark as Complete'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Pro Upgrade Modal */}
      <Modal visible={proModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/80 px-4">
          <View className="border rounded-3xl p-6 w-full max-w-md" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="font-inter-bold text-2xl" style={{ color: colors.textPrimary }}>Upgrade to Pro</Text>
              <TouchableOpacity onPress={() => setProModalVisible(false)}>
                <Feather name="x" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View className="gap-y-4 mb-8">
              <View className="border p-4 rounded-xl" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                <Text className="font-inter-bold text-lg mb-1" style={{ color: colors.textPrimary }}>Free</Text>
                <Text className="font-inter-bold mb-2" style={{ color: colors.accent }}>$0</Text>
                <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>Learn, earn, and build your profile</Text>
              </View>
              
              <View className="border-2 p-4 rounded-xl relative" style={{ backgroundColor: colors.cardSurface, borderColor: colors.accent }}>
                <View className="absolute -top-3 right-4 px-3 py-1 rounded-full" style={{ backgroundColor: colors.accent }}>
                  <Text className="font-inter-bold text-xs uppercase" style={{ color: colors.accentText }}>Recommended</Text>
                </View>
                <Text className="font-inter-bold text-lg mb-1" style={{ color: colors.textPrimary }}>Pro</Text>
                <Text className="text-purple-400 font-inter-bold mb-2">$9.99/mo</Text>
                <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>Premium courses, analytics, visibility boosts</Text>
              </View>

              <View className="border p-4 rounded-xl" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                <Text className="font-inter-bold text-lg mb-1" style={{ color: colors.textPrimary }}>Enterprise</Text>
                <Text className="font-inter-bold mb-2" style={{ color: colors.textPrimary }}>Contact us</Text>
                <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>Team training and hiring at scale</Text>
              </View>
            </View>

            <TouchableOpacity 
              className="bg-purple-600 w-full py-4 rounded-xl items-center"
              onPress={handleUpgradeToPro}
            >
              <Text className="text-white font-inter-bold text-lg">Upgrade to Pro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}
