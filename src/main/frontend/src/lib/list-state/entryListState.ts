import type { EntryStatus, EntryType } from "@/types"
import { cleanSearchParams } from "./listState"
import { ENTRY_PRIORITY_OPTIONS } from "@/components/entries/entry-filter-options"
import type { ListView } from "@/components/list/list-view"

export type EntryListView = ListView

export interface EntryListUrlState {
  view: EntryListView
  q: string
  page: number
  pageSize: number
  status: EntryStatus | "all"
  type: EntryType | "all"
  dateFrom: string
  dateTo: string
  tag: string
  pinned: boolean
  priority: string
}

export const DEFAULT_ENTRY_LIST_STATE: EntryListUrlState = {
  view: "table",
  q: "",
  page: 1,
  pageSize: 20,
  status: "all",
  type: "all",
  dateFrom: "",
  dateTo: "",
  tag: "",
  pinned: false,
  priority: "all",
}

const ALLOWED_STATUSES: Array<EntryStatus | "all"> = [
  "all",
  "OPEN",
  "IN_PROGRESS",
  "PAUSED",
  "DONE",
  "CANCELLED",
]

const ALLOWED_TYPES: Array<EntryType | "all"> = ["all", "TASK", "NOTE", "MEETING_NOTE", "REMINDER"]

function isValidStatus(value: string | null): value is EntryStatus | "all" {
  return Boolean(value && ALLOWED_STATUSES.includes(value as EntryStatus | "all"))
}

function isValidType(value: string | null): value is EntryType | "all" {
  return Boolean(value && ALLOWED_TYPES.includes(value as EntryType | "all"))
}

function isValidPriority(value: string | null): value is string {
  return Boolean(value && ENTRY_PRIORITY_OPTIONS.includes(value as (typeof ENTRY_PRIORITY_OPTIONS)[number]))
}

export function parseEntryListState(searchParams: URLSearchParams): EntryListUrlState {
  const rawPage = Number(searchParams.get("page") ?? DEFAULT_ENTRY_LIST_STATE.page)
  const rawPageSize = Number(searchParams.get("pageSize") ?? DEFAULT_ENTRY_LIST_STATE.pageSize)
  const statusParam = searchParams.get("status")
  const typeParam = searchParams.get("type")
  const priorityParam = searchParams.get("priority")

  return {
    view: searchParams.get("view") === "cards" ? "cards" : "table",
    q: searchParams.get("q") ?? "",
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: rawPageSize === 10 || rawPageSize === 20 || rawPageSize === 50 || rawPageSize === 100 ? rawPageSize : DEFAULT_ENTRY_LIST_STATE.pageSize,
    status: isValidStatus(statusParam) ? statusParam : DEFAULT_ENTRY_LIST_STATE.status,
    type: isValidType(typeParam) ? typeParam : DEFAULT_ENTRY_LIST_STATE.type,
    dateFrom: searchParams.get("dateFrom") ?? "",
    dateTo: searchParams.get("dateTo") ?? "",
    tag: searchParams.get("tag") ?? "",
    pinned: searchParams.get("pinned") === "true",
    priority: isValidPriority(priorityParam) ? priorityParam : DEFAULT_ENTRY_LIST_STATE.priority,
  }
}

export function stringifyEntryListState(state: EntryListUrlState): URLSearchParams {
  return cleanSearchParams(state, { defaults: DEFAULT_ENTRY_LIST_STATE })
}
