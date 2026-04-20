import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { Calendar, Clock, List, FileDown, ChevronLeft, ChevronRight, FolderKanban, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const NAV_ITEMS = [
  { to: "/", label: "Avui", icon: Calendar },
  { to: "/entries", label: "Entrades", icon: List },
  { to: "/timelogs", label: "Hores", icon: Clock },
  { to: "/projects", label: "Projectes", icon: FolderKanban },
]

const TOOLS_ITEMS = [
  { to: "/export", label: "Export", icon: FileDown },
]

const THEMES = [
  { id: "light", label: "Clar", color: "#2563EB", isDark: false },
  { id: "dark", label: "Fosc", color: "#60A5FA", isDark: true },
  { id: "midnight", label: "Midnight", color: "#818CF8", isDark: true },
  { id: "forest", label: "Forest", color: "#4ADE80", isDark: true },
  { id: "sunset", label: "Sunset", color: "#FB923C", isDark: true },
  { id: "ocean", label: "Ocean", color: "#38BDF8", isDark: true },
  { id: "rose", label: "Rose", color: "#FB7185", isDark: true },
  { id: "lavender", label: "Lavender", color: "#8B5CF6", isDark: false },
  { id: "nord", label: "Nord", color: "#88C0D0", isDark: true },
] as const

type ThemeId = (typeof THEMES)[number]["id"]

function applyTheme(themeId: ThemeId) {
  const el = document.documentElement
  const theme = THEMES.find(t => t.id === themeId)
  THEMES.forEach(t => {
    if (t.id !== "light" && t.id !== "dark") el.classList.remove(t.id)
  })
  el.classList.remove("dark")

  if (themeId === "dark") {
    el.classList.add("dark")
  } else if (themeId !== "light") {
    el.classList.add(themeId)
    if (theme?.isDark) el.classList.add("dark")
  }
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(max-width: 1024px)").matches
    }
    return false
  })
  const [theme, setTheme] = useState<ThemeId>(() => (localStorage.getItem("theme") as ThemeId) || "light")

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem("theme", theme)
  }, [theme])

  return (
    <aside className={cn(
      "flex flex-col border-r border-border transition-all duration-300 bg-card",
      collapsed ? "w-[48px]" : "w-[200px]"
    )}>
      <div className="flex h-[48px] items-center justify-between px-3 border-b border-border">
        {!collapsed && <span className="font-bold tracking-tight text-foreground truncate">Workboard</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground shrink-0">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
        
        <div className="h-px bg-border mx-2 my-4" />
        {!collapsed && <span className="px-4 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">Eines</span>}
        
        {TOOLS_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="p-2 border-t border-border">
        {collapsed ? (
          <button
            className="flex w-full items-center justify-center rounded-md px-2 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Canviar tema"
            onClick={() => {
              const idx = THEMES.findIndex(t => t.id === theme)
              setTheme(THEMES[(idx + 1) % THEMES.length].id)
            }}
          >
            <Palette size={18} />
          </button>
        ) : (
          <div className="space-y-1.5 px-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Tema</span>
            <Select value={theme} onValueChange={(v) => setTheme(v as ThemeId)}>
              <SelectTrigger className="h-8 text-xs border-border bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                      {t.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </aside>
  )
}
