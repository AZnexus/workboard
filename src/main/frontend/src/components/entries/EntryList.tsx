import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useEntries } from "@/hooks/useEntries"
import { EntryFilters } from "./EntryFilters"
import { EntryCard } from "./EntryCard"
import { EntryListTable } from "./EntryListTable"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/hooks/useDebounce"
import { Database } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { ListToolbar } from "@/components/list/ListToolbar"
import { ListPagination } from "@/components/list/ListPagination"
import {
  parseEntryListState,
  stringifyEntryListState,
  type EntryListUrlState,
} from "@/lib/list-state/entryListState"
import { updatePageOnListStateChange } from "@/lib/list-state/listState"

function hasActiveFilters(state: EntryListUrlState): boolean {
  return (
    state.status !== "all" ||
    state.type !== "all" ||
    state.dateFrom !== "" ||
    state.dateTo !== "" ||
    state.tag !== "" ||
    state.pinned ||
    state.priority !== "all"
  )
}

export function EntryList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const parsedState = useMemo(() => parseEntryListState(searchParams), [searchParams])
  const [search, setSearch] = useState(parsedState.q)
  const [filtersOpen, setFiltersOpen] = useState(() => hasActiveFilters(parsedState))

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setSearch(parsedState.q)
  }, [parsedState.q])

  useEffect(() => {
    if (hasActiveFilters(parsedState)) {
      setFiltersOpen(true)
    }
  }, [parsedState])

  const updateState = (partial: Partial<EntryListUrlState>) => {
    const next = {
      ...parsedState,
      ...partial,
    }

    const nextWithPage = {
      ...next,
      page: partial.page ?? updatePageOnListStateChange(parsedState, next),
    }

    const nextParams = stringifyEntryListState(nextWithPage)
    setSearchParams(nextParams, { replace: true })
  }

  useEffect(() => {
    if (debouncedSearch !== parsedState.q) {
      updateState({ q: debouncedSearch })
    }
  }, [debouncedSearch, parsedState.q])

  const { data, isLoading } = useEntries({
    status: parsedState.status !== "all" ? parsedState.status : undefined,
    type: parsedState.type !== "all" ? parsedState.type : undefined,
    q: parsedState.q || undefined,
    dateFrom: parsedState.dateFrom || undefined,
    dateTo: parsedState.dateTo || undefined,
    tag: parsedState.tag || undefined,
    pinned: parsedState.pinned ? true : undefined,
    priority: parsedState.priority !== "all" ? Number(parsedState.priority) : undefined,
    page: Math.max(0, parsedState.page - 1),
    size: 50,
  })

  const totalPages = data?.meta?.totalPages || 0
  const currentPage = data?.meta?.page || 0
  const entries = data?.data || []

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={Database} 
        title="Registre" 
        description="Cerca, filtra i explora l'històric de totes les teves entrades."
      />

      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        filtersOpen={filtersOpen}
        onFiltersToggle={() => setFiltersOpen((value) => !value)}
        view={parsedState.view}
        onViewChange={(view) => updateState({ view })}
        filtersPanelId="entry-list-filters"
      />

      {filtersOpen ? (
        <EntryFilters
          id="entry-list-filters"
          status={parsedState.status}
          setStatus={(status) => updateState({ status })}
          type={parsedState.type}
          setType={(type) => updateState({ type })}
          search={search}
          setSearch={setSearch}
          dateFrom={parsedState.dateFrom}
          setDateFrom={(dateFrom) => updateState({ dateFrom })}
          dateTo={parsedState.dateTo}
          setDateTo={(dateTo) => updateState({ dateTo })}
          tag={parsedState.tag}
          setTag={(tag) => updateState({ tag })}
          pinned={parsedState.pinned}
          setPinned={(pinned) => updateState({ pinned })}
          priority={parsedState.priority}
          setPriority={(priority) => updateState({ priority })}
          compact
        />
      ) : null}

      {isLoading ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          </div>
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
          {parsedState.view === "table" ? (
            <EntryListTable entries={entries} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}

          <ListPagination
            page={currentPage + 1}
            totalPages={totalPages}
            onPageChange={(page) => updateState({ page })}
          />
        </div>
      )}
    </div>
  )
}
