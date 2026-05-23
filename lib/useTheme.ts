import { useThemeStore } from '../store/themeStore'

export function useTheme() {
  const { mode, colors, setTheme } = useThemeStore()
  return { mode, colors, setTheme }
}
