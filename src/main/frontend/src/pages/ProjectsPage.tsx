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

const DEFAULT_COLORS = [
  "var(--data-info)", "var(--data-negative)", "var(--data-positive)", "var(--data-warning)", "var(--tag-1)",
  "var(--tag-4)", "var(--tag-3)", "var(--accent-primary)", "var(--data-neutral)", "var(--tag-2)"
]

function ProjectRow({ project }: { project: Project }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description || "")
  const [color, setColor] = useState(project.color || "var(--data-info)")
  const updateMut = useUpdateProject()
  const deleteMut = useDeleteProject()

  const handleSave = async () => {
    if (!name.trim()) return
    try {
      await updateMut.mutateAsync({ id: project.id, data: { name: name.trim(), description: description.trim() || undefined, color } })
      toast.success("✅ Projecte actualitzat")
      setIsEditing(false)
    } catch {
      toast.error("❌ Error al actualitzar")
    }
  }

  const handleCancel = () => {
    setName(project.name)
    setDescription(project.description || "")
    setColor(project.color || "var(--data-info)")
    setIsEditing(false)
  }

  const handleToggleActive = async () => {
    try {
      await updateMut.mutateAsync({ id: project.id, data: { active: !project.active } })
      toast.success(project.active ? "Arxivat" : "Reactivat")
    } catch {
      toast.error("❌ Error")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(project.id)
      toast.success("✅ Esborrat")
    } catch {
      toast.error("❌ Error al esborrar")
    }
  }

  if (isEditing) {
    return (
<div className="flex items-center gap-2 p-3 border border-border rounded-md bg-card">
        <Input value={name} onChange={e => setName(e.target.value)} className="h-8 flex-1 text-sm" placeholder="Nom" />
        <Input value={description} onChange={e => setDescription(e.target.value)} className="h-8 flex-1 text-sm" placeholder="Descripció (opcional)" />
        <div className="flex items-center gap-2 p-1.5 bg-muted/20 rounded-lg border border-border/50">
          {DEFAULT_COLORS.slice(0, 8).map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                color === c 
                  ? "scale-110 z-10" 
                  : "hover:scale-110 opacity-90 hover:opacity-100"
              }`}
              style={{ 
                backgroundColor: c,
                boxShadow: color === c ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${c}` : 'none'
              }}
            >
              {color === c && <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />}
            </button>
          ))}
          <div className="w-px h-6 bg-border mx-1" />
          <div 
            className={`relative w-7 h-7 rounded-full overflow-hidden transition-all duration-200 hover:scale-110 ${
              !DEFAULT_COLORS.slice(0, 8).includes(color) ? "scale-110 z-10" : ""
            }`}
            style={{ 
              backgroundColor: color,
              boxShadow: !DEFAULT_COLORS.slice(0, 8).includes(color) ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${color}` : 'none'
            }}
          >
            {!DEFAULT_COLORS.slice(0, 8).includes(color) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
              </div>
            )}
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer opacity-0" title="Color personalitzat" />
          </div>
        </div>
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
<div className="flex items-center gap-3 p-3 border border-border rounded-md bg-card group">
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color || "var(--data-info)" }} />
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
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-blue-500" onClick={() => setIsEditing(true)}>
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
  const [newColor, setNewColor] = useState("var(--data-info)")
  const [showAdd, setShowAdd] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await createMut.mutateAsync({ name: newName.trim(), color: newColor })
      toast.success("✅ Projecte creat")
      setNewName("")
      setNewColor("var(--data-info)")
      setShowAdd(false)
    } catch {
      toast.error("❌ Error al crear (potser ja existeix)")
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
            placeholder="Nom del projecte..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="h-9 flex-1 text-sm"
            autoFocus
          />
          <div className="flex items-center gap-2 p-1.5 bg-muted/20 rounded-lg border border-border/50">
            {DEFAULT_COLORS.slice(0, 8).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setNewColor(c)}
                className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                  newColor === c 
                    ? "scale-110 z-10" 
                    : "hover:scale-110 opacity-90 hover:opacity-100"
                }`}
                style={{ 
                  backgroundColor: c,
                  boxShadow: newColor === c ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${c}` : 'none'
                }}
              >
                {newColor === c && <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />}
              </button>
            ))}
            <div className="w-px h-6 bg-border mx-1" />
            <div 
              className={`relative w-7 h-7 rounded-full overflow-hidden transition-all duration-200 hover:scale-110 ${
                !DEFAULT_COLORS.slice(0, 8).includes(newColor) ? "scale-110 z-10" : ""
              }`}
              style={{ 
                backgroundColor: newColor,
                boxShadow: !DEFAULT_COLORS.slice(0, 8).includes(newColor) ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px ${newColor}` : 'none'
              }}
            >
              {!DEFAULT_COLORS.slice(0, 8).includes(newColor) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Check className="w-4 h-4 text-white drop-shadow-md" strokeWidth={3} />
                </div>
              )}
              <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer opacity-0" title="Color personalitzat" />
            </div>
          </div>
          <Button type="submit" size="sm" className="h-9">Crear</Button>
          <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => { setShowAdd(false); setNewName("") }}>
            <X size={14} />
          </Button>
        </form>
      )}

      {isLoading ? (
        <div className="space-y-2">
{[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-md" />)}
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-border rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">Cap projecte</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Afegeix-ne un per començar a imputar hores</p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map(p => <ProjectRow key={p.id} project={p} />)}
        </div>
      )}
    </div>
  )
}
