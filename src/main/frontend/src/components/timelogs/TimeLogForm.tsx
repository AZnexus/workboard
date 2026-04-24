import { useState } from "react"
import { useCreateTimeLog } from "@/hooks/useTimeLogs"
import { useProjects } from "@/hooks/useProjects"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Plus } from "lucide-react"

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
    } catch {
      toast.error("Error al afegir temps")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row flex-wrap gap-4 items-end bg-card w-full">
      <div className="space-y-1.5 w-full sm:w-[140px] shrink-0">
        <label className="text-xs font-semibold text-muted-foreground ml-0.5">Data</label>
        <Input type="date" required value={date} onChange={e => setDate(e.target.value)} className="h-10 bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary hover:border-border transition-colors" />
      </div>
      
      <div className="space-y-1.5 w-full sm:w-[180px] shrink-0">
        <label className="text-xs font-semibold text-muted-foreground ml-0.5">Projecte</label>
        <Select value={project} onValueChange={setProject}>
          <SelectTrigger className="h-10 bg-background border-border/60 focus:ring-1 focus:ring-primary hover:border-border transition-colors">
            <SelectValue placeholder="Selecciona..." />
          </SelectTrigger>
          <SelectContent>
            {projects?.map(p => (
              <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5 w-full sm:w-[110px] shrink-0">
        <label className="text-xs font-semibold text-muted-foreground ml-0.5">Codi</label>
        <Input value={taskCode} onChange={e => setTaskCode(e.target.value)} className="h-10 bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary hover:border-border transition-colors" placeholder="CEL-1234" />
      </div>
      
      <div className="space-y-1.5 w-full sm:w-[90px] shrink-0">
        <label className="text-xs font-semibold text-muted-foreground ml-0.5">Hores</label>
        <Input type="number" step="0.25" min="0" required value={hours} onChange={e => setHours(e.target.value)} className="h-10 bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary hover:border-border transition-colors" placeholder="0.0" />
      </div>
      
      <div className="space-y-1.5 w-full sm:flex-1 min-w-[200px]">
        <label className="text-xs font-semibold text-muted-foreground ml-0.5">Descripció</label>
        <div className="flex gap-3 w-full">
          <Input value={description} onChange={e => setDescription(e.target.value)} className="h-10 flex-1 bg-background border-border/60 focus-visible:ring-1 focus-visible:ring-primary hover:border-border transition-colors" placeholder="Què has fet?" />
          <Button type="submit" className="h-10 shrink-0 gap-1.5 px-5 shadow-sm" disabled={createMut.isPending}>
            <Plus size={16} />
            <span className="hidden sm:inline">Afegir</span>
          </Button>
        </div>
      </div>
    </form>
  )
}
