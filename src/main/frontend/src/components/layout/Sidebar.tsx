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
      <div className="flex h-12 items-center px-3 border-b border-border gap-2">
        <Hexagon className="h-5 w-5 text-primary shrink-0" />
        {!collapsed && <span className="text-lg font-bold tracking-tight truncate flex-1">Work<span className="text-muted-foreground">.board</span></span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground shrink-0 ml-auto">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors border-l-2",
              isActive 
                ? "bg-primary/10 text-primary border-primary" 
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
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors border-l-2",
              isActive 
                ? "bg-primary/10 text-primary border-primary" 
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
