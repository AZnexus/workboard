import { useState } from "react"
import { useCreateTimeLog, useProjects } from "@/hooks/useTimeLogs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function TimeLogForm() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [hours, setHours] = useState("")
  const [project, setProject] = useState("")
  const [taskCode, setTaskCode] = useState("")
  const [description, setDescription] = useState("")

  const createMut = useCreateTimeLog()
  const { data: projects } = useProjects()

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
        <div className="space-y-1 w-full sm:w-[140px] shrink-0 relative">
          <label className="text-xs text-muted-foreground">Projecte</label>
          <Input 
            required 
            list="project-list"
            value={project} 
            onChange={e => setProject(e.target.value)} 
            className="h-9 border-border bg-background" 
            placeholder="Ex: CORE" 
          />
          <datalist id="project-list">
            {projects?.map(p => (
              <option key={p} value={p} />
            ))}
          </datalist>
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
