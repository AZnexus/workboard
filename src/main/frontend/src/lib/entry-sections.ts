import type { Entry } from '@/types'

export interface EntrySubsection {
  key: 'fixed' | 'regular'
  title: 'Fixades' | 'Sense fixar'
  count: number
  entries: Entry[]
}

const PRIORITY_FALLBACK = 99

function comparePriority(a: Entry, b: Entry) {
  return (a.priority ?? PRIORITY_FALLBACK) - (b.priority ?? PRIORITY_FALLBACK)
}

function compareDueDatePresence(a: Entry, b: Entry) {
  if (a.due_date && !b.due_date) return -1
  if (!a.due_date && b.due_date) return 1
  return 0
}

function compareDueDateValue(a: Entry, b: Entry) {
  if (!a.due_date || !b.due_date) return 0
  return a.due_date.localeCompare(b.due_date)
}

function compareCreatedAtDesc(a: Entry, b: Entry) {
  return b.created_at.localeCompare(a.created_at)
}

export function sortEntriesForPinnedSections(entries: Entry[]) {
  return [...entries].sort((a, b) => {
    const byPriority = comparePriority(a, b)
    if (byPriority !== 0) return byPriority

    const byDueDatePresence = compareDueDatePresence(a, b)
    if (byDueDatePresence !== 0) return byDueDatePresence

    const byDueDateValue = compareDueDateValue(a, b)
    if (byDueDateValue !== 0) return byDueDateValue

    return compareCreatedAtDesc(a, b)
  })
}

export function buildEntrySubsections(entries: Entry[]): EntrySubsection[] {
  const fixedEntries = sortEntriesForPinnedSections(entries.filter(entry => entry.pinned))
  const regularEntries = sortEntriesForPinnedSections(entries.filter(entry => !entry.pinned))

  const sections: EntrySubsection[] = []

  if (fixedEntries.length > 0) {
    sections.push({
      key: 'fixed',
      title: 'Fixades',
      count: fixedEntries.length,
      entries: fixedEntries,
    })
  }

  if (regularEntries.length > 0) {
    sections.push({
      key: 'regular',
      title: 'Sense fixar',
      count: regularEntries.length,
      entries: regularEntries,
    })
  }

  return sections
}
