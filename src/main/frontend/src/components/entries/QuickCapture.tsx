import { useState, useRef, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useCreateEntry } from "@/hooks/useEntries"
import { toast } from "sonner"
import { Zap } from "lucide-react"

type QuickType = "REMINDER" | "NOTE"

interface QuickCaptureProps {
  compact?: boolean
}

export function QuickCapture({ compact }: QuickCaptureProps) {
  const [type, setType] = useState<QuickType>("REMINDER")
  const [title, setTitle] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  
  const createEntry = useCreateEntry()

  useEffect(() => {
    if (!compact) inputRef.current?.focus()
  }, [compact])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await createEntry.mutateAsync({
        title: title.trim(),
        type,
      })
      toast.success("Creat")
      setTitle("")
      inputRef.current?.focus()
    } catch (error) {
      toast.error("Error al crear")
    }
  }

  if (compact) {
    return (
      <div className="flex h-9 flex-1 max-w-xl items-center gap-1.5 rounded-md border border-amber-500/20 bg-amber-500/5 px-2 transition-colors focus-within:border-amber-500/40 focus-within:bg-amber-500/[0.08]">
        <Zap size={14} className="text-amber-500 shrink-0 ml-1.5" />
        <Select value={type} onValueChange={(val: string) => setType(val as QuickType)}>
          <SelectTrigger
            className="h-7 w-[132px] border-0 bg-transparent shadow-none focus:ring-0 text-sm font-medium text-amber-600/90 px-1.5 pr-2"
            style={{
              backgroundColor: "transparent",
              border: "0",
              boxShadow: "none",
              borderRadius: 0,
              paddingLeft: "var(--space-2)",
              paddingRight: "var(--space-2)",
            }}
          >
            <SelectValue placeholder="Tipus" />
          </SelectTrigger>
          <SelectContent side="bottom" position="popper" sideOffset={4} align="start">
            <SelectItem value="REMINDER">Recordatori</SelectItem>
            <SelectItem value="NOTE">Nota ràpida</SelectItem>
          </SelectContent>
        </Select>
        
        <form onSubmit={handleSubmit} className="flex-1 flex items-center h-full min-w-0">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Captura ràpida..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-full w-full border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 text-sm font-normal placeholder:text-muted-foreground/60"
            style={{
              backgroundColor: "transparent",
              border: "0",
              boxShadow: "none",
              paddingLeft: "var(--space-1)",
              paddingRight: 0,
            }}
          />
        </form>
      </div>
    )
  }

  return (
<div className="flex h-12 w-full items-center gap-2 rounded-md border border-border bg-card p-1 shadow-sm">
      <Select value={type} onValueChange={(val: string) => setType(val as QuickType)}>
        <SelectTrigger className="w-[140px] border-0 bg-transparent shadow-none focus:ring-0">
          <SelectValue placeholder="Tipus" />
        </SelectTrigger>
        <SelectContent side="bottom" position="popper" sideOffset={4} align="start">
          <SelectItem value="REMINDER">Recordatori</SelectItem>
          <SelectItem value="NOTE">Nota ràpida</SelectItem>
        </SelectContent>
      </Select>

      <div className="h-6 w-px bg-border shrink-0" />

      <form onSubmit={handleSubmit} className="flex-1 flex items-center h-full">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Escriu i prem Enter..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-full w-full border-0 bg-transparent px-2 shadow-none focus-visible:ring-0"
        />
      </form>
    </div>
  )
}
