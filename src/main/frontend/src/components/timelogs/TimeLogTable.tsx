import { useTimeLogs, useDeleteTimeLog } from "@/hooks/useTimeLogs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function TimeLogTable() {
  const { data, isLoading } = useTimeLogs()
  const deleteMut = useDeleteTimeLog()

  const handleDelete = async (id: number) => {
    if (confirm("Segur que vols esborrar-ho?")) {
      try {
        await deleteMut.mutateAsync(id)
        toast.success("Esborrat")
      } catch (err) {
        toast.error("Error")
      }
    }
  }

  if (isLoading) return <Skeleton className="h-48" />

  const logs = data?.data || []

  return (
    <div className="border border-border rounded-[8px] bg-surface overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Projecte</TableHead>
            <TableHead>Hores</TableHead>
            <TableHead className="w-full">Descripció</TableHead>
            <TableHead className="text-right">Accions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground h-24">Cap registre</TableCell>
            </TableRow>
          )}
          {logs.map(log => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">{log.date}</TableCell>
              <TableCell className="font-medium text-foreground">{log.project}</TableCell>
              <TableCell className="text-foreground">{log.hours}h</TableCell>
              <TableCell className="text-muted-foreground">{log.description}</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(log.id)}>
                  <Trash2 size={14} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
