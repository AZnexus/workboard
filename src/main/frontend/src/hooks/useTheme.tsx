import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export const THEMES = [
  { id: "dark", label: "Indigo Deep", isDark: true },
  { id: "light", label: "Indigo Clar", isDark: false },
  { id: "teal-night", label: "Teal Night", isDark: true },
  { id: "warm-earth", label: "Warm Earth", isDark: true },
  { id: "steel-blue", label: "Steel Blue", isDark: true },
  { id: "ember-rose", label: "Ember Rose", isDark: true },
  { id: "jade-noir", label: "Jade Noir", isDark: true },
  { id: "sunset-amber", label: "Sunset Amber", isDark: true },
  { id: "sage-mist", label: "Sage Mist", isDark: false },
] as const

export type ThemeId = (typeof THEMES)[number]["id"]

function applyTheme(themeId: ThemeId) {
  const el = document.documentElement
  THEMES.forEach(t => {
    if (t.id !== "dark") el.classList.remove(t.id)
  })
  el.classList.remove("dark")
  el.classList.remove("light")

  const theme = THEMES.find(t => t.id === themeId)
  if (themeId === "light") {
    el.classList.add("light")
  } else if (themeId === "dark") {
    el.classList.add("dark")
  } else {
    el.classList.add(themeId)
    if (theme?.isDark) el.classList.add("dark")
  }
}

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (id: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const stored = localStorage.getItem("theme")
    return THEMES.some(t => t.id === stored) ? (stored as ThemeId) : "dark"
  })

  const setTheme = (id: ThemeId) => {
    setThemeState(id)
    localStorage.setItem("theme", id)
  }

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error("useTheme must be used within ThemeProvider")
  return context
}
