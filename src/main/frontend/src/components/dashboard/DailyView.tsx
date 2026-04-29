import { useState } from "react"
import { useDaily } from "@/hooks/useDashboard"
import { useTimeLogs } from "@/hooks/useTimeLogs"
import { useUpdateEntry } from "@/hooks/useEntries"
import { ReminderItem } from "./ReminderItem"
import { EntryCard } from "@/components/entries/EntryCard"
import { buildEntrySubsections } from "@/lib/entry-sections"
import { EntrySubsection } from "@/components/entries/EntrySubsection"
import { CheckSquare, Clock, AlertTriangle, History, Bell, Calendar } from "lucide-react"
import type { Entry, TimeLog } from "@/types"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/layout/PageHeader"
import { PageContentSkeleton } from "@/components/layout/PageContentSkeleton"
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"

function SectionHeader({ icon: Icon, title, count, extra, iconClassName, badgeClassName }: {
  icon: React.ElementType
  title: string
  count?: number
  extra?: React.ReactNode
  iconClassName?: string
  badgeClassName?: string
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon size={14} className={iconClassName || "text-muted-foreground"} />
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className={cn("inline-flex min-w-6 items-center justify-center rounded-full border px-1.5 py-0.5 text-[11px] font-semibold", badgeClassName || "border-border bg-muted text-muted-foreground")}>{count}</span>
      )}
      <div className="flex-1 h-px bg-border" />
      {extra}
    </div>
  )
}

function DraggableEntry({ entry, sectionTone }: { entry: Entry; sectionTone?: "fixed" | "regular" }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `entry-${entry.id}`,
    data: { entry },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={isDragging ? "opacity-30" : ""}
    >
      <EntryCard entry={entry} hideType columnContext={entry.scheduled_today ? "today" : "backlog"} sectionTone={sectionTone} />
    </div>
  )
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
className={`min-h-[60px] rounded-md transition-colors ${isOver ? "bg-primary/5 ring-2 ring-primary/20" : ""}`}
    >
      {children}
    </div>
  )
}

const PROJECT_COLORS = [
  "bg-accent-primary",
  "bg-data-positive",
  "bg-data-info",
  "bg-data-warning",
  "bg-data-negative",
  "bg-data-neutral",
]

