import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Archive, FileText, Inbox, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"
import { useDebounce } from "@/hooks/useDebounce"
import { useEntries, useUpdateEntry } from "@/hooks/useEntries"
import { EntryCard } from "@/components/entries/EntryCard"
import { ListToolbar } from "@/components/list/ListToolbar"
import { ListPagination } from "@/components/list/ListPagination"
import type { ListView } from "@/components/list/list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cleanSearchParams, updatePageOnListStateChange } from "@/lib/list-state/listState"
import type { Entry, UpdateEntryRequest } from "@/types"

type NotesScope = "active" | "archived"

interface NotesListState {
  view: ListView
  q: string
  page: number
  pageSize: number
  scope: NotesScope
}

const DEFAULT_NOTES_LIST_STATE: NotesListState = {
  view: "table",
  q: "",
  page: 1,
  pageSize: 20,
  scope: "active",
}

function parseNotesListState(searchParams: URLSearchParams): NotesListState {
  const rawPage = Number(searchParams.get("page") ?? DEFAULT_NOTES_LIST_STATE.page)
  const rawPageSize = Number(searchParams.get("pageSize") ?? DEFAULT_NOTES_LIST_STATE.pageSize)
  const scopeParam = searchParams.get("scope")

  return {
    view: searchParams.get("view") === "cards" ? "cards" : "table",
    q: searchParams.get("q") ?? "",
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: rawPageSize === 10 || rawPageSize === 20 || rawPageSize === 50 || rawPageSize === 100 ? rawPageSize : DEFAULT_NOTES_LIST_STATE.pageSize,
    scope: scopeParam === "archived" ? "archived" : "active",
  }
}

function stringifyNotesListState(state: NotesListState): URLSearchParams {
  return cleanSearchParams(state, { defaults: DEFAULT_NOTES_LIST_STATE })
}

function isArchived(entry: Entry): boolean {
  return entry.status === "DONE" || entry.status === "CANCELLED"
}

export function NotesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const parsedState = useMemo(() => parseNotesListState(searchParams), [searchParams])
  const [search, setSearch] = useState(parsedState.q)
  const [filtersOpen, setFiltersOpen] = useState(() => parsedState.scope !== DEFAULT_NOTES_LIST_STATE.scope)
  const updateEntry = useUpdateEntry()

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setSearch(parsedState.q)
  }, [parsedState.q])

  useEffect(() => {
    if (parsedState.scope !== DEFAULT_NOTES_LIST_STATE.scope) {
      setFiltersOpen(true)
    }
  }, [parsedState.scope])

  const updateState = (partial: Partial<NotesListState>) => {
    const next = {
      ...parsedState,
      ...partial,
    }

    const nextWithPage = {
      ...next,
      page: partial.page ?? updatePageOnListStateChange(parsedState, next),
    }

    setSearchParams(stringifyNotesListState(nextWithPage), { replace: true })
  }

  useEffect(() => {
    if (debouncedSearch !== parsedState.q) {
      updateState({ q: debouncedSearch })
    }
  }, [debouncedSearch, parsedState.q])

  const { data, isLoading } = useEntries({
    type: "NOTE",
    q: parsedState.q || undefined,
    size: 500,
  })

  const entries = data?.data ?? []
  const scopedEntries = useMemo(
    () => entries.filter((entry) => (parsedState.scope === "archived" ? isArchived(entry) : !isArchived(entry))),
    [entries, parsedState.scope],
  )

  const totalPages = Math.max(1, Math.ceil(scopedEntries.length / parsedState.pageSize))
  const page = Math.min(parsedState.page, totalPages)
  const pageStart = (page - 1) * parsedState.pageSize
  const pagedEntries = scopedEntries.slice(pageStart, pageStart + parsedState.pageSize)

  useEffect(() => {
    if (page !== parsedState.page) {
      updateState({ page })
    }
  }, [page, parsedState.page])

  const showArchived = parsedState.scope === "archived"

  const handleConvert = (entry: Entry) => {
    const body = { type: "TASK", status: "OPEN" } satisfies UpdateEntryRequest
    updateEntry.mutate(
      { id: entry.id, body },
      {
        onSuccess: () => toast.success("Convertida a tasca"),
      },
    )
  }

  const handleArchiveToggle = (entry: Entry) => {
    const body = { status: showArchived ? "OPEN" : "DONE" } satisfies UpdateEntryRequest
    updateEntry.mutate({ id: entry.id, body })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileText}
        title="Notes"
        description="Apunts ràpids, idees i referències que no necessiten una data de venciment."
      />

      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        filtersOpen={filtersOpen}
        onFiltersToggle={() => setFiltersOpen((value) => !value)}
        view={parsedState.view}
        onViewChange={(view) => updateState({ view })}
        filtersPanelId="notes-list-filters"
      />

      {filtersOpen ? (
        <div id="notes-list-filters" className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Estat</p>
          <div className="flex gap-2">
            <Button
              type="button"
              aria-pressed={!showArchived}
              variant={!showArchived ? "default" : "outline"}
              size="sm"
              onClick={() => updateState({ scope: "active" })}
            >
              Actives
            </Button>
            <Button
              type="button"
              aria-pressed={showArchived}
              variant={showArchived ? "default" : "outline"}
              size="sm"
              onClick={() => updateState({ scope: "archived" })}
            >
              Arxivades
            </Button>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : pagedEntries.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-16 text-center text-muted-foreground">
          {showArchived ? "Cap nota arxivada." : "Cap nota activa. Crea la primera!"}
        </div>
      ) : (
        <>
          {parsedState.view === "table" ? (
            <div className="rounded-xl border border-border bg-surface-1 p-2 shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Títol</TableHead>
                    <TableHead>Estat</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Accions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="max-w-[44ch]">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-foreground">{entry.title}</span>
                          {entry.body ? <span className="truncate text-sm text-muted-foreground">{entry.body}</span> : null}
                        </div>
                      </TableCell>
                      <TableCell>{entry.status}</TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {!showArchived ? (
                            <Button type="button" variant="outline" size="sm" onClick={() => handleConvert(entry)}>
                              <RefreshCw data-icon="inline-start" />
                              Convertir
                            </Button>
                          ) : null}
                          <Button type="button" variant="outline" size="sm" onClick={() => handleArchiveToggle(entry)}>
                            {showArchived ? <Inbox data-icon="inline-start" /> : <Archive data-icon="inline-start" />}
                            {showArchived ? "Activar" : "Arxivar"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="space-y-4">
              {pagedEntries.map((entry) => (
                <div key={entry.id} className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <EntryCard entry={entry} columnContext="default" hideType />
                  </div>
                  {!showArchived ? (
                    <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => handleConvert(entry)}>
                      <RefreshCw data-icon="inline-start" />
                      Convertir
                    </Button>
                  ) : null}
                  <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => handleArchiveToggle(entry)}>
                    {showArchived ? <Inbox data-icon="inline-start" /> : <Archive data-icon="inline-start" />}
                    {showArchived ? "Activar" : "Arxivar"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <ListPagination
            page={page}
            totalPages={totalPages}
            totalItems={scopedEntries.length}
            pageSize={parsedState.pageSize}
            onPageSizeChange={(pageSize) => updateState({ pageSize, page: 1 })}
            onPageChange={(nextPage) => updateState({ page: nextPage })}
          />
        </>
      )}
    </div>
  )
}
