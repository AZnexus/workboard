import { useState, useRef, useEffect } from "react"
import { Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCreateEntry } from "@/hooks/useEntries"
import { toast } from "sonner"
import { EntryForm } from "./EntryForm"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

type QuickType = "REMINDER" | "NOTE"

export function QuickCapture() {
  const [type, setType] = useState<QuickType>("REMINDER")
  const [title, setTitle] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
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
      <Select value={type} onValueChange={(val: string) => setType(val as QuickType)}>
        <SelectTrigger className="w-[140px] border-0 bg-transparent shadow-none focus:ring-0">
          <SelectValue placeholder="Tipus" />
        </SelectTrigger>
        <SelectContent side="bottom">
          <SelectItem value="REMINDER">Recordatori</SelectItem>
          <SelectItem value="NOTE">Nota ràpida</SelectItem>
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

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 h-10 w-10 text-muted-foreground hover:text-foreground"
        onClick={() => setDialogOpen(true)}
        title="Nova tasca"
      >
        <Plus size={20} />
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogTitle className="sr-only">Nova Tasca</DialogTitle>
          <EntryForm
            initialType="TASK"
            onSuccess={() => {
              setDialogOpen(false)
              setTitle("")
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
