# task_15_ui_overhaul.md
> Agent task — Enhance layout aesthetics, container styling, logo integration, and responsive scaling to match modern SaaS platform standards (Upwork-inspired).
> Day: 15 | Focus: Structural UI polish, balanced spacing, and unified branding elements.

---

## Goal
Tweak the existing dashboard layout, feed list components, and navigation wrappers to introduce crisp container boundaries, subtle border depths, adaptive screen layout scales, and high-contrast typographic hierarchies.

---

## 1. Branding & Logo Component Setup
[cite_start]Per the KRYD product specifications, the identity logo is a geometric text mark[cite: 356, 1181]. Instead of loading external pixel images that risk breaking or failing to scale across screen displays, build the logo as a highly responsive, vector-styled native sub-component.

### Brand Design Tokens:
- [cite_start]**Geometric "K" Accent:** Lime Green (`#CCDF1A`) [cite: 356]
- **Brand Name Typography:** Pure White (`#FFFFFF`)

### Action: Create the file `/components/BrandLogo.tsx`
Implement the code snippet below exactly to generate the sharp brand anchor:

```tsx
import React from 'react';
import { View, Text } from 'react-native';

export function BrandLogo() {
  return (
    <View className="flex-row items-center space-x-2">
      {/* Geometric Icon Box Container */}
      <View className="bg-[#CCDF1A] w-8 h-8 rounded-lg items-center justify-center">
        <Text className="text-[#0B2D2C] font-black text-xl tracking-tighter">K</Text>
      </View>
      {/* Brand Text Identity */}
      <Text className="text-white text-xl font-bold tracking-tight">
        ryd
      </Text>
    </View>
  );
}



2. Global Surface Depth & Container Hierarchy
Avoid using completely flat background blocks that compress visual clarity. Upwork achieves a professional, solid look by shifting background planes to generate depth. Since Kryd utilizes a rich tech-green palette, establish contrast levels across the workspace using standard NativeWind layers:


Platform Canvas Base: Deep flat tone bg-[#0B2D2C].  


Component & Card Surfaces: Step up to a slightly lighter surface shade using bg-[#0E3A39] or bg-[#124745].


High-Tech Border Framing: Instead of heavy, high-contrast border colors, use faint opacity lines to anchor element bounds: border border-white/5 or border border-emerald-500/10.

3. Specific Component Refinements
A. Dashboard Header & Quick Stats Row

Header Structure: Integrate the brand logo directly into your header grid rows.

TypeScript
<View className="w-full flex-row justify-between items-center py-4 px-6 bg-[#0B2D2C]">
  <BrandLogo />
  {/* Profile Avatar remains anchored on the right side */}
</View>

Stats Row Layout: Wrap your 3 home stats blocks in an adaptive row layout container. On desktop screens, explicitly lock them to equal sizing metrics using flex-1.


Card Refinements: Apply the surface treatment (bg-[#0E3A39]), rounded corners (rounded-xl), and matching padding layouts (p-5).


Typography Scale: Separate primary values from secondary information layers using color contrast:

Main balances/values: text-2xl font-bold text-white.

Section description labels: text-xs uppercase tracking-wider text-slate-400.

B. Course & Job Card Structures (The "Upwork Feed" Feel)
Upwork's feed items look clean because they chunk metadata and keep individual details highly organized.


State Borders: Apply a border-l-4 (3px equivalent) left-accent border line to list cards to indicate contextual status flags (e.g., lime green for strong AI Match scores , purple for premium Pro modules ).  


Metadata Grouping: Chain core text items together using standard mid-dot separators to avoid cluttered layouts:


Example: Company Name • Location • Job Type styled using text-sm text-slate-400.


Tag Spacing: Give skill tag pills clear padding separation to maintain visibility: px-3 py-1 bg-white/5 rounded-full text-xs text-white/80 mr-2 mb-2.

C. Category Filter Pills (Horizontal Feeds)
Avoid heavy block fills for inactive toggle paths.


Inactive State: Fully transparent background frame accented with a soft border mask (border border-white/10 text-white/60).


Active State: Scale the capsule into a clean lime fill (bg-[#CCDF1A] text-[#0B2D2C] font-semibold).

4. Web & Mobile Layout Responsiveness
Ensure your platform workspace adapts cleanly when compiled for desktop screen limits on localhost:8081.


Max-Width Wrapper Constraint: Wrap all main tab screens and dashboard feed scrollers within a centering responsive box wrapper component to prevent content from stretching weirdly across ultra-wide monitors:

TypeScript
<View className="w-full max-w-5xl mx-auto px-4 md:px-8">

Quick Actions Grid Adaptation: Update the Quick Actions container layout using Tailwind screen prefix modifiers to automatically transform layout columns:


Mobile width view bounds: grid-cols-2 


Desktop/Large width view bounds: md:grid-cols-4 (shifting the 4 boxes smoothly into a clean, horizontal single line).

5. Done When
[ ] The BrandLogo utility component is built in /components/BrandLogo.tsx and compiles perfectly.

[ ] The logo is integrated into the primary top header layout container, rendering cleanly on the local testing frame.

[ ] Content cards and dashboard panels drop their old flat styles for structured, bordered surface layouts (bg-[#0E3A39] border-white/5).

[ ] Typography layouts separate titles from description snippets using explicit sizing scales.

[ ] The global layout contains a max-w-5xl mx-auto constraint to maintain clean column proportions on wide web screens.

[ ] Quick Actions smoothly grid-shift from a 2x2 layout on mobile profiles into a clean 1x4 array on desktop screens.


# task_15_profile_dropdown.md
> Agent task — Implement an absolute floating profile settings dropdown menu triggered from the top-right header avatar (Upwork-inspired layout syntax).
> Day: 15 | Focus: Modal positioning context, Zustand store toggling, and layout state synchronization.

---

## Goal
Build a responsive, floating dropdown card overlay contextually positioned underneath the top-right header avatar. This menu acts as a unified control center managing single-account state switches, progress diagnostics, account configurations, and finance summary tools.

---

## 1. Technical Framework & State Logic

### State Requirements:
1. **Zustand Interfacing (`store/userStore.ts`):** - Read `profile.full_name`, `profile.role`, `profile.points`, `profile.coins`, and `profile.verification_status`.
   - Read/Write active layout states (e.g., `isProviderMode: boolean`) and a corresponding toggle function `toggleUserMode()`.
2. **Supabase Interfacing (`lib/supabase.ts`):**
   - Bind the session cleanup callback routing directly to `supabase.auth.signOut()`.

---

## 2. Code Implementation: The Dropdown Component
Create a new file at `/components/AvatarDropdown.tsx` and place this exact script inside it:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, Pressable } from 'react-native';
import { useUserStore } from '../store/userStore'; // Map path accurately to your project store
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

interface AvatarDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AvatarDropdown({ isOpen, onClose }: AvatarDropdownProps) {
  if (!isOpen) return null;

  const router = useRouter();
  const { profile, isProviderMode, toggleUserMode } = useUserStore();

  // Safe fallback states if profile is hydrating
  const fullName = profile?.full_name || 'User';
  const points = profile?.points || 0;
  const coins = (profile?.coins || 0) / 100; // Handling stored integer precision formats
  const isVerified = profile?.verification_status === 'verified';

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      onClose();
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('Logout processing error:', error);
    }
  };

  return (
    <>
      {/* Click Outside Backdrop Matrix Layer */}
      <Pressable onPress={onClose} className="absolute inset-0 z-40 bg-black/10 web:fixed" />

      {/* Dropdown Container Card */}
      <View className="absolute right-6 top-16 z-50 w-72 rounded-xl border border-white/5 bg-[#0E3A39] p-4 shadow-2xl web:fixed">
        
        {/* Section 1: User Identity Summary Block */}
        <View className="border-b border-white/5 pb-3">
          <Text className="text-base font-bold text-white tracking-tight">{fullName}</Text>
          <Text className="text-xs text-slate-400 mt-0.5">
            {isProviderMode ? 'Service Provider' : 'Client Profile View'}
          </Text>
          
          {/* Mini-Tier Progression Gauge */}
          <View className="mt-3">
            <View className="flex-row justify-between text-center items-center mb-1">
              <Text className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">Level 1 / New Talent</Text>
              <Text className="text-[10px] font-bold text-slate-400">75%</Text>
            </View>
            <View className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <View className="h-full bg-emerald-500 w-[75%]" />
            </View>
          </View>
        </View>

        {/* Section 2: Fluid Single-Account Role Switcher Toggle */}
        <View className="py-3 border-b border-white/5">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Workspace View</Text>
          <TouchableOpacity 
            onPress={() => { toggleUserMode(); onClose(); }}
            className="w-full bg-[#0B2D2C] rounded-lg p-1.5 flex-row border border-white/5"
          >
            <View className={`flex-1 py-1 rounded-md items-center ${!isProviderMode ? 'bg-[#CCDF1A]' : ''}`}>
              <Text className={`text-xs font-semibold ${!isProviderMode ? 'text-[#0B2D2C]' : 'text-white/60'}`}>Client</Text>
            </View>
            <View className={`flex-1 py-1 rounded-md items-center ${isProviderMode ? 'bg-[#CCDF1A]' : ''}`}>
              <Text className={`text-xs font-semibold ${isProviderMode ? 'text-[#0B2D2C]' : 'text-white/60'}`}>Provider</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Section 3: Navigation Shortcut Lanes */}
        <View className="py-2 border-b border-white/5">
          
          {/* Profile Settings shortcut option row */}
          <TouchableOpacity 
            onPress={() => { router.push('/profile'); onClose(); }}
            className="flex-row items-center space-x-3 py-2 px-1 rounded-lg active:bg-white/5"
          >
            <FontAwesome5 name="cog" size={14} color="#94A3B8" />
            <Text className="text-sm text-slate-200 font-medium">Profile Settings</Text>
          </TouchableOpacity>

          {/* Verification lane diagnostics check */}
          <TouchableOpacity 
            onPress={() => { if (!isVerified) { router.push('/kyc/submit'); onClose(); } }}
            disabled={isVerified}
            className="flex-row items-center justify-between py-2 px-1 rounded-lg active:bg-white/5"
          >
            <div className="flex-row items-center space-x-3">
              <FontAwesome5 name="shield-alt" size={14} color={isVerified ? '#34D399' : '#94A3B8'} />
              <Text className="text-sm text-slate-200 font-medium pl-3">Verification</Text>
            </div>
            {isVerified ? (
              <Text className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Verified</Text>
            ) : (
              <Text className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">Verify Now</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Section 4: Fast Ledger Multi-Currency Wallet Readout */}
        <View className="py-3 border-b border-white/5 bg-[#0B2D2C]/40 rounded-lg my-2 px-2">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center space-x-2">
              <FontAwesome5 name="clock" size={11} color="#CCDF1A" />
              <Text className="text-xs text-slate-300 font-medium pl-1.5">{points} pts</Text>
            </View>
            <View className="flex-row items-center space-x-2">
              <FontAwesome5 name="coins" size={11} color="#34D399" />
              <Text className="text-xs text-white font-bold pl-1.5">${coins.toFixed(2)}</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => { router.push('/wallet'); onClose(); }}
            className="w-full items-center py-1 bg-white/5 rounded border border-white/5 active:bg-white/10"
          >
            <Text className="text-xs font-semibold text-white">Open Wallet Ledger</Text>
          </TouchableOpacity>
        </View>

        {/* Section 5: Session Termination Destruction Anchor */}
        <TouchableOpacity 
          onPress={handleSignOut}
          className="w-full flex-row items-center space-x-3 pt-2 pb-1 px-1 rounded-lg active:bg-red-500/10"
        >
          <FontAwesome5 name="sign-out-alt" size={14} color="#EF4444" />
          <Text className="text-sm font-semibold text-red-400 pl-0.5">Sign Out</Text>
        </TouchableOpacity>

      </View>
    </>
  );
}
3. Deployment Integration Hook
To show the dropdown on screen, mount it natively in the header block of /app/(tabs)/index.tsx.

TypeScript
import React, { useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { AvatarDropdown } from '../../components/AvatarDropdown';

export default function Dashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <View className="flex-1 bg-[#0B2D2C]">
      {/* Top Banner Core Layout Header Container Wrapper */}
      <View className="w-full flex-row justify-between items-center py-4 px-6 bg-[#0B2D2C] border-b border-white/5 z-50">
        <Text className="text-white font-bold text-xl">Dashboard</Text>
        
        {/* Interactive Circle Avatar Click Target Trigger */}
        <TouchableOpacity 
          onPress={() => setDropdownOpen(!dropdownOpen)}
          className="w-10 h-10 rounded-full bg-[#1D9E75] items-center justify-center border border-white/10 shadow"
        >
          <Text className="text-white font-bold text-sm uppercase">YB</Text>
        </TouchableOpacity>
      </View>

      {/* Mount Absolute Menu Overlays Directly Below Core Context Row Container */}
      <AvatarDropdown isOpen={dropdownOpen} onClose={() => setDropdownOpen(false)} />

      {/* Rest of your home dashboard screen layout remains completely untouched */}
    </View>
  );
}
4. Done When
[x] Clicking the right-hand avatar wrapper triggers the menu overlay to display without modifying existing styling properties.

[x] Tapping the segmented workspace slider mutates global role values inside your app store layout logic cleanly.

[x] Tapping Profile Settings fires a smooth route redirection hook driving the stack directly into /app/profile.tsx.

[x] Clicking on any background section outside the card bounds automatically calls the cancellation handler to hide the drop-down.



Build a responsive, production-grade footer component mapped at the baseline trail of layout scrolls. It handles adaptive screen-shifting dimensions, binds working links directly to your app directory, and includes fallback interactions for missing pages so they remain interactive.

---

## 1. Design & Layout Mapping Tokens

- **Background Palette Wrapper:** Fused with the primary application slate space: `bg-[#0B2D2C]`.
- **Top Border Accents:** Faint geometric dividing rules separating body blocks from trailing details: `border-t border-white/5`.
- **Typography Scale Rules:**
  - Section Headers: `text-[10px] font-bold uppercase tracking-widest text-slate-400`.
  - Content Option Links: `text-sm text-slate-300 hover:text-[#CCDF1A] active:text-[#CCDF1A] font-medium`.

---

## 2. Code Implementation: The Platform Footer Component
Create a new file inside your local workspace at `/components/PlatformFooter.tsx` and copy the complete script below into it:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

export function PlatformFooter() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  // Helper handling active fallbacks for non-existent mockup page pathways
  const handleMockPress = (featureName: string) => {
    const message = `${featureName} settings and documentation details are coming soon to the production launch.`;
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('KRYD Feature Mock', message, [{ text: 'Got it' }]);
    }
  };

  const handleSocialPress = (platform: string, url: string) => {
    Linking.openURL(url).catch(() => {
      handleMockPress(`${platform} Social Channel`);
    });
  };

  return (
    <View className="w-full bg-[#0B2D2C] border-t border-white/5 mt-12 px-6 py-8 md:py-12">
      <View className="w-full max-w-5xl mx-auto">
        
        {/* Section 1: Main Links Grid Layout Matrix */}
        <View className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-white/5">
          
          {/* Column A: Platform Navigation Hub */}
          <View className="space-y-3">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Platform</Text>
            <TouchableOpacity onPress={() => router.push('/learn')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">Learning Hub</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/jobs')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">Job Marketplace</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/community')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">Community Hub</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/community/create')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">Create Post Feed</Text>
            </TouchableOpacity>
          </View>

          {/* Column B: Trust & Ecosystem Operations */}
          <View className="space-y-3">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Trust & Safety</Text>
            <TouchableOpacity onPress={() => router.push('/profile')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">Identity Badge Status</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMockPress('24-Hour Escrow System Rules')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">24-Hour Escrow Rules</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMockPress('KYC Verification Guidelines')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">Verification Guidelines</Text>
            </TouchableOpacity>
          </View>

          {/* Column C: Legal Policies Framework */}
          <View className="space-y-3">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Legal</Text>
            <TouchableOpacity onPress={() => handleMockPress('Privacy Policy Documentation')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMockPress('Terms of Service Agreement')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMockPress('Cookie Configuration Management')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">Cookie Management</Text>
            </TouchableOpacity>
          </View>

          {/* Column D: Corporate Authority Records */}
          <View className="space-y-3">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Organization</Text>
            <TouchableOpacity onPress={() => handleMockPress('About TorestTech Corporate')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">About TorestTech</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMockPress('Platform Feedback Submissions')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">Platform Feedback</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/wallet')} className="py-1">
              <Text className="text-sm text-slate-300 active:text-[#CCDF1A] hover:text-[#CCDF1A]">Wallet Ledger Account</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Section 2: Social Links Channels and Copyright Assertions */}
        <View className="pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          
          {/* Social Channels Array Target Rows */}
          <View className="flex-row items-center space-x-6">
            <TouchableOpacity onPress={() => handleSocialPress('Facebook', '[https://facebook.com](https://facebook.com)')} className="p-1">
              <FontAwesome5 name="facebook" size={18} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSocialPress('LinkedIn', '[https://linkedin.com](https://linkedin.com)')} className="p-1">
              <FontAwesome5 name="linkedin" size={18} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSocialPress('X / Twitter', '[https://x.com](https://x.com)')} className="p-1">
              <FontAwesome5 name="twitter" size={18} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSocialPress('YouTube', '[https://youtube.com](https://youtube.com)')} className="p-1">
              <FontAwesome5 name="youtube" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Legal Identity Assertions Label Row */}
          <Text className="text-xs text-slate-500 tracking-tight text-center md:text-right">
            © {currentYear} KRYD® System Layout. Proprietary Information of TorestTech. All Rights Reserved.
          </Text>

        </View>

      </View>
    </View>
  );
}
3. Mounting the Element inside Your App Navigation Scroll
To apply the footer to the base of your screens, import the component and structure it directly inside your scroll canvas wrapper elements (e.g., inside your home file view /app/(tabs)/index.tsx):

TypeScript
import React from 'react';
import { ScrollView, View } from 'react-native';
import { PlatformFooter } from '../../components/PlatformFooter';

export default function HomeDashboardLayout() {
  return (
    <ScrollView className="flex-1 bg-[#0B2D2C]" contentContainerStyle={{ flexGrow: 1 }}>
      {/* Content Container Body */}
      <View className="flex-1">
        {/* Your active greeting headings and cards stay here completely untouched */}
      </View>

      {/* Footer handles active trailing navigation rules smoothly */}
      <PlatformFooter />
    </ScrollView>
  );
}
4. Done When
[x] The custom file runs smoothly with no TypeScript types or syntax processing faults.

[x] Columns reflow into a clean, horizontal 4-column block configuration when scaled to a wide desktop browser screen.

[x] Clicking on existing workspace directory links routes the navigation history tree accurately.

[x] Clicking on any mockup items captures events and launches fallback system alert windows without stopping code routines.