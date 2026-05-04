import { cn } from "@/lib/utils"
import type { EntryStatus } from "@/types"
import { Circle, CircleCheck, Loader, Pause, XCircle } from "lucide-react"

export type EntryStatusVariant = "default" | "note"

export const ENTRY_STATUS_CONFIG: Record<EntryStatus, {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  bgClass: string
  textClass: string
  borderClass: string
}> = {
  OPEN: {
    label: "Nou",
    icon: Circle,
    bgClass: "bg-data-info/15",
    textClass: "text-data-info",
    borderClass: "border-data-info/30",
  },
  IN_PROGRESS: {
    label: "En Curs",
    icon: Loader,
    bgClass: "bg-data-positive/15",
    textClass: "text-data-positive",
    borderClass: "border-data-positive/30",
  },
  PAUSED: {
    label: "Pausada",
    icon: Pause,
    bgClass: "bg-data-warning/15",
    textClass: "text-data-warning",
    borderClass: "border-data-warning/30",
  },
  DONE: {
    label: "Fet",
    icon: CircleCheck,
    bgClass: "bg-data-positive/15",
    textClass: "text-data-positive",
    borderClass: "border-data-positive/30",
  },
  CANCELLED: {
    label: "Cancel·lat",
    icon: XCircle,
    bgClass: "bg-data-negative/15",
    textClass: "text-data-negative",
    borderClass: "border-data-negative/30",
  },
}

const NOTE_STATUS_CONFIG: Record<EntryStatus, {
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  bgClass: string
  textClass: string
  borderClass: string
}> = {
  ...ENTRY_STATUS_CONFIG,
  DONE: {
    label: "Arxivada",
    icon: CircleCheck,
    bgClass: "bg-data-neutral/15",
    textClass: "text-data-neutral",
    borderClass: "border-data-neutral/30",
  },
  CANCELLED: {
    label: "Arxivada",
    icon: XCircle,
    bgClass: "bg-data-neutral/15",
    textClass: "text-data-neutral",
    borderClass: "border-data-neutral/30",
  },
}

function getEntryStatusConfig(status: EntryStatus, variant: EntryStatusVariant) {
  return variant === "note" ? NOTE_STATUS_CONFIG[status] : ENTRY_STATUS_CONFIG[status]
}

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
