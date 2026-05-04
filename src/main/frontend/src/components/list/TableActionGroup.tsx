import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export type TableActionIntent = "default" | "open" | "convert" | "archive" | "activate" | "duplicate" | "danger"

export const tableActionButtonClassName =
  "h-7 rounded-full px-2.5 text-xs font-medium text-muted-foreground shadow-none hover:shadow-none focus-visible:shadow-none"

const tableActionIntentClassNames: Record<TableActionIntent, string> = {
  default: "hover:bg-surface-2 hover:text-foreground focus-visible:bg-surface-2 focus-visible:text-foreground",
  open: "hover:bg-data-info/15 hover:text-data-info focus-visible:bg-data-info/15 focus-visible:text-data-info",
  convert: "hover:bg-accent-primary/15 hover:text-accent-primary focus-visible:bg-accent-primary/15 focus-visible:text-accent-primary",
  archive: "hover:bg-data-warning/15 hover:text-data-warning focus-visible:bg-data-warning/15 focus-visible:text-data-warning",
  activate: "hover:bg-data-positive/15 hover:text-data-positive focus-visible:bg-data-positive/15 focus-visible:text-data-positive",
  duplicate: "hover:bg-data-neutral/15 hover:text-data-neutral focus-visible:bg-data-neutral/15 focus-visible:text-data-neutral",
  danger: "hover:bg-data-negative/15 hover:text-data-negative focus-visible:bg-data-negative/15 focus-visible:text-data-negative",
}

export function tableActionIntentClassName(intent: TableActionIntent = "default") {
  return cn(tableActionButtonClassName, tableActionIntentClassNames[intent])
}

export function TableActionGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="table-action-group"
      className={cn(
        "inline-flex items-center justify-end rounded-full border border-border bg-background p-0.5 shadow-sm gap-0.5",
        className,
      )}
      {...props}
    />
  )
}
