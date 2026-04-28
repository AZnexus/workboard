import { useState } from "react"
import { useEntries, useUpdateEntry } from "@/hooks/useEntries"
import { EntryCard } from "@/components/entries/EntryCard"
import { EntrySubsection } from "@/components/entries/EntrySubsection"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { FileText, Archive, Inbox, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { buildEntrySubsections } from "@/lib/entry-sections"
import { formatGroupDate, groupByDate } from "@/lib/date-utils"
import type { EntryType, EntryStatus } from "@/types"

export function NotesPage() {
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
  
  const subsections = buildEntrySubsections(filteredEntries)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-muted-foreground" />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Notes</h1>
        </div>
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
{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 rounded-md" />)}
        </div>
      ) : filteredEntries.length === 0 ? (
<div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-md">
          {showArchived ? "Cap nota arxivada." : "Cap nota activa. Crea la primera!"}
        </div>
      ) : (
        <div className="space-y-6">
          {subsections.map(section => {
            const dateGroups = groupByDate(section.entries)
            return (
              <EntrySubsection
                key={section.key}
                title={section.title}
                count={section.count}
                tone={section.key}
              >
                <div className="space-y-4">
                  {dateGroups.map(([date, items]) => (
                    <div key={date} className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground border-b border-border pb-1">
                        {formatGroupDate(date)}
                      </h4>
                      {items.map(entry => (
                        <div key={entry.id} className="flex items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <EntryCard entry={entry} columnContext="yesterday" hideType sectionTone={section.key} />
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
                  ))}
                </div>
              </EntrySubsection>
            )
          })}
        </div>
      )}
    </div>
  )
}
