import { useState } from "react"
import { useEntries } from "@/hooks/useEntries"
import { EntryCard } from "@/components/entries/EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Users, Plus } from "lucide-react"
import type { Entry } from "@/types"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { EntryForm } from "@/components/entries/EntryForm"

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

export function ActesPage() {
  const [sheetOpen, setSheetOpen] = useState(false)

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
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus size={14} /> Nova Acta
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-lg overflow-y-auto">
            <SheetTitle className="sr-only">Nova Acta</SheetTitle>
            <EntryForm
              initialType="MEETING_NOTE"
              onSuccess={() => setSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
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
                {entries.map(entry => <EntryCard key={entry.id} entry={entry} columnContext="yesterday" />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
