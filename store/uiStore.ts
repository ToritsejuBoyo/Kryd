import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LayoutAnimation, Platform, UIManager } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface UIStore {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isSidebarCollapsed: false,
      toggleSidebar: () => set((state) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        return { isSidebarCollapsed: !state.isSidebarCollapsed };
      }),
    }),
    {
      name: 'kryd-ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
