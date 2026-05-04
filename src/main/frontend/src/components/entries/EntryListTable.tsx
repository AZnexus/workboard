import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PRIORITY_CONFIG } from "@/lib/priorities"
import type { Entry } from "@/types"
import { EntryOpenSheetAction } from "./EntryOpenSheetAction"
import { TableActionGroup } from "@/components/list/TableActionGroup"

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
          <TableHead className="text-right">Accions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="w-[110px] whitespace-nowrap">{TYPE_LABELS[entry.type]}</TableCell>
            <TableCell className="min-w-0 max-w-[42ch]">
              <div className="flex flex-col gap-1">
                <span className="truncate font-medium text-foreground" title={entry.title}>{entry.title}</span>
                {entry.body ? <span className="max-w-[32ch] truncate text-sm text-muted-foreground">{entry.body}</span> : null}
              </div>
            </TableCell>
            <TableCell className="max-w-[28ch]">
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
            <TableCell className="whitespace-nowrap">{entry.status}</TableCell>
            <TableCell className="whitespace-nowrap">{entry.priority ? PRIORITY_CONFIG[entry.priority]?.label ?? "-" : "-"}</TableCell>
            <TableCell className="whitespace-nowrap">{entry.date}</TableCell>
            <TableCell>
              <TableActionGroup className="ml-auto">
                <EntryOpenSheetAction entry={entry} />
              </TableActionGroup>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
