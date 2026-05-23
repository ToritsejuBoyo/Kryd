import { create } from 'zustand';

export interface OnboardingState {
  role: 'freelancer' | 'client' | null;
  // Freelancer fields
  workTypes: string[];
  experienceYears: string;
  goals: string[];
  // Client fields
  itNeeds: string[];
  hiringAs: string;
  companyName: string;
  // Common
  fullName: string;
  email: string;
  country: string;
  preferredCurrency: 'NGN_USD' | 'USD';
}

interface OnboardingStore extends OnboardingState {
  setRole: (role: 'freelancer' | 'client') => void;
  setWorkTypes: (types: string[]) => void;
  setExperienceYears: (years: string) => void;
  setGoals: (goals: string[]) => void;
  setItNeeds: (needs: string[]) => void;
  setHiringAs: (hiringAs: string) => void;
  setCompanyName: (name: string) => void;
  setFullName: (name: string) => void;
  setEmail: (email: string) => void;
  setCountry: (country: string) => void;
  setPreferredCurrency: (currency: 'NGN_USD' | 'USD') => void;
  resetOnboarding: () => void;
}

const initialState: OnboardingState = {
  role: null,
  workTypes: [],
  experienceYears: '',
  goals: [],
  itNeeds: [],
  hiringAs: '',
  companyName: '',
  fullName: '',
  email: '',
  country: 'Nigeria',
  preferredCurrency: 'NGN_USD'
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  ...initialState,
  setRole: (role) => set({ role }),
  setWorkTypes: (workTypes) => set({ workTypes }),
  setExperienceYears: (experienceYears) => set({ experienceYears }),
  setGoals: (goals) => set({ goals }),
  setItNeeds: (itNeeds) => set({ itNeeds }),
  setHiringAs: (hiringAs) => set({ hiringAs }),
  setCompanyName: (companyName) => set({ companyName }),
  setFullName: (fullName) => set({ fullName }),
  setEmail: (email) => set({ email }),
  setCountry: (country) => set({ country }),
  setPreferredCurrency: (preferredCurrency) => set({ preferredCurrency }),
  resetOnboarding: () => set(initialState)
}));
