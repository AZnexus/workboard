import type { Entry, EntryStatus } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pin, Play, Pause, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EntryForm } from "./EntryForm"
import { useState } from "react"
import { useUpdateEntry } from "@/hooks/useEntries"
import { toast } from "sonner"

import { PRIORITY_CONFIG } from "@/lib/priorities"
import { ENTRY_TYPE_CONFIG } from "@/config/entry-taxonomy"
import { CalendarIcon } from "lucide-react"
import { EntryStatusBadge, type EntryStatusVariant } from "./entry-status"

export type ColumnContext = "yesterday" | "today" | "backlog" | "default"

interface EntryCardProps {
  entry: Entry
  hideType?: boolean
  columnContext?: ColumnContext
  sectionTone?: "fixed" | "regular"
  statusVariant?: EntryStatusVariant
}

function getDueDateConfig(dueDateStr: string | null | undefined) {
  if (!dueDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const parts = dueDateStr.split('-');
  const shortDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : dueDateStr;

  if (diffDays < 0) return { label: shortDate, bgClass: "bg-data-negative/15", textClass: "text-data-negative", borderClass: "border-data-negative/30" };
  if (diffDays <= 2) return { label: shortDate, bgClass: "bg-data-warning/15", textClass: "text-data-warning", borderClass: "border-data-warning/30" };
  return { label: shortDate, bgClass: "bg-data-positive/15", textClass: "text-data-positive", borderClass: "border-data-positive/30" };
}

export function EntryCard({ entry, hideType, columnContext = "default", sectionTone = "regular", statusVariant = "default" }: EntryCardProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const updateEntry = useUpdateEntry()
  const typeConfig = ENTRY_TYPE_CONFIG[entry.type]
  const dueDateConfig = getDueDateConfig(entry.due_date)
  const isBacklogCompact = columnContext === "backlog"
  const tagsSummary = entry.tags.length > 0
    ? entry.tags.length === 1
      ? entry.tags[0].name
      : `${entry.tags[0].name} +${entry.tags.length - 1}`
    : null
  const versionText = entry.version ? (entry.version.active ? entry.version.name : `${entry.version.name} (arxivada)`) : null
  const versionBadgeStyle = entry.version?.color
    ? {
        color: entry.version.color,
        borderColor: entry.version.color,
        backgroundColor: `color-mix(in srgb, var(--background) 88%, ${entry.version.color})`,
      }
    : undefined
  const hasBacklogMeta = Boolean(
    (entry.type === "TASK" && dueDateConfig) ||
    !hideType ||
    entry.external_ref ||
    tagsSummary ||
    versionText
  )

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

  const moveTaskToToday = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    updateEntry.mutate({ id: entry.id, body: { scheduledToday: true } })
  }

  const moveTaskToBacklog = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    updateEntry.mutate({ id: entry.id, body: { scheduledToday: false } })
  }

  const isDailyColumn = columnContext === "today" || columnContext === "backlog"
  const canMoveTaskToBacklog =
    columnContext === "today" &&
    entry.type === "TASK" &&
    (entry.status === "OPEN" || entry.status === "IN_PROGRESS" || entry.status === "PAUSED")
  const showTodayStatusActions =
    columnContext === "today" &&
    entry.type === "TASK" &&
    (entry.status === "OPEN" || entry.status === "IN_PROGRESS" || entry.status === "PAUSED")
  const showTaskActions = entry.type === "TASK" && columnContext !== "yesterday"

  const pinButton = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              isDailyColumn
                ? "h-6 w-6 rounded-full"
                : "h-7 w-7 rounded-full border border-border shadow-sm bg-background",
              entry.pinned
                ? "text-accent-primary hover:bg-accent-primary/10"
                : "text-data-neutral hover:text-accent-primary hover:bg-muted"
            )}
            onClick={togglePin}
          >
            <Pin size={isDailyColumn ? 12 : 13} className={cn(entry.pinned && "fill-accent-primary")} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{entry.pinned ? "Desfixar" : "Fixar"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  const movementAction =
    entry.type === "TASK" && columnContext === "backlog" ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-accent-primary"
              onClick={moveTaskToToday}
            >
              ← Avui
            </Button>
          </TooltipTrigger>
          <TooltipContent>Planificar</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : canMoveTaskToBacklog ? (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className="h-7 px-2 text-xs font-medium text-muted-foreground hover:text-accent-primary"
              onClick={moveTaskToBacklog}
            >
              Pendent →
            </Button>
          </TooltipTrigger>
          <TooltipContent>Moure a pendents</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ) : null

  const todayStatusActions = (
    <>
      {columnContext === "today" && entry.type === "TASK" && entry.status === "OPEN" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-data-positive hover:text-data-positive hover:bg-data-positive/10" onClick={e => changeStatus(e, "IN_PROGRESS")}>
                <Play size={13} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Començar</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {columnContext === "today" && entry.type === "TASK" && (entry.status === "IN_PROGRESS" || entry.status === "PAUSED") && (
        <>
          {entry.status === "IN_PROGRESS" ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-data-warning hover:text-data-warning hover:bg-data-warning/10" onClick={e => changeStatus(e, "PAUSED")}>
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-data-positive hover:text-data-positive hover:bg-data-positive/10" onClick={e => changeStatus(e, "IN_PROGRESS")}>
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
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-data-positive hover:text-data-positive hover:bg-data-positive/10" onClick={e => changeStatus(e, "DONE")}>
                  <Check size={13} strokeWidth={3} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Finalitzar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
      {columnContext === "today" && entry.type === "TASK" && (entry.status === "OPEN" || entry.status === "IN_PROGRESS" || entry.status === "PAUSED") && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-data-negative hover:text-data-negative hover:bg-data-negative/10" onClick={e => changeStatus(e, "CANCELLED")}>
                <X size={13} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancel·lar tasca</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  )

  const defaultStatusActions = (
    <>
      {columnContext === "default" && entry.type === "TASK" && entry.status === "OPEN" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-data-positive hover:text-data-positive hover:bg-data-positive/10" onClick={e => changeStatus(e, "IN_PROGRESS")}>
                <Play size={13} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Començar</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      {columnContext === "default" && entry.type === "TASK" && (entry.status === "IN_PROGRESS" || entry.status === "PAUSED") && (
        <>
          {entry.status === "IN_PROGRESS" ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-data-warning hover:text-data-warning hover:bg-data-warning/10" onClick={e => changeStatus(e, "PAUSED")}>
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-data-positive hover:text-data-positive hover:bg-data-positive/10" onClick={e => changeStatus(e, "IN_PROGRESS")}>
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
                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-data-positive hover:text-data-positive hover:bg-data-positive/10" onClick={e => changeStatus(e, "DONE")}>
                  <Check size={13} strokeWidth={3} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Finalitzar</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}
      {columnContext === "default" && entry.type === "TASK" && (entry.status === "OPEN" || entry.status === "IN_PROGRESS" || entry.status === "PAUSED") && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-data-negative hover:text-data-negative hover:bg-data-negative/10" onClick={e => changeStatus(e, "CANCELLED")}>
                <X size={13} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cancel·lar tasca</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  )

  const showDailyFooter = Boolean(movementAction) || showTodayStatusActions

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Card className={cn(
          "group relative cursor-pointer bg-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden",
          typeConfig.color,
          sectionTone === "fixed" && "bg-accent-primary/5 shadow-md border-accent-primary/20"
        )}>
          {isDailyColumn && (
            <div className="absolute right-2 top-2 z-10">
              {pinButton}
            </div>
          )}
          <div className="flex h-full">
            <CardContent className={cn(
              "flex-1 px-3 py-2.5",
              isDailyColumn && "pr-9",
              isDailyColumn ? "flex flex-col gap-2.5" : "flex items-center gap-3"
            )}>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "mb-0.5",
                  isBacklogCompact
                    ? "flex items-center gap-1.5 flex-nowrap overflow-hidden"
                    : "flex items-center gap-2 flex-wrap"
                )}>
                  <EntryStatusBadge status={entry.status} variant={statusVariant} className="shrink-0" />

                  {entry.priority && PRIORITY_CONFIG[entry.priority] && (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-1.5 py-px text-xs font-bold border shrink-0",
                        PRIORITY_CONFIG[entry.priority].bgClass,
                        PRIORITY_CONFIG[entry.priority].textClass,
                        PRIORITY_CONFIG[entry.priority].borderClass
                      )}
                    >
                      {PRIORITY_CONFIG[entry.priority].label}
                    </span>
                  )}

                  {!isBacklogCompact && (
                    <>
                      {entry.type === "TASK" && dueDateConfig && (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-1.5 py-px text-xs font-bold border",
                            dueDateConfig.bgClass,
                            dueDateConfig.textClass,
                            dueDateConfig.borderClass
                          )}
                        >
                          <CalendarIcon size={11} />
                          {dueDateConfig.label}
                        </span>
                      )}

                      {!hideType && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <typeConfig.icon size={11} className={typeConfig.textColor} />
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
                          {versionText && (
                            <Badge
                              variant="secondary"
                              className="normal-case tracking-normal"
                              style={versionBadgeStyle}
                            >
                              {versionText}
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
                      {!entry.external_ref && entry.tags.length === 0 && versionText && (
                        <Badge
                          variant="secondary"
                          className="normal-case tracking-normal"
                          style={versionBadgeStyle}
                        >
                          {versionText}
                        </Badge>
                      )}
                    </>
                  )}
                </div>

                <h3 className={cn(
                  "text-sm font-medium leading-tight text-foreground break-words [word-break:break-word]",
                  entry.status === "DONE" && "line-through text-muted-foreground"
                )}
                style={isBacklogCompact ? {
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                } : undefined}>
                  {entry.title}
                </h3>

                {isBacklogCompact && hasBacklogMeta && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground/85 flex-nowrap overflow-hidden">
                    {entry.type === "TASK" && dueDateConfig && (
                      <span className="inline-flex items-center gap-1 shrink-0">
                        <CalendarIcon size={11} />
                        {dueDateConfig.label}
                      </span>
                    )}

                    {!hideType && (
                      <span className="inline-flex items-center gap-1 shrink-0">
                        <typeConfig.icon size={11} className={typeConfig.textColor} />
                        {typeConfig.label}
                      </span>
                    )}

                    {entry.external_ref && (
                      <span className="min-w-0 truncate font-mono">
                        {entry.external_ref}
                      </span>
                    )}

                    {tagsSummary && (
                      <span className="min-w-0 truncate">#{tagsSummary}</span>
                    )}

                    {versionText && (
                      <Badge
                        variant="secondary"
                        className="normal-case tracking-normal max-w-[12rem] shrink-0"
                        style={versionBadgeStyle}
                      >
                        {versionText}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {isDailyColumn ? (
                showDailyFooter && (
                  <div className={cn("mt-2 flex items-center border-t border-border/60 pt-2", columnContext === "today" ? "mt-auto justify-between" : "justify-start")}>
                    {columnContext === "today" ? (
                      <>
                        <div className="flex items-center gap-1">{todayStatusActions}</div>
                        <div>{movementAction}</div>
                      </>
                    ) : (
                      <div>{movementAction}</div>
                    )}
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2">
                  {pinButton}

                  {showTaskActions && (
                    <div className="flex items-center bg-background border border-border shadow-sm rounded-full p-0.5 gap-0.5">
                      {defaultStatusActions}
                    </div>
                  )}
                </div>
              )}
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
