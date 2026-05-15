import { useEffect, useState } from "react"
import { Archive, ArchiveRestore, Check, Copy, Edit2, Plus, Star, Trash2, X } from "lucide-react"
import { toast } from "sonner"

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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useCreateValuationTemplate,
  useDeleteValuationTemplate,
  useUpdateValuationTemplate,
  useValuationTemplates,
} from "@/hooks/useImprovements"
import type { ValuationTemplate } from "@/types"

import { ValuationTemplateForm } from "./ValuationTemplateForm"

function getTemplateErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.includes("still used by valuations")) {
    return "No es pot esborrar: la plantilla encara està en ús"
  }

  if (error instanceof Error && error.message.includes("already exists")) {
    return "Error al guardar (la plantilla ja existeix)"
  }

  if (error instanceof Error && error.message.includes("Default valuation template cannot be inactive")) {
    return "La plantilla predeterminada no es pot desactivar"
  }

  return fallback
}

interface RowProps {
  template: ValuationTemplate
  onDuplicate: (template: ValuationTemplate) => Promise<void>
}

function ValuationTemplateRow({ template, onDuplicate }: RowProps) {
  const updateMut = useUpdateValuationTemplate()
  const deleteMut = useDeleteValuationTemplate()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [optimisticActive, setOptimisticActive] = useState<boolean | null>(null)
  const [isTransitioningActive, setIsTransitioningActive] = useState(false)
  const effectiveActive = optimisticActive ?? template.active

  useEffect(() => {
    setOptimisticActive(null)
    setIsTransitioningActive(false)
  }, [template.active])

  const handleSave = async (values: { name: string; textileTemplate: string }) => {
    try {
      await updateMut.mutateAsync({
        templateId: template.id,
        body: {
          name: values.name,
          textileTemplate: values.textileTemplate,
        },
      })
      toast.success("Plantilla actualitzada")
      setIsEditOpen(false)
    } catch (error) {
      toast.error(getTemplateErrorMessage(error, "Error al actualitzar plantilla"))
    }
  }

  const handleSetDefault = async () => {
    try {
      await updateMut.mutateAsync({
        templateId: template.id,
        body: { isDefault: true },
      })
      toast.success("Plantilla predeterminada actualitzada")
    } catch (error) {
      toast.error(getTemplateErrorMessage(error, "Error al marcar com predeterminada"))
    }
  }

  const handleToggleActive = async () => {
    const nextActive = !effectiveActive

    try {
      setOptimisticActive(nextActive)
      setIsTransitioningActive(true)
      await updateMut.mutateAsync({
        templateId: template.id,
        body: { active: nextActive },
      })
      toast.success(effectiveActive ? "Plantilla arxivada" : "Plantilla reactivada")
    } catch (error) {
      setOptimisticActive(null)
      toast.error(getTemplateErrorMessage(error, "Error al canviar l'estat"))
    } finally {
      setIsTransitioningActive(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(template.id)
      toast.success("Plantilla esborrada")
    } catch (error) {
      toast.error(getTemplateErrorMessage(error, "Error al esborrar plantilla"))
    }
  }

  const handleDuplicate = async () => {
    try {
      await onDuplicate(template)
      toast.success("Plantilla duplicada")
    } catch (error) {
      toast.error(getTemplateErrorMessage(error, "Error al duplicar plantilla"))
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-md border border-border bg-card p-3 group">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
              <span
              className={`text-sm font-medium ${effectiveActive ? "text-foreground" : "text-muted-foreground line-through"}`}
              >
                {template.name}
              </span>
            {template.is_default && (
              <Badge variant="secondary" className="gap-1">
                <Star size={12} /> Predeterminada
              </Badge>
            )}
            {!effectiveActive && <Badge variant="outline">Arxivada</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-1 truncate">{template.textile_template}</p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-accent-primary"
            onClick={() => setIsEditOpen(true)}
            aria-label={`Editar ${template.name}`}
          >
            <Edit2 size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-data-neutral"
            onClick={handleDuplicate}
            aria-label={`Duplicar ${template.name}`}
          >
            <Copy size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-data-warning"
            onClick={handleSetDefault}
            disabled={template.is_default || !effectiveActive || isTransitioningActive}
            aria-label={`Marcar ${template.name} com predeterminada`}
            title={!effectiveActive ? "Només les plantilles actives poden ser predeterminades" : undefined}
          >
            <Check size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={handleToggleActive}
            aria-label={`${effectiveActive ? "Arxivar" : "Reactivar"} ${template.name}`}
            disabled={(template.is_default && effectiveActive) || isTransitioningActive}
            title={template.is_default && effectiveActive ? "La plantilla predeterminada no es pot arxivar" : undefined}
          >
            {effectiveActive ? <Archive size={13} /> : <ArchiveRestore size={13} />}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                aria-label={`Esborrar ${template.name}`}
              >
                <Trash2 size={13} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar</AlertDialogTitle>
                <AlertDialogDescription>
                  Segur que vols esborrar la plantilla &quot;{template.name}&quot;?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Esborrar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar plantilla</DialogTitle>
            <DialogDescription>
              Actualitza el nom i el contingut Textile de la plantilla.
            </DialogDescription>
          </DialogHeader>

          <ValuationTemplateForm
            initialValues={{ name: template.name, textileTemplate: template.textile_template }}
            submitLabel="Guardar"
            isSubmitting={updateMut.isPending}
            onSubmit={handleSave}
            onCancel={() => setIsEditOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ValuationTemplatesSection() {
  const { data: templates, isLoading } = useValuationTemplates()
  const createMut = useCreateValuationTemplate()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const activeTemplates = templates?.filter((template) => template.active) ?? []
  const archivedTemplates = templates?.filter((template) => !template.active) ?? []

  const handleCreate = async (values: { name: string; textileTemplate: string }) => {
    try {
      await createMut.mutateAsync({
        name: values.name,
        textileTemplate: values.textileTemplate,
        isDefault: false,
        active: true,
      })
      toast.success("Plantilla creada")
      setIsCreateOpen(false)
    } catch (error) {
      toast.error(getTemplateErrorMessage(error, "Error al crear plantilla"))
    }
  }

  const handleDuplicate = async (template: ValuationTemplate) => {
    await createMut.mutateAsync({
      name: `${template.name} (còpia)`,
      textileTemplate: template.textile_template,
      isDefault: false,
      active: true,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsCreateOpen((previous) => !previous)}>
          {isCreateOpen ? <X size={14} /> : <Plus size={14} />} {isCreateOpen ? "Tancar" : "Afegir"}
        </Button>
      </div>

      {isCreateOpen && (
        <div className="rounded-md border border-border bg-card p-4">
          <ValuationTemplateForm
            submitLabel="Crear"
            isSubmitting={createMut.isPending}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
          />
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-12 rounded-md" />
          ))}
        </div>
      ) : !templates || templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-border rounded-lg">
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">Cap plantilla</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Afegeix-ne una per configurar noves valoracions</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Plantilles actives</h2>
            {activeTemplates.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-dashed border-border rounded-md px-3 py-4">
                No hi ha plantilles actives.
              </div>
            ) : (
              activeTemplates.map((template) => (
                <ValuationTemplateRow key={template.id} template={template} onDuplicate={handleDuplicate} />
              ))
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Plantilles arxivades</h2>
            {archivedTemplates.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-dashed border-border rounded-md px-3 py-4">
                No hi ha plantilles arxivades.
              </div>
            ) : (
              archivedTemplates.map((template) => (
                <ValuationTemplateRow key={template.id} template={template} onDuplicate={handleDuplicate} />
              ))
            )}
          </section>
        </div>
      )}
    </div>
  )
}
