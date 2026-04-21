import { useState } from "react"
import { useDaily } from "@/hooks/useDashboard"
import { useTimeLogs } from "@/hooks/useTimeLogs"
import { useUpdateEntry } from "@/hooks/useEntries"
import { QuickCapture } from "@/components/entries/QuickCapture"
import { EntryCard } from "@/components/entries/EntryCard"
import { EntryForm } from "@/components/entries/EntryForm"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckSquare, Clock, AlertTriangle, History, Bell, X, Plus } from "lucide-react"
import type { Entry, TimeLog } from "@/types"
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

function SectionHeader({ icon: Icon, title, count, extra }: {
  icon: React.ElementType
  title: string
  count?: number
  extra?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <Icon size={14} className="text-muted-foreground" />
      <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">{count}</span>
      )}
      <div className="flex-1 h-px bg-border" />
      {extra}
    </div>
  )
}

function DraggableEntry({ entry }: { entry: Entry }) {
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
      <EntryCard entry={entry} hideType columnContext="backlog" />
    </div>
  )
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[60px] rounded-[8px] transition-colors ${isOver ? "bg-primary/5 ring-2 ring-primary/20" : ""}`}
    >
      {children}
    </div>
  )
}

const PROJECT_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-pink-500",
  "bg-cyan-500",
]

export function DailyView() {
  const { data: dailyData, isLoading } = useDaily()
  const { data: timeLogsData } = useTimeLogs({ date: new Date().toISOString().split('T')[0] })
  const updateEntry = useUpdateEntry()
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  if (isLoading) {
    return <div className="space-y-6 p-6"><Skeleton className="h-12" /><Skeleton className="h-32" /></div>
  }

  const dashboard = dailyData
  const today = new Date().toISOString().split('T')[0]
  const todayTasks = (dashboard?.entries || [])
    .filter(e => {
      if (e.type === 'TASK') {
        return e.due_date === today && (e.status === 'OPEN' || e.status === 'IN_PROGRESS')
      }
      return false
    })
    .sort((a, b) => {
      const pa = a.priority ?? 99
      const pb = b.priority ?? 99
      return pa - pb
    })
  const todayDone = (dashboard?.entries || []).filter(e => e.type === 'TASK' && e.status === 'DONE')
  const yesterdayDone = dashboard?.yesterday_done || []
  const backlog = dashboard?.backlog || []
  const reminders = dashboard?.reminders || []
  const timeLogs = timeLogsData || []

  const dismissReminder = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    e.preventDefault()
    updateEntry.mutate({ id, body: { status: 'DONE' as const } })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveEntry(event.active.data.current?.entry || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveEntry(null)
    const { active, over } = event
    if (!over || over.id !== "today-column") return

    const entry = active.data.current?.entry as Entry | undefined
    if (!entry) return

    if (entry.type === 'TASK') {
      if (entry.due_date !== today) {
        updateEntry.mutate({ id: entry.id, body: { dueDate: today } })
      }
    } else {
      if (entry.date !== today) {
        updateEntry.mutate({ id: entry.id, body: { date: today } })
      }
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/50 border-l-4 border-l-amber-400 p-3 rounded-r-[8px]">
            <div className="flex items-center gap-1.5 mb-2 text-amber-600 dark:text-amber-500 font-semibold text-xs tracking-wider uppercase">
              <span className="text-base leading-none">⚡</span>
              <span>Captura Ràpida</span>
            </div>
            <QuickCapture />
          </div>
          <Button variant="outline" className="w-full justify-start text-muted-foreground gap-2" onClick={() => setDialogOpen(true)}>
            <Plus size={16} /> Nova Entrada
          </Button>
        </div>

        <Button
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="!h-6 !w-6" />
          <span className="sr-only">Nova Entrada</span>
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogTitle className="sr-only">Nova Entrada</DialogTitle>
            <EntryForm
              initialType="TASK"
              onSuccess={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <div className="flex-1 grid grid-cols-[1fr_3fr_1fr] gap-4 min-h-0">

          <div className="flex flex-col min-h-0 overflow-y-auto">
            <SectionHeader icon={Bell} title="Recordatoris" count={reminders.length} />
            {reminders.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs border border-dashed border-border rounded-[8px]">
                Cap recordatori actiu
              </div>
            ) : (
              <div className="space-y-1.5">
                {reminders.map(r => (
                  <div key={r.id} className="flex items-center gap-2 rounded-[8px] border border-border bg-card px-3 py-2 text-sm text-foreground">
                    <span className="flex-1 truncate">{r.title}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" onClick={e => dismissReminder(e, r.id)}>
                      <X size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 min-h-0">
            <div className="flex flex-col min-h-0 overflow-y-auto">
              <SectionHeader icon={History} title="Ahir" count={yesterdayDone.length} />
              {yesterdayDone.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs border border-dashed border-border rounded-[8px]">
                  Res completat
                </div>
              ) : (
                <div className="space-y-1.5">
                  {yesterdayDone.map(entry => <EntryCard key={entry.id} entry={entry} hideType columnContext="yesterday" />)}
                </div>
              )}
            </div>

            <div className="flex flex-col min-h-0 overflow-y-auto">
              <SectionHeader icon={CheckSquare} title="Avui" count={todayTasks.length} />
              <DroppableColumn id="today-column">
                {todayTasks.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-xs border border-dashed border-border rounded-[8px]">
                    Arrossega tasques aquí ↑
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {todayTasks.map(entry => <EntryCard key={entry.id} entry={entry} hideType columnContext="today" />)}
                  </div>
                )}
                {todayDone.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Fetes</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                    {todayDone.map(entry => <EntryCard key={entry.id} entry={entry} hideType columnContext="today" />)}
                  </div>
                )}
              </DroppableColumn>
            </div>

            <div className="flex flex-col min-h-0 overflow-y-auto">
              <SectionHeader icon={AlertTriangle} title="Pendent" count={backlog.length} />
              {backlog.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs border border-dashed border-border rounded-[8px]">
                  Tot al dia! 🎉
                </div>
              ) : (
                <div className="space-y-1.5">
                  {backlog.map(entry => <DraggableEntry key={entry.id} entry={entry} />)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col min-h-0">
            <SectionHeader
              icon={Clock}
              title="Temps"
              extra={
                dashboard?.total_hours !== undefined && dashboard.total_hours > 0
                  ? <span className="text-[11px] font-medium text-primary">{dashboard.total_hours}h</span>
                  : undefined
              }
            />
            {timeLogs.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs border border-dashed border-border rounded-[8px]">
                Cap hora avui
              </div>
            ) : (
              <div className="bg-card border border-border rounded-[8px] divide-y divide-border overflow-y-auto">
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
                          <span className="text-[10px] text-muted-foreground w-7 text-right">{percentage}%</span>
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
        </div>
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
