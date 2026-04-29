import { useState, useMemo } from "react"
import { useEntries, useCreateEntry } from "@/hooks/useEntries"
import { useTags } from "@/hooks/useTags"
import { TagMultiSelect } from "@/components/entries/TagMultiSelect"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Pin, Circle, Loader, CircleCheck, XCircle, Search, CheckSquare, Copy } from "lucide-react"
import { groupByDate, formatGroupDate } from "@/lib/date-utils"
import type { Entry } from "@/types"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/PageHeader"

const STATUS_CONFIG = {
  OPEN: { label: "Obert", icon: Circle, bgClass: "bg-data-info/15", textClass: "text-data-info", borderClass: "border-data-info/30" },
  IN_PROGRESS: { label: "En Curs", icon: Loader, bgClass: "bg-data-warning/15", textClass: "text-data-warning", borderClass: "border-data-warning/30" },
  PAUSED: { label: "Pausat", icon: Circle, bgClass: "bg-data-warning/15", textClass: "text-data-warning", borderClass: "border-data-warning/30" },
  DONE: { label: "Fet", icon: CircleCheck, bgClass: "bg-data-positive/15", textClass: "text-data-positive", borderClass: "border-data-positive/30" },
  CANCELLED: { label: "Cancel·lat", icon: XCircle, bgClass: "bg-data-negative/15", textClass: "text-data-negative", borderClass: "border-data-negative/30" },
} as const

function ActaCard({ entry, onDuplicate }: { entry: Entry, onDuplicate: (e: React.MouseEvent, entry: Entry) => void }) {
  const navigate = useNavigate()
  const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG.OPEN

  const previewText = useMemo(() => {
    if (!entry.body) return ""
    const cleanText = entry.body
      .replace(/^[#\-*]+\s/gm, '')
      .replace(/\[[ xX]\]\s/g, '')
      .replace(/\r?\n/g, ' ')
      .trim()
    return cleanText.length > 100 ? cleanText.substring(0, 100) + '...' : cleanText
  }, [entry.body])

  const actionStats = useMemo(() => {
    if (!entry.body) return null
    const matches = entry.body.match(/\[([ xX])\]/g)
    if (!matches) return null
    const total = matches.length
    const completed = matches.filter(m => m.includes('x') || m.includes('X')).length
    return { total, completed }
  }, [entry.body])

  return (
    <Card 
      onClick={() => navigate(`/actes/${entry.id}`)}
      className="group cursor-pointer bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="flex h-full">
        <CardContent className="flex-1 px-3 py-2.5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-px text-xs font-medium border",
                    config.bgClass, config.textClass, config.borderClass
                  )}
              >
                <config.icon size={11} className={cn(entry.status === 'IN_PROGRESS' && "animate-spin")} />
                {config.label}
              </span>
              
              {entry.pinned && <Pin size={11} className="text-primary fill-primary/20" />}

              {(entry.tags.length > 0) && (
                <>
                  {entry.tags.map((tag) => (
                    <Badge
                      key={tag.id ?? tag.name}
                      variant="secondary"
                      className="uppercase tracking-wider"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </>
              )}
            </div>
            
            <h3 className={cn("text-sm font-medium leading-tight text-foreground", entry.status === "DONE" && "line-through text-muted-foreground")}>
              {entry.title}
            </h3>
            
            {previewText && (
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {previewText}
              </p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatGroupDate(entry.date)}
            </span>
            {actionStats && actionStats.total > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-sm">
                <CheckSquare size={10} />
                {actionStats.completed}/{actionStats.total}
              </span>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 text-muted-foreground hover:text-foreground mt-auto"
              onClick={(e) => onDuplicate(e, entry)}
            >
              <Copy size={14} />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export function ActesPage() {
  const [search, setSearch] = useState("")
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [sortBy, setSortBy] = useState<"date" | "title-asc" | "title-desc" | "status">("date")
  
  const { data: tagsData } = useTags()
  const selectedTagName = selectedTagIds.length > 0 
    ? tagsData?.find(t => t.id === selectedTagIds[0])?.name 
    : undefined

  const { data, isLoading } = useEntries({
    type: "MEETING_NOTE",
    size: 50,
    q: search || undefined,
    tag: selectedTagName
  })

  const { mutateAsync: createEntry } = useCreateEntry()

  const handleDuplicate = async (e: React.MouseEvent, entry: Entry) => {
    e.stopPropagation()
    try {
      await createEntry({
        type: "MEETING_NOTE",
        title: `${entry.title} (còpia)`,
        body: entry.body || "",
        date: new Date().toISOString().split('T')[0],
        tagIds: entry.tags.map(t => t.id).filter((id): id is number => id != null),
      })
      toast.success("Acta duplicada", { duration: 2500 })
    } catch {
      toast.error("Error al duplicar l'acta")
    }
  }

  const entries = data?.data || []
  
  const sortedEntries = useMemo(() => {
    const sorted = [...entries]
    switch (sortBy) {
      case "title-asc": return sorted.sort((a, b) => a.title.localeCompare(b.title, "ca"))
      case "title-desc": return sorted.sort((a, b) => b.title.localeCompare(a.title, "ca"))
      case "status": return sorted.sort((a, b) => a.status.localeCompare(b.status))
      default: return sorted
    }
  }, [entries, sortBy])

  const grouped = groupByDate(sortedEntries)

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={Users} 
        title="Actes de Reunió" 
        description="Gestió i seguiment de les teves actes de reunió. Filtra i ordena ràpidament."
      />

        <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_200px_180px]">
            <div className="space-y-2">
              <label htmlFor="actes-search" className="text-xs font-medium text-muted-foreground">Cercar</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="actes-search"
                  placeholder="Títol o contingut de l'acta..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-10 bg-background border-border text-sm w-full"
              />
            </div>
          </div>

            <div className="space-y-2">
              <label htmlFor="actes-tags" className="text-xs font-medium text-muted-foreground">Etiquetes</label>
              <div className="rounded-md bg-background">
            <TagMultiSelect inputId="actes-tags" inputAriaLabel="Etiquetes" selectedIds={selectedTagIds} onChange={setSelectedTagIds} />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="actes-sort" className="text-xs font-medium text-muted-foreground">Ordenar per</label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                <SelectTrigger id="actes-sort" aria-label="Ordenar per" className="h-10 w-full text-sm bg-background">
                  <SelectValue placeholder="Ordenar per..." />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data</SelectItem>
                <SelectItem value="title-asc">Títol (A-Z)</SelectItem>
                <SelectItem value="title-desc">Títol (Z-A)</SelectItem>
                <SelectItem value="status">Estat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border">
          Cap acta de reunió. Crea la primera!
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, entries]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {formatGroupDate(date)}
              </h3>
              <div className="space-y-2">
                {entries.map(entry => <ActaCard key={entry.id} entry={entry} onDuplicate={handleDuplicate} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
