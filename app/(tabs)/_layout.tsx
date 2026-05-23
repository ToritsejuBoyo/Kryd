import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { GlobalHeader } from '@/components/GlobalHeader';
import { ThemeWrapper } from '@/components/ThemeWrapper';
import { useTheme } from '@/lib/useTheme';

export default function TabLayout() {
  const { colors, mode } = useTheme();

  return (
    <ThemeWrapper>
      <GlobalHeader />
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
            sceneStyle: { backgroundColor: 'transparent' }
          }}>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="learn" />
          <Tabs.Screen name="jobs" />
          <Tabs.Screen name="community" />
        </Tabs>
      </View>
    </ThemeWrapper>
  );
}
