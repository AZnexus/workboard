import { useState } from "react"
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Plus, Edit2, Check, X, Trash2, Archive, ArchiveRestore } from "lucide-react"
import type { Project } from "@/types"
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

function ProjectRow({ project }: { project: Project }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || "")
  const updateMut = useUpdateProject()
  const deleteMut = useDeleteProject()

  const handleSave = async () => {
    if (!name.trim()) return
    try {
      await updateMut.mutateAsync({ id: project.id, data: { name: name.trim(), description: description.trim() || undefined } })
      toast.success("Projecte actualitzat")
      setIsEditing(false)
    } catch {
      toast.error("Error al actualitzar")
    }
  }

  const handleCancel = () => {
    setName(project.name)
    setDescription(project.description || "")
    setIsEditing(false)
  }

  const handleToggleActive = async () => {
    try {
      await updateMut.mutateAsync({ id: project.id, data: { active: !project.active } })
      toast.success(project.active ? "Arxivat" : "Reactivat")
    } catch {
      toast.error("Error")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(project.id)
      toast.success("Esborrat")
    } catch {
      toast.error("Error al esborrar")
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-3 border border-border rounded-[8px] bg-card">
        <Input value={name} onChange={e => setName(e.target.value)} className="h-8 flex-1 text-sm" placeholder="Nom" />
        <Input value={description} onChange={e => setDescription(e.target.value)} className="h-8 flex-1 text-sm" placeholder="Descripció (opcional)" />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100" onClick={handleSave}>
          <Check size={14} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleCancel}>
          <X size={14} />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 border border-border rounded-[8px] bg-card group">
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium ${project.active ? "text-foreground" : "text-muted-foreground line-through"}`}>
          {project.name}
        </span>
        {project.description && (
          <span className="text-xs text-muted-foreground ml-2">{project.description}</span>
        )}
        {!project.active && (
          <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 ml-2">Arxivat</span>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => setIsEditing(true)}>
          <Edit2 size={13} />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={handleToggleActive} title={project.active ? "Arxivar" : "Reactivar"}>
          {project.active ? <Archive size={13} /> : <ArchiveRestore size={13} />}
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
              <AlertDialogDescription>Segur que vols esborrar el projecte &quot;{project.name}&quot;?</AlertDialogDescription>
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

export function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  const createMut = useCreateProject()
  const [newName, setNewName] = useState("")
  const [showAdd, setShowAdd] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await createMut.mutateAsync({ name: newName.trim() })
      toast.success("Projecte creat")
      setNewName("")
      setShowAdd(false)
    } catch {
      toast.error("Error al crear (potser ja existeix)")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Projectes</h1>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={14} /> Afegir
        </Button>
      </div>

      {showAdd && (
        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <Input
            placeholder="Nom del projecte..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="h-9 flex-1 text-sm"
            autoFocus
          />
          <Button type="submit" size="sm" className="h-9">Crear</Button>
          <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => { setShowAdd(false); setNewName("") }}>
            <X size={14} />
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-[8px]" />)}
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-[8px]">
          Cap projecte creat. Afegeix-ne un per començar a imputar hores!
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map(p => <ProjectRow key={p.id} project={p} />)}
        </div>
      )}
    </div>
  )
}
