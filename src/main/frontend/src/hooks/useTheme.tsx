import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import {
  DEFAULT_THEME_IDENTITY_ID,
  DEFAULT_THEME_MODE,
  THEME_MODES,
  THEME_VARIANTS,
  getThemeIdentityById,
  getThemeVariant,
  parseThemeSelection,
  serializeThemeSelection,
  type ThemeIdentity,
  type ThemeIdentityId,
  type ThemeMode,
  type ThemeSelection,
} from "@/config/themes"

const THEME_STORAGE_KEY = "theme"

function readThemeSelectionFromStorage(): ThemeSelection {
  const parsed = parseThemeSelection(localStorage.getItem(THEME_STORAGE_KEY))
  return parsed ?? { id: DEFAULT_THEME_IDENTITY_ID, mode: DEFAULT_THEME_MODE }
}

function applyTheme(selection: ThemeSelection) {
  const root = document.documentElement

  root.classList.remove("dark")
  root.classList.remove("light")

  for (const variant of THEME_VARIANTS) {
    root.classList.remove(variant.className)

    for (const legacyId of variant.legacyIds) {
      root.classList.remove(legacyId)
    }
  }

  root.classList.add(selection.mode)
  root.classList.add(getThemeVariant(selection).className)
}

interface ThemeContextValue {
  theme: ThemeIdentity
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  setTheme: (id: ThemeIdentityId, mode?: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<ThemeSelection>(() => readThemeSelectionFromStorage())

  const setMode = (mode: ThemeMode) => {
    setSelection(prev => ({ id: prev.id, mode }))
  }

  const setTheme = (id: ThemeIdentityId, mode?: ThemeMode) => {
    setSelection(prev => ({ id, mode: mode ?? prev.mode }))
  }

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, serializeThemeSelection(selection))
    applyTheme(selection)
  }, [selection])

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: getThemeIdentityById(selection.id),
      mode: selection.mode,
      setMode,
      setTheme,
    }),
    [selection],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }

  return context
}

export { THEME_MODES }
