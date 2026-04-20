import { useState } from "react"
import { useDaily } from "@/hooks/useDashboard"
import { useTimeLogs } from "@/hooks/useTimeLogs"
import { useUpdateEntry } from "@/hooks/useEntries"
import { QuickCapture } from "@/components/entries/QuickCapture"
import { EntryCard } from "@/components/entries/EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckSquare, Clock, AlertTriangle, History, MessageCircle } from "lucide-react"
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

export function DailyView() {
  const { data: dailyData, isLoading } = useDaily()
  const { data: timeLogsData } = useTimeLogs({ date: new Date().toISOString().split('T')[0] })
  const updateEntry = useUpdateEntry()
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null)
  const [comments, setComments] = useState(() => localStorage.getItem("daily-comments") || "")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const handleCommentsChange = (value: string) => {
    setComments(value)
    localStorage.setItem("daily-comments", value)
  }

  if (isLoading) {
    return <div className="space-y-6 p-6"><Skeleton className="h-12" /><Skeleton className="h-32" /></div>
  }

  const dashboard = dailyData
  const todayTasks = (dashboard?.entries || [])
    .filter(e => e.type === 'TASK' && (e.status === 'OPEN' || e.status === 'IN_PROGRESS'))
    .sort((a, b) => {
      const pa = a.priority ?? 99
      const pb = b.priority ?? 99
      return pa - pb
    })
  const todayDone = (dashboard?.entries || []).filter(e => e.type === 'TASK' && e.status === 'DONE')
  const yesterdayDone = dashboard?.yesterday_done || []
  const backlog = dashboard?.backlog || []
  const timeLogs = timeLogsData || []
  const today = new Date().toISOString().split('T')[0]

  const handleDragStart = (event: DragStartEvent) => {
    setActiveEntry(event.active.data.current?.entry || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveEntry(null)
    const { active, over } = event
    if (!over || over.id !== "today-column") return

    const entry = active.data.current?.entry as Entry | undefined
    if (!entry) return

    if (entry.date !== today) {
      updateEntry.mutate({ id: entry.id, body: { date: today } })
    }
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full gap-4">
        <QuickCapture />

        <div className="flex-1 grid grid-cols-[1fr_3fr_1fr] gap-4 min-h-0">

          <div className="flex flex-col min-h-0">
            <SectionHeader icon={MessageCircle} title="Coses a comentar" />
            <textarea
              value={comments}
              onChange={e => handleCommentsChange(e.target.value)}
              placeholder="Apunta aquí el que vols comentar..."
              className="flex-1 w-full resize-none rounded-[8px] border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
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
                {timeLogs.map((log: TimeLog) => (
                  <div key={log.id} className="px-3 py-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate">{log.project}</span>
                      <span className="font-medium text-foreground whitespace-nowrap ml-2">{log.hours}h</span>
                    </div>
                    {log.description && (
                      <p className="text-muted-foreground truncate mt-0.5">{log.description}</p>
                    )}
                  </div>
                ))}
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
