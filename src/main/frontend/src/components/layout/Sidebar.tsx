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
      collapsed ? "w-16" : "w-64"
    )}>
      <div className={cn("h-16 border-b border-border flex items-center transition-all", collapsed ? "justify-center px-0" : "justify-between px-2")}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2.5 overflow-hidden pr-2 min-w-0 flex-1">
              <Hexagon className="h-7 w-7 text-primary fill-primary/20 shrink-0" strokeWidth={2.5} />
              <span className="text-[1.62rem] font-extrabold tracking-tight truncate text-foreground leading-none flex items-baseline min-w-0">
                Work<span className="text-muted-foreground font-bold ml-[0.16em] text-[0.88em]">.board</span>
              </span>
            </div>
            <button 
              onClick={() => setCollapsed(true)} 
              className="w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 transition-colors"
              title="Col·lapsar"
            >
              <ChevronLeft size={14} />
            </button>
          </>
        ) : (
          <div className="relative flex h-full w-full items-center justify-center">
            <button
              onClick={() => setCollapsed(false)}
              className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-border/80 bg-muted/80 text-primary shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/80 hover:text-primary"
              title="Expandir sidebar"
            >
              <ChevronRight size={13} />
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-muted/35 text-primary shadow-sm">
              <Hexagon className="h-7 w-7 fill-primary/20 shrink-0" strokeWidth={2.1} />
            </div>
          </div>
        )}
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
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all border-l-[3px]",
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
               "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all border-l-[3px]",
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
