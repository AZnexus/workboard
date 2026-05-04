import { cn } from "@/lib/utils"
import type { EntryStatus } from "@/types"
import { getEntryStatusConfig, type EntryStatusVariant } from "@/config/entry-taxonomy"

export type { EntryStatusVariant } from "@/config/entry-taxonomy"

interface EntryStatusBadgeProps {
  status: EntryStatus
  className?: string
  variant?: EntryStatusVariant
}

export function EntryStatusBadge({ status, className, variant = "default" }: EntryStatusBadgeProps) {
  const config = getEntryStatusConfig(status, variant)
  const Icon = config.icon

  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex h-6 items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2 text-xs font-semibold normal-case tracking-normal",
        config.bgClass,
        config.textClass,
        config.borderClass,
        className,
      )}
    >
      <Icon size={11} className={cn(status === "IN_PROGRESS" && "animate-spin")} />
      {config.label}
    </span>
  )
}
