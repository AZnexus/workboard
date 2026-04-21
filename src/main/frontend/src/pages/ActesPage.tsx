import { useEntries } from "@/hooks/useEntries"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Pin, Circle, Loader, CircleCheck, XCircle } from "lucide-react"
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

function groupByDate(entries: Entry[]): [string, Entry[]][] {
  const groups: Record<string, Entry[]> = {}
  for (const entry of entries) {
    const key = entry.date
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getTime() === today.getTime()) return "Avui"
  if (date.getTime() === yesterday.getTime()) return "Ahir"
  return date.toLocaleDateString("ca-ES", { weekday: "long", day: "numeric", month: "long" })
}

function ActaCard({ entry }: { entry: Entry }) {
  const navigate = useNavigate()
  const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG.OPEN

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
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export function ActesPage() {
  const navigate = useNavigate()

  const { data, isLoading } = useEntries({
    type: "MEETING_NOTE",
    size: 50,
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
        <Button size="sm" className="gap-1.5" onClick={() => navigate("/actes/new")}>
          <Plus size={14} /> Nova Acta
        </Button>
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