export function DailyView() {
  const { data: dailyData, isLoading } = useDaily()
  const { data: timeLogsData } = useTimeLogs({ date: new Date().toISOString().split('T')[0] })
  const updateEntry = useUpdateEntry()
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const dateStr = new Intl.DateTimeFormat("ca-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date())

  const dashboard = dailyData
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = (dashboard?.entries || [])
    .filter(e => {
      if (e.type === 'TASK') {
        return e.scheduled_today && (e.status === 'OPEN' || e.status === 'IN_PROGRESS' || e.status === 'PAUSED')
      }
      return false
    })
  const todayDone = (dashboard?.entries || []).filter(e => e.type === 'TASK' && e.status === 'DONE')
  const yesterdayDone = dashboard?.yesterday_done || []
  const backlog = dashboard?.backlog || []
  const reminders = dashboard?.reminders || []
  const timeLogs = timeLogsData || []

  const handleDragStart = (event: DragStartEvent) => {
    setActiveEntry(event.active.data.current?.entry || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveEntry(null)
    const { active, over } = event
    if (!over || (over.id !== "today-column" && over.id !== "backlog-column")) return

    const entry = active.data.current?.entry as Entry | undefined
    if (!entry) return

    if (entry.type === 'TASK') {
      if (over.id === "today-column" && !entry.scheduled_today) {
        updateEntry.mutate({ id: entry.id, body: { scheduledToday: true } })
      }
      if (over.id === "backlog-column" && entry.scheduled_today) {
        updateEntry.mutate({ id: entry.id, body: { scheduledToday: false } })
      }
    } else {
      if (over.id !== "today-column") return
      if (entry.date !== today) {
        updateEntry.mutate({ id: entry.id, body: { date: today } })
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <PageHeader 
          icon={Calendar} 
          title="El meu dia" 
          date={dateStr} 
          description="Organitza les teves tasques prioritàries i revisa els esdeveniments d'avui."
        />

        {isLoading ? (
          <PageContentSkeleton />
        ) : (
          <div className="grid min-h-0 gap-6 xl:min-h-[calc(100vh-280px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px]">

            {/* Zona primària: Ahir | AVUI (hero) | Pendent */}
            <section className="grid min-h-0 gap-4 grid-cols-1 lg:grid-cols-[0.85fr_1.6fr_1fr]">

            {/* Ahir — quiet */}
            <div className="flex flex-col min-h-0 rounded-2xl border border-border/60 bg-card/50 p-4 overflow-y-auto">
              <SectionHeader icon={History} title="Ahir" count={yesterdayDone.length} iconClassName="text-data-neutral" badgeClassName="border-data-neutral/30 bg-data-neutral/10 text-data-neutral" />
              {yesterdayDone.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground/50">
                  <History size={24} className="text-data-neutral" />
                  <p className="text-xs">Res completat ahir</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {yesterdayDone.map(entry => <EntryCard key={entry.id} entry={entry} hideType columnContext="yesterday" />)}
                </div>
              )}
            </div>

            {/* AVUI — hero panel */}
            <div className="flex flex-col min-h-0 rounded-2xl border border-accent-primary/30 bg-card shadow-lg p-5 overflow-y-auto">
              <SectionHeader icon={CheckSquare} title="Avui" count={todayTasks.length} iconClassName="text-accent-primary" badgeClassName="border-accent-primary/30 bg-accent-primary/10 text-accent-primary" />
              <DroppableColumn id="today-column">
                {todayTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground/50">
                    <CheckSquare size={24} className="text-accent-primary opacity-80" />
                    <p className="text-xs">Arrossega tasques aquí</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {buildEntrySubsections(todayTasks).map(section => (
                      <EntrySubsection key={section.key} title={section.title} count={section.count} tone={section.key}>
                        {section.entries.map(entry => <DraggableEntry key={entry.id} entry={entry} sectionTone={section.key} />)}
                      </EntrySubsection>
                    ))}
                  </div>
                )}
                {todayDone.length > 0 && (
                  <div className="mt-3 pt-3 space-y-1.5 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-data-positive uppercase tracking-wider">Fetes</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    {todayDone.map(entry => <EntryCard key={entry.id} entry={entry} hideType columnContext="today" />)}
                  </div>
                )}
              </DroppableColumn>
            </div>

            {/* Pendent — quiet */}
            <div className="flex flex-col min-h-0 rounded-2xl border border-border/60 bg-card/50 p-4 overflow-y-auto">
              <SectionHeader icon={AlertTriangle} title="Pendent" count={backlog.length} iconClassName="text-data-warning" badgeClassName="border-data-warning/30 bg-data-warning/10 text-data-warning" />
              <DroppableColumn id="backlog-column">
                {backlog.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground/50">
                    <AlertTriangle size={24} className="text-data-warning opacity-80" />
                    <p className="text-xs">Tot al dia!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {buildEntrySubsections(backlog).map(section => (
                      <EntrySubsection key={section.key} title={section.title} count={section.count} tone={section.key}>
                        {section.entries.map(entry => <DraggableEntry key={entry.id} entry={entry} sectionTone={section.key} />)}
                      </EntrySubsection>
                    ))}
                  </div>
                )}
              </DroppableColumn>
            </div>

          </section>

          {/* Rail secundari: Recordatoris + Temps */}
          <aside className="grid min-h-0 gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-1 xl:grid-rows-[0.85fr_1.15fr]">

            {/* Recordatoris */}
            <div className="flex flex-col min-h-0 rounded-2xl border border-border/60 bg-card/35 p-4 overflow-y-auto">
              <SectionHeader icon={Bell} title="Recordatoris" count={reminders.length} iconClassName="text-data-warning" badgeClassName="border-data-warning/30 bg-data-warning/10 text-data-warning" />
              {reminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground/50">
                  <Bell size={24} className="text-data-warning opacity-80" />
                  <p className="text-xs">Cap recordatori actiu</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {reminders.map(r => (
                    <ReminderItem key={r.id} reminder={r} />
                  ))}
                </div>
              )}
            </div>

            {/* Temps */}
            <div className="flex flex-col min-h-0 rounded-2xl border border-border/60 bg-card/35 p-4 overflow-y-auto">
              <SectionHeader
                icon={Clock}
                title="Temps"
                iconClassName="text-data-info"
                extra={
                  dashboard?.total_hours !== undefined && dashboard.total_hours > 0
                    ? <span className="text-xs font-medium text-primary">{dashboard.total_hours}h</span>
                    : undefined
                }
              />
              {timeLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground/50">
                  <Clock size={24} className="text-data-info opacity-80" />
                  <p className="text-xs">Cap hora registrada avui</p>
                </div>
              ) : (
<div className="bg-card border border-border rounded-md divide-y divide-border overflow-y-auto">
                  {timeLogs.map((log: TimeLog, index: number) => {
                    const colorClass = PROJECT_COLORS[index % PROJECT_COLORS.length]
                    const total = dashboard?.total_hours || timeLogs.reduce((acc: number, l: TimeLog) => acc + l.hours, 0)
                    const percentage = total > 0 ? Math.round((log.hours / total) * 100) : 0

                    return (
                      <div key={log.id} className="px-3 py-3 text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-semibold text-sm text-foreground truncate">{log.project}</span>
                          <div className="flex items-baseline gap-1.5 ml-2 shrink-0">
                            <span className="font-semibold text-sm text-foreground">{log.hours}h</span>
                            <span className="text-xs text-muted-foreground w-7 text-right">{percentage}%</span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mb-1.5">
                          <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }} />
                        </div>
                        {log.description && (
                          <p className="text-muted-foreground break-words mt-1 leading-relaxed">{log.description}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </aside>
        </div>
        )}
      </div>

      <DragOverlay>
        {activeEntry && (
          <div className="opacity-90 rotate-2 scale-105">
            <EntryCard entry={activeEntry} hideType columnContext="backlog" />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
