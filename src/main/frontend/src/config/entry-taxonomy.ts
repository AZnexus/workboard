import type { ComponentType } from "react"
import type { EntryStatus, EntryType } from "@/types"
import {
  Bell,
  CheckSquare,
  Circle,
  CircleCheck,
  FileText,
  Loader,
  Pause,
  Users,
  XCircle,
} from "lucide-react"

type EntryTypeIcon = ComponentType<{ size?: number; className?: string }>
type EntryStatusIcon = ComponentType<{ size?: number; className?: string }>

type EntryOption<TValue extends string> = {
  value: TValue
  label: string
}

type EntryFilterOption<TValue extends string> = {
  value: TValue | "all"
  label: string
}

export const ENTRY_TYPE_CONFIG: Record<EntryType, {
  color: string
  textColor: string
  icon: EntryTypeIcon
  label: string
}> = {
  TASK: { color: "border-data-info", textColor: "text-data-info", icon: CheckSquare, label: "Tasca" },
  NOTE: { color: "border-data-neutral", textColor: "text-data-neutral", icon: FileText, label: "Nota" },
  MEETING_NOTE: { color: "border-accent-primary", textColor: "text-accent-primary", icon: Users, label: "Reunió" },
  REMINDER: { color: "border-data-warning", textColor: "text-data-warning", icon: Bell, label: "Recordatori" },
}

export const ENTRY_FORM_TYPE_OPTIONS: Array<EntryOption<Extract<EntryType, "TASK" | "NOTE">>> = [
  { value: "TASK", label: ENTRY_TYPE_CONFIG.TASK.label },
  { value: "NOTE", label: ENTRY_TYPE_CONFIG.NOTE.label },
]

export function getEntryEditableTypeOptions(type: EntryType) {
  if (type === "TASK" || type === "NOTE") {
    return ENTRY_FORM_TYPE_OPTIONS
  }

  return []
}

export const ENTRY_TYPE_FILTER_OPTIONS: Array<EntryFilterOption<EntryType>> = [
  { value: "all", label: "Tots" },
  { value: "TASK", label: ENTRY_TYPE_CONFIG.TASK.label },
  { value: "NOTE", label: ENTRY_TYPE_CONFIG.NOTE.label },
  { value: "MEETING_NOTE", label: ENTRY_TYPE_CONFIG.MEETING_NOTE.label },
  { value: "REMINDER", label: ENTRY_TYPE_CONFIG.REMINDER.label },
]

export const NOTE_QUICK_CAPTURE_TYPE_OPTIONS: Array<EntryOption<Extract<EntryType, "REMINDER" | "NOTE">>> = [
  { value: "REMINDER", label: ENTRY_TYPE_CONFIG.REMINDER.label },
  { value: "NOTE", label: "Nota ràpida" },
]

export const ENTRY_STATUS_CONFIG: Record<EntryStatus, {
  label: string
  icon: EntryStatusIcon
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
  icon: EntryStatusIcon
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

export const ENTRY_FORM_STATUS_OPTIONS: Array<EntryOption<EntryStatus>> = [
  { value: "OPEN", label: ENTRY_STATUS_CONFIG.OPEN.label },
  { value: "IN_PROGRESS", label: ENTRY_STATUS_CONFIG.IN_PROGRESS.label },
  { value: "PAUSED", label: ENTRY_STATUS_CONFIG.PAUSED.label },
  { value: "DONE", label: ENTRY_STATUS_CONFIG.DONE.label },
  { value: "CANCELLED", label: ENTRY_STATUS_CONFIG.CANCELLED.label },
]

export const NOTE_ENTRY_FORM_STATUS_OPTIONS: Array<EntryOption<EntryStatus>> = [
  { value: "OPEN", label: ENTRY_STATUS_CONFIG.OPEN.label },
  { value: "IN_PROGRESS", label: ENTRY_STATUS_CONFIG.IN_PROGRESS.label },
  { value: "PAUSED", label: ENTRY_STATUS_CONFIG.PAUSED.label },
  { value: "DONE", label: NOTE_STATUS_CONFIG.DONE.label },
  { value: "CANCELLED", label: NOTE_STATUS_CONFIG.CANCELLED.label },
]

export const ENTRY_STATUS_FILTER_OPTIONS: Array<EntryFilterOption<EntryStatus>> = [
  { value: "all", label: "Tots" },
  { value: "OPEN", label: "Oberts" },
  { value: "IN_PROGRESS", label: ENTRY_STATUS_CONFIG.IN_PROGRESS.label },
  { value: "PAUSED", label: "Pausats" },
  { value: "DONE", label: "Fets" },
  { value: "CANCELLED", label: "Cancel·lats" },
]

export type EntryStatusVariant = "default" | "note"

export function getEntryStatusConfig(status: EntryStatus, variant: EntryStatusVariant = "default") {
  return variant === "note" ? NOTE_STATUS_CONFIG[status] : ENTRY_STATUS_CONFIG[status]
}

export function getEntryFormTitle(type: EntryType, isEditing: boolean, fixedType = false) {
  if (isEditing) {
    if (type === "TASK") return "Editar Tasca"
    if (type === "NOTE") return "Editar Nota"
    return "Editar Entrada"
  }

  if (fixedType && type === "TASK") return "Nova Tasca"
  if (fixedType && type === "NOTE") return "Nova Nota"
  return "Nova Entrada"
}

export function getEntryFormStatusOptions(type: EntryType) {
  return type === "NOTE" ? NOTE_ENTRY_FORM_STATUS_OPTIONS : ENTRY_FORM_STATUS_OPTIONS
}

export function getGlobalCreateDialogTitle(type: EntryType) {
  if (type === "TASK") return "Nova Tasca"
  if (type === "NOTE") return "Nova Nota"
  return `Nova ${ENTRY_TYPE_CONFIG[type].label}`
}

export function getGlobalCreateDialogDescription(type: EntryType) {
  if (type === "TASK") return "Formulari per crear una nova tasca."
  if (type === "NOTE") return "Formulari per crear una nova nota."
  return `Formulari per crear una nova ${ENTRY_TYPE_CONFIG[type].label.toLowerCase()}.`
}
