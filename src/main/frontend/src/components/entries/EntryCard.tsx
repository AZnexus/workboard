import type { Entry, EntryStatus } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pin, Circle, Loader, CircleCheck, XCircle, CheckSquare, FileText, Users, Bell, Play, Pause, Check, X, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EntryForm } from "./EntryForm"
import { useState } from "react"
import { useUpdateEntry } from "@/hooks/useEntries"
import { toast } from "sonner"

const STATUS_CONFIG = {
  OPEN: { label: "Nou", icon: Circle, bgClass: "bg-blue-500/15", textClass: "text-blue-600 dark:text-blue-400", borderClass: "border-blue-500/30" },
  IN_PROGRESS: { label: "En Curs", icon: Loader, bgClass: "bg-green-500/15", textClass: "text-green-600 dark:text-green-400", borderClass: "border-green-500/30" },
  PAUSED: { label: "Pausada", icon: Pause, bgClass: "bg-amber-500/15", textClass: "text-amber-600 dark:text-amber-400", borderClass: "border-amber-500/30" },
  DONE: { label: "Fet", icon: CircleCheck, bgClass: "bg-green-500/15", textClass: "text-green-600 dark:text-green-400", borderClass: "border-green-500/30" },
  CANCELLED: { label: "Cancel·lat", icon: XCircle, bgClass: "bg-stone-500/15", textClass: "text-stone-500 dark:text-stone-400", borderClass: "border-stone-500/30" },
} as const

const TYPE_CONFIG = {
  TASK: { color: "border-blue-500", icon: CheckSquare, label: "Tasca" },
  NOTE: { color: "border-stone-400", icon: FileText, label: "Nota" },
  MEETING_NOTE: { color: "border-violet-500", icon: Users, label: "Reunió" },
  REMINDER: { color: "border-amber-500", icon: Bell, label: "Recordatori" },
} as const

const PRIORITY_CONFIG: Record<number, { label: string; bgClass: string; textClass: string; borderClass: string }> = {
  1: { label: "P1 — Immediata", bgClass: "bg-red-500/15", textClass: "text-red-600 dark:text-red-400", borderClass: "border-red-500/30" },
  2: { label: "P2 — Urgent", bgClass: "bg-orange-500/15", textClass: "text-orange-600 dark:text-orange-400", borderClass: "border-orange-500/30" },
  3: { label: "P3 — Alta", bgClass: "bg-yellow-500/15", textClass: "text-yellow-600 dark:text-yellow-400", borderClass: "border-yellow-500/30" },
  4: { label: "P4 — Normal", bgClass: "bg-blue-400/15", textClass: "text-blue-600 dark:text-blue-400", borderClass: "border-blue-400/30" },
  5: { label: "P5 — Baixa", bgClass: "bg-stone-400/15", textClass: "text-stone-500 dark:text-stone-400", borderClass: "border-stone-400/30" },
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
    if (newStatus === 'CANCELLED') {
      toast.error("Cancel·lada")
    }
  }

  const togglePin = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    updateEntry.mutate({ id: entry.id, body: { pinned: !entry.pinned } })
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Card className={cn(
          "group cursor-pointer bg-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden",
          typeConfig.color
        )}>
          <div className="flex h-full">
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
                  
                  {(entry.tags.length > 0 || entry.external_ref) && (
                    <>
                      {entry.external_ref && (
                        <Badge variant="outline" className="font-mono text-muted-foreground">
                          {entry.external_ref}
                        </Badge>
                      )}
                      {entry.tags.map((tag) => (
                        <Badge
                          key={tag.id ?? tag.name}
                          variant="secondary"
                          className="uppercase tracking-wider"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </>
                  )}
                </div>
                
                <h3 className={cn(
                  "text-sm font-medium leading-tight text-foreground break-words [word-break:break-word]",
                  entry.status === "DONE" && "line-through text-muted-foreground"
                )}>
                  {entry.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-full border border-border shadow-sm bg-background", entry.pinned ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted")} onClick={togglePin}>
                        <Pin size={13} className={cn(entry.pinned && "fill-primary")} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{entry.pinned ? "Desfixar" : "Fixar"}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {entry.type === "TASK" && columnContext !== "yesterday" && (
                  <div className="flex items-center bg-background border border-border shadow-sm rounded-full p-0.5 gap-0.5">
                    {columnContext === "backlog" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-500/10" onClick={e => { e.stopPropagation(); e.preventDefault(); updateEntry.mutate({ id: entry.id, body: { dueDate: new Date().toISOString().split('T')[0] } }) }}>
                              <ClipboardList size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Planificar</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                {columnContext === "today" && entry.type === "TASK" && entry.status === 'OPEN' && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-green-600 hover:text-green-700 hover:bg-green-500/10" onClick={e => changeStatus(e, 'IN_PROGRESS')}>
                          <Play size={13} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Començar</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {columnContext === "today" && entry.type === "TASK" && (entry.status === 'IN_PROGRESS' || entry.status === 'PAUSED') && (
                  <>
                    {entry.status === 'IN_PROGRESS' ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-amber-600 hover:text-amber-700 hover:bg-amber-500/10" onClick={e => changeStatus(e, 'PAUSED')}>
                              <Pause size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Pausar</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-green-600 hover:text-green-700 hover:bg-green-500/10" onClick={e => changeStatus(e, 'IN_PROGRESS')}>
                              <Play size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reprendre</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-green-600 hover:text-green-700 hover:bg-green-500/10" onClick={e => changeStatus(e, 'DONE')}>
                            <Check size={13} strokeWidth={3} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Finalitzar</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                )}
                {columnContext === "today" && entry.type === "TASK" && (entry.status === 'OPEN' || entry.status === 'IN_PROGRESS' || entry.status === 'PAUSED') && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={e => changeStatus(e, 'CANCELLED')}>
                          <X size={13} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Cancel·lar tasca</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {columnContext === "default" && entry.type === "TASK" && (
                  <>
                    {entry.status === 'OPEN' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-green-600 hover:text-green-700 hover:bg-green-500/10" onClick={e => changeStatus(e, 'IN_PROGRESS')}>
                              <Play size={13} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Començar</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {(entry.status === 'IN_PROGRESS' || entry.status === 'PAUSED') && (
                      <>
                        {entry.status === 'IN_PROGRESS' ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-amber-600 hover:text-amber-700 hover:bg-amber-500/10" onClick={e => changeStatus(e, 'PAUSED')}>
                                  <Pause size={13} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Pausar</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-green-600 hover:text-green-700 hover:bg-green-500/10" onClick={e => changeStatus(e, 'IN_PROGRESS')}>
                                  <Play size={13} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reprendre</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-green-600 hover:text-green-700 hover:bg-green-500/10" onClick={e => changeStatus(e, 'DONE')}>
                                <Check size={13} strokeWidth={3} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Finalitzar</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                    {(entry.status === 'OPEN' || entry.status === 'IN_PROGRESS' || entry.status === 'PAUSED') && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={e => changeStatus(e, 'CANCELLED')}>
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
