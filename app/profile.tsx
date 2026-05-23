import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Switch, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useUserStore } from '@/store/userStore';
import { useUIStore } from '@/store/uiStore';
import { useTheme } from '@/lib/useTheme';
import { updateProfile, getUserApplications } from '@/lib/db';
import { supabase } from '@/lib/supabase';
import { GlobalHeader } from '@/components/GlobalHeader';
import { PlatformFooter } from '@/components/PlatformFooter';
import { DESIGN, getAvatarColour } from '@/lib/design';

type ProfileSection = 'overview' | 'bio' | 'skills' | 'experience' | 'certifications' | 'portfolio' | 'workHistory' | 'availability' | 'resume' | 'reviews' | 'identity' | 'appearance' | 'notifications' | 'privacy' | 'currency' | 'account' | 'delete';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, setProfile, isClientMode } = useUserStore();
  const { mode, colors, setTheme } = useTheme();
  const { isSidebarCollapsed, toggleSidebar } = useUIStore();
  
  const [selectedSection, setSelectedSection] = useState<ProfileSection>('overview');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (profile) loadData();
  }, [profile]);

  const loadData = async () => {
    try {
      const apps = await getUserApplications(profile!.id);
      setApplications(apps);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (updates: any) => {
    if (!profile) return;
    try {
      const updated = await updateProfile(profile.id, updates);
      setProfile({ ...profile, ...updated });
    } catch (e) {
      console.error(e);
    }
  };

  if (!profile) return null;

  const initials = profile.full_name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  const GROUPS = isClientMode ? [
    {
      title: 'MY PROFILE',
      items: [
        { id: 'overview', icon: 'user', label: 'Overview' },
        { id: 'bio', icon: 'file-text', label: 'Bio & Company Info' },
        { id: 'workHistory', icon: 'briefcase', label: 'Work History' }
      ]
    },
    {
      title: 'HIRING',
      items: [
        { id: 'portfolio', icon: 'grid', label: 'Posted Jobs' },
        { id: 'currency', icon: 'credit-card', label: 'Payment Methods' },
        { id: 'reviews', icon: 'star', label: 'Reviews Given' }
      ]
    },
    {
      title: 'VERIFICATION',
      items: [
        { id: 'identity', icon: 'shield', label: 'Identity & Trust' }
      ]
    },
    {
      title: 'APP SETTINGS',
      items: [
        { id: 'appearance', icon: 'layout', label: 'Appearance' },
        { id: 'notifications', icon: 'bell', label: 'Notifications' },
        { id: 'privacy', icon: 'lock', label: 'Privacy' },
        { id: 'account', icon: 'settings', label: 'Account' }
      ]
    },
    {
      title: 'DANGER ZONE',
      items: [
        { id: 'delete', icon: 'trash-2', label: 'Delete Account' }
      ]
    }
  ] : [
    {
      title: 'MY PROFILE',
      items: [
        { id: 'overview', icon: 'user', label: 'Overview' },
        { id: 'bio', icon: 'file-text', label: 'Bio & Personal Info' },
        { id: 'skills', icon: 'zap', label: 'Skills' },
        { id: 'experience', icon: 'briefcase', label: 'Experience' },
        { id: 'certifications', icon: 'award', label: 'Certifications' },
        { id: 'portfolio', icon: 'grid', label: 'Portfolio' },
        { id: 'workHistory', icon: 'clock', label: 'Work History' }
      ]
    },
    {
      title: 'CAREER & JOBS',
      items: [
        { id: 'availability', icon: 'calendar', label: 'Availability & Rate' },
        { id: 'resume', icon: 'file', label: 'Resume / CV' },
        { id: 'reviews', icon: 'star', label: 'Reviews & Ratings' }
      ]
    },
    {
      title: 'VERIFICATION',
      items: [
        { id: 'identity', icon: 'shield', label: 'Identity & Trust' }
      ]
    },
    {
      title: 'APP SETTINGS',
      items: [
        { id: 'appearance', icon: 'layout', label: 'Appearance' },
        { id: 'notifications', icon: 'bell', label: 'Notifications' },
        { id: 'privacy', icon: 'lock', label: 'Privacy' },
        { id: 'currency', icon: 'dollar-sign', label: 'Currency & Language' },
        { id: 'account', icon: 'settings', label: 'Account' }
      ]
    },
    {
      title: 'DANGER ZONE',
      items: [
        { id: 'delete', icon: 'trash-2', label: 'Delete Account' }
      ]
    }
  ];

  // Helper for inline edits
  const InlineField = ({ label, value, field, placeholder, multiline = false }: any) => {
    const [editing, setEditing] = useState(false);
    const [temp, setTemp] = useState(value || '');
    const [saving, setSaving] = useState(false);

    const save = async () => {
      setSaving(true);
      await handleUpdate({ [field]: temp });
      setSaving(false);
      setEditing(false);
    };

    if (editing) {
      return (
        <View className="mb-6">
          <Text className="font-inter-medium text-xs mb-2" style={{ color: colors.textSecondary }}>{label}</Text>
          <TextInput
            className="border rounded-xl px-4 py-3 font-inter text-sm mb-3"
            style={{ backgroundColor: colors.cardSurface, borderColor: colors.border, color: colors.textPrimary, minHeight: multiline ? 100 : 48 }}
            value={temp}
            onChangeText={setTemp}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
          />
          <View className="flex-row gap-x-3">
            <TouchableOpacity onPress={save} className="px-4 py-2 rounded-lg" style={{ backgroundColor: colors.accent }}>
              {saving ? <ActivityIndicator size="small" color={colors.accentText} /> : <Text className="font-inter-bold text-xs" style={{ color: colors.accentText }}>Save</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditing(false)} className="px-4 py-2 rounded-lg border" style={{ borderColor: colors.border }}>
              <Text className="font-inter-medium text-xs" style={{ color: colors.textPrimary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View className="mb-6 border-b pb-4" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
        <Text className="font-inter-medium text-xs mb-1" style={{ color: colors.textSecondary }}>{label}</Text>
        <View className="flex-row justify-between items-start">
          <Text className="font-inter text-sm flex-1 mr-4" style={{ color: value ? colors.textPrimary : colors.textSecondary }}>
            {value || placeholder}
          </Text>
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text className="font-inter-medium text-xs" style={{ color: colors.accent }}>{value ? 'Edit' : 'Add'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --- Components ---

  const OverviewSection = () => (
    <View>
      <Text className="font-inter-bold text-2xl mb-1" style={{ color: colors.textPrimary }}>Overview</Text>
      <Text className="font-inter text-sm mb-6" style={{ color: colors.textSecondary }}>This is how your profile appears to others.</Text>
      
      <View style={{ ...getStandardCardStyle(), marginBottom: 32 }}>
        <View className="flex-row items-center mb-6">
          <View className="w-14 h-14 rounded-full items-center justify-center mr-4" style={{ backgroundColor: getAvatarColour(profile.full_name || '') }}>
            <Text className="font-inter-medium text-2xl text-white">{initials}</Text>
          </View>
          <View>
            <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>{profile.full_name}</Text>
            <View className="flex-row items-center mt-1">
              <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#1D9E75' }} />
              <Text className="font-inter text-xs" style={{ color: colors.textPrimary }}>Available Now</Text>
            </View>
          </View>
        </View>
        
        <Text className="font-inter text-sm mb-6" style={{ color: colors.textPrimary }}>
          {profile.bio || "No bio added yet."}
        </Text>
        
        <Text className="font-inter-italic text-xs mb-8" style={{ color: colors.textPrimary }}>
          {profile.skills && profile.skills.length > 0 ? profile.skills.join(', ') : "No skills added."}
        </Text>
        
        <View className="flex-col md:flex-row gap-4">
          <View className="flex-1 items-center justify-center py-4 rounded-xl" style={{ backgroundColor: mode === 'light' ? '#C2E0D8' : colors.backgroundTertiary }}>
            <Feather name="star" size={20} color={colors.textPrimary} className="mb-2" />
            <View className="flex-row items-end">
              <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>{profile.points}</Text>
            </View>
            <Text className="font-inter text-xs mt-1" style={{ color: colors.textPrimary }}>Points</Text>
          </View>
          
          <View className="flex-1 items-center justify-center py-4 rounded-xl" style={{ backgroundColor: mode === 'light' ? '#C2E0D8' : colors.backgroundTertiary }}>
            <Feather name="briefcase" size={20} color={colors.textPrimary} className="mb-2" />
            <View className="flex-row items-end">
              <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>0</Text>
            </View>
            <Text className="font-inter text-xs mt-1" style={{ color: colors.textPrimary }}>Jobs</Text>
          </View>
          
          <View className="flex-1 items-center justify-center py-4 rounded-xl" style={{ backgroundColor: mode === 'light' ? '#C2E0D8' : colors.backgroundTertiary }}>
            <Feather name="message-square" size={20} color={colors.textPrimary} className="mb-2" />
            <View className="flex-row items-end">
              <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>0</Text>
            </View>
            <Text className="font-inter text-xs mt-1" style={{ color: colors.textPrimary }}>Reviews</Text>
          </View>
        </View>
      </View>

      <Text className="font-inter-bold text-sm mb-4 uppercase tracking-wider" style={{ color: colors.textPrimary }}>Complete Your Profile</Text>
      <View style={getStandardCardStyle()}>
        
        <View className="flex-row items-center justify-between border-b pb-4 mb-4" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
          <View className="flex-row items-center">
            <Feather name="check" size={16} color="#1D9E75" className="mr-3" />
            <Text className="font-inter-bold text-sm" style={{ color: '#1D9E75' }}>Name and role added</Text>
          </View>
        </View>
        
        <View className="flex-row items-center justify-between border-b pb-4 mb-4" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
          <View className="flex-row items-center">
            <Feather name="image" size={16} color={colors.textPrimary} className="mr-3" />
            <Text className="font-inter text-sm" style={{ color: colors.textPrimary }}>Add a profile photo</Text>
          </View>
          <TouchableOpacity className="px-4 py-1.5 rounded flex-row items-center" style={{ backgroundColor: colors.accent }}>
            <Text className="font-inter-bold text-xs" style={{ color: colors.accentText }}>Add</Text>
            <Feather name="arrow-right" size={12} color={colors.accentText} className="ml-1" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center justify-between border-b pb-4 mb-4" style={{ borderColor: 'rgba(0,0,0,0.05)' }}>
          <View className="flex-row items-center">
            <Feather name="align-left" size={16} color={profile.bio ? "#1D9E75" : colors.textPrimary} className="mr-3" />
            <Text className="font-inter text-sm" style={{ color: profile.bio ? '#1D9E75' : colors.textPrimary }}>Write your bio</Text>
          </View>
          {!profile.bio && (
            <TouchableOpacity onPress={() => setSelectedSection('bio')} className="px-4 py-1.5 rounded flex-row items-center" style={{ backgroundColor: colors.accent }}>
              <Text className="font-inter-bold text-xs" style={{ color: colors.accentText }}>Add</Text>
              <Feather name="arrow-right" size={12} color={colors.accentText} className="ml-1" />
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Feather name="zap" size={16} color={(profile.skills?.length || 0) > 0 ? "#1D9E75" : colors.textPrimary} className="mr-3" />
            <Text className="font-inter text-sm" style={{ color: (profile.skills?.length || 0) > 0 ? '#1D9E75' : colors.textPrimary }}>Add at least 1 skill</Text>
          </View>
          {!(profile.skills && profile.skills.length > 0) && (
            <TouchableOpacity onPress={() => setSelectedSection('skills')} className="px-4 py-1.5 rounded flex-row items-center" style={{ backgroundColor: colors.accent }}>
              <Text className="font-inter-bold text-xs" style={{ color: colors.accentText }}>Add</Text>
              <Feather name="arrow-right" size={12} color={colors.accentText} className="ml-1" />
            </TouchableOpacity>
          )}
        </View>
        
      </View>
    </View>
  );

  const BioSection = () => (
    <View style={getStandardCardStyle()}>
      <Text className="font-inter-bold text-2xl mb-1" style={{ color: colors.textPrimary }}>Bio & Personal Info</Text>
      <Text className="font-inter text-sm mb-8" style={{ color: colors.textSecondary }}>Tell clients and the community who you are.</Text>
      <InlineField label="Full Name" value={profile.full_name} field="full_name" placeholder="Your full name" />
      <InlineField label="Bio" value={profile.bio} field="bio" placeholder="Write a short bio... Max 300 characters." multiline={true} />
      <InlineField label="Location" value="Lagos, Nigeria" field="location" placeholder="City, Country" />
      <InlineField label="Phone number" value={profile.phone_number} field="phone_number" placeholder="Not added. Only used for verification." />
      <InlineField label="Date of birth" value={profile.dob} field="dob" placeholder="Not added. Required for KYC." />
      <InlineField label="LinkedIn profile" value={profile.linkedin_url} field="linkedin_url" placeholder="https://linkedin.com/in/..." />
    </View>
  );

  const SkillsSection = () => {
    const [skillInput, setSkillInput] = useState('');
    const addSkill = () => {
      if (skillInput.trim() && !(profile.skills || []).includes(skillInput.trim())) {
        handleUpdate({ skills: [...(profile.skills || []), skillInput.trim()] });
        setSkillInput('');
      }
    };
    const removeSkill = (sk: string) => {
      handleUpdate({ skills: (profile.skills || []).filter(s => s !== sk) });
    };

    return (
      <View style={getStandardCardStyle()}>
        <Text className="font-inter-bold text-2xl mb-1" style={{ color: colors.textPrimary }}>Your Skills</Text>
        <Text className="font-inter text-sm mb-8" style={{ color: colors.textSecondary }}>Skills are used to match you with jobs. Be specific.</Text>
        
        <View className="flex-row items-center border rounded-xl px-4 py-2 mb-6" style={{ backgroundColor: colors.cardSurface, borderColor: colors.border }}>
          <Feather name="search" size={16} color={colors.textSecondary} />
          <TextInput
            className="flex-1 font-inter text-sm ml-2 h-10 outline-none"
            style={{ color: colors.textPrimary }}
            placeholder="Type a skill and press enter..."
            placeholderTextColor={colors.textSecondary}
            value={skillInput}
            onChangeText={setSkillInput}
            onSubmitEditing={addSkill}
          />
          <TouchableOpacity onPress={addSkill} className="px-3 py-1.5 rounded" style={{ backgroundColor: colors.accent }}>
            <Text className="font-inter-bold text-xs" style={{ color: colors.accentText }}>Add</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap gap-3">
          {(profile.skills || []).map(skill => (
            <View key={skill} className="flex-row items-center px-4 py-2 rounded-full border" style={{ backgroundColor: mode === 'light' ? '#F4F7F6' : 'rgba(255,255,255,0.05)', borderColor: colors.border }}>
              <Text className="font-inter-medium text-sm mr-2" style={{ color: colors.textPrimary }}>{skill}</Text>
              <TouchableOpacity onPress={() => removeSkill(skill)}><Feather name="x" size={14} color={colors.textSecondary} /></TouchableOpacity>
            </View>
          ))}
          {!(profile.skills && profile.skills.length > 0) && <Text className="font-inter text-sm" style={{ color: colors.textSecondary }}>No skills added yet.</Text>}
        </View>
      </View>
    );
  };

  const AppearanceSection = () => (
    <View style={getStandardCardStyle()}>
      <Text className="font-inter-bold text-2xl mb-1" style={{ color: colors.textPrimary }}>Appearance</Text>
      <Text className="font-inter text-sm mb-8" style={{ color: colors.textSecondary }}>Customise how Kryd looks for you.</Text>
      
      <Text className="font-inter-medium text-sm mb-4" style={{ color: colors.textPrimary }}>Theme</Text>
      <View className="flex-row gap-4 mb-8">
        {['light', 'dark'].map(t => (
          <TouchableOpacity 
            key={t}
            onPress={() => setTheme(t as any)}
            className="flex-1 py-4 border rounded-xl items-center justify-center"
            style={{ 
              borderColor: mode === t ? colors.accent : colors.border, 
              backgroundColor: mode === t ? 'rgba(204,223,26,0.1)' : colors.cardSurface 
            }}
          >
            <Feather name={t === 'light' ? 'sun' : 'moon'} size={24} color={mode === t ? colors.accent : colors.textSecondary} className="mb-2" />
            <Text className="font-inter-bold text-xs uppercase" style={{ color: mode === t ? colors.accent : colors.textPrimary }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const ComingSoonSection = ({ title, desc }: { title: string, desc: string }) => (
    <View style={getStandardCardStyle()}>
      <Text className="font-inter-bold text-2xl mb-1" style={{ color: colors.textPrimary }}>{title}</Text>
      <Text className="font-inter text-sm mb-8" style={{ color: colors.textSecondary }}>{desc}</Text>
      <View className="border rounded-2xl p-8 items-center" style={{ backgroundColor: colors.backgroundPrimary, borderColor: colors.border }}>
        <Feather name="clock" size={32} color={colors.textSecondary} className="mb-4" />
        <Text className="font-inter-bold text-lg mb-2" style={{ color: colors.textPrimary }}>Coming Soon</Text>
        <Text className="font-inter text-sm text-center" style={{ color: colors.textSecondary }}>We're working hard on bringing this feature to you.</Text>
      </View>
    </View>
  );
  
  const DeleteSection = () => (
    <View style={getStandardCardStyle()}>
      <Text className="font-inter-bold text-2xl mb-1 text-red-500">Delete Account</Text>
      <Text className="font-inter text-sm mb-8" style={{ color: colors.textSecondary }}>Permanently delete your Kryd account.</Text>
      <View className="border border-red-500/30 bg-red-500/10 rounded-2xl p-6">
        <Text className="font-inter-bold text-base text-red-500 mb-2">⚠️ This action cannot be undone.</Text>
        <Text className="font-inter text-sm text-red-400 mb-6 leading-relaxed">Deleting your account will remove your profile permanently, cancel active applications, and forfeit all points.</Text>
        <TouchableOpacity className="bg-red-500 py-3 rounded-xl items-center">
          <Text className="font-inter-bold text-sm text-white">Delete my account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case 'overview': return <OverviewSection />;
      case 'bio': return <BioSection />;
      case 'skills': return <SkillsSection />;
      case 'appearance': return <AppearanceSection />;
      case 'experience': return <ComingSoonSection title="Experience" desc="Add past IT roles." />;
      case 'certifications': return <ComingSoonSection title="Certifications" desc="Verified certs increase visibility." />;
      case 'portfolio': return <ComingSoonSection title="Portfolio" desc="Show clients what you built." />;
      case 'workHistory': return <ComingSoonSection title="Work History" desc="Jobs completed on Kryd." />;
      case 'availability': return <ComingSoonSection title="Availability & Rate" desc="Set your expected hourly rate." />;
      case 'resume': return <ComingSoonSection title="Resume / CV" desc="Upload your CV for clients." />;
      case 'reviews': return <ComingSoonSection title="Reviews & Ratings" desc="Reviews from clients." />;
      case 'identity': return <ComingSoonSection title="Identity & Trust" desc="Get verified to unlock features." />;
      case 'notifications': return <ComingSoonSection title="Notifications" desc="Notification preferences." />;
      case 'privacy': return <ComingSoonSection title="Privacy Settings" desc="Control profile visibility." />;
      case 'currency': return <ComingSoonSection title="Currency & Language" desc="Set primary display currency." />;
      case 'account': return <ComingSoonSection title="Account Settings" desc="Manage login credentials." />;
      case 'delete': return <DeleteSection />;
      default: return <OverviewSection />;
    }
  };

  return (
    <View className="flex-1 relative" style={{ backgroundColor: mode === 'light' ? '#F4F8F7' : colors.backgroundPrimary }}>
      <GlobalHeader />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        
        {/* WE MUST USE FLEX ROW ON DESKTOP, SO WE RELY ON PLATFORM AND STYLES INSTEAD OF NATIVEWIND PREFIXES WHICH BREAK */}
        <View 
          className="w-full max-w-[1200px] mx-auto px-4 py-8"
          style={{ 
            flexDirection: Platform.OS === 'web' ? 'row' : 'column',
            gap: 32
          }}
        >
          
          {/* Left Sidebar */}
          <View 
            className="flex-col gap-6 transition-all duration-500 ease-in-out flex-shrink-0"
            style={{ 
              width: Platform.OS === 'web' ? 300 : '100%',
              backgroundColor: mode === 'light' ? '#EBF7F4' : 'rgba(255,255,255,0.06)', 
              borderColor: mode === 'light' ? '#D5EAE2' : 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              borderRadius: DESIGN.radius.xl,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: mode === 'light' ? 0.04 : 0.2,
              shadowRadius: 12,
              elevation: 4,
            }}
          >


                {/* Profile Header */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-4">
                    <View className="w-14 h-14 rounded-full items-center justify-center mr-4" style={{ backgroundColor: getAvatarColour(profile.full_name || '') }}>
                      <Text className="font-inter-medium text-xl text-white">{initials}</Text>
                    </View>
                    <View>
                      <Text className="font-inter-bold text-lg" style={{ color: colors.textPrimary }}>{profile.full_name}</Text>
                    </View>
                  </View>
                  
                  <View className="flex-row w-full h-2 mb-2 space-x-1">
                    {[1,2,3,4,5,6,7,8,9,10].map((i) => (
                      <View key={i} className="flex-1 h-full rounded" style={{ backgroundColor: i <= 3 ? colors.accent : (mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.1)') }} />
                    ))}
                  </View>
                  <Text className="font-inter-medium text-[10px]" style={{ color: colors.textPrimary }}>30% Complete</Text>
                </View>

                {/* Nav Groups */}
                <View className="space-y-6">
                  {GROUPS.map(group => (
                    <View key={group.title} className="mb-6">
                      <Text className="font-inter-bold text-[10px] uppercase mb-3 tracking-wider" style={{ color: colors.textPrimary }}>{group.title}</Text>
                      <View className="space-y-1">
                        {group.items.map(item => {
                          const isActive = selectedSection === item.id;
                          return (
                            <TouchableOpacity
                              key={item.id}
                              onPress={() => setSelectedSection(item.id as any)}
                              className={`flex-row items-center px-4 py-3 mb-1`}
                              style={{ 
                                backgroundColor: isActive 
                                  ? (mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.08)') 
                                  : 'transparent',
                                borderLeftColor: isActive ? colors.accent : 'transparent',
                                borderLeftWidth: 4,
                                borderRadius: DESIGN.radius.sm,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: isActive && mode === 'light' ? 0.05 : 0,
                                shadowRadius: 2,
                              }}
                            >
                              <Feather name={item.icon as any} size={16} color={colors.textPrimary} />
                              <Text className="font-inter-medium text-sm ml-3 flex-1" style={{ color: colors.textPrimary }}>{item.label}</Text>
                              
                              {/* Indicator icons */}
                              {item.id === 'bio' && <View className={`w-2 h-2 rounded-full border ${profile.bio ? 'bg-[#1D9E75] border-[#1D9E75]' : 'border-gray-400'}`} />}
                              {item.id === 'skills' && <View className={`w-2 h-2 rounded-full border ${(profile.skills?.length || 0) > 0 ? 'bg-[#1D9E75] border-[#1D9E75]' : 'border-gray-400'}`} />}
                            </TouchableOpacity>
                          )
                        })}
                      </View>
                    </View>
                  ))}
                </View>

          </View>

          {/* Right Content Panel - Floating natively on background */}
          <View className="flex-1 min-w-0 md:min-h-[600px] mb-20 px-2">
            {renderContent()}
          </View>

        </View>
        <PlatformFooter />
      </ScrollView>
    </View>
  );
}
