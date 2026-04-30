import { useState } from "react"
import type { Entry } from "@/types"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { EntryForm } from "./EntryForm"

interface EntryOpenSheetActionProps {
  entry: Entry
  className?: string
}

export function EntryOpenSheetAction({ entry, className }: EntryOpenSheetActionProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className={className}>
          Obrir
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetTitle className="sr-only">Editar Entrada</SheetTitle>
        <EntryForm entry={entry} onSuccess={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
