import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ListContainerProps {
  children: ReactNode
  footer?: ReactNode
  className?: string
  contentClassName?: string
}

export function ListContainer({ children, footer, className, contentClassName }: ListContainerProps) {
  return (
    <section className={cn("overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm", className)}>
      <div className={cn("min-w-0", contentClassName)}>{children}</div>
      {footer ? <div className="border-t border-border/70 bg-surface-2/20 px-4 py-3 md:px-6">{footer}</div> : null}
    </section>
  )
}
