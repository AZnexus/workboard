import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export const tableActionButtonClassName =
  "h-7 rounded-full px-2.5 text-xs font-medium text-muted-foreground shadow-none hover:bg-surface-2 hover:text-foreground focus-visible:bg-surface-2 focus-visible:text-foreground"

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
