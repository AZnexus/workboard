import type { Entry } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { EntryForm } from "./EntryForm"
import { useState } from "react"

const STATUS_CONFIG = {
  OPEN: { variant: "outline" as const, label: "Obert", classes: "text-muted-foreground border-border" },
  IN_PROGRESS: { variant: "default" as const, label: "En Curs", classes: "bg-primary hover:bg-primary/90" },
  DONE: { variant: "default" as const, label: "Fet", classes: "bg-[#16a34a] hover:bg-[#16a34a]/90 text-white" },
  CANCELLED: { variant: "secondary" as const, label: "Cancel·lat", classes: "line-through text-muted-foreground" },
}

export function EntryCard({ entry }: { entry: Entry }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const config = STATUS_CONFIG[entry.status]

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetTrigger asChild>
        <Card className="group cursor-pointer rounded-[8px] border-border bg-card shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-[12px] flex flex-col gap-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={config.variant} className={cn("rounded-[6px] text-xs font-medium px-2 py-0.5", config.classes)}>
                  {config.label}
                </Badge>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{entry.type}</span>
                {entry.pinned && <Pin size={12} className="text-primary" />}
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
                  <Badge variant="outline" className="rounded-[6px] bg-muted/50 text-xs font-mono px-1 py-0 border-border text-muted-foreground">
                    {entry.external_ref}
                  </Badge>
                )}
                {entry.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-[6px] text-[10px] px-1 py-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetTitle className="sr-only">Editar Entrada</SheetTitle>
        <EntryForm entry={entry} onSuccess={() => setSheetOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
