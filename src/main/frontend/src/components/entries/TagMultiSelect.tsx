import { useState, useRef, useEffect } from "react"
import { useTags, useCreateTag } from "@/hooks/useTags"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { toast } from "sonner"
import type { Tag } from "@/types"

interface TagMultiSelectProps {
  selectedIds: number[]
  onChange: (ids: number[]) => void
}

export function TagMultiSelect({ selectedIds, onChange }: TagMultiSelectProps) {
  const { data: allTags = [] } = useTags()
  const createTag = useCreateTag()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedTags = allTags.filter(t => selectedIds.includes(t.id))
  const filteredTags = allTags.filter(t =>
    !selectedIds.includes(t.id) &&
    t.name.toLowerCase().includes(search.toLowerCase())
  )
  const canCreate = search.trim() && !allTags.some(t => t.name.toLowerCase() === search.trim().toLowerCase())

  const toggleTag = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(i => i !== id))
    } else {
      onChange([...selectedIds, id])
    }
    setSearch("")
  }

  const removeTag = (id: number) => {
    onChange(selectedIds.filter(i => i !== id))
  }

  const handleCreateAndAdd = async () => {
    if (!search.trim()) return
    try {
      const newTag = await createTag.mutateAsync({ name: search.trim() })
      onChange([...selectedIds, newTag.id])
      setSearch("")
    } catch (err) {
      toast.error("Error al crear l'etiqueta")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (filteredTags.length > 0) {
        toggleTag(filteredTags[0].id)
      } else if (canCreate) {
        handleCreateAndAdd()
      }
    }
    if (e.key === "Backspace" && !search && selectedIds.length > 0) {
      removeTag(selectedIds[selectedIds.length - 1])
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div
        className="flex flex-wrap items-center gap-1 min-h-[36px] px-2 py-1 rounded-md border border-border bg-background cursor-text"
        onClick={() => { setOpen(true); inputRef.current?.focus() }}
      >
        {selectedTags.map((tag: Tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="rounded-[6px] text-[11px] px-1.5 py-0 gap-1 font-normal"
            style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color + "40" }}
          >
            {tag.name}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); removeTag(tag.id) }}
              className="hover:opacity-70"
            >
              <X size={10} />
            </button>
          </Badge>
        ))}
        <input
          ref={inputRef}
          value={search}
          onChange={e => { setSearch(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedIds.length === 0 ? "Cercar o crear etiqueta..." : ""}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none h-7"
        />
      </div>

      {open && (filteredTags.length > 0 || canCreate) && (
        <div className="absolute z-50 mt-1 w-full max-h-[200px] overflow-y-auto rounded-md border border-border bg-popover shadow-md" onPointerDown={e => e.stopPropagation()}>
          {filteredTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-muted/50 transition-colors"
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
              <span className="text-foreground">{tag.name}</span>
            </button>
          ))}
          {canCreate && (
            <button
              type="button"
              onClick={handleCreateAndAdd}
              className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left hover:bg-muted/50 transition-colors text-primary"
            >
              <Plus size={12} />
              <span>Crear &quot;{search.trim()}&quot;</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
