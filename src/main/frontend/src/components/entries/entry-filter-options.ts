import type { EntryStatus, EntryType } from "@/types"

export const ENTRY_STATUS_OPTIONS: Array<{ value: EntryStatus | "all"; label: string }> = [
  { value: "all", label: "Tots" },
  { value: "OPEN", label: "Oberts" },
  { value: "IN_PROGRESS", label: "En Curs" },
  { value: "PAUSED", label: "Pausats" },
  { value: "DONE", label: "Fets" },
  { value: "CANCELLED", label: "Cancel·lats" },
]

export const ENTRY_TYPE_OPTIONS: Array<{ value: EntryType | "all"; label: string }> = [
  { value: "all", label: "Tots" },
  { value: "TASK", label: "Tasca" },
  { value: "NOTE", label: "Nota" },
  { value: "MEETING_NOTE", label: "Reunió" },
  { value: "REMINDER", label: "Recordatori" },
]

export const ENTRY_PRIORITY_OPTIONS = ["all", "1", "2", "3", "4", "5"] as const
