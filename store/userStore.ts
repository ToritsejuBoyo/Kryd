import { create } from 'zustand'

export type AppTheme = 'light' | 'dark' | 'kryd';

export interface UserStore {
  profile: {
    id: string
    full_name: string
    role: string
    points: number
    coins: number
    is_pro: boolean
    verification_status?: string
    default_mode?: string
    phone_number?: string
    dob?: string
    languages?: string[]
    website_url?: string
    linkedin_url?: string
    twitter_url?: string
    skills?: string[]
    experience?: any[]
    certifications?: any[]
    portfolio?: any[]
    availability_status?: string
    hourly_rate?: number
    open_to?: any
    project_size?: any
    resume_url?: string
    profile_visibility?: string
    show_on_leaderboard?: boolean
    show_availability?: boolean
    show_hourly_rate?: boolean
    show_work_history?: boolean
    notification_prefs?: any
    preferred_currency?: string
    language?: string
    bio?: string
  } | null
  isClientMode: boolean
  setClientMode: (isClient: boolean) => void
  isLoggingIn: boolean
  setIsLoggingIn: (isLoggingIn: boolean) => void
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  setProfile: (profile: UserStore['profile']) => void
  updatePoints: (amount: number) => void
  updatePointsAndCoins: (pointsDelta: number, coinsDelta: number) => void
  clearProfile: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  isClientMode: false,
  setClientMode: (isClient) => set({ isClientMode: isClient }),
  isLoggingIn: false,
  setIsLoggingIn: (isLoggingIn) => set({ isLoggingIn }),
  theme: 'kryd',
  setTheme: (theme) => set({ theme }),
  setProfile: (profile) => set({ profile }),
  updatePoints: (amount) => set((state) => ({
    profile: state.profile ? { ...state.profile, points: state.profile.points + amount } : null
  })),
  updatePointsAndCoins: (pointsDelta, coinsDelta) => set((state) => ({
    profile: state.profile ? { 
      ...state.profile, 
      points: state.profile.points + pointsDelta,
      coins: state.profile.coins + coinsDelta
    } : null
  })),
  clearProfile: () => set({ profile: null }),
}))
