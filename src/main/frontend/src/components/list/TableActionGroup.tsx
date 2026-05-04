import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

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
