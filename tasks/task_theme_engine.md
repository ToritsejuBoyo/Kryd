# task_theme_engine.md
> Agent task — read KRYD_SPEC.md first, then follow these instructions.
> Depends on: task_01_setup, task_04_dashboard | Build on existing code

---

## Goal
Make the three theme switcher buttons (Light, Dark, Kryd) on the dashboard profile dropdown actually work. The buttons already exist in the UI — they just do not do anything yet. This task wires them up to a real theme system that changes the entire app colours instantly and persists the choice across sessions.

---

## The three themes

### Light theme
Clean, bright, professional — like LinkedIn or Notion.

| Token | Value |
|-------|-------|
| backgroundPrimary | `#FFFFFF` |
| backgroundSecondary | `#F5F5F5` |
| backgroundTertiary | `#EBEBEB` |
| textPrimary | `#0A0A0A` |
| textSecondary | `#555555` |
| border | `#E0E0E0` |
| accent | `#0B2D2C` |
| accentText | `#FFFFFF` |
| cardSurface | `#FFFFFF` |
| cardBorder | `#E8E8E8` |
| success | `#1D9E75` |
| tabBarBackground | `#FFFFFF` |
| tabBarBorder | `#E0E0E0` |
| activeTab | `#0B2D2C` |

### Dark theme
Pure dark mode — like GitHub Dark or Vercel.

| Token | Value |
|-------|-------|
| backgroundPrimary | `#0D0D0D` |
| backgroundSecondary | `#1A1A1A` |
| backgroundTertiary | `#242424` |
| textPrimary | `#F5F5F5` |
| textSecondary | `#888888` |
| border | `#2A2A2A` |
| accent | `#CCDF1A` |
| accentText | `#0B2D2C` |
| cardSurface | `#1A1A1A` |
| cardBorder | `#2A2A2A` |
| success | `#1D9E75` |
| tabBarBackground | `#0D0D0D` |
| tabBarBorder | `#2A2A2A` |
| activeTab | `#CCDF1A` |

### Kryd theme (default)
The signature Kryd brand — dark teal background with lime green accents.

| Token | Value |
|-------|-------|
| backgroundPrimary | `#0B2D2C` |
| backgroundSecondary | `#0F3B3A` |
| backgroundTertiary | `#134443` |
| textPrimary | `#FFFFFF` |
| textSecondary | `rgba(255,255,255,0.6)` |
| border | `rgba(255,255,255,0.08)` |
| accent | `#CCDF1A` |
| accentText | `#0B2D2C` |
| cardSurface | `rgba(255,255,255,0.05)` |
| cardBorder | `rgba(255,255,255,0.08)` |
| success | `#1D9E75` |
| tabBarBackground | `#0B2D2C` |
| tabBarBorder | `rgba(255,255,255,0.08)` |
| activeTab | `#CCDF1A` |

---

## Implementation

### Step 1 — Create the theme store at /store/themeStore.ts

