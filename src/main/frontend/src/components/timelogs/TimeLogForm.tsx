import { useState } from "react"
import { useCreateTimeLog } from "@/hooks/useTimeLogs"
import { useProjects } from "@/hooks/useProjects"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

export function TimeLogForm() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [hours, setHours] = useState("")
  const [project, setProject] = useState("")
  const [taskCode, setTaskCode] = useState("")
  const [description, setDescription] = useState("")

  const createMut = useCreateTimeLog()
  const { data: projects } = useProjects(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hours || !project) return

    try {
      await createMut.mutateAsync({
        date,
        hours: parseFloat(hours),
        project,
        taskCode: taskCode || undefined,
        description
      })
      toast.success("Temps afegit")
      setHours("")
      setTaskCode("")
      setDescription("")
    } catch (err) {
      toast.error("Error al afegir temps")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-card p-4 rounded-[8px] border border-border">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end w-full">
        <div className="space-y-1 w-full sm:w-[140px] shrink-0">
          <label className="text-xs text-muted-foreground">Data</label>
          <Input type="date" required value={date} onChange={e => setDate(e.target.value)} className="h-9 border-border bg-background" />
        </div>
        <div className="space-y-1 w-full sm:w-[80px] shrink-0">
          <label className="text-xs text-muted-foreground">Hores</label>
          <Input type="number" step="0.25" min="0" required value={hours} onChange={e => setHours(e.target.value)} className="h-9 border-border bg-background" placeholder="0.0" />
        </div>
        <div className="space-y-1 w-full sm:w-[160px] shrink-0">
          <label className="text-xs text-muted-foreground">Projecte</label>
          <Select value={project} onValueChange={setProject} required>
            <SelectTrigger className="h-9 border-border bg-background">
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              {projects?.map(p => (
                <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
              ))}
              {(!projects || projects.length === 0) && (
                <SelectItem value="" disabled>Cap projecte</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 w-full sm:w-[140px] shrink-0">
          <label className="text-xs text-muted-foreground">Codi Tasca</label>
          <Input value={taskCode} onChange={e => setTaskCode(e.target.value)} className="h-9 border-border bg-background" placeholder="Ex: CEL-1234" />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end w-full">
        <div className="space-y-1 w-full flex-1">
          <label className="text-xs text-muted-foreground">Descripció</label>
          <Input value={description} onChange={e => setDescription(e.target.value)} className="h-9 border-border bg-background" placeholder="Opcional" />
        </div>
        <Button type="submit" className="h-9 w-full sm:w-auto shrink-0">Afegir</Button>
      </div>
    </form>
  )
}
