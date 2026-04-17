import { useState, useEffect } from "react"
import { NavLink } from "react-router-dom"
import { Calendar, Users, Clock, List, FileDown, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { to: "/", label: "Avui", icon: Calendar },
  { to: "/standup", label: "Standup", icon: Users },
  { to: "/timelogs", label: "Hores", icon: Clock },
  { to: "/entries", label: "Tot", icon: List },
  { to: "/export", label: "Export", icon: FileDown },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light")

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === "light" ? "dark" : "light")

  return (
    <aside className={cn(
      "flex flex-col border-r border-border transition-all duration-300 bg-surface",
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
                ? "bg-accent/10 text-accent" 
                : "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
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
        <button
          onClick={toggleTheme}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/10 hover:text-foreground",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Canviar tema" : undefined}
        >
          {theme === "dark" ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
          {!collapsed && <span className="truncate">Tema {theme === "light" ? "Fosc" : "Clar"}</span>}
        </button>
      </div>
    </aside>
  )
}
