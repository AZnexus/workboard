import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useEntries } from "@/hooks/useEntries"
import { EntryFilters } from "./EntryFilters"
import { EntryCard } from "./EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"
import type { Entry } from "@/types"

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getTime() === today.getTime()) return "Avui"
  if (date.getTime() === yesterday.getTime()) return "Ahir"
  return date.toLocaleDateString("ca-ES", { weekday: "long", day: "numeric", month: "long" })
}

function groupByDate(entries: Entry[]): [string, Entry[]][] {
  const groups: Record<string, Entry[]> = {}
  for (const entry of entries) {
    const key = entry.date
    if (!groups[key]) groups[key] = []
    groups[key].push(entry)
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

export function EntryList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get("q") || ""

  const [status, setStatus] = useState("all")
  const [type, setType] = useState("all")
  const [search, setSearch] = useState(initialQ)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [tag, setTag] = useState("")
  const [pinned, setPinned] = useState(false)
  const [priority, setPriority] = useState("all")
  const [page, setPage] = useState(0)

  const debouncedSearch = useDebounce(search, 300)
  const debouncedTag = useDebounce(tag, 300)

  useEffect(() => {
    setPage(0)
  }, [status, type, debouncedSearch, dateFrom, dateTo, debouncedTag, pinned, priority])

  const { data, isLoading } = useEntries({
    status: (status !== "all" ? status : undefined) as any,
    type: (type !== "all" ? type : undefined) as any,
    q: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    tag: debouncedTag || undefined,
    pinned: pinned ? true : undefined,
    priority: priority !== "all" ? Number(priority) : undefined,
    page,
    size: 50
  })

  useEffect(() => {
    if (initialQ && debouncedSearch === "") {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete("q")
      setSearchParams(newParams)
    }
  }, [debouncedSearch, initialQ, searchParams, setSearchParams])

  const totalPages = data?.meta?.totalPages || 0
  const currentPage = data?.meta?.page || 0
  const entries = data?.data || []
  const dateGroups = groupByDate(entries)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Totes les Entrades</h1>
      </div>

      <EntryFilters
        status={status} setStatus={setStatus}
        type={type} setType={setType}
        search={search} setSearch={setSearch}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        tag={tag} setTag={setTag}
        pinned={pinned} setPinned={setPinned}
        priority={priority} setPriority={setPriority}
      />

      {isLoading ? (
        <div className="space-y-4">
{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-md" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 border border-dashed border-border rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div className="text-center">
            <p className="text-lg font-medium text-muted-foreground">Cap resultat</p>
            <p className="text-sm text-muted-foreground/70 mt-1">No hi ha cap entrada que coincideixi amb els filtres</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {dateGroups.map(([date, groupEntries]) => (
            <div key={date} className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {formatGroupDate(date)}
                </h2>
                <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                  {groupEntries.length}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupEntries.map(entry => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                Anterior
              </Button>
              <div className="text-sm text-muted-foreground">
                Pàgina {currentPage + 1} de {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Següent
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
