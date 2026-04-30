import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PRIORITY_CONFIG } from "@/lib/priorities"
import type { Entry } from "@/types"

interface EntryListTableProps {
  entries: Entry[]
}

const TYPE_LABELS: Record<Entry["type"], string> = {
  TASK: "Tasca",
  NOTE: "Nota",
  MEETING_NOTE: "Reunió",
  REMINDER: "Recordatori",
}

export function EntryListTable({ entries }: EntryListTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipus</TableHead>
          <TableHead>Títol</TableHead>
          <TableHead>Etiquetes</TableHead>
          <TableHead>Estat</TableHead>
          <TableHead>Prioritat</TableHead>
          <TableHead>Data</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{TYPE_LABELS[entry.type]}</TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-foreground">{entry.title}</span>
                {entry.body ? <span className="max-w-[32ch] truncate text-sm text-muted-foreground">{entry.body}</span> : null}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {entry.tags.length > 0 ? (
                  entry.tags.map((tag) => (
                    <Badge key={tag.id ?? tag.name} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
            </TableCell>
            <TableCell>{entry.status}</TableCell>
            <TableCell>{entry.priority ? PRIORITY_CONFIG[entry.priority]?.label ?? "-" : "-"}</TableCell>
            <TableCell>{entry.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
