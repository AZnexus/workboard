import { TableCell } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface EntryTitlePreviewCellProps {
  title: string
  preview?: string | null
  cellClassName?: string
  previewClassName?: string
}

export function EntryTitlePreviewCell({ title, preview, cellClassName, previewClassName }: EntryTitlePreviewCellProps) {
  const hasPreview = preview != null && preview.trim() !== ""

  return (
    <TableCell className={cn("min-w-0 max-w-[44ch]", cellClassName)}>
      <div data-slot="entry-title-preview-cell" className="flex flex-col gap-1">
        <span className="truncate font-medium text-foreground" title={title}>{title}</span>
        {hasPreview ? <span className={cn("truncate text-sm text-muted-foreground", previewClassName)}>{preview}</span> : null}
      </div>
    </TableCell>
  )
}
