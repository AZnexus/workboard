import { useState } from "react"
import { Archive, ArchiveRestore, Check, Edit2, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ColorPicker } from "@/components/ui/color-picker"
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
import { useCreateVersion, useDeleteVersion, useUpdateVersion, useVersions } from "@/hooks/useVersions"
import type { Version } from "@/types"

const DEFAULT_COLORS = [
  "#3B82F6", "#EF4444", "#22C55E", "#EAB308", "#F97316",
  "#EC4899", "#14B8A6", "#8B5CF6", "#6B7280", "#A855F7",
]

function getVersionConflictErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.includes("already exists")) {
    return "Error al guardar (la versió ja existeix)"
  }

  if (error instanceof Error && error.message.includes("still assigned to tasks")) {
    return "No es pot esborrar: encara està assignada a tasques"
  }

  return fallback
}

function VersionRow({ version }: { version: Version }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(version.name)
  const [color, setColor] = useState(version.color || "#3B82F6")
  const updateMut = useUpdateVersion()
  const deleteMut = useDeleteVersion()

  const handleSave = async () => {
    if (!name.trim()) return
    try {
      await updateMut.mutateAsync({ id: version.id, data: { name: name.trim(), color } })
      toast.success("Versió actualitzada")
      setIsEditing(false)
    } catch (error) {
      toast.error(getVersionConflictErrorMessage(error, "Error al actualitzar"))
    }
  }

  const handleCancel = () => {
    setName(version.name)
    setColor(version.color || "#3B82F6")
    setIsEditing(false)
  }

  const handleToggleActive = async () => {
    try {
      await updateMut.mutateAsync({ id: version.id, data: { active: !version.active } })
      toast.success(version.active ? "Arxivada" : "Reactivada")
    } catch (error) {
      toast.error(getVersionConflictErrorMessage(error, "Error"))
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(version.id)
      toast.success("Versió esborrada")
    } catch (error) {
      toast.error(getVersionConflictErrorMessage(error, "Error al esborrar"))
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-3 border border-border rounded-md bg-card">
        <Input value={name} onChange={e => setName(e.target.value)} className="h-8 flex-1 text-sm" placeholder="Nom" />
        <ColorPicker palette={DEFAULT_COLORS} value={color} onChange={setColor} />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-data-positive hover:text-data-positive hover:bg-data-positive/10" onClick={handleSave}>
          <Check size={14} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleCancel}>
          <X size={14} />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 border border-border rounded-md bg-card group">
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: version.color || "var(--data-info)" }} />
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium ${version.active ? "text-foreground" : "text-muted-foreground line-through"}`}>
          {version.name}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-accent-primary" onClick={() => setIsEditing(true)}>
          <Edit2 size={13} />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleToggleActive} title={version.active ? "Arxivar" : "Reactivar"}>
          {version.active ? <Archive size={13} /> : <ArchiveRestore size={13} />}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
              <Trash2 size={13} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar</AlertDialogTitle>
              <AlertDialogDescription>Segur que vols esborrar la versió &quot;{version.name}&quot;?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel·lar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Esborrar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export function VersionsPage() {
  const { data: versions, isLoading } = useVersions()
  const createMut = useCreateVersion()
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("#3B82F6")
  const [showAdd, setShowAdd] = useState(false)

  const activeVersions = versions?.filter(version => version.active) ?? []
  const archivedVersions = versions?.filter(version => !version.active) ?? []

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await createMut.mutateAsync({ name: newName.trim(), color: newColor })
      toast.success("Versió creada")
      setNewName("")
      setNewColor("#3B82F6")
      setShowAdd(false)
    } catch (error) {
      toast.error(getVersionConflictErrorMessage(error, "Error al crear versió"))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={14} /> Afegir
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <Input
            placeholder="Nom de la versió..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="h-9 flex-1 text-sm"
            autoFocus
          />
          <ColorPicker palette={DEFAULT_COLORS} value={newColor} onChange={setNewColor} />
          <Button type="submit" size="sm" className="h-9">Crear</Button>
          <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => { setShowAdd(false); setNewName(""); setNewColor("#3B82F6") }}>
            <X size={14} />
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-md" />)}
        </div>
      ) : !versions || versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-border rounded-lg">
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">Cap versió</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Afegeix-ne una per assignar-la a tasques</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Versions actives</h2>
            {activeVersions.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-dashed border-border rounded-md px-3 py-4">No hi ha versions actives.</div>
            ) : (
              activeVersions.map(version => <VersionRow key={version.id} version={version} />)
            )}
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Versions arxivades</h2>
            {archivedVersions.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-dashed border-border rounded-md px-3 py-4">No hi ha versions arxivades.</div>
            ) : (
              archivedVersions.map(version => <VersionRow key={version.id} version={version} />)
            )}
          </section>
        </div>
      )}
    </div>
  )
}
