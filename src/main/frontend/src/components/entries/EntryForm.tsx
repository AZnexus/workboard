import { useState } from "react"
import type { Entry, EntryType, EntryStatus, CreateEntryRequest, UpdateEntryRequest } from "@/types"
import { useCreateEntry, useUpdateEntry, useDeleteEntry } from "@/hooks/useEntries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagMultiSelect } from "./TagMultiSelect"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Trash2, Pin } from "lucide-react"

interface EntryFormProps {
  entry?: Entry
  initialType?: EntryType
  initialTitle?: string
  fixedType?: boolean
  onSuccess: () => void
}

export function EntryForm({ entry, initialType, initialTitle, fixedType, onSuccess }: EntryFormProps) {
  const isEditing = !!entry
  const [type, setType] = useState<EntryType>(entry?.type || initialType || "TASK")
  const [title, setTitle] = useState(entry?.title || initialTitle || "")
  const defaultBody = !isEditing && (initialType === "MEETING_NOTE") ? "## Punts tractats\n\n- \n\n## Acords\n\n- \n\n## Accions\n\n- [ ] " : ""
  const [body, setBody] = useState(entry?.body || defaultBody)
  const [status, setStatus] = useState<EntryStatus>(entry?.status || "OPEN")
  const [date, setDate] = useState(entry?.date || new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(entry?.due_date || "")
  const [tagsIds, setTagsIds] = useState<number[]>(entry?.tags?.map(t => t.id).filter((id): id is number => id != null) || [])
  const [externalRef, setExternalRef] = useState(entry?.external_ref || "")
  const [pinned, setPinned] = useState(entry?.pinned || false)
  const [priority, setPriority] = useState<number | null>(entry?.priority ?? 4)

  const createMut = useCreateEntry()
  const updateMut = useUpdateEntry()
  const deleteMut = useDeleteEntry()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      if (isEditing) {
        const payload: UpdateEntryRequest = { type, title, body, status, date, dueDate: type === 'TASK' ? (dueDate || null) : null, tagIds: tagsIds, externalRef, pinned, priority: type === 'TASK' && priority != null ? priority : undefined }
        await updateMut.mutateAsync({ id: entry.id, body: payload })
        toast.info("Actualitzat", { duration: 2500 })
      } else {
        const payload: CreateEntryRequest = { type, title, body, date, dueDate: type === 'TASK' ? (dueDate || null) : null, tagIds: tagsIds, externalRef, priority: type === 'TASK' && priority != null ? priority : undefined }
        await createMut.mutateAsync(payload)
        toast.success("Creat", { duration: 2500 })
      }
      onSuccess()
    } catch (error) {
      toast.error("Error al guardar", { duration: 3000 })
    }
  }

  const handleDelete = async () => {
    if (!entry) return
    try {
      await deleteMut.mutateAsync(entry.id)
      toast.error("Esborrat", { duration: 2500 })
      onSuccess()
    } catch (err) {
      toast.error("Error al esborrar", { duration: 3000 })
    }
  }

  return (
    <div className="flex flex-col h-full px-6">
      <div className="py-5 border-b border-border">
        <h2 className="text-lg font-semibold">{isEditing ? "Editar Entrada" : "Nova Entrada"}</h2>
      </div>
      <form id="entry-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 px-1 -mx-1 space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Títol</label>
          <Input required value={title} onChange={e => setTitle(e.target.value)} className="bg-background border-border text-foreground" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {!fixedType && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Tipus</label>
              <Select value={type} onValueChange={(val: EntryType) => setType(val)}>
                <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TASK">Tasca</SelectItem>
                  <SelectItem value="NOTE">Nota</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {isEditing && type !== "MEETING_NOTE" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Estat</label>
              <Select value={status} onValueChange={(val: EntryStatus) => setStatus(val)}>
                <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Nou</SelectItem>
                  <SelectItem value="IN_PROGRESS">En Curs</SelectItem>
                  <SelectItem value="PAUSED">Pausada</SelectItem>
                  <SelectItem value="DONE">Fet</SelectItem>
                  <SelectItem value="CANCELLED">Cancel·lat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {isEditing && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Data de creació</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} disabled className="bg-background border-border text-foreground" />
            </div>
          )}
          {type !== "MEETING_NOTE" && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Ref Externa</label>
              <Input value={externalRef} onChange={e => setExternalRef(e.target.value)} className="bg-background border-border text-foreground" />
            </div>
          )}
        </div>

        {type === "TASK" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Data planificada</label>
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-background border-border text-foreground" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Prioritat</label>
              <Select value={priority != null ? String(priority) : "4"} onValueChange={val => setPriority(Number(val))}>
                <SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">P1 — Immediata</SelectItem>
                  <SelectItem value="2">P2 — Urgent</SelectItem>
                  <SelectItem value="3">P3 — Alta</SelectItem>
                  <SelectItem value="4">P4 — Normal</SelectItem>
                  <SelectItem value="5">P5 — Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant={pinned ? "default" : "outline"}
            size="sm"
            className="h-8 gap-2"
            onClick={() => setPinned(!pinned)}
          >
            <Pin size={14} className={cn(pinned ? "fill-primary-foreground" : "")} />
            {pinned ? "Fixada" : "Fixar"}
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Etiquetes</label>
          <TagMultiSelect selectedIds={tagsIds} onChange={setTagsIds} />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            {type === "MEETING_NOTE" ? "Acta (Markdown)" : "Cos / Detalls"}
          </label>
          <Textarea 
            value={body} 
            onChange={e => setBody(e.target.value)} 
            placeholder={type === "MEETING_NOTE" ? "" : ""}
            className={cn(
              "bg-background border-border text-foreground resize-y break-words [word-break:break-word]",
              type === "MEETING_NOTE" ? "min-h-[60vh] font-mono text-sm" : "min-h-[150px]"
            )}
          />
        </div>
      </form>

      <div className="py-5 border-t border-border flex items-center justify-between">
        {isEditing ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="icon">
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar</AlertDialogTitle>
                <AlertDialogDescription>Segur que vols esborrar?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Esborrar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : <div />}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>Cancel·lar</Button>
          <Button type="submit" form="entry-form" className="">Guardar</Button>
        </div>
      </div>
    </div>
  )
}
