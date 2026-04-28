import { useState } from "react"
import { useUpdateEntry } from "@/hooks/useEntries"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { X } from "lucide-react"
import type { Entry } from "@/types"

export function ReminderItem({ reminder }: { reminder: Entry }) {
  const updateEntry = useUpdateEntry()
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState(reminder.title)

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    updateEntry.mutate({ id: reminder.id, body: { status: 'DONE' as const } })
  }

  const handleSave = () => {
    if (!text.trim() || text === reminder.title) {
      setIsOpen(false)
      return
    }
    updateEntry.mutate(
      { id: reminder.id, body: { title: text } },
      {
        onSuccess: () => setIsOpen(false),
      }
    )
  }

  return (
    <>
      <div 
        onClick={() => {
          setText(reminder.title)
          setIsOpen(true)
        }}
        className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground cursor-pointer hover:bg-surface-2 transition-colors"
      >
        <span className="flex-1 truncate">{reminder.title}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-data-negative hover:bg-data-negative/10" 
          onClick={handleDismiss}
        >
          <X size={14} />
        </Button>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Edita el recordatori</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Textarea 
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Escriu el recordatori..."
              disabled={updateEntry.isPending}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={updateEntry.isPending}>
              Cancel·lar
            </Button>
            <Button variant="default" onClick={handleSave} disabled={updateEntry.isPending || !text.trim()}>
              {updateEntry.isPending ? 'Desant...' : 'Desar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
