import { useState } from "react"
import { useEntries } from "@/hooks/useEntries"
import { EntryCard } from "@/components/entries/EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { MessageSquare, FileText } from "lucide-react"
import { groupByDate, formatGroupDate } from "@/lib/date-utils"

export function MeetingsPage() {
  const [showType, setShowType] = useState<"all" | "NOTE" | "MEETING_NOTE">("all")

  const { data, isLoading } = useEntries({
    type: showType === "all" ? undefined : showType,
    size: 50,
  })

  const entries = data?.data || []
  const filteredEntries = showType === "all"
    ? entries.filter(e => e.type === "NOTE" || e.type === "MEETING_NOTE")
    : entries

  const grouped = groupByDate(filteredEntries)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reunions i Notes</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={showType === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setShowType("all")}
          >
            Totes
          </Button>
          <Button
            variant={showType === "MEETING_NOTE" ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setShowType("MEETING_NOTE")}
          >
            <MessageSquare size={13} /> Reunions
          </Button>
          <Button
            variant={showType === "NOTE" ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setShowType("NOTE")}
          >
            <FileText size={13} /> Notes
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-md" />)}
        </div>
      ) : filteredEntries.length === 0 ? (
<div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-md">
          Cap nota ni reunió trobada
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, entries]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {formatGroupDate(date)}
              </h3>
              <div className="space-y-2">
                {entries.map(entry => <EntryCard key={entry.id} entry={entry} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
