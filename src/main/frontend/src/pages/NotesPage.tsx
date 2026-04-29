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
import type { UpdateEntryRequest } from "@/types"
import { PageHeader } from "@/components/layout/PageHeader"

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
      <PageHeader 
        icon={FileText} 
        title="Notes" 
        description="Apunts ràpids, idees i referències que no necessiten una data de venciment."
      >
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            aria-pressed={!showArchived}
            variant={!showArchived ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowArchived(false)}
            className="flex-1 sm:flex-none"
          >
            Actives
          </Button>
          <Button 
            aria-pressed={showArchived}
            variant={showArchived ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowArchived(true)}
            className="flex-1 sm:flex-none"
          >
            Arxivades
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          </div>
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
                                const body = { type: "TASK", status: "OPEN" } satisfies UpdateEntryRequest
                                updateEntry.mutate({ id: entry.id, body }, {
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
                            onClick={() => {
                              const body = { status: showArchived ? "OPEN" : "DONE" } satisfies UpdateEntryRequest
                              updateEntry.mutate({ id: entry.id, body })
                            }}
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
