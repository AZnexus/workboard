import { useState } from "react"
import { useEntries } from "@/hooks/useEntries"
import { EntryCard } from "@/components/entries/EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { CheckSquare } from "lucide-react"
import type { Entry } from "@/types"

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

export function TasksPage() {
  const [showClosed, setShowClosed] = useState(false)

  const { data, isLoading } = useEntries({
    type: "TASK",
    size: 100,
  })

  const entries = data?.data || []
  
  const filteredEntries = entries.filter(entry => {
    const isClosed = entry.status === "DONE" || entry.status === "CANCELLED"
    return showClosed ? isClosed : !isClosed
  })
  
  const grouped = groupByDate(filteredEntries)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare size={20} className="text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tasques</h1>
        </div>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button 
          variant={!showClosed ? "secondary" : "outline"} 
          size="sm" 
          onClick={() => setShowClosed(false)}
        >
          Actives
        </Button>
        <Button 
          variant={showClosed ? "secondary" : "outline"} 
          size="sm" 
          onClick={() => setShowClosed(true)}
        >
          Tancades
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-[8px]" />)}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-[8px]">
          {showClosed ? "Cap tasca tancada." : "Cap tasca activa. Crea la primera!"}
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, groupEntries]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {formatGroupDate(date)}
              </h3>
              <div className="space-y-2">
                {groupEntries.map(entry => (
                  <div key={entry.id} className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <EntryCard entry={entry} columnContext="default" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
