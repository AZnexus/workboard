import type { Entry, EntryStatus } from "@/types"

function isClosedStatus(status: EntryStatus): boolean {
  return status === "DONE" || status === "CANCELLED"
}

export function isEntryClosed(entry: Pick<Entry, "status">): boolean {
  return isClosedStatus(entry.status)
}
