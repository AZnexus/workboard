import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export const THEMES = [
  { id: "light", label: "Clar", isDark: false },
  { id: "dark", label: "Fosc", isDark: true },
  { id: "matrix", label: "Matrix", isDark: true },
  { id: "dragonball", label: "Dragon Ball", isDark: true },
  { id: "cyberpunk", label: "Cyberpunk", isDark: true },
  { id: "nord", label: "Nord", isDark: true },
  { id: "monokai", label: "Monokai", isDark: true },
] as const

export type ThemeId = (typeof THEMES)[number]["id"]

function applyTheme(themeId: ThemeId) {
  const el = document.documentElement
  THEMES.forEach(t => {
    if (t.id !== "light" && t.id !== "dark") el.classList.remove(t.id)
  })
  el.classList.remove("dark")

  const theme = THEMES.find(t => t.id === themeId)
  if (themeId === "dark") {
    el.classList.add("dark")
  } else if (themeId !== "light") {
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
    return THEMES.some(t => t.id === stored) ? (stored as ThemeId) : "light"
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
