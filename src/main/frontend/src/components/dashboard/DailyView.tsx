import { useState } from "react"
import { useDaily } from "@/hooks/useDashboard"
import { useTimeLogs } from "@/hooks/useTimeLogs"
import { useUpdateEntry } from "@/hooks/useEntries"
import { QuickCapture } from "@/components/entries/QuickCapture"
import { PinnedEntries } from "./PinnedEntries"
import { EntryCard } from "@/components/entries/EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckSquare, Clock, ChevronDown, ChevronUp, AlertTriangle, History, FileText } from "lucide-react"
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
      <EntryCard entry={entry} hideType />
    </div>
  )
}

function DroppableColumn({ id, children, isOver }: { id: string; children: React.ReactNode; isOver?: boolean }) {
  const { setNodeRef, isOver: droppableIsOver } = useDroppable({ id })
  const active = isOver ?? droppableIsOver

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] rounded-[8px] transition-colors ${active ? "bg-primary/5 ring-2 ring-primary/20" : ""}`}
    >
      {children}
    </div>
  )
}

export function DailyView() {
  const { data: dailyData, isLoading } = useDaily()
  const { data: timeLogsData } = useTimeLogs({ date: new Date().toISOString().split('T')[0] })
  const updateEntry = useUpdateEntry()
  const [backlogOpen, setBacklogOpen] = useState(true)
  const [activeEntry, setActiveEntry] = useState<Entry | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

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
      <div className="space-y-5">
        <QuickCapture />

        {dashboard?.pinned && dashboard.pinned.length > 0 && (
          <PinnedEntries entries={dashboard.pinned} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr_1fr] gap-4">
          <div>
            <SectionHeader icon={History} title="Ahir" count={yesterdayDone.length} />
            {yesterdayDone.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-[8px]">
                Res completat
              </div>
            ) : (
              <div className="space-y-2">
                {yesterdayDone.map(entry => <EntryCard key={entry.id} entry={entry} hideType />)}
              </div>
            )}
          </div>

          <div>
            <SectionHeader icon={CheckSquare} title="Avui" count={todayTasks.length} />
            <DroppableColumn id="today-column">
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-[8px]">
                  Arrossega tasques aquí o crea'n una ↑
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map(entry => <EntryCard key={entry.id} entry={entry} hideType />)}
                </div>
              )}
              {todayDone.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">Completades</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  {todayDone.map(entry => <EntryCard key={entry.id} entry={entry} hideType />)}
                </div>
              )}
            </DroppableColumn>
          </div>

          <div>
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
            {backlogOpen && (
              backlog.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-[8px]">
                  Tot al dia! 🎉
                </div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {backlog.map(entry => <DraggableEntry key={entry.id} entry={entry} />)}
                </div>
              )
            )}
          </div>
        </div>

        {todayNotes.length > 0 && (
          <div>
            <SectionHeader icon={FileText} title="Notes i Reunions" count={todayNotes.length} />
            <div className="grid grid-cols-1 gap-2">
              {todayNotes.map(entry => <EntryCard key={entry.id} entry={entry} />)}
            </div>
          </div>
        )}

        <div className="pb-8">
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

      <DragOverlay>
        {activeEntry && (
          <div className="opacity-90 rotate-2 scale-105">
            <EntryCard entry={activeEntry} hideType />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
