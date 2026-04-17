import os

files = {
    "src/components/layout/AppShell.tsx": """import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { TopBar } from "./TopBar"

export function AppShell() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[768px] p-[24px] space-y-[24px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
""",
    "src/components/layout/Sidebar.tsx": """import { useState, useEffect } from "react"
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
""",
    "src/components/layout/TopBar.tsx": """import { useState } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function TopBar() {
  const [search, setSearch] = useState("")

  const dateStr = new Intl.DateTimeFormat("ca-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date())

  return (
    <header className="flex h-[48px] shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <div className="text-sm font-medium text-muted-foreground capitalize">
        {dateStr}
      </div>
      <div className="relative w-64">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          type="text"
          placeholder="Cercar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-full pl-8 bg-background border-border text-sm"
        />
      </div>
    </header>
  )
}
""",
    "src/components/entries/QuickCapture.tsx": """import { useState, useRef, useEffect } from "react"
import { Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCreateEntry } from "@/hooks/useEntries"
import { EntryType } from "@/types"
import { toast } from "sonner"
import { EntryForm } from "./EntryForm"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function QuickCapture() {
  const [type, setType] = useState<EntryType>("TASK")
  const [title, setTitle] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const createEntry = useCreateEntry()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await createEntry.mutateAsync({
        title: title.trim(),
        type,
      })
      toast.success("Afegit correctament")
      setTitle("")
      inputRef.current?.focus()
    } catch (error) {
      toast.error("Error a l'afegir")
    }
  }

  return (
    <div className="flex h-[48px] w-full items-center gap-2 rounded-[8px] border border-border bg-surface p-1 shadow-sm">
      <Select value={type} onValueChange={(val: EntryType) => setType(val)}>
        <SelectTrigger className="w-[120px] border-0 bg-transparent shadow-none focus:ring-0">
          <SelectValue placeholder="Tipus" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TASK">Tasca</SelectItem>
          <SelectItem value="NOTE">Nota</SelectItem>
          <SelectItem value="MEETING_NOTE">Reunió</SelectItem>
          <SelectItem value="REMINDER">Recordatori</SelectItem>
        </SelectContent>
      </Select>

      <div className="h-6 w-px bg-border shrink-0" />

      <form onSubmit={handleSubmit} className="flex-1 flex items-center h-full">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Escriu i prem Enter..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-full w-full border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
        />
      </form>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground">
            <Plus size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetTitle className="sr-only">Nova Entrada</SheetTitle>
          <EntryForm 
            initialType={type} 
            initialTitle={title} 
            onSuccess={() => {
              setSheetOpen(false)
              setTitle("")
            }} 
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
""",
    "src/components/entries/EntryCard.tsx": """import { Entry } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { EntryForm } from "./EntryForm"
import { useState } from "react"

const STATUS_CONFIG = {
  OPEN: { variant: "outline" as const, label: "Obert", classes: "text-muted-foreground border-border" },
  IN_PROGRESS: { variant: "default" as const, label: "En Curs", classes: "bg-accent hover:bg-accent/90" },
  DONE: { variant: "default" as const, label: "Fet", classes: "bg-[#16a34a] hover:bg-[#16a34a]/90 text-white" },
  CANCELLED: { variant: "secondary" as const, label: "Cancel·lat", classes: "line-through text-muted-foreground" },
}

export function EntryCard({ entry }: { entry: Entry }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const config = STATUS_CONFIG[entry.status]

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Card className="group cursor-pointer rounded-[8px] border-border bg-surface shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-[12px] flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={config.variant} className={cn("rounded-[6px] text-xs font-medium px-2 py-0.5", config.classes)}>
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{entry.type}</span>
                {entry.pinned && <Pin size={12} className="text-accent" />}
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {new Intl.DateTimeFormat("ca-ES", { dateStyle: "short", timeStyle: "short" }).format(new Date(entry.updated_at))}
              </span>
            </div>
            
            <h3 className={cn("text-sm font-medium leading-tight text-foreground", entry.status === "DONE" && "line-through text-muted-foreground")}>
              {entry.title}
            </h3>

            {(entry.tags.length > 0 || entry.external_ref) && (
              <div className="flex flex-wrap gap-1 mt-1">
                {entry.external_ref && (
                  <Badge variant="outline" className="rounded-[6px] bg-muted/50 text-xs font-mono px-1 py-0 border-border text-muted-foreground">
                    {entry.external_ref}
                  </Badge>
                )}
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-[6px] text-[10px] px-1 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetTitle className="sr-only">Editar Entrada</SheetTitle>
        <EntryForm entry={entry} onSuccess={() => setSheetOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
""",
    "src/components/entries/EntryForm.tsx": """import { useState } from "react"
import { Entry, EntryType, EntryStatus, CreateEntryRequest, UpdateEntryRequest } from "@/types"
import { useCreateEntry, useUpdateEntry, useDeleteEntry } from "@/hooks/useEntries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface EntryFormProps {
  entry?: Entry
  initialType?: EntryType
  initialTitle?: string
  onSuccess: () => void
}

export function EntryForm({ entry, initialType, initialTitle, onSuccess }: EntryFormProps) {
  const isEditing = !!entry
  const [type, setType] = useState<EntryType>(entry?.type || initialType || "TASK")
  const [title, setTitle] = useState(entry?.title || initialTitle || "")
  const [body, setBody] = useState(entry?.body || "")
  const [status, setStatus] = useState<EntryStatus>(entry?.status || "OPEN")
  const [date, setDate] = useState(entry?.date || new Date().toISOString().split('T')[0])
  const [tagsStr, setTagsStr] = useState(entry?.tags?.join(", ") || "")
  const [externalRef, setExternalRef] = useState(entry?.external_ref || "")
  const [pinned, setPinned] = useState(entry?.pinned || false)

  const createMut = useCreateEntry()
  const updateMut = useUpdateEntry()
  const deleteMut = useDeleteEntry()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const tags = tagsStr.split(",").map(t => t.trim()).filter(Boolean)

    try {
      if (isEditing) {
        const payload: UpdateEntryRequest = { type, title, body, status, date, tags, externalRef, pinned }
        await updateMut.mutateAsync({ id: entry.id, body: payload })
        toast.success("Actualitzat")
      } else {
        const payload: CreateEntryRequest = { type, title, body, date, tags, externalRef }
        await createMut.mutateAsync(payload)
        toast.success("Creat")
      }
      onSuccess()
    } catch (error) {
      toast.error("Error al guardar")
    }
  }

  const handleDelete = async () => {
    if (!entry) return
    if (confirm("Segur que vols esborrar?")) {
      try {
        await deleteMut.mutateAsync(entry.id)
        toast.success("Esborrat")
        onSuccess()
      } catch (err) {
        toast.error("Error al esborrar")
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="py-4 border-b border-border">
        <h2 className="text-lg font-semibold">{isEditing ? "Editar Entrada" : "Nova Entrada"}</h2>
      </div>
      <form id="entry-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Títol</label>
          <Input required value={title} onChange={e => setTitle(e.target.value)} className="bg-background border-border text-foreground" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Tipus</label>
            <Select value={type} onValueChange={(val: EntryType) => setType(val)}>
              <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TASK">Tasca</SelectItem>
                <SelectItem value="NOTE">Nota</SelectItem>
                <SelectItem value="MEETING_NOTE">Reunió</SelectItem>
                <SelectItem value="REMINDER">Recordatori</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Estat</label>
            <Select value={status} onValueChange={(val: EntryStatus) => setStatus(val)}>
              <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Obert</SelectItem>
                <SelectItem value="IN_PROGRESS">En Curs</SelectItem>
                <SelectItem value="DONE">Fet</SelectItem>
                <SelectItem value="CANCELLED">Cancel·lat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Data</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-background border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Ref Externa</label>
            <Input value={externalRef} onChange={e => setExternalRef(e.target.value)} className="bg-background border-border text-foreground" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* We do not have Switch initialized by shadcn maybe? Wait, components.json has "toggle". Not switch. Let's fallback to checkbox if Switch doesn't exist. Actually, let's just use input type="checkbox". */}
          <input type="checkbox" id="pinned" checked={pinned} onChange={e => setPinned(e.target.checked)} className="w-4 h-4 rounded border-border" />
          <label htmlFor="pinned" className="text-sm font-medium text-muted-foreground">Fixada</label>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Etiquetes (separades per coma)</label>
          <Input value={tagsStr} onChange={e => setTagsStr(e.target.value)} className="bg-background border-border text-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Cos / Detalls</label>
          <Textarea 
            value={body} 
            onChange={e => setBody(e.target.value)} 
            className="min-h-[150px] bg-background border-border text-foreground resize-y" 
          />
        </div>
      </form>

      <div className="py-4 border-t border-border flex items-center justify-between">
        {isEditing ? (
          <Button type="button" variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 size={16} />
          </Button>
        ) : <div />}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>Cancel·lar</Button>
          <Button type="submit" form="entry-form" className="bg-accent hover:bg-accent/90 text-white">Guardar</Button>
        </div>
      </div>
    </div>
  )
}
""",
    "src/components/entries/EntryFilters.tsx": """import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"

interface EntryFiltersProps {
  status: string
  setStatus: (s: string) => void
  type: string
  setType: (t: string) => void
  search: string
  setSearch: (s: string) => void
}

export function EntryFilters({ status, setStatus, type, setType, search, setSearch }: EntryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-surface rounded-[8px] border border-border">
      <div className="flex flex-wrap gap-4">
        <ToggleGroup type="single" value={status} onValueChange={setStatus} className="justify-start">
          <ToggleGroupItem value="" aria-label="Tots">Tots</ToggleGroupItem>
          <ToggleGroupItem value="OPEN" aria-label="Oberts">Oberts</ToggleGroupItem>
          <ToggleGroupItem value="IN_PROGRESS" aria-label="En Curs">En Curs</ToggleGroupItem>
          <ToggleGroupItem value="DONE" aria-label="Fets">Fets</ToggleGroupItem>
        </ToggleGroup>
        
        <div className="h-8 w-px bg-border hidden sm:block" />
        
        <ToggleGroup type="single" value={type} onValueChange={setType} className="justify-start">
          <ToggleGroupItem value="" aria-label="Tots">Tots</ToggleGroupItem>
          <ToggleGroupItem value="TASK" aria-label="Tasques">Tasca</ToggleGroupItem>
          <ToggleGroupItem value="NOTE" aria-label="Notes">Nota</ToggleGroupItem>
        </ToggleGroup>
      </div>

      <Input 
        placeholder="Cercar..." 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        className="w-full sm:w-64 bg-background border-border text-foreground"
      />
    </div>
  )
}
""",
    "src/components/entries/EntryList.tsx": """import { useState } from "react"
import { useEntries } from "@/hooks/useEntries"
import { EntryFilters } from "./EntryFilters"
import { EntryCard } from "./EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/hooks/useDebounce"

export function EntryList() {
  const [status, setStatus] = useState("")
  const [type, setType] = useState("")
  const [search, setSearch] = useState("")
  
  const debouncedSearch = useDebounce(search, 300)
  
  const { data, isLoading } = useEntries({ 
    status: status || undefined, 
    type: type || undefined, 
    query: debouncedSearch || undefined 
  })

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Totes les Entrades</h1>
      </div>
      
      <EntryFilters 
        status={status} setStatus={setStatus}
        type={type} setType={setType}
        search={search} setSearch={setSearch}
      />

      {isLoading ? (
        <div className="space-y-[16px]">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-[8px]" />)}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-[8px]">
          No hi ha cap entrada que coincideixi
        </div>
      ) : (
        <div className="space-y-[16px]">
          {data?.data?.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
""",
    "src/components/dashboard/PinnedEntries.tsx": """import { Entry } from "@/types"
import { EntryCard } from "@/components/entries/EntryCard"

export function PinnedEntries({ entries }: { entries: Entry[] }) {
  if (!entries || entries.length === 0) return null

  return (
    <div className="space-y-[12px]">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fixades</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
        {entries.map(entry => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}
""",
    "src/components/dashboard/DailyView.tsx": """import { useDaily } from "@/hooks/useDashboard"
import { QuickCapture } from "@/components/entries/QuickCapture"
import { PinnedEntries } from "./PinnedEntries"
import { EntryCard } from "@/components/entries/EntryCard"
import { Skeleton } from "@/components/ui/skeleton"

export function DailyView() {
  const { data, isLoading } = useDaily()

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-12" /><Skeleton className="h-32" /></div>
  }

  const dashboard = data?.data
  const openEntries = dashboard?.entries?.filter(e => e.status !== "DONE" && e.status !== "CANCELLED") || []
  const doneEntries = dashboard?.entries?.filter(e => e.status === "DONE" || e.status === "CANCELLED") || []

  return (
    <div className="space-y-[24px]">
      <QuickCapture />
      
      {dashboard?.pinned && <PinnedEntries entries={dashboard.pinned} />}

      <div className="space-y-[16px]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avui</h2>
          {dashboard?.totalHours !== undefined && (
            <span className="text-xs font-medium text-accent">{dashboard.totalHours} h</span>
          )}
        </div>
        
        {openEntries.length === 0 && doneEntries.length === 0 && (
           <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-[8px]">
             Cap tasca avui.
           </div>
        )}

        <div className="space-y-[16px]">
          {openEntries.map(entry => <EntryCard key={entry.id} entry={entry} />)}
          {doneEntries.map(entry => <EntryCard key={entry.id} entry={entry} />)}
        </div>
      </div>
    </div>
  )
}
""",
    "src/components/dashboard/StandupCard.tsx": """import { useStandup } from "@/hooks/useDashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function StandupCard() {
  const { data, isLoading } = useStandup()

  if (isLoading) return <Skeleton className="h-64" />

  const standup = data?.data

  const handleCopy = () => {
    if (!standup) return
    const text = `Ahir:
${standup.yesterdayDone.map(e => `- ${e.title}`).join('\\n')}

Avui:
${standup.todayPlan.map(e => `- ${e.title}`).join('\\n')}
`
    navigator.clipboard.writeText(text)
    toast.success("Copiat al porta-retalls")
  }

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Standup</h1>
        <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2">
          <Copy size={14} /> Copiar
        </Button>
      </div>

      <Card className="rounded-[8px] border-border bg-surface shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">Ahir ({standup?.yesterday})</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {standup?.yesterdayDone.length === 0 && <li>Cap element</li>}
              {standup?.yesterdayDone.map(e => (
                <li key={e.id}>{e.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">Avui ({standup?.today})</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {standup?.todayPlan.length === 0 && <li>Cap element</li>}
              {standup?.todayPlan.map(e => (
                <li key={e.id}>{e.title}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
""",
    "src/components/timelogs/TimeLogForm.tsx": """import { useState } from "react"
import { useCreateTimeLog } from "@/hooks/useTimeLogs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function TimeLogForm() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [hours, setHours] = useState("")
  const [project, setProject] = useState("")
  const [description, setDescription] = useState("")

  const createMut = useCreateTimeLog()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hours || !project) return

    try {
      await createMut.mutateAsync({
        date,
        hours: parseFloat(hours),
        project,
        description
      })
      toast.success("Temps afegit")
      setHours("")
      setDescription("")
    } catch (err) {
      toast.error("Error al afegir temps")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-surface p-4 rounded-[8px] border border-border">
      <div className="space-y-1 w-full sm:w-auto">
        <label className="text-xs text-muted-foreground">Data</label>
        <Input type="date" required value={date} onChange={e => setDate(e.target.value)} className="h-9 border-border bg-background" />
      </div>
      <div className="space-y-1 w-full sm:w-24">
        <label className="text-xs text-muted-foreground">Hores</label>
        <Input type="number" step="0.25" min="0" required value={hours} onChange={e => setHours(e.target.value)} className="h-9 border-border bg-background" placeholder="0.0" />
      </div>
      <div className="space-y-1 w-full sm:w-48">
        <label className="text-xs text-muted-foreground">Projecte</label>
        <Input required value={project} onChange={e => setProject(e.target.value)} className="h-9 border-border bg-background" placeholder="Ex: CORE" />
      </div>
      <div className="space-y-1 w-full sm:flex-1">
        <label className="text-xs text-muted-foreground">Descripció</label>
        <Input value={description} onChange={e => setDescription(e.target.value)} className="h-9 border-border bg-background" placeholder="Opcional" />
      </div>
      <Button type="submit" className="h-9 w-full sm:w-auto bg-accent hover:bg-accent/90 text-white">Afegir</Button>
    </form>
  )
}
""",
    "src/components/timelogs/TimeLogTable.tsx": """import { useTimeLogs, useDeleteTimeLog } from "@/hooks/useTimeLogs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function TimeLogTable() {
  const { data, isLoading } = useTimeLogs()
  const deleteMut = useDeleteTimeLog()

  const handleDelete = async (id: number) => {
    if (confirm("Segur que vols esborrar-ho?")) {
      try {
        await deleteMut.mutateAsync(id)
        toast.success("Esborrat")
      } catch (err) {
        toast.error("Error")
      }
    }
  }

  if (isLoading) return <Skeleton className="h-48" />

  const logs = data?.data || []

  return (
    <div className="border border-border rounded-[8px] bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Projecte</TableHead>
            <TableHead>Hores</TableHead>
            <TableHead className="w-full">Descripció</TableHead>
            <TableHead className="text-right">Accions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground h-24">Cap registre</TableCell>
            </TableRow>
          )}
          {logs.map(log => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">{log.date}</TableCell>
              <TableCell className="font-medium text-foreground">{log.project}</TableCell>
              <TableCell className="text-foreground">{log.hours}h</TableCell>
              <TableCell className="text-muted-foreground">{log.description}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(log.id)}>
                  <Trash2 size={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
""",
    "src/components/timelogs/WeeklySummary.tsx": """import { useWeekly } from "@/hooks/useDashboard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function WeeklySummary() {
  const { data, isLoading } = useWeekly()

  if (isLoading) return <Skeleton className="h-32" />

  const weekly = data?.data

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">Resum Setmanal ({weekly?.week})</h2>
      <div className="border border-border rounded-[8px] bg-surface overflow-hidden w-full sm:max-w-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Projecte</TableHead>
              <TableHead className="text-right">Hores</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(weekly?.hoursByProject || {}).map(([project, hours]) => (
              <TableRow key={project}>
                <TableCell className="font-medium text-foreground">{project}</TableCell>
                <TableCell className="text-right text-foreground">{Number(hours).toFixed(2)}h</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/30">
              <TableCell className="font-semibold text-foreground">Total</TableCell>
              <TableCell className="text-right font-semibold text-accent">{weekly?.totalHours?.toFixed(2)}h</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
""",
    "src/pages/TimeLogsPage.tsx": """import { TimeLogForm } from "@/components/timelogs/TimeLogForm"
import { TimeLogTable } from "@/components/timelogs/TimeLogTable"
import { WeeklySummary } from "@/components/timelogs/WeeklySummary"

export function TimeLogsPage() {
  return (
    <div className="space-y-[24px]">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Hores</h1>
      <TimeLogForm />
      <TimeLogTable />
      <WeeklySummary />
    </div>
  )
}
""",
    "src/components/export/ExportView.tsx": """import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchMarkdownExport } from "@/api/dashboard"
import { Copy, Download } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function ExportView() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!date) return
    setLoading(true)
    fetchMarkdownExport({ date })
      .then(setContent)
      .catch(() => toast.error("Error al carregar exportació"))
      .finally(() => setLoading(false))
  }, [date])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    toast.success("Copiat al porta-retalls")
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `export-${date}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-[24px] h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Exportar</h1>
        <div className="flex items-center gap-2">
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9 w-auto border-border bg-background text-foreground" />
          <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2"><Copy size={14} /> Copiar</Button>
          <Button onClick={handleDownload} size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-white"><Download size={14} /> .md</Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-surface border border-border rounded-[8px] p-4 overflow-auto">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap break-words">{content}</pre>
        )}
      </div>
    </div>
  )
}
""",
    "src/App.tsx": """import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AppShell } from "@/components/layout/AppShell"
import { DailyView } from "@/components/dashboard/DailyView"
import { StandupCard } from "@/components/dashboard/StandupCard"
import { EntryList } from "@/components/entries/EntryList"
import { TimeLogsPage } from "@/pages/TimeLogsPage"
import { ExportView } from "@/components/export/ExportView"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DailyView />} />
          <Route path="/standup" element={<StandupCard />} />
          <Route path="/entries" element={<EntryList />} />
          <Route path="/timelogs" element={<TimeLogsPage />} />
          <Route path="/export" element={<ExportView />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
"""
}

for filepath, content in files.items():
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w") as f:
        f.write(content)

print("Files created successfully.")
