import type { Entry, EntryStatus } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pin, Circle, Loader, CircleCheck, XCircle, CheckSquare, FileText, Users, Bell, Play, Square, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
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

interface EntryCardProps {
  entry: Entry
  hideType?: boolean
}

export function EntryCard({ entry, hideType }: EntryCardProps) {
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
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-stone-500 hover:text-stone-600 hover:bg-stone-500/10" onClick={e => changeStatus(e, 'CANCELLED')}>
                    <X size={13} />
                  </Button>
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
