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
import { PRIORITY_CONFIG } from "@/lib/priorities"
import {
  getEntryEditableTypeOptions,
  getEntryFormStatusOptions,
  getEntryFormTitle,
} from "@/config/entry-taxonomy"
import {
  ENTRY_FORM_CONFIRM_DELETE_TEXT,
  ENTRY_FORM_FIELD_LABELS,
  ENTRY_FORM_SAVE_TOASTS,
  ENTRY_FORM_TEXT,
} from "@/config/entry-text"
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
  const [scheduledToday, setScheduledToday] = useState(entry?.scheduled_today || false)
  const [tagsIds, setTagsIds] = useState<number[]>(entry?.tags?.map(t => t.id).filter((id): id is number => id != null) || [])
  const [externalRef, setExternalRef] = useState(entry?.external_ref || "")
  const [pinned, setPinned] = useState(entry?.pinned || false)
  const [priority, setPriority] = useState<number | null>(entry?.priority ?? 4)
  const editableTypeOptions = getEntryEditableTypeOptions(type)
  const statusOptions = getEntryFormStatusOptions(type)
  const fieldBlockClassName = "space-y-2"
  const fieldLabelClassName = "text-xs font-medium text-muted-foreground"
  const backgroundSurfaceClassName = "bg-background"
  const twoColumnGridClassName = "grid grid-cols-2 gap-4"
  const textareaBaseClassName = "resize-y break-words [word-break:break-word] flex-1 bg-background"
  const meetingNoteTextareaClassName = "min-h-[60vh] font-mono text-sm"
  const defaultTextareaClassName = "min-h-[120px]"

  const createMut = useCreateEntry()
  const updateMut = useUpdateEntry()
  const deleteMut = useDeleteEntry()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      if (isEditing) {
        const payload: UpdateEntryRequest = { type, title, body, status, date, dueDate: type === 'TASK' ? (dueDate || null) : null, scheduledToday: type === 'TASK' ? scheduledToday : undefined, tagIds: tagsIds, externalRef, pinned, priority: type === 'TASK' && priority != null ? priority : undefined }
        await updateMut.mutateAsync({ id: entry.id, body: payload })
        toast.info(ENTRY_FORM_SAVE_TOASTS.updated, { duration: 2500 })
      } else {
        const payload: CreateEntryRequest = { type, title, body, date, dueDate: type === 'TASK' ? (dueDate || null) : null, scheduledToday: type === 'TASK' ? scheduledToday : undefined, tagIds: tagsIds, externalRef, priority: type === 'TASK' && priority != null ? priority : undefined }
        await createMut.mutateAsync(payload)
        toast.success(ENTRY_FORM_SAVE_TOASTS.created, { duration: 2500 })
      }
      onSuccess()
    } catch {
      toast.error(ENTRY_FORM_SAVE_TOASTS.saveError, { duration: 3000 })
    }
  }

  const handleDelete = async () => {
    if (!entry) return
    try {
      await deleteMut.mutateAsync(entry.id)
      toast.error(ENTRY_FORM_SAVE_TOASTS.deleted, { duration: 2500 })
      onSuccess()
    } catch {
      toast.error(ENTRY_FORM_SAVE_TOASTS.deleteError, { duration: 3000 })
    }
  }

  return (
    <div className="flex flex-col h-full px-6">
      <div className="py-5 border-b border-border">
        <h2 className="text-lg font-semibold">{getEntryFormTitle(type, isEditing, fixedType)}</h2>
      </div>
      <form id="entry-form" onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto py-4 px-1 -mx-1 space-y-4">
        <div className={fieldBlockClassName}>
          <label className={fieldLabelClassName}>{ENTRY_FORM_FIELD_LABELS.title}</label>
          <Input required value={title} onChange={e => setTitle(e.target.value)} className={backgroundSurfaceClassName} />
        </div>
        
        {type === "TASK" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start gap-4">
              <div className="w-full max-w-[220px] space-y-2">
                <label className={fieldLabelClassName}>{ENTRY_FORM_FIELD_LABELS.plannedDate}</label>
                <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={backgroundSurfaceClassName} />
              </div>
              <div className="w-full min-w-[180px] flex-1 space-y-2">
                <label className={fieldLabelClassName}>{ENTRY_FORM_FIELD_LABELS.priority}</label>
                <Select value={priority != null ? String(priority) : "4"} onValueChange={val => setPriority(Number(val))}>
                  <SelectTrigger className={backgroundSurfaceClassName}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <span className={cn("w-2 h-2 rounded-full", config.dotClass)} />
                          {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="scheduledToday"
                checked={scheduledToday}
                onChange={(e) => setScheduledToday(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="scheduledToday" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {ENTRY_FORM_FIELD_LABELS.scheduledToday}
              </label>
            </div>
          </div>
        )}

        <div className={twoColumnGridClassName}>
          {!fixedType && editableTypeOptions.length > 0 && (
            <div className={fieldBlockClassName}>
              <label className={fieldLabelClassName}>{ENTRY_FORM_FIELD_LABELS.type}</label>
              <Select value={type} onValueChange={(val: EntryType) => setType(val)}>
                <SelectTrigger className={backgroundSurfaceClassName}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {editableTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {isEditing && type !== "MEETING_NOTE" && (
            <div className={fieldBlockClassName}>
              <label className={fieldLabelClassName}>{ENTRY_FORM_FIELD_LABELS.status}</label>
              <Select value={status} onValueChange={(val: EntryStatus) => setStatus(val)}>
                <SelectTrigger className={backgroundSurfaceClassName}><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className={twoColumnGridClassName}>
          {isEditing && (
            <div className={fieldBlockClassName}>
              <label className={fieldLabelClassName}>{ENTRY_FORM_FIELD_LABELS.createdAt}</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} disabled className={backgroundSurfaceClassName} />
            </div>
          )}
          {type !== "MEETING_NOTE" && (
            <div className={fieldBlockClassName}>
              <label className={fieldLabelClassName}>{ENTRY_FORM_FIELD_LABELS.externalRef}</label>
              <div className="flex items-center gap-2">
                <Input value={externalRef} onChange={e => setExternalRef(e.target.value)} className={backgroundSurfaceClassName} />
                <Button
                  type="button"
                  variant={pinned ? "default" : "outline"}
                  size="sm"
                  className={cn("h-9 gap-1.5 shrink-0", pinned ? "" : "bg-background")}
                  onClick={() => setPinned(!pinned)}
                >
                  <Pin size={14} className={cn(pinned ? "fill-primary-foreground" : "")} />
                  {pinned ? ENTRY_FORM_TEXT.pinActive : ENTRY_FORM_TEXT.pinInactive}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className={fieldBlockClassName}>
          <label className={fieldLabelClassName}>{ENTRY_FORM_FIELD_LABELS.tags}</label>
          <div className="bg-background rounded-md"><TagMultiSelect selectedIds={tagsIds} onChange={setTagsIds} /></div>
        </div>

        <div className={cn("flex flex-col flex-1", fieldBlockClassName, "min-h-[160px] pb-4")}>
          <label className={fieldLabelClassName}>
            {type === "MEETING_NOTE" ? ENTRY_FORM_FIELD_LABELS.meetingNoteBody : ENTRY_FORM_FIELD_LABELS.body}
          </label>
          <Textarea 
            value={body} 
            onChange={e => setBody(e.target.value)} 
            placeholder={type === "MEETING_NOTE" ? "" : ENTRY_FORM_TEXT.bodyPlaceholder}
            className={cn(
              textareaBaseClassName,
              type === "MEETING_NOTE" ? meetingNoteTextareaClassName : defaultTextareaClassName
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
                <AlertDialogTitle>{ENTRY_FORM_CONFIRM_DELETE_TEXT.title}</AlertDialogTitle>
                <AlertDialogDescription>{ENTRY_FORM_CONFIRM_DELETE_TEXT.description}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{ENTRY_FORM_CONFIRM_DELETE_TEXT.cancel}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {ENTRY_FORM_CONFIRM_DELETE_TEXT.confirm}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : <div />}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>{ENTRY_FORM_TEXT.cancelAction}</Button>
          <Button type="submit" form="entry-form" className="">{ENTRY_FORM_TEXT.saveAction}</Button>
        </div>
      </div>
    </div>
  )
}
