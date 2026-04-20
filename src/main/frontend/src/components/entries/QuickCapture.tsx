import { useState, useRef, useEffect } from "react"
import { Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCreateEntry } from "@/hooks/useEntries"
import type { EntryType } from "@/types"
import { toast } from "sonner"
import { EntryForm } from "./EntryForm"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

export function QuickCapture() {
  const [type, setType] = useState<EntryType>("TASK")
  const [title, setTitle] = useState("")
  const [sheetOpen, setSheetOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const createEntry = useCreateEntry()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await createEntry.mutateAsync({
        title: title.trim(),
        type,
      })
      toast.success("Afegit correctament")
      setTitle("")
      inputRef.current?.focus()
    } catch (error) {
      toast.error("Error a l'afegir")
    }
  }

  return (
    <div className="flex h-[48px] w-full items-center gap-2 rounded-[8px] border border-border bg-card p-1 shadow-sm">
      <Select value={type} onValueChange={(val: EntryType) => setType(val)}>
        <SelectTrigger className="w-[120px] border-0 bg-transparent shadow-none focus:ring-0">
          <SelectValue placeholder="Tipus" />
        </SelectTrigger>
        <SelectContent side="bottom">
          <SelectItem value="TASK">Tasca</SelectItem>
          <SelectItem value="NOTE">Nota</SelectItem>
          <SelectItem value="MEETING_NOTE">Reunió</SelectItem>
          <SelectItem value="REMINDER">Recordatori</SelectItem>
        </SelectContent>
      </Select>

      <div className="h-6 w-px bg-border shrink-0" />

      <form onSubmit={handleSubmit} className="flex-1 flex items-center h-full">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Escriu i prem Enter..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-full w-full border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
        />
      </form>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground">
            <Plus size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetTitle className="sr-only">Nova Entrada</SheetTitle>
          <EntryForm 
            initialType={type} 
            initialTitle={title} 
            onSuccess={() => {
              setSheetOpen(false)
              setTitle("")
            }} 
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
