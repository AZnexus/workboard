import { NavLink } from "react-router-dom"
import { Calendar, Clock, List, ChevronLeft, ChevronRight, FileText, Users, Settings, CheckSquare, Hexagon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const NAV_ITEMS = [
  { to: "/", label: "El meu dia", icon: Calendar },
  { to: "/timelogs", label: "Hores", icon: Clock },
  { to: "/tasks", label: "Tasques", icon: CheckSquare },
  { to: "/notes", label: "Notes", icon: FileText },
  { to: "/actes", label: "Actes", icon: Users },
  { to: "/entries", label: "Registre", icon: List },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(max-width: 1024px)").matches
    }
    return false
  })

  return (
    <aside className={cn(
      "flex flex-col border-r border-border transition-all duration-300 bg-card",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className={cn("h-16 border-b border-border relative", collapsed ? "px-2" : "px-3")}>
        <div className={cn("flex h-full items-center overflow-hidden transition-all", collapsed ? "w-0 opacity-0 hidden" : "w-full gap-2 opacity-100") }>
          <Hexagon className="h-6 w-6 text-primary shrink-0" />
          <span className="text-[1.85rem] font-extrabold tracking-[-0.04em] truncate flex-1 text-foreground leading-none">
            Work<span className="text-muted-foreground font-bold">.board</span>
          </span>
        </div>
        {collapsed && (
          <Hexagon className="h-8 w-8 text-primary shrink-0 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className={cn(
            "text-muted-foreground hover:text-foreground shrink-0 transition-all flex items-center justify-center",
              collapsed 
                ? "absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-muted/70 z-10" 
                : "absolute right-3 w-8 h-8 rounded-md hover:bg-muted"
          )}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => isActive ? {
              borderLeftColor: "var(--accent-primary)",
              backgroundColor: "hsla(var(--accent-primary-hue), 50%, 50%, 0.08)",
            } : undefined}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-r-md px-3 py-2 text-sm font-medium transition-all border-l-2",
              isActive 
                ? "text-primary font-semibold" 
                : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
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
        <NavLink
          to="/config"
            style={({ isActive }) => isActive ? {
              borderLeftColor: "var(--accent-primary)",
              backgroundColor: "hsla(var(--accent-primary-hue), 50%, 50%, 0.08)",
            } : undefined}
            className={({ isActive }) => cn(
               "flex items-center gap-3 rounded-r-md px-3 py-2 text-sm font-medium transition-all border-l-2",
              isActive 
                ? "text-primary font-semibold" 
                : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
              collapsed && "justify-center px-0"
            )}
          title={collapsed ? "Configuració" : undefined}
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span className="truncate">Configuració</span>}
        </NavLink>
      </div>
    </aside>
  )
}
