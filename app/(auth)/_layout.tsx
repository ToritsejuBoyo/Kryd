import { Stack } from 'expo-router';
import { useTheme } from '@/lib/useTheme';

export default function AuthLayout() {
  const { colors, mode } = useTheme();

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.backgroundPrimary } }}>
      <Stack.Screen name="signup" />
      <Stack.Screen name="login" />
      <Stack.Screen name="welcome-intro" />
    </Stack>
  );
}
