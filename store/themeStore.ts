import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type ThemeMode = 'light' | 'dark'

export interface ThemeColors {
  backgroundPrimary: string
  backgroundSecondary: string
  backgroundTertiary: string
  textPrimary: string
  textSecondary: string
  border: string
  accent: string
  accentText: string
  cardSurface: string
  cardBorder: string
  success: string
  tabBarBackground: string
  tabBarBorder: string
  activeTab: string
  headerBackground: string
}

const themes: Record<ThemeMode, ThemeColors> = {
  light: {
    backgroundPrimary: '#F4F7F6', // Off-white for main background
    backgroundSecondary: '#FFFFFF',
    backgroundTertiary: '#EBEBEB',
    textPrimary: '#0B2D2C', // Dark Kryd green for text
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    accent: '#0B2D2C', // Light mode accent should be dark green for readability
    accentText: '#FFFFFF',
    cardSurface: '#FFFFFF', // Pure white cards
    cardBorder: 'transparent', // Borderless cards with shadows
    success: '#1D9E75',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    activeTab: '#0B2D2C',
    headerBackground: '#FFFFFF',
  },
  dark: {
    backgroundPrimary: '#0D0D0D',
    backgroundSecondary: '#1A1A1A',
    backgroundTertiary: '#242424',
    textPrimary: '#F5F5F5',
    textSecondary: '#888888',
    border: '#2A2A2A',
    accent: '#CCDF1A', // Kryd lime
    accentText: '#0B2D2C',
    cardSurface: '#1A1A1A',
    cardBorder: '#2A2A2A',
    success: '#1D9E75',
    tabBarBackground: '#0D0D0D',
    tabBarBorder: '#2A2A2A',
    activeTab: '#CCDF1A',
    headerBackground: '#0B2D2C',
  }
}

interface ThemeStore {
  mode: ThemeMode
  colors: ThemeColors
  setTheme: (mode: ThemeMode) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'dark', // Default to dark since they said dark mode is okay already
      colors: themes.dark,
      setTheme: (mode) => set({ mode, colors: themes[mode] }),
    }),
    {
      name: 'kryd-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export { themes }

