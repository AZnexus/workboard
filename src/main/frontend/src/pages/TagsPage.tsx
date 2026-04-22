import { useState } from "react"
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks/useTags"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Plus, Edit2, Check, X, Trash2 } from "lucide-react"
import type { Tag } from "@/types"
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
  "#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6",
  "#8B5CF6", "#EC4899", "#6B7280", "#14B8A6", "#F43F5E"
]

function TagRow({ tag }: { tag: Tag }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(tag.name)
  const [color, setColor] = useState(tag.color)
  const updateMut = useUpdateTag()
  const deleteMut = useDeleteTag()

  const handleSave = async () => {
    if (!name.trim()) return
    try {
      await updateMut.mutateAsync({ id: tag.id, data: { name: name.trim(), color } })
      toast.success("✅ Etiqueta actualitzada")
      setIsEditing(false)
    } catch {
      toast.error("❌ Error al actualitzar")
    }
  }

  const handleCancel = () => {
    setName(tag.name)
    setColor(tag.color)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(tag.id)
      toast.success("✅ Etiqueta esborrada")
    } catch {
      toast.error("❌ Error al esborrar")
    }
  }

  if (isEditing) {
    return (
<div className="flex items-center gap-2 p-3 border border-border rounded-md bg-card">
        <Input value={name} onChange={e => setName(e.target.value)} className="h-8 flex-1 text-sm" placeholder="Nom" />
        <div className="flex items-center gap-2 p-1.5 bg-muted/20 rounded-lg border border-border/50">
          {DEFAULT_COLORS.slice(0, 8).map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              type="button"
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
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
      <span className="text-sm font-medium text-foreground flex-1">{tag.name}</span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-blue-500" onClick={() => setIsEditing(true)}>
          <Edit2 size={13} />
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
              <AlertDialogDescription>Segur que vols esborrar l&apos;etiqueta &quot;{tag.name}&quot;?</AlertDialogDescription>
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

export function TagsPage() {
  const { data: tags, isLoading } = useTags()
  const createMut = useCreateTag()
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("#3B82F6")
  const [showAdd, setShowAdd] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    try {
      await createMut.mutateAsync({ name: newName.trim(), color: newColor })
      toast.success("✅ Etiqueta creada")
      setNewName("")
      setNewColor("#3B82F6")
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
            placeholder="Nom de l'etiqueta..."
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
      ) : !tags || tags.length === 0 ? (
<div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-md">
          Cap etiqueta creada. Afegeix-ne una per organitzar les entrades!
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map(t => <TagRow key={t.id} tag={t} />)}
        </div>
      )}
    </div>
  )
}
