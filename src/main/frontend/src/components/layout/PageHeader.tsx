import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
  icon: LucideIcon
  title: string
  description?: string
  date?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({
  icon: Icon,
  title,
  description,
  date,
  children,
  className
}: PageHeaderProps) {
  return (
    <div className={cn("bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6", className)}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0" data-testid="page-header-icon">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex flex-col gap-1 md:flex-row md:items-baseline md:gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            {date && (
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-muted-foreground text-2xl hidden md:inline">·</span>
                <span className="text-lg md:text-xl font-normal text-muted-foreground capitalize truncate">{date}</span>
              </div>
            )}
          </div>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          {children}
        </div>
      )}
    </div>
  )
}
