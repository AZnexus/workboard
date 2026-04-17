import type { Entry } from "@/types"
import { EntryCard } from "@/components/entries/EntryCard"

export function PinnedEntries({ entries }: { entries: Entry[] }) {
  if (!entries || entries.length === 0) return null

  return (
    <div className="space-y-[12px]">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fixades</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px]">
        {entries.map(entry => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  )
}
