import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { postJob } from '@/lib/db';
import { useUserStore } from '@/store/userStore';
import { PlatformFooter } from '@/components/PlatformFooter';
import { useTheme } from '@/lib/useTheme';

const JOB_TYPES = ['Remote', 'Freelance', 'Full-time', 'Hybrid'];

export default function PostJobScreen() {
  const router = useRouter();
  const profile = useUserStore((state) => state.profile);
  const { colors, mode } = useTheme();

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newJobId, setNewJobId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('Full-time');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [email, setEmail] = useState('');

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = 'Job title is required';
    if (!company.trim()) newErrors.company = 'Company name is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    
    if (!salaryMin.trim() || isNaN(Number(salaryMin))) {
      newErrors.salaryMin = 'Valid minimum salary is required';
    }
    
    if (!salaryMax.trim() || isNaN(Number(salaryMax))) {
      newErrors.salaryMax = 'Valid maximum salary is required';
    } else if (Number(salaryMin) > Number(salaryMax)) {
      newErrors.salaryMax = 'Max salary cannot be less than min salary';
    }

    if (!description.trim() || description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!skills.trim()) {
      newErrors.skills = 'At least one skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!profile) return;
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      
      const jobData = {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        type,
        salary_min: Number(salaryMin),
        salary_max: Number(salaryMax),
        description: description.trim(),
        skills_required: skillsArray,
        posted_by: profile.id
      };

      const newJob = await postJob(jobData);
      setNewJobId(newJob.id);
      setSuccess(true);
      
    } catch (error) {
      console.error(error);
      setErrors({ submit: 'Failed to post job. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCompany('');
    setLocation('');
    setType('Full-time');
    setSalaryMin('');
    setSalaryMax('');
    setDescription('');
    setSkills('');
    setEmail('');
    setErrors({});
    setSuccess(false);
    setNewJobId(null);
  };

  if (success) {
    return (
      <View className="flex-1 justify-center items-center px-6" style={{ backgroundColor: colors.backgroundPrimary }}>
        <View className="w-24 h-24 rounded-full items-center justify-center mb-8" style={{ backgroundColor: 'rgba(29,158,117,0.2)' }}>
          <Feather name="check" size={48} color={colors.success} />
        </View>
        
        <Text className="font-inter-bold text-3xl mb-4 text-center" style={{ color: colors.textPrimary }}>Your job is live!</Text>
        <Text className="font-inter text-base text-center leading-relaxed mb-12" style={{ color: colors.textSecondary }}>
          Kryd will notify matching IT professionals about this role.
        </Text>
        
        <TouchableOpacity 
          className="w-full py-4 rounded-xl items-center mb-4"
          style={{ backgroundColor: colors.accent }}
          onPress={() => router.replace(`/job/${newJobId}` as any)}
        >
          <Text className="font-inter-bold text-lg" style={{ color: colors.accentText }}>View Job</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="w-full border py-4 rounded-xl items-center"
          style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}
          onPress={resetForm}
        >
          <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>Post Another</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      className="flex-1 relative"
      style={{ backgroundColor: colors.backgroundPrimary }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
            <View className="w-full max-w-5xl mx-auto px-4 md:px-8 flex-1 pt-4">
              
              {/* Navigation Bar */}
              <View className="flex-row items-center space-x-4 py-4 mb-6 border-b" style={{ borderBottomColor: colors.border }}>
                <TouchableOpacity 
                  onPress={() => router.back()} 
                  className="w-10 h-10 rounded-lg items-center justify-center border"
                  style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}
                >
                  <FontAwesome5 name="chevron-left" size={14} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text className="text-xl font-bold tracking-tight" style={{ color: colors.textPrimary }}>Post a Job</Text>
              </View>

              <View className="pb-12">
                
                {errors.submit && (
                  <View className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl mb-6">
                    <Text className="text-red-400 font-inter">{errors.submit}</Text>
                  </View>
                )}

          {/* Job Title */}
          <View className="mb-6">
            <Text className="font-inter-medium mb-2" style={{ color: colors.textPrimary }}>Job Title *</Text>
            <TextInput
              className={`border ${errors.title ? 'border-red-500' : ''} rounded-xl px-4 py-3 font-inter`}
              style={{ backgroundColor: colors.cardSurface, borderColor: errors.title ? '#EF4444' : colors.border, color: colors.textPrimary }}
              placeholder="e.g. Senior Cloud Engineer"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            {errors.title && <Text className="text-red-400 font-inter text-xs mt-1">{errors.title}</Text>}
          </View>

          {/* Company Name */}
          <View className="mb-6">
            <Text className="font-inter-medium mb-2" style={{ color: colors.textPrimary }}>Company Name *</Text>
            <TextInput
              className={`border ${errors.company ? 'border-red-500' : ''} rounded-xl px-4 py-3 font-inter`}
              style={{ backgroundColor: colors.cardSurface, borderColor: errors.company ? '#EF4444' : colors.border, color: colors.textPrimary }}
              placeholder="e.g. Acme Corp"
              placeholderTextColor={colors.textSecondary}
              value={company}
              onChangeText={setCompany}
            />
            {errors.company && <Text className="text-red-400 font-inter text-xs mt-1">{errors.company}</Text>}
          </View>

          {/* Location */}
          <View className="mb-6">
            <Text className="font-inter-medium mb-2" style={{ color: colors.textPrimary }}>Location *</Text>
            <TextInput
              className={`border ${errors.location ? 'border-red-500' : ''} rounded-xl px-4 py-3 font-inter`}
              style={{ backgroundColor: colors.cardSurface, borderColor: errors.location ? '#EF4444' : colors.border, color: colors.textPrimary }}
              placeholder="e.g. Remote or Lagos, Nigeria"
              placeholderTextColor={colors.textSecondary}
              value={location}
              onChangeText={setLocation}
            />
            {errors.location && <Text className="text-red-400 font-inter text-xs mt-1">{errors.location}</Text>}
          </View>

          {/* Job Type */}
          <View className="mb-6">
            <Text className="font-inter-medium mb-2" style={{ color: colors.textPrimary }}>Job Type *</Text>
            <View className="flex-row flex-wrap gap-2">
              {JOB_TYPES.map(t => (
                <TouchableOpacity 
                  key={t}
                  onPress={() => setType(t)}
                  className={`px-4 py-2 rounded-full border`}
                  style={{ backgroundColor: type === t ? colors.accent : colors.cardSurface, borderColor: type === t ? colors.accent : colors.border }}
                >
                  <Text className={`font-inter-medium`} style={{ color: type === t ? colors.accentText : colors.textPrimary }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Salary */}
          <View className="flex-row gap-4 mb-6">
            <View className="flex-1">
              <Text className="font-inter-medium mb-2" style={{ color: colors.textPrimary }}>Salary Min (USD) *</Text>
              <TextInput
                className={`border ${errors.salaryMin ? 'border-red-500' : ''} rounded-xl px-4 py-3 font-inter`}
                style={{ backgroundColor: colors.cardSurface, borderColor: errors.salaryMin ? '#EF4444' : colors.border, color: colors.textPrimary }}
                placeholder="4000"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={salaryMin}
                onChangeText={setSalaryMin}
              />
              {errors.salaryMin && <Text className="text-red-400 font-inter text-xs mt-1">{errors.salaryMin}</Text>}
            </View>
            <View className="flex-1">
              <Text className="font-inter-medium mb-2" style={{ color: colors.textPrimary }}>Salary Max (USD) *</Text>
              <TextInput
                className={`border ${errors.salaryMax ? 'border-red-500' : ''} rounded-xl px-4 py-3 font-inter`}
                style={{ backgroundColor: colors.cardSurface, borderColor: errors.salaryMax ? '#EF4444' : colors.border, color: colors.textPrimary }}
                placeholder="5500"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
                value={salaryMax}
                onChangeText={setSalaryMax}
              />
              {errors.salaryMax && <Text className="text-red-400 font-inter text-xs mt-1">{errors.salaryMax}</Text>}
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className="font-inter-medium" style={{ color: colors.textPrimary }}>Job Description *</Text>
              <Text className={`${description.length < 50 ? 'text-red-400' : ''} font-inter text-xs`} style={{ color: description.length < 50 ? undefined : colors.textSecondary }}>
                {description.length}/50 min
              </Text>
            </View>
            <TextInput
              className={`border ${errors.description ? 'border-red-500' : ''} rounded-xl px-4 py-3 font-inter min-h-[120px]`}
              style={{ backgroundColor: colors.cardSurface, borderColor: errors.description ? '#EF4444' : colors.border, color: colors.textPrimary }}
              placeholder="Describe the role, responsibilities, and requirements..."
              placeholderTextColor={colors.textSecondary}
              multiline
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
            />
            {errors.description && <Text className="text-red-400 font-inter text-xs mt-1">{errors.description}</Text>}
          </View>

          {/* Skills */}
          <View className="mb-6">
            <Text className="font-inter-medium mb-2" style={{ color: colors.textPrimary }}>Required Skills *</Text>
            <TextInput
              className={`border ${errors.skills ? 'border-red-500' : ''} rounded-xl px-4 py-3 font-inter`}
              style={{ backgroundColor: colors.cardSurface, borderColor: errors.skills ? '#EF4444' : colors.border, color: colors.textPrimary }}
              placeholder="e.g. AWS, Linux, Terraform (comma separated)"
              placeholderTextColor={colors.textSecondary}
              value={skills}
              onChangeText={setSkills}
            />
            {errors.skills && <Text className="text-red-400 font-inter text-xs mt-1">{errors.skills}</Text>}
          </View>

          {/* Email */}
          <View className="mb-10">
            <Text className="font-inter-medium mb-2" style={{ color: colors.textPrimary }}>Contact Email (Optional)</Text>
            <TextInput
              className="border rounded-xl px-4 py-3 font-inter"
              style={{ backgroundColor: colors.cardSurface, borderColor: colors.border, color: colors.textPrimary }}
              placeholder="hiring@company.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            className="w-full py-4 rounded-xl items-center"
            style={{ backgroundColor: colors.accent }}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={colors.accentText} />
            ) : (
              <Text className="font-inter-bold text-lg" style={{ color: colors.accentText }}>Post Job</Text>
            )}
          </TouchableOpacity>

              </View>
            </View>
            <PlatformFooter />
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
