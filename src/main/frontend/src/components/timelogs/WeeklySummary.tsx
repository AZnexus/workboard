import { useWeekly } from "@/hooks/useDashboard"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function WeeklySummary({ dateFrom }: { dateFrom?: string, dateTo?: string } = {}) {
  const { data, isLoading } = useWeekly(dateFrom)

  if (isLoading) return <Skeleton className="h-32" />

  const weekly = data

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold tracking-tight text-foreground">Resum Setmanal ({weekly?.week})</h2>
      <div className="border border-border rounded-[8px] bg-card overflow-hidden w-full sm:max-w-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Projecte</TableHead>
              <TableHead className="text-right">Hores</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(weekly?.hours_by_project || {}).map(([project, hours]) => (
              <TableRow key={project}>
                <TableCell className="font-medium text-foreground">{project}</TableCell>
                <TableCell className="text-right text-foreground">{Number(hours).toFixed(2)}h</TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/30">
              <TableCell className="font-semibold text-foreground">Total</TableCell>
              <TableCell className="text-right font-semibold text-primary">{weekly?.total_hours?.toFixed(2)}h</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
