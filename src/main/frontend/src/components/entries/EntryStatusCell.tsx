import { TableCell } from "@/components/ui/table"
import type { EntryStatus } from "@/types"
import { EntryStatusBadge, type EntryStatusVariant } from "./entry-status"

interface EntryStatusCellProps {
  status: EntryStatus
  variant?: EntryStatusVariant
}

export function EntryStatusCell({ status, variant }: EntryStatusCellProps) {
  return (
    <TableCell className="whitespace-nowrap">
      <EntryStatusBadge status={status} variant={variant} />
    </TableCell>
  )
}
