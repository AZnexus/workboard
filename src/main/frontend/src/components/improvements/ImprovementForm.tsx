import { useMemo, useState } from "react"

import { toast } from "sonner"

import { TagMultiSelect } from "@/components/entries/TagMultiSelect"
import { IMPROVEMENT_STATUS_OPTIONS } from "@/config/improvement-taxonomy"
import { useCreateImprovement, useUpdateImprovement } from "@/hooks/useImprovements"
import { useVersions } from "@/hooks/useVersions"
import { PRIORITY_CONFIG } from "@/lib/priorities"
import type { CreateImprovementRequest, Improvement, ImprovementStatus, UpdateImprovementRequest } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ImprovementFormProps {
  improvement?: Improvement
  onCancel: () => void
  onSuccess: (id: number) => void
}

export function ImprovementForm({ improvement, onCancel, onSuccess }: ImprovementFormProps) {
  const isEditing = Boolean(improvement)

  const [title, setTitle] = useState(improvement?.title ?? "")
  const [requirements, setRequirements] = useState(improvement?.requirements ?? "")
  const [redmineParentRef, setRedmineParentRef] = useState(improvement?.redmine_parent_ref ?? "")
  const [priority, setPriority] = useState<string>(improvement?.priority != null ? String(improvement.priority) : "none")
  const [dueDate, setDueDate] = useState(improvement?.due_date ?? "")
  const [jiraRef, setJiraRef] = useState(improvement?.jira_ref ?? "")
  const [versionId, setVersionId] = useState<string>(improvement?.version?.id != null ? String(improvement.version.id) : "none")
  const [tagIds, setTagIds] = useState<number[]>(improvement?.tags.map((tag) => tag.id).filter((id): id is number => id != null) ?? [])
  const [soldHours, setSoldHours] = useState<string>(improvement?.sold_hours != null ? String(improvement.sold_hours) : "")
  const [completionPercentage, setCompletionPercentage] = useState<string>(
    improvement?.completion_percentage != null ? String(improvement.completion_percentage) : "0",
  )
  const [status, setStatus] = useState<ImprovementStatus>(improvement?.status ?? "NOVA")
  const [noteContext, setNoteContext] = useState(improvement?.note.context ?? "")
  const [noteRiskDependency, setNoteRiskDependency] = useState(improvement?.note.risk_dependency ?? "")
  const [noteObservations, setNoteObservations] = useState(improvement?.note.observations ?? "")

  const { data: versions = [] } = useVersions()

  const createMut = useCreateImprovement()
  const updateMut = useUpdateImprovement()

  const isSubmitting = createMut.isPending || updateMut.isPending

  const selectableVersions = useMemo(
    () => versions.filter((version) => version.active || version.id === improvement?.version?.id),
    [improvement?.version?.id, versions],
  )

  const toCreatePayload = (): CreateImprovementRequest => ({
    title: title.trim(),
    requirements: requirements.trim() || null,
    redmineParentRef: redmineParentRef.trim() || null,
    priority: priority === "none" ? null : Number(priority),
    dueDate: dueDate || null,
    jiraRef: jiraRef.trim() || null,
    versionId: versionId === "none" ? null : Number(versionId),
    tagIds,
    soldHours: soldHours.trim() === "" ? null : Number(soldHours),
    status,
    completionPercentage: Number(completionPercentage),
    note: {
      context: noteContext.trim(),
      riskDependency: noteRiskDependency.trim(),
      observations: noteObservations.trim(),
    },
  })

  const toUpdatePayload = (): UpdateImprovementRequest => ({
    title: title.trim(),
    requirements: requirements.trim() || null,
    redmineParentRef: redmineParentRef.trim() || null,
    priority: priority === "none" ? null : Number(priority),
    dueDate: dueDate || null,
    jiraRef: jiraRef.trim() || null,
    versionId: versionId === "none" ? null : Number(versionId),
    tagIds,
    soldHours: soldHours.trim() === "" ? null : Number(soldHours),
    status,
    completionPercentage: Number(completionPercentage),
    note: {
      context: noteContext.trim(),
      riskDependency: noteRiskDependency.trim(),
      observations: noteObservations.trim(),
    },
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!title.trim()) {
      return
    }

    try {
      if (isEditing && improvement) {
        const updated = await updateMut.mutateAsync({ id: improvement.id, body: toUpdatePayload() })
        toast.success("Millora actualitzada", { duration: 2500 })
        onSuccess(updated.id)
        return
      }

      const created = await createMut.mutateAsync(toCreatePayload())
      toast.success("Millora creada", { duration: 2500 })
      onSuccess(created.id)
    } catch {
      toast.error("No s'ha pogut guardar la millora", { duration: 3000 })
    }
  }

  return (
    <div className="flex h-full max-w-5xl flex-col">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-semibold text-foreground">{isEditing ? "Editar millora" : "Nova millora"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Defineix la fitxa funcional, context i estat de la millora abans de crear o revisar la valoració.
        </p>
      </div>

      <form id="improvement-form" onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-6">
        <section className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dades principals</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label htmlFor="improvement-title" className="text-xs font-medium text-muted-foreground">
                Títol
              </label>
              <Input
                id="improvement-title"
                aria-label="Títol"
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Millora del flux de valoració"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="improvement-requirements" className="text-xs font-medium text-muted-foreground">
                Requisits
              </label>
              <Textarea
                id="improvement-requirements"
                aria-label="Requisits"
                value={requirements}
                onChange={(event) => setRequirements(event.target.value)}
                className="min-h-28"
                placeholder="Detall funcional, casos d'ús i condicionants."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="improvement-redmine-parent" className="text-xs font-medium text-muted-foreground">
                Redmine pare
              </label>
              <Input
                id="improvement-redmine-parent"
                aria-label="Redmine pare"
                value={redmineParentRef}
                onChange={(event) => setRedmineParentRef(event.target.value)}
                placeholder="RM-101"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="improvement-jira" className="text-xs font-medium text-muted-foreground">
                JIRA
              </label>
              <Input
                id="improvement-jira"
                aria-label="JIRA"
                value={jiraRef}
                onChange={(event) => setJiraRef(event.target.value)}
                placeholder="WB-101"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="improvement-priority" className="text-xs font-medium text-muted-foreground">
                Prioritat
              </label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="improvement-priority" aria-label="Prioritat" className="w-full">
                  <SelectValue placeholder="Selecciona prioritat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sense prioritat</SelectItem>
                  {Object.entries(PRIORITY_CONFIG).map(([value, config]) => (
                    <SelectItem key={value} value={value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="improvement-due-date" className="text-xs font-medium text-muted-foreground">
                Data límit
              </label>
              <Input
                id="improvement-due-date"
                aria-label="Data límit"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="improvement-version" className="text-xs font-medium text-muted-foreground">
                Versió
              </label>
              <Select value={versionId} onValueChange={setVersionId}>
                <SelectTrigger id="improvement-version" aria-label="Versió" className="w-full">
                  <SelectValue placeholder="Sense versió" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sense versió</SelectItem>
                  {selectableVersions.map((version) => (
                    <SelectItem key={version.id} value={String(version.id)}>
                      {version.active ? version.name : `${version.name} (arxivada)`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="improvement-sold-hours" className="text-xs font-medium text-muted-foreground">
                Hores venudes
              </label>
              <Input
                id="improvement-sold-hours"
                aria-label="Hores venudes"
                type="number"
                step="0.25"
                min="0"
                value={soldHours}
                onChange={(event) => setSoldHours(event.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="improvement-completion" className="text-xs font-medium text-muted-foreground">
                Percentatge de completitud
              </label>
              <Input
                id="improvement-completion"
                aria-label="Percentatge de completitud"
                type="number"
                min="0"
                max="100"
                value={completionPercentage}
                onChange={(event) => setCompletionPercentage(event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="improvement-status" className="text-xs font-medium text-muted-foreground">
                Estat
              </label>
              <Select value={status} onValueChange={(value) => setStatus(value as ImprovementStatus)}>
                <SelectTrigger id="improvement-status" aria-label="Estat" className="w-full">
                  <SelectValue placeholder="Estat" />
                </SelectTrigger>
                <SelectContent>
                  {IMPROVEMENT_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Etiquetes</label>
              <div className="rounded-md bg-background">
                <TagMultiSelect selectedIds={tagIds} onChange={setTagIds} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Notes de context</h2>
          <div className="mt-4 grid gap-4">
            <div className="space-y-2">
              <label htmlFor="improvement-note-context" className="text-xs font-medium text-muted-foreground">
                Context
              </label>
              <Textarea
                id="improvement-note-context"
                aria-label="Context"
                value={noteContext}
                onChange={(event) => setNoteContext(event.target.value)}
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="improvement-note-risk" className="text-xs font-medium text-muted-foreground">
                Risc / dependència
              </label>
              <Textarea
                id="improvement-note-risk"
                aria-label="Risc / dependència"
                value={noteRiskDependency}
                onChange={(event) => setNoteRiskDependency(event.target.value)}
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="improvement-note-observations" className="text-xs font-medium text-muted-foreground">
                Observacions
              </label>
              <Textarea
                id="improvement-note-observations"
                aria-label="Observacions"
                value={noteObservations}
                onChange={(event) => setNoteObservations(event.target.value)}
                className="min-h-24"
              />
            </div>
          </div>
        </section>

        <div className="mt-auto flex items-center justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel·lar
          </Button>
          <Button type="submit" form="improvement-form" disabled={isSubmitting}>
            {isEditing ? "Guardar canvis" : "Crear millora"}
          </Button>
        </div>
      </form>
    </div>
  )
}
