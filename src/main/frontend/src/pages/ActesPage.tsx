import { useState, useMemo } from "react"
import { useEntries } from "@/hooks/useEntries"
import { useTags } from "@/hooks/useTags"
import { TagMultiSelect } from "@/components/entries/TagMultiSelect"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Pin, Circle, Loader, CircleCheck, XCircle, Search, CheckSquare } from "lucide-react"
import { groupByDate, formatGroupDate } from "@/lib/date-utils"
import type { Entry } from "@/types"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"

const STATUS_CONFIG = {
  OPEN: { label: "Obert", icon: Circle, bgClass: "bg-blue-500/15", textClass: "text-blue-500 dark:text-blue-400", borderClass: "border-blue-500/30" },
  IN_PROGRESS: { label: "En Curs", icon: Loader, bgClass: "bg-amber-500/15", textClass: "text-amber-600 dark:text-amber-400", borderClass: "border-amber-500/30" },
  PAUSED: { label: "Pausat", icon: Circle, bgClass: "bg-amber-500/15", textClass: "text-amber-600 dark:text-amber-400", borderClass: "border-amber-500/30" },
  DONE: { label: "Fet", icon: CircleCheck, bgClass: "bg-green-500/15", textClass: "text-green-600 dark:text-green-400", borderClass: "border-green-500/30" },
  CANCELLED: { label: "Cancel·lat", icon: XCircle, bgClass: "bg-stone-500/15", textClass: "text-stone-500 dark:text-stone-400", borderClass: "border-stone-500/30" },
} as const

function ActaCard({ entry }: { entry: Entry }) {
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
      onClick={() => navigate(`/actes/${entry.id}/edit`)}
      className="group cursor-pointer rounded-[8px] border-2 border-violet-500 bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="flex h-full">
        <CardContent className="flex-1 px-3 py-2.5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-px text-[11px] font-medium border",
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
                      className="rounded-[6px] text-[10px] px-1.5 py-0 font-normal border"
                      style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color + "40" }}
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
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {formatGroupDate(entry.date)}
            </span>
            {actionStats && actionStats.total > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-[4px]">
                <CheckSquare size={10} />
                {actionStats.completed}/{actionStats.total}
              </span>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export function ActesPage() {
  const [search, setSearch] = useState("")
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  
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

  const entries = data?.data || []
  const grouped = groupByDate(entries)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Actes de Reunió</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cerca actes..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 bg-background"
          />
        </div>
        <div className="w-[200px]">
          <TagMultiSelect selectedIds={selectedTagIds} onChange={setSelectedTagIds} />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-[8px]" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-[8px]">
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
                {entries.map(entry => <ActaCard key={entry.id} entry={entry} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
