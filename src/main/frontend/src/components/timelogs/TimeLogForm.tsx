import { useState } from "react"
import { useCreateTimeLog } from "@/hooks/useTimeLogs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function TimeLogForm() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [hours, setHours] = useState("")
  const [project, setProject] = useState("")
  const [description, setDescription] = useState("")

  const createMut = useCreateTimeLog()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hours || !project) return

    try {
      await createMut.mutateAsync({
        date,
        hours: parseFloat(hours),
        project,
        description
      })
      toast.success("Temps afegit")
      setHours("")
      setDescription("")
    } catch (err) {
      toast.error("Error al afegir temps")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-surface p-4 rounded-[8px] border border-border">
      <div className="space-y-1 w-full sm:w-auto">
        <label className="text-xs text-muted-foreground">Data</label>
        <Input type="date" required value={date} onChange={e => setDate(e.target.value)} className="h-9 border-border bg-background" />
      </div>
      <div className="space-y-1 w-full sm:w-24">
        <label className="text-xs text-muted-foreground">Hores</label>
        <Input type="number" step="0.25" min="0" required value={hours} onChange={e => setHours(e.target.value)} className="h-9 border-border bg-background" placeholder="0.0" />
      </div>
      <div className="space-y-1 w-full sm:w-48">
        <label className="text-xs text-muted-foreground">Projecte</label>
        <Input required value={project} onChange={e => setProject(e.target.value)} className="h-9 border-border bg-background" placeholder="Ex: CORE" />
      </div>
      <div className="space-y-1 w-full sm:flex-1">
        <label className="text-xs text-muted-foreground">Descripció</label>
        <Input value={description} onChange={e => setDescription(e.target.value)} className="h-9 border-border bg-background" placeholder="Opcional" />
      </div>
      <Button type="submit" className="h-9 w-full sm:w-auto bg-accent hover:bg-accent/90 text-white">Afegir</Button>
    </form>
  )
}
