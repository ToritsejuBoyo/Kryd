import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { getJobById, getUserApplications, applyToJob, addPoints } from '@/lib/db';
import { useUserStore } from '@/store/userStore';
import Toast from 'react-native-toast-message';
import { PlatformFooter } from '@/components/PlatformFooter';
import { GlobalHeader } from '@/components/GlobalHeader';
import { useTheme } from '@/lib/useTheme';
import { formatDual, formatSalaryRange } from '@/lib/currency';
import { DESIGN } from '@/lib/design';
export default function JobDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const updatePoints = useUserStore((state) => state.updatePoints);
  const { colors, mode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [application, setApplication] = useState<any>(null);
  const [applying, setApplying] = useState(false);

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
    if (profile && id) {
      fetchData();
    }
  }, [profile?.id, id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [jobData, appsData] = await Promise.all([
        getJobById(id as string),
        getUserApplications(profile!.id)
      ]);
      setJob(jobData);
      
      const userApp = appsData.find((app: any) => app.job_id === id);
      setApplication(userApp || null);
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Failed to load job details' });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!profile || !job || application || applying) return;

    try {
      setApplying(true);
      const newApp = await applyToJob(profile.id, job.id);
      await addPoints(profile.id, 5, 'job_applied');
      updatePoints(5);
      
      setApplication(newApp);
      Toast.show({ 
        type: 'success', 
        text1: 'Application submitted!',
        text2: 'The employer will review your profile.'
      });
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Could not apply. Please try again.' });
    } finally {
      setApplying(false);
    }
  };

  const formatSalary = (jobData: any) => {
    if (jobData.type === 'Freelance' || jobData.salary_min === jobData.salary_max) {
      return `${formatDual(jobData.salary_min)} fixed`;
    }
    return formatSalaryRange(jobData.salary_min, jobData.salary_max);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading || !job) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.backgroundPrimary }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const hasApplied = !!application;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.backgroundPrimary }}>
      <GlobalHeader />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}>
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
            <Text className="text-xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>Job Details</Text>
          </View>

          {/* Job Details Card */}
          <View style={getStandardCardStyle()}>
            {/* Job Header */}
            <View className="mb-6 border-b pb-6" style={{ borderColor: colors.border }}>
              <Text className="font-inter-bold text-3xl mb-4" style={{ color: colors.textPrimary }}>{job.title}</Text>
              
              <View className="flex-row items-center flex-wrap mb-4">
                <Text className="font-inter-bold text-base" style={{ color: colors.textSecondary }}>{job.company}</Text>
                <Text className="mx-3" style={{ color: colors.border }}>•</Text>
                <Text className="font-inter text-base" style={{ color: colors.textSecondary }}>{job.location}</Text>
                <Text className="mx-3" style={{ color: colors.border }}>•</Text>
                <View className="border px-2 py-1 rounded" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border }}>
                  <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>{job.type}</Text>
                </View>
              </View>

              <Text className="font-inter-bold text-xl" style={{ color: colors.success }}>{formatSalary(job)}</Text>
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="font-inter-bold text-xl mb-3" style={{ color: colors.textPrimary }}>About this role</Text>
              <Text className="font-inter text-base leading-relaxed" style={{ color: colors.textSecondary }}>
                {job.description}
              </Text>
            </View>

            {/* Skills */}
            <View className="pt-2">
              <Text className="font-inter-bold text-xl mb-3" style={{ color: colors.textPrimary }}>Required skills</Text>
              <View className="flex-row flex-wrap gap-2">
                {job.skills_required?.map((skill: string) => (
                  <View key={skill} className="border rounded-full px-4 py-2" style={{ backgroundColor: colors.backgroundSecondary, borderColor: colors.border }}>
                    <Text className="font-inter text-sm" style={{ color: colors.textPrimary }}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

        </View>
        <PlatformFooter />
      </ScrollView>

      {/* Application Section (Sticky Bottom) */}
      <View className="absolute bottom-0 w-full border-t px-4 py-6 pb-8" style={{ backgroundColor: colors.backgroundPrimary, borderTopColor: colors.border }}>
        <View className="w-full max-w-4xl mx-auto">
          {hasApplied ? (
            <View className="w-full">
              <View className="border py-4 rounded-xl items-center mb-2" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
                <Text className="font-inter-bold text-lg" style={{ color: colors.textSecondary }}>Application Submitted ✓</Text>
              </View>
              <Text className="font-inter text-sm text-center" style={{ color: colors.textSecondary }}>
                Applied on {formatDate(application.applied_at)}
              </Text>
            </View>
          ) : (
            <View className="w-full">
              <TouchableOpacity 
                className="py-4 rounded-xl items-center mb-2"
                style={{ backgroundColor: colors.accent }}
                onPress={handleApply}
                disabled={applying}
              >
                {applying ? (
                  <ActivityIndicator color={colors.accentText} />
                ) : (
                  <Text className="font-inter-bold text-lg" style={{ color: colors.accentText }}>Apply Now</Text>
                )}
              </TouchableOpacity>
              <Text className="font-inter text-sm text-center" style={{ color: colors.textSecondary }}>
                Your profile will be shared with the employer
              </Text>
            </View>
          )}
        </View>
      </View>

    </View>
  );
}
