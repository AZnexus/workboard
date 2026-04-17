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

export function EntryCard({ entry }: { entry: Entry }) {
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
            <CardContent className="flex-1 p-[12px] flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border",
                      config.bgClass, config.textClass, config.borderClass
                    )}
                  >
                    <config.icon size={12} className={cn(entry.status === 'IN_PROGRESS' && "animate-spin")} />
                    {config.label}
                  </span>
                  
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <typeConfig.icon size={12} />
                    {typeConfig.label}
                  </span>
                  
                  {entry.pinned && <Pin size={12} className="text-primary fill-primary/20" />}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Intl.DateTimeFormat("ca-ES", { dateStyle: "short", timeStyle: "short" }).format(new Date(entry.updated_at))}
                </span>
              </div>
              
              <h3 className={cn("text-sm font-medium leading-tight text-foreground", entry.status === "DONE" && "line-through text-muted-foreground")}>
                {entry.title}
              </h3>

              {(entry.tags.length > 0 || entry.external_ref) && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.external_ref && (
                    <Badge variant="outline" className="rounded-[6px] bg-muted/50 text-xs font-mono px-1.5 py-0 border-border text-muted-foreground">
                      {entry.external_ref}
                    </Badge>
                  )}
                  {entry.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-[6px] text-[10px] px-1.5 py-0 font-normal">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {(entry.status === 'OPEN' || entry.status === 'IN_PROGRESS') && (
                <div className="flex items-center gap-1.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {entry.status === 'OPEN' && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10" onClick={e => changeStatus(e, 'IN_PROGRESS')}>
                      <Play size={11} /> Començar
                    </Button>
                  )}
                  {entry.status === 'IN_PROGRESS' && (
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-green-600 hover:text-green-700 hover:bg-green-500/10" onClick={e => changeStatus(e, 'DONE')}>
                      <Square size={11} /> Finalitzar
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1 text-stone-500 hover:text-stone-600 hover:bg-stone-500/10" onClick={e => changeStatus(e, 'CANCELLED')}>
                    <X size={11} /> Cancel·lar
                  </Button>
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