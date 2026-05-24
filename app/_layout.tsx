import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { supabase } from '@/lib/supabase';
import { getProfile } from '@/lib/db';
import { useUserStore } from '@/store/userStore';
import Toast from 'react-native-toast-message';
import { AIAssistantWidget } from '@/components/AIAssistantWidget';
import { useTheme } from '@/lib/useTheme';
import { ThemeWrapper } from '@/components/ThemeWrapper';

import '../global.css';

const remoteLog = (msg: string, data?: any) => {
  const payload = { message: `[LAYOUT] ${msg} ${data ? JSON.stringify(data) : ''}` };
  fetch('http://localhost:8085/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {});
  console.log(`[LAYOUT] ${msg}`, data || '');
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  if (fontError) {
    console.warn('Error loading fonts:', fontError);
  }

  const router = useRouter();
  const segments = useSegments();
  const profile = useUserStore((state) => state.profile);
  const setProfile = useUserStore((state) => state.setProfile);
  const clearProfile = useUserStore((state) => state.clearProfile);
  const isLoggingIn = useUserStore((state) => state.isLoggingIn);
  const setIsLoggingIn = useUserStore((state) => state.setIsLoggingIn);
  const { mode, colors } = useTheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [sessionState, setSessionState] = useState<any>(undefined);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          remoteLog('Session restored on startup', { userId: session.user.id });
          setIsFetchingProfile(true);
          setSessionState(session);
          await fetchProfile(session.user.id, false);
        } else {
          remoteLog('No session on startup');
          setSessionState(null);
        }
      } catch (e: any) {
        remoteLog('Error in startup prepare', { error: e.message || String(e) });
        console.warn(e);
        setSessionState(null);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        remoteLog('onAuthStateChange fired', { event, hasSession: !!session });
        if (session) {
          const loggingIn = useUserStore.getState().isLoggingIn;
          remoteLog('onAuthStateChange has session. Captured loggingIn state:', { loggingIn });
          setIsFetchingProfile(true);
          setSessionState(session);
          fetchProfile(session.user.id, loggingIn);
        } else {
          setSessionState(session);
          clearProfile();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (appIsReady && (fontsLoaded || fontError) && sessionState !== undefined) {
      remoteLog('Routing useEffect triggered', {
        isFetchingProfile,
        hasSession: !!sessionState,
        hasProfile: !!profile,
        isLoggingIn,
        segments
      });

      if (isFetchingProfile) {
        remoteLog('Routing blocked because isFetchingProfile is true');
        return;
      }
      SplashScreen.hideAsync();

      const inAuthGroup = segments[0] === '(auth)' || segments.includes('onboarding') || segments.includes('welcome') || segments.includes('signup') || segments.includes('login');
      const isExplicitAuthLanding = segments.includes('login') || segments.includes('welcome-intro') || (segments.includes('welcome') && !segments.includes('onboarding'));

      if (sessionState) {
        if (profile) {
          if (inAuthGroup) {
            remoteLog('User has session and profile. Redirecting from auth group to /(tabs)');
            router.replace('/(tabs)');
          }
          if (isLoggingIn) {
            remoteLog('Clearing isLoggingIn flag');
            setIsLoggingIn(false);
          }
        } else {
          if (isLoggingIn) {
            remoteLog('User has session, no profile, but isLoggingIn is true. Redirecting to /(tabs) (profile creation should be completed)');
            if (inAuthGroup) {
              router.replace('/(tabs)');
            }
            setIsLoggingIn(false);
          } else {
            if (isExplicitAuthLanding) {
              remoteLog('User has session, no profile, not logging in, and on explicit auth landing page. Signing out.');
              supabase.auth.signOut();
            } else if (!inAuthGroup) {
              remoteLog('User has session, no profile, not logging in, and not in auth group. Redirecting to onboarding.');
              router.replace('/(auth)/onboarding/role-select');
            }
          }
        }
      } else {
        if (!inAuthGroup) {
          remoteLog('No session and not in auth group. Redirecting to /login');
          router.replace('/(auth)/login');
        }
      }
    }
  }, [appIsReady, fontsLoaded, fontError, sessionState, segments, profile, isFetchingProfile, isLoggingIn]);




  // Fetch profile and store in Zustand
  const fetchProfile = async (userId: string, isLoggingInAttempt?: boolean) => {
    const isLoggingInFlag = isLoggingInAttempt !== undefined ? isLoggingInAttempt : useUserStore.getState().isLoggingIn;
    remoteLog('fetchProfile initiated', { userId, isLoggingInFlag });
    setIsFetchingProfile(true);
    try {
      let profileData;
      try {
        profileData = await getProfile(userId);
        remoteLog('Successfully fetched existing profile from DB', { userId });
      } catch (err: any) {
        remoteLog('getProfile failed, checking if we should create default profile', { error: err.message || String(err), isLoggingInFlag });
        if (isLoggingInFlag) {
          remoteLog('Profile not found during login. Creating default profile for:', userId);
          const { data: { user } } = await supabase.auth.getUser();
          const defaultProfile = {
            user_id: userId,
            full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
            role: 'IT Support Specialist',
            points: 0,
            coins: 0
          };
          
          remoteLog('Inserting default profile row into DB...', defaultProfile);
          const { data, error: insertError } = await supabase
            .from('profiles')
            .insert(defaultProfile)
            .select()
            .single();
          
          if (insertError) {
            remoteLog('DB insert profile failed', { error: insertError.message });
            throw insertError;
          }
          profileData = data;
          remoteLog('Successfully inserted default profile row');
        } else {
          remoteLog('Not logging in attempt, passing profile error upstream');
          throw err;
        }
      }

      setProfile(profileData);
      if (profileData && profileData.default_mode === 'client') {
        useUserStore.getState().setClientMode(true);
      } else {
        useUserStore.getState().setClientMode(false);
      }
    } catch (error: any) {
      remoteLog('Error fetching or creating profile:', { error: error.message || String(error) });
      console.error('Error fetching profile:', error);
    } finally {
      setIsFetchingProfile(false);
      remoteLog('fetchProfile finished');
    }
  };

  const isFontsReady = fontsLoaded || fontError;

  if (!appIsReady || !isFontsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.backgroundPrimary, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.textPrimary, fontSize: 20 }}>
          {!appIsReady ? 'Initializing App...' : 'Loading Fonts...'}
        </Text>
        {fontError && <Text style={{ color: 'red', marginTop: 10 }}>Font Error: {String(fontError)}</Text>}
      </View>
    );
  }

  return (
    <>
      <ThemeWrapper>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeWrapper>
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
      <AIAssistantWidget />
      <Toast />
    </>
  );
}
