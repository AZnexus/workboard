import { useState } from "react"
import { useTimeLogs, useDeleteTimeLog, useUpdateTimeLog } from "@/hooks/useTimeLogs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Edit2, Check, X } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import type { TimeLog } from "@/types"
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

function TimeLogRow({ log }: { log: TimeLog }) {
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
    } catch (err) {
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
    } catch (err) {
      toast.error("Error")
    }
  }

  if (isEditing) {
    return (
      <TableRow>
        <TableCell className="p-2">
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 min-w-[120px] px-2 text-sm" />
        </TableCell>
        <TableCell className="p-2">
          <Input value={project} onChange={e => setProject(e.target.value)} className="h-8 min-w-[100px] px-2 text-sm" placeholder="Projecte" />
        </TableCell>
        <TableCell className="p-2">
          <Input value={taskCode} onChange={e => setTaskCode(e.target.value)} className="h-8 min-w-[100px] px-2 text-sm" placeholder="Codi Tasca" />
        </TableCell>
        <TableCell className="p-2">
          <Input type="number" step="0.25" min="0" value={hours} onChange={e => setHours(e.target.value)} className="h-8 w-[70px] px-2 text-sm" />
        </TableCell>
        <TableCell className="p-2">
          <Input value={description} onChange={e => setDescription(e.target.value)} className="h-8 w-full px-2 text-sm" placeholder="Descripció" />
        </TableCell>
        <TableCell className="text-right p-2 whitespace-nowrap">
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20" onClick={handleSave}>
              <Check size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={handleCancel}>
              <X size={14} />
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">{log.date}</TableCell>
      <TableCell className="font-medium text-foreground">{log.project}</TableCell>
      <TableCell className="text-foreground">{log.task_code || '-'}</TableCell>
      <TableCell className="text-foreground">{log.hours}h</TableCell>
      <TableCell className="text-muted-foreground">{log.description}</TableCell>
      <TableCell className="text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsEditing(true)}>
            <Edit2 size={14} />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 size={14} />
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

export function TimeLogTable() {
  const { data, isLoading } = useTimeLogs()

  if (isLoading) return <Skeleton className="h-48" />

  const logs = data?.data || []

  return (
    <div className="border border-border rounded-[8px] bg-card overflow-x-auto">
      <Table className="min-w-[800px]">
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[120px]">Data</TableHead>
            <TableHead className="w-[120px]">Projecte</TableHead>
            <TableHead className="w-[120px]">Codi</TableHead>
            <TableHead className="w-[80px]">Hores</TableHead>
            <TableHead className="w-auto">Descripció</TableHead>
            <TableHead className="w-[100px] text-right">Accions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground h-24">Cap registre</TableCell>
            </TableRow>
          )}
          {logs.map(log => (
            <TimeLogRow key={log.id} log={log} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
