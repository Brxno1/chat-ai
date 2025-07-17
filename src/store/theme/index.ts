import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { codeThemes } from '@/components/theme/code-theme'

type State = {
  theme: string
}

type Actions = {
  setTheme: (theme: string) => void
  getTheme: (label: string) => (typeof codeThemes)[0]
}

type ThemeState = State & Actions

const FALLBACK_THEME = codeThemes[0]

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: FALLBACK_THEME.label,

      setTheme: (theme) => set({ theme }),
      getTheme: (label) =>
        codeThemes.find((t) => t.label === label) || FALLBACK_THEME,
    }),
    {
      name: 'code-theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
)
