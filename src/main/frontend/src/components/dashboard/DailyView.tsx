import { useDaily } from "@/hooks/useDashboard"
import { QuickCapture } from "@/components/entries/QuickCapture"
import { PinnedEntries } from "./PinnedEntries"
import { EntryCard } from "@/components/entries/EntryCard"
import { Skeleton } from "@/components/ui/skeleton"

export function DailyView() {
  const { data, isLoading } = useDaily()

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-12" /><Skeleton className="h-32" /></div>
  }

  const dashboard = data?.data
  const openEntries = dashboard?.entries?.filter(e => e.status !== "DONE" && e.status !== "CANCELLED") || []
  const doneEntries = dashboard?.entries?.filter(e => e.status === "DONE" || e.status === "CANCELLED") || []

  return (
    <div className="space-y-[24px]">
      <QuickCapture />
      
      {dashboard?.pinned && <PinnedEntries entries={dashboard.pinned} />}

      <div className="space-y-[16px]">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avui</h2>
          {dashboard?.totalHours !== undefined && (
            <span className="text-xs font-medium text-accent">{dashboard.totalHours} h</span>
          )}
        </div>
        
        {openEntries.length === 0 && doneEntries.length === 0 && (
           <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-[8px]">
             Cap tasca avui.
           </div>
        )}

        <div className="space-y-[16px]">
          {openEntries.map(entry => <EntryCard key={entry.id} entry={entry} />)}
          {doneEntries.map(entry => <EntryCard key={entry.id} entry={entry} />)}
        </div>
      </div>
    </div>
  )
}
