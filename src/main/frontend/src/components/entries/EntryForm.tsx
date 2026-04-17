import { useState } from "react"
import type { Entry, EntryType, EntryStatus, CreateEntryRequest, UpdateEntryRequest } from "@/types"
import { useCreateEntry, useUpdateEntry, useDeleteEntry } from "@/hooks/useEntries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { toast } from "sonner"
import { Trash2 } from "lucide-react"

interface EntryFormProps {
  entry?: Entry
  initialType?: EntryType
  initialTitle?: string
  onSuccess: () => void
}

export function EntryForm({ entry, initialType, initialTitle, onSuccess }: EntryFormProps) {
  const isEditing = !!entry
  const [type, setType] = useState<EntryType>(entry?.type || initialType || "TASK")
  const [title, setTitle] = useState(entry?.title || initialTitle || "")
  const [body, setBody] = useState(entry?.body || "")
  const [status, setStatus] = useState<EntryStatus>(entry?.status || "OPEN")
  const [date, setDate] = useState(entry?.date || new Date().toISOString().split('T')[0])
  const [tagsStr, setTagsStr] = useState(entry?.tags?.join(", ") || "")
  const [externalRef, setExternalRef] = useState(entry?.external_ref || "")
  const [pinned, setPinned] = useState(entry?.pinned || false)

  const createMut = useCreateEntry()
  const updateMut = useUpdateEntry()
  const deleteMut = useDeleteEntry()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    const tags = tagsStr.split(",").map(t => t.trim()).filter(Boolean)

    try {
      if (isEditing) {
        const payload: UpdateEntryRequest = { type, title, body, status, date, tags, externalRef, pinned }
        await updateMut.mutateAsync({ id: entry.id, body: payload })
        toast.success("Actualitzat")
      } else {
        const payload: CreateEntryRequest = { type, title, body, date, tags, externalRef }
        await createMut.mutateAsync(payload)
        toast.success("Creat")
      }
      onSuccess()
    } catch (error) {
      toast.error("Error al guardar")
    }
  }

  const handleDelete = async () => {
    if (!entry) return
    if (confirm("Segur que vols esborrar?")) {
      try {
        await deleteMut.mutateAsync(entry.id)
        toast.success("Esborrat")
        onSuccess()
      } catch (err) {
        toast.error("Error al esborrar")
      }
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="py-4 border-b border-border">
        <h2 className="text-lg font-semibold">{isEditing ? "Editar Entrada" : "Nova Entrada"}</h2>
      </div>
      <form id="entry-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Títol</label>
          <Input required value={title} onChange={e => setTitle(e.target.value)} className="bg-background border-border text-foreground" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Tipus</label>
            <Select value={type} onValueChange={(val: EntryType) => setType(val)}>
              <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="TASK">Tasca</SelectItem>
                <SelectItem value="NOTE">Nota</SelectItem>
                <SelectItem value="MEETING_NOTE">Reunió</SelectItem>
                <SelectItem value="REMINDER">Recordatori</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Estat</label>
            <Select value={status} onValueChange={(val: EntryStatus) => setStatus(val)}>
              <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Obert</SelectItem>
                <SelectItem value="IN_PROGRESS">En Curs</SelectItem>
                <SelectItem value="DONE">Fet</SelectItem>
                <SelectItem value="CANCELLED">Cancel·lat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Data</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="bg-background border-border text-foreground" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Ref Externa</label>
            <Input value={externalRef} onChange={e => setExternalRef(e.target.value)} className="bg-background border-border text-foreground" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* We do not have Switch initialized by shadcn maybe? Wait, components.json has "toggle". Not switch. Let's fallback to checkbox if Switch doesn't exist. Actually, let's just use input type="checkbox". */}
          <input type="checkbox" id="pinned" checked={pinned} onChange={e => setPinned(e.target.checked)} className="w-4 h-4 rounded border-border" />
          <label htmlFor="pinned" className="text-sm font-medium text-muted-foreground">Fixada</label>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Etiquetes (separades per coma)</label>
          <Input value={tagsStr} onChange={e => setTagsStr(e.target.value)} className="bg-background border-border text-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Cos / Detalls</label>
          <Textarea 
            value={body} 
            onChange={e => setBody(e.target.value)} 
            className="min-h-[150px] bg-background border-border text-foreground resize-y" 
          />
        </div>
      </form>

      <div className="py-4 border-t border-border flex items-center justify-between">
        {isEditing ? (
          <Button type="button" variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 size={16} />
          </Button>
        ) : <div />}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>Cancel·lar</Button>
          <Button type="submit" form="entry-form" className="bg-accent hover:bg-accent/90 text-white">Guardar</Button>
        </div>
      </div>
    </div>
  )
}
