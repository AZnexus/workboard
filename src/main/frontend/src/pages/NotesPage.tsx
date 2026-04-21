import { useState } from "react"
import { useEntries, useUpdateEntry } from "@/hooks/useEntries"
import { EntryCard } from "@/components/entries/EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { FileText, Plus, Archive, Inbox, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { Entry, EntryType, EntryStatus } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
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

export function NotesPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const updateEntry = useUpdateEntry()

  const { data, isLoading } = useEntries({
    type: "NOTE",
    size: 100,
  })

  const entries = data?.data || []
  
  const filteredEntries = entries.filter(entry => {
    const isArchived = entry.status === "DONE" || entry.status === "CANCELLED"
    return showArchived ? isArchived : !isArchived
  })
  
  const grouped = groupByDate(filteredEntries)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Notes</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
            <Plus size={14} /> Nova Nota
          </Button>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogTitle className="sr-only">Nova Nota</DialogTitle>
            <EntryForm
              initialType="NOTE"
              fixedType
              onSuccess={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex gap-2 mb-4">
        <Button 
          variant={!showArchived ? "secondary" : "outline"} 
          size="sm" 
          onClick={() => setShowArchived(false)}
        >
          Actives
        </Button>
        <Button 
          variant={showArchived ? "secondary" : "outline"} 
          size="sm" 
          onClick={() => setShowArchived(true)}
        >
          Arxivades
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-[8px]" />)}
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-[8px]">
          {showArchived ? "Cap nota arxivada." : "Cap nota activa. Crea la primera!"}
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
                      <EntryCard entry={entry} columnContext="yesterday" hideType />
                    </div>
                    {!showArchived && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                        title="Convertir a Tasca"
                        onClick={() => {
                          updateEntry.mutate({ id: entry.id, body: { type: 'TASK' as EntryType, status: 'OPEN' as EntryStatus } }, {
                            onSuccess: () => toast.success("Convertida a tasca")
                          })
                        }}
                      >
                        <RefreshCw size={14} className="mr-1.5" />
                        Convertir
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="shrink-0"
                      onClick={() => updateEntry.mutate({ id: entry.id, body: { status: showArchived ? 'OPEN' : 'DONE' } })}
                    >
                      {showArchived ? (
                        <><Inbox size={14} className="mr-1.5" /> Activar</>
                      ) : (
                        <><Archive size={14} className="mr-1.5" /> Arxivar</>
                      )}
                    </Button>
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
