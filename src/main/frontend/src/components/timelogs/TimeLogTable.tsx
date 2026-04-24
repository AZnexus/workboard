import { useState } from "react"
import { useTimeLogs, useDeleteTimeLog, useUpdateTimeLog } from "@/hooks/useTimeLogs"
import { useProjects } from "@/hooks/useProjects"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit2, Check, X, Clock } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import type { TimeLog } from "@/types"

function formatFriendlyDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getTime() === today.getTime()) return "Avui"
  if (date.getTime() === yesterday.getTime()) return "Ahir"
  return date.toLocaleDateString("ca-ES", { weekday: "short", day: "numeric", month: "short" })
}
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

function TimeLogRow({ log, projectColor }: { log: TimeLog; projectColor?: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [date, setDate] = useState(log.date)
  const [project, setProject] = useState(log.project)
  const [taskCode, setTaskCode] = useState(log.task_code || "")
  const [hours, setHours] = useState(log.hours.toString())
  const [description, setDescription] = useState(log.description || "")

  const updateMut = useUpdateTimeLog()
  const deleteMut = useDeleteTimeLog()

  const handleSave = async () => {
    try {
      await updateMut.mutateAsync({
        id: log.id,
        data: {
          date,
          project,
          taskCode: taskCode || undefined,
          hours: parseFloat(hours),
          description: description || undefined
        }
      })
      toast.success("Actualitzat")
      setIsEditing(false)
    } catch {
      toast.error("Error al actualitzar")
    }
  }

  const handleCancel = () => {
    setDate(log.date)
    setProject(log.project)
    setTaskCode(log.task_code || "")
    setHours(log.hours.toString())
    setDescription(log.description || "")
    setIsEditing(false)
  }

  const handleDelete = async () => {
    try {
      await deleteMut.mutateAsync(log.id)
      toast.success("Esborrat")
    } catch {
      toast.error("Error")
    }
  }

  if (isEditing) {
    return (
      <TableRow className="bg-muted/30">
        <TableCell className="p-3">
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 min-w-[120px] px-2 text-sm bg-background border-border/60" />
        </TableCell>
        <TableCell className="p-3">
          <Input value={project} onChange={e => setProject(e.target.value)} className="h-8 min-w-[100px] px-2 text-sm bg-background border-border/60" placeholder="Projecte" />
        </TableCell>
        <TableCell className="p-3">
          <Input value={taskCode} onChange={e => setTaskCode(e.target.value)} className="h-8 min-w-[100px] px-2 text-sm bg-background border-border/60" placeholder="Codi Tasca" />
        </TableCell>
        <TableCell className="p-3">
          <Input type="number" step="0.25" min="0" value={hours} onChange={e => setHours(e.target.value)} className="h-8 w-[70px] px-2 text-sm bg-background border-border/60" />
        </TableCell>
        <TableCell className="p-3">
          <Input value={description} onChange={e => setDescription(e.target.value)} className="h-8 w-full px-2 text-sm bg-background border-border/60" placeholder="Descripció" />
        </TableCell>
        <TableCell className="text-right p-3 whitespace-nowrap">
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-data-positive hover:text-data-positive hover:bg-data-positive/10 transition-colors" onClick={handleSave}>
              <Check size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" onClick={handleCancel}>
              <X size={16} />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow className="group hover:bg-muted/40 transition-colors">
      <TableCell className="whitespace-nowrap p-3 text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="opacity-50" />
          <span className={formatFriendlyDate(log.date) === "Avui" ? "font-medium text-foreground" : ""}>
            {formatFriendlyDate(log.date)}
          </span>
        </div>
      </TableCell>
      <TableCell className="font-medium text-foreground p-3">
        <div className="flex items-center gap-1.5">
          {projectColor && <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: projectColor }} />}
          {log.project}
        </div>
      </TableCell>
      <TableCell className="p-3">
        {log.task_code ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground border border-border/50">
            {log.task_code}
          </span>
        ) : (
          <span className="text-muted-foreground/40">-</span>
        )}
      </TableCell>
      <TableCell className="p-3">
        <span className="font-medium text-foreground">{log.hours}</span>
        <span className="text-muted-foreground ml-0.5">h</span>
      </TableCell>
      <TableCell className="text-muted-foreground p-3 max-w-[300px] truncate" title={log.description || undefined}>
        {log.description}
      </TableCell>
      <TableCell className="text-right p-3 whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent-primary hover:bg-accent-primary/10 transition-colors" onClick={() => setIsEditing(true)}>
            <Edit2 size={15} />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 size={15} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar</AlertDialogTitle>
                <AlertDialogDescription>Segur que vols esborrar aquest registre?</AlertDialogDescription>
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
      </TableCell>
    </TableRow>
  )
}

export function TimeLogTable({ params }: { params?: Record<string, string> } = {}) {
  const { data, isLoading } = useTimeLogs(params)
  const { data: projects } = useProjects()
  const projectColorMap = new Map(projects?.map(p => [p.name, p.color]) || [])

  if (isLoading) return (
    <div className="border border-border/50 rounded-lg bg-card shadow-sm p-4">
<Skeleton className="h-48 w-full rounded-md" />
    </div>
  )

  const logs = data || []

  return (
    <div className="border border-border/50 rounded-lg bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-b-border/50">
            <TableHead className="w-[140px] font-medium h-10 text-muted-foreground">Data</TableHead>
            <TableHead className="w-[140px] font-medium h-10 text-muted-foreground">Projecte</TableHead>
            <TableHead className="w-[120px] font-medium h-10 text-muted-foreground">Codi</TableHead>
            <TableHead className="w-[90px] font-medium h-10 text-muted-foreground">Hores</TableHead>
            <TableHead className="w-auto font-medium h-10 text-muted-foreground">Descripció</TableHead>
            <TableHead className="w-[100px] text-right font-medium h-10 text-muted-foreground">Accions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6} className="text-center h-40">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Clock size={32} className="text-muted-foreground/30" />
                  <div>
                    <p className="text-lg font-medium text-muted-foreground">Sense registres</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Cap hora registrada en aquest període</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )}
          {logs.map(log => (
            <TimeLogRow key={log.id} log={log} projectColor={projectColorMap.get(log.project)} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
