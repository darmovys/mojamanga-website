/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { ScriptOnce } from '@tanstack/react-router'
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

type Theme = 'dark' | 'light'
const STORAGE_KEY_DEFAULT = 'theme'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const initialState: ThemeProviderState = {
  theme: 'dark',
  setTheme: () => null,
  toggleTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = STORAGE_KEY_DEFAULT,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme
    return (localStorage.getItem(storageKey) as Theme | null) ?? defaultTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (!root.classList.contains(theme)) {
      root.classList.remove('light', 'dark')
      root.classList.add(theme)
    }
  }, [theme])

  const setTheme = useCallback(
    (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme)
      setThemeState(newTheme)
    },
    [storageKey],
  )

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return (
    <ThemeProviderContext {...props} value={value}>
      <ScriptOnce>
        {/* Apply theme early to avoid FOUC — defaults to dark for new users */}
        {`document.documentElement.classList.add(
            localStorage.getItem('${storageKey}') ?? 'dark'
          )`}
      </ScriptOnce>
      {children}
    </ThemeProviderContext>
  )
}

export const useTheme = () => {
  const context = use(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')

  return context
}
