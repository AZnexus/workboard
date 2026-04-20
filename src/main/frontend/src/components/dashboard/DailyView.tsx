import { useState } from "react"
import { useDaily } from "@/hooks/useDashboard"
import { useTimeLogs } from "@/hooks/useTimeLogs"
import { QuickCapture } from "@/components/entries/QuickCapture"
import { PinnedEntries } from "./PinnedEntries"
import { EntryCard } from "@/components/entries/EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckSquare, Clock, ChevronDown, ChevronUp, AlertTriangle, History } from "lucide-react"
import type { Entry, TimeLog } from "@/types"

function SectionHeader({ icon: Icon, title, count, extra }: {
  icon: React.ElementType
  title: string
  count?: number
  extra?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-muted-foreground" />
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">{count}</span>
      )}
      <div className="flex-1 h-px bg-border" />
      {extra}
    </div>
  )
}

function EntryColumn({ entries, emptyMessage }: { entries: Entry[]; emptyMessage: string }) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-[8px]">
        {emptyMessage}
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 gap-2">
      {entries.map(entry => <EntryCard key={entry.id} entry={entry} hideType />)}
    </div>
  )
}

export function DailyView() {
  const { data: dailyData, isLoading } = useDaily()
  const { data: timeLogsData } = useTimeLogs({ date: new Date().toISOString().split('T')[0] })
  const [backlogOpen, setBacklogOpen] = useState(true)

  if (isLoading) {
    return <div className="space-y-6"><Skeleton className="h-12" /><Skeleton className="h-32" /></div>
  }

  const dashboard = dailyData
  const todayTasks = (dashboard?.entries || []).filter(e => e.type === 'TASK' && (e.status === 'OPEN' || e.status === 'IN_PROGRESS'))
  const todayDone = (dashboard?.entries || []).filter(e => e.type === 'TASK' && e.status === 'DONE')
  const todayNotes = (dashboard?.entries || []).filter(e => e.type !== 'TASK')
  const yesterdayDone = dashboard?.yesterday_done || []
  const backlog = dashboard?.backlog || []
  const timeLogs = timeLogsData || []

  return (
    <div className="space-y-5">
      <QuickCapture />

      {dashboard?.pinned && dashboard.pinned.length > 0 && (
        <PinnedEntries entries={dashboard.pinned} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="space-y-2">
          <SectionHeader icon={History} title="Ahir" count={yesterdayDone.length} />
          <EntryColumn entries={yesterdayDone} emptyMessage="Res completat ahir" />
        </div>

        <div className="space-y-2">
          <SectionHeader icon={CheckSquare} title="Avui" count={todayTasks.length} />
          <EntryColumn entries={todayTasks} emptyMessage="Cap tasca per avui" />
          {todayDone.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Completades</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <EntryColumn entries={todayDone} emptyMessage="" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <SectionHeader
            icon={AlertTriangle}
            title="Pendent"
            count={backlog.length}
            extra={
              backlog.length > 0 ? (
                <button onClick={() => setBacklogOpen(!backlogOpen)} className="text-muted-foreground hover:text-foreground">
                  {backlogOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              ) : undefined
            }
          />
          {backlogOpen && <EntryColumn entries={backlog} emptyMessage="Tot al dia! 🎉" />}
        </div>
      </div>

      {todayNotes.length > 0 && (
        <div className="space-y-2">
          <SectionHeader icon={CheckSquare} title="Notes i Reunions" count={todayNotes.length} />
          <div className="grid grid-cols-1 gap-2">
            {todayNotes.map(entry => <EntryCard key={entry.id} entry={entry} />)}
          </div>
        </div>
      )}

      <div className="space-y-2 pb-8">
        <SectionHeader
          icon={Clock}
          title="Temps Registrat"
          extra={
            dashboard?.total_hours !== undefined && dashboard.total_hours > 0
              ? <span className="text-xs font-medium text-primary">Total: {dashboard.total_hours}h</span>
              : undefined
          }
        />
        {timeLogs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-[8px]">
            Cap hora registrada avui
          </div>
        ) : (
          <div className="bg-card border border-border rounded-[8px] divide-y divide-border overflow-hidden">
            {timeLogs.map((log: TimeLog) => (
              <div key={log.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{log.project}</span>
                  {log.task_code && <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{log.task_code}</span>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-xs truncate max-w-[200px] sm:max-w-[400px]">{log.description}</span>
                  <span className="font-medium text-foreground whitespace-nowrap">{log.hours}h</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
