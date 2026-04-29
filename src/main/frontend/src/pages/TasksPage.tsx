import { useState } from "react"
import { useEntries } from "@/hooks/useEntries"
import { EntryCard } from "@/components/entries/EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { CheckSquare } from "lucide-react"
import { EntrySubsection } from "@/components/entries/EntrySubsection"
import { buildEntrySubsections } from "@/lib/entry-sections"
import { formatGroupDate, groupByDate } from "@/lib/date-utils"
import { PageHeader } from "@/components/layout/PageHeader"

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
  
  const sections = buildEntrySubsections(filteredEntries)

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={CheckSquare} 
        title="Tasques" 
        description="Gestiona les teves tasques pendents i completades."
      >
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            aria-pressed={!showClosed}
            variant={!showClosed ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowClosed(false)}
            className="flex-1 sm:flex-none"
          >
            Actives
          </Button>
          <Button 
            aria-pressed={showClosed}
            variant={showClosed ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowClosed(true)}
            className="flex-1 sm:flex-none"
          >
            Tancades
          </Button>
        </div>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          </div>
        </div>
      ) : filteredEntries.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-md">
          {showClosed ? "Cap tasca tancada." : "Cap tasca activa. Crea la primera!"}
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => {
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
                      {items.map((entry) => (
                        <EntryCard
                          key={entry.id}
                          entry={entry}
                          columnContext="default"
                          sectionTone={section.key}
                        />
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
