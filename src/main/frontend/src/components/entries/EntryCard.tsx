import type { Entry, EntryStatus } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pin, Circle, Loader, CircleCheck, XCircle, CheckSquare, FileText, Users, Bell, Play, Pause, Square, X, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EntryForm } from "./EntryForm"
import { useState } from "react"
import { useUpdateEntry } from "@/hooks/useEntries"

const STATUS_CONFIG = {
  OPEN: { label: "Obert", icon: Circle, bgClass: "bg-blue-500/15", textClass: "text-blue-500 dark:text-blue-400", borderClass: "border-blue-500/30" },
  IN_PROGRESS: { label: "En Curs", icon: Loader, bgClass: "bg-amber-500/15", textClass: "text-amber-600 dark:text-amber-400", borderClass: "border-amber-500/30" },
  DONE: { label: "Fet", icon: CircleCheck, bgClass: "bg-green-500/15", textClass: "text-green-600 dark:text-green-400", borderClass: "border-green-500/30" },
  CANCELLED: { label: "Cancel·lat", icon: XCircle, bgClass: "bg-stone-500/15", textClass: "text-stone-500 dark:text-stone-400", borderClass: "border-stone-500/30" },
} as const

const TYPE_CONFIG = {
  TASK: { color: "bg-blue-500", icon: CheckSquare, label: "Tasca" },
  NOTE: { color: "bg-stone-400", icon: FileText, label: "Nota" },
  MEETING_NOTE: { color: "bg-violet-500", icon: Users, label: "Reunió" },
  REMINDER: { color: "bg-amber-500", icon: Bell, label: "Recordatori" },
} as const

const PRIORITY_CONFIG: Record<number, { label: string; bgClass: string; textClass: string; borderClass: string }> = {
  1: { label: "P1", bgClass: "bg-red-500/15", textClass: "text-red-600 dark:text-red-400", borderClass: "border-red-500/30" },
  2: { label: "P2", bgClass: "bg-orange-500/15", textClass: "text-orange-600 dark:text-orange-400", borderClass: "border-orange-500/30" },
  3: { label: "P3", bgClass: "bg-yellow-500/15", textClass: "text-yellow-600 dark:text-yellow-400", borderClass: "border-yellow-500/30" },
  4: { label: "P4", bgClass: "bg-blue-400/15", textClass: "text-blue-500 dark:text-blue-400", borderClass: "border-blue-400/30" },
  5: { label: "P5", bgClass: "bg-stone-400/15", textClass: "text-stone-500 dark:text-stone-400", borderClass: "border-stone-400/30" },
}

export type ColumnContext = "yesterday" | "today" | "backlog" | "default"

interface EntryCardProps {
  entry: Entry
  hideType?: boolean
  columnContext?: ColumnContext
}

export function EntryCard({ entry, hideType, columnContext = "default" }: EntryCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const updateEntry = useUpdateEntry()
  const config = STATUS_CONFIG[entry.status]
  const typeConfig = TYPE_CONFIG[entry.type]

  const changeStatus = (e: React.MouseEvent, newStatus: EntryStatus) => {
    e.stopPropagation()
    e.preventDefault()
    updateEntry.mutate({ id: entry.id, body: { status: newStatus } })
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Card className="group cursor-pointer rounded-[8px] border-border bg-card shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <div className="flex h-full">
            <div className={cn("w-[3px] shrink-0", typeConfig.color)} />
            <CardContent className="flex-1 px-3 py-2.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-px text-[11px] font-medium border",
                      config.bgClass, config.textClass, config.borderClass
                    )}
                  >
                    <config.icon size={11} className={cn(entry.status === 'IN_PROGRESS' && "animate-spin")} />
                    {config.label}
                  </span>
                  
                  {entry.priority && PRIORITY_CONFIG[entry.priority] && (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-1.5 py-px text-[10px] font-bold border",
                        PRIORITY_CONFIG[entry.priority].bgClass,
                        PRIORITY_CONFIG[entry.priority].textClass,
                        PRIORITY_CONFIG[entry.priority].borderClass
                      )}
                    >
                      {PRIORITY_CONFIG[entry.priority].label}
                    </span>
                  )}

                  {!hideType && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <typeConfig.icon size={11} />
                      {typeConfig.label}
                    </span>
                  )}
                  
                  {entry.pinned && <Pin size={11} className="text-primary fill-primary/20" />}

                  {(entry.tags.length > 0 || entry.external_ref) && (
                    <>
                      {entry.external_ref && (
                        <Badge variant="outline" className="rounded-[6px] bg-muted/50 text-[10px] font-mono px-1.5 py-0 border-border text-muted-foreground">
                          {entry.external_ref}
                        </Badge>
                      )}
                      {entry.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-[6px] text-[10px] px-1.5 py-0 font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </>
                  )}
                </div>
                
                <h3 className={cn("text-sm font-medium leading-tight text-foreground", entry.status === "DONE" && "line-through text-muted-foreground")}>
                  {entry.title}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {columnContext === "backlog" && entry.type === "TASK" && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10" onClick={e => { e.stopPropagation(); e.preventDefault(); updateEntry.mutate({ id: entry.id, body: { date: new Date().toISOString().split('T')[0] } }) }}>
                    <ClipboardList size={11} /> Planificar
                  </Button>
                )}
                {columnContext === "today" && entry.status === 'OPEN' && (
                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10" onClick={e => changeStatus(e, 'IN_PROGRESS')}>
                    <Play size={11} /> Començar
                  </Button>
                )}
                {columnContext === "today" && entry.status === 'IN_PROGRESS' && (
                  <>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-stone-600 hover:text-stone-700 hover:bg-stone-500/10" onClick={e => changeStatus(e, 'OPEN')}>
                      <Pause size={11} /> Pausar
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-500/10" onClick={e => changeStatus(e, 'DONE')}>
                      <Square size={11} /> Finalitzar
                    </Button>
                  </>
                )}
                {columnContext === "today" && (entry.status === 'OPEN' || entry.status === 'IN_PROGRESS') && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={e => changeStatus(e, 'CANCELLED')}>
                          <X size={13} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cancel·lar tasca</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {columnContext === "default" && (
                  <>
                    {entry.status === 'OPEN' && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10" onClick={e => changeStatus(e, 'IN_PROGRESS')}>
                        <Play size={11} /> Començar
                      </Button>
                    )}
                    {entry.status === 'IN_PROGRESS' && (
                      <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-500/10" onClick={e => changeStatus(e, 'DONE')}>
                        <Square size={11} /> Finalitzar
                      </Button>
                    )}
                    {(entry.status === 'OPEN' || entry.status === 'IN_PROGRESS') && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={e => changeStatus(e, 'CANCELLED')}>
                              <X size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Cancel·lar tasca</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetTitle className="sr-only">Editar Entrada</SheetTitle>
        <EntryForm entry={entry} onSuccess={() => setSheetOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