```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type ThemeMode = 'light' | 'dark' | 'kryd'

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
}

const themes: Record<ThemeMode, ThemeColors> = {
  light: {
    backgroundPrimary: '#FFFFFF',
    backgroundSecondary: '#F5F5F5',
    backgroundTertiary: '#EBEBEB',
    textPrimary: '#0A0A0A',
    textSecondary: '#555555',
    border: '#E0E0E0',
    accent: '#0B2D2C',
    accentText: '#FFFFFF',
    cardSurface: '#FFFFFF',
    cardBorder: '#E8E8E8',
    success: '#1D9E75',
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E0E0E0',
    activeTab: '#0B2D2C',
  },
  dark: {
    backgroundPrimary: '#0D0D0D',
    backgroundSecondary: '#1A1A1A',
    backgroundTertiary: '#242424',
    textPrimary: '#F5F5F5',
    textSecondary: '#888888',
    border: '#2A2A2A',
    accent: '#CCDF1A',
    accentText: '#0B2D2C',
    cardSurface: '#1A1A1A',
    cardBorder: '#2A2A2A',
    success: '#1D9E75',
    tabBarBackground: '#0D0D0D',
    tabBarBorder: '#2A2A2A',
    activeTab: '#CCDF1A',
  },
  kryd: {
    backgroundPrimary: '#0B2D2C',
    backgroundSecondary: '#0F3B3A',
    backgroundTertiary: '#134443',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.6)',
    border: 'rgba(255,255,255,0.08)',
    accent: '#CCDF1A',
    accentText: '#0B2D2C',
    cardSurface: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.08)',
    success: '#1D9E75',
    tabBarBackground: '#0B2D2C',
    tabBarBorder: 'rgba(255,255,255,0.08)',
    activeTab: '#CCDF1A',
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
      mode: 'kryd',
      colors: themes.kryd,
      setTheme: (mode) => set({ mode, colors: themes[mode] }),
    }),
    {
      name: 'kryd-theme',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
)

export { themes }
```

### Step 2 — Create /lib/useTheme.ts

```ts
import { useThemeStore } from '../store/themeStore'
export function useTheme() {
  const { mode, colors, setTheme } = useThemeStore()
  return { mode, colors, setTheme }
}
```

### Step 3 — Wire up the existing theme buttons

Find the Light, Dark, and Kryd buttons in the profile dropdown. Connect them:

```ts
const { mode, setTheme } = useTheme()

// Each button gets onPress and a style that shows active state
// Active: lime green background #CCDF1A, dark text #0B2D2C, bold
// Inactive: transparent background, border, secondary text
```

### Step 4 — Apply theme tokens to every screen

Replace ALL hardcoded colour values in every screen with theme tokens.

Files to update:
- /app/(tabs)/index.tsx
- /app/(tabs)/learn.tsx
- /app/(tabs)/jobs.tsx
- /app/(tabs)/community.tsx
- /app/(auth)/welcome.tsx
- /app/(auth)/signup.tsx
- /app/(auth)/login.tsx
- /app/profile.tsx
- /app/wallet.tsx
- /app/course/[id].tsx
- /app/job/[id].tsx
- /app/notifications.tsx (if built)

Replace pattern:
- All backgrounds → colors.backgroundPrimary or colors.backgroundSecondary
- All card backgrounds → colors.cardSurface
- All card borders → colors.cardBorder
- All body text → colors.textPrimary
- All secondary text → colors.textSecondary
- All dividers/borders → colors.border
- All primary buttons → colors.accent background, colors.accentText text
- All active indicators → colors.activeTab

### Step 5 — Theme the tab bar in /app/(tabs)/_layout.tsx

```ts
const { colors } = useTheme()

tabBarStyle: {
  backgroundColor: colors.tabBarBackground,
  borderTopColor: colors.tabBarBorder,
}
tabBarActiveTintColor: colors.activeTab
tabBarInactiveTintColor: colors.textSecondary
```

### Step 6 — Status bar

```ts
import { StatusBar } from 'expo-status-bar'
const { mode } = useTheme()
<StatusBar style={mode === 'light' ? 'dark' : 'light'} />
```

### Step 7 — Fade transition on theme change

Wrap each screen root view in an Animated.View with a 200ms fade so the theme switch feels smooth not jarring.

---

## Persistence
Theme is saved to AsyncStorage via Zustand persist. App loads last chosen theme on restart. Default is Kryd.

---

## Done when
- Tapping Light makes the entire app white and bright immediately
- Tapping Dark makes the entire app pure dark immediately  
- Tapping Kryd returns to the signature dark teal immediately
- Active theme button is visually highlighted in the switcher
- Reopening the app loads the last chosen theme
- Tab bar colours change with the theme
- Status bar is dark on light theme, light on dark and Kryd themes
- No hardcoded colour strings remain in any screen file
