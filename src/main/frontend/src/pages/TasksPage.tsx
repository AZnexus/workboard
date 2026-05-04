import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { CheckSquare } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { EntryCard } from "@/components/entries/EntryCard"
import { useEntries } from "@/hooks/useEntries"
import { useDebounce } from "@/hooks/useDebounce"
import { ListToolbar } from "@/components/list/ListToolbar"
import { ListPagination } from "@/components/list/ListPagination"
import { ListContainer } from "@/components/list/ListContainer"
import type { ListView } from "@/components/list/list-view"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cleanSearchParams, updatePageOnListStateChange } from "@/lib/list-state/listState"
import { PRIORITY_CONFIG } from "@/lib/priorities"
import type { Entry } from "@/types"
import { EntryOpenSheetAction } from "@/components/entries/EntryOpenSheetAction"
import { TableActionGroup } from "@/components/list/TableActionGroup"
import { EntryStatusBadge } from "@/components/entries/entry-status"

type TaskScope = "active" | "closed"

interface TasksListState {
  view: ListView
  q: string
  page: number
  pageSize: number
  scope: TaskScope
}

const DEFAULT_TASKS_LIST_STATE: TasksListState = {
  view: "table",
  q: "",
  page: 1,
  pageSize: 10,
  scope: "active",
}

function parseTasksListState(searchParams: URLSearchParams): TasksListState {
  const rawPage = Number(searchParams.get("page") ?? DEFAULT_TASKS_LIST_STATE.page)
  const rawPageSize = Number(searchParams.get("pageSize") ?? DEFAULT_TASKS_LIST_STATE.pageSize)
  const scopeParam = searchParams.get("scope")

  return {
    view: searchParams.get("view") === "cards" ? "cards" : "table",
    q: searchParams.get("q") ?? "",
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: rawPageSize === 10 || rawPageSize === 20 || rawPageSize === 50 || rawPageSize === 100 ? rawPageSize : DEFAULT_TASKS_LIST_STATE.pageSize,
    scope: scopeParam === "closed" ? "closed" : "active",
  }
}

function stringifyTasksListState(state: TasksListState): URLSearchParams {
  return cleanSearchParams(state, { defaults: DEFAULT_TASKS_LIST_STATE })
}

function isEntryClosed(entry: Entry): boolean {
  return entry.status === "DONE" || entry.status === "CANCELLED"
}

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const parsedState = useMemo(() => parseTasksListState(searchParams), [searchParams])
  const [search, setSearch] = useState(parsedState.q)
  const [filtersOpen, setFiltersOpen] = useState(() => parsedState.scope !== DEFAULT_TASKS_LIST_STATE.scope)

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setSearch(parsedState.q)
  }, [parsedState.q])

  useEffect(() => {
    if (parsedState.scope !== DEFAULT_TASKS_LIST_STATE.scope) {
      setFiltersOpen(true)
    }
  }, [parsedState.scope])

  const updateState = (partial: Partial<TasksListState>) => {
    const next = {
      ...parsedState,
      ...partial,
    }

    const nextWithPage = {
      ...next,
      page: partial.page ?? updatePageOnListStateChange(parsedState, next),
    }

    setSearchParams(stringifyTasksListState(nextWithPage), { replace: true })
  }

  useEffect(() => {
    if (debouncedSearch !== parsedState.q) {
      updateState({ q: debouncedSearch })
    }
  }, [debouncedSearch, parsedState.q])

  const { data, isLoading } = useEntries({
    type: "TASK",
    q: parsedState.q || undefined,
    size: 500,
  })

  const entries = data?.data ?? []

  const scopedEntries = useMemo(() => {
    return entries.filter((entry) => {
      const closed = isEntryClosed(entry)
      return parsedState.scope === "closed" ? closed : !closed
    })
  }, [entries, parsedState.scope])

  const totalPages = Math.max(1, Math.ceil(scopedEntries.length / parsedState.pageSize))
  const page = Math.min(parsedState.page, totalPages)
  const pageStart = (page - 1) * parsedState.pageSize
  const pagedEntries = scopedEntries.slice(pageStart, pageStart + parsedState.pageSize)

  useEffect(() => {
    if (page !== parsedState.page) {
      updateState({ page })
    }
  }, [page, parsedState.page])

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CheckSquare}
        title="Tasques"
        description="Gestiona les teves tasques pendents i completades."
      />

      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        filtersOpen={filtersOpen}
        onFiltersToggle={() => setFiltersOpen((value) => !value)}
        view={parsedState.view}
        onViewChange={(view) => updateState({ view })}
        filtersPanelId="tasks-list-filters"
        filtersContent={
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Estat</p>
            <div className="flex gap-2">
              <Button
                type="button"
                aria-pressed={parsedState.scope === "active"}
                variant={parsedState.scope === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => updateState({ scope: "active" })}
              >
                Actives
              </Button>
              <Button
                type="button"
                aria-pressed={parsedState.scope === "closed"}
                variant={parsedState.scope === "closed" ? "default" : "outline"}
                size="sm"
                onClick={() => updateState({ scope: "closed" })}
              >
                Tancades
              </Button>
            </div>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : pagedEntries.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-16 text-center text-muted-foreground">
          {parsedState.scope === "closed" ? "Cap tasca tancada." : "Cap tasca activa. Crea la primera!"}
        </div>
      ) : (
        <ListContainer
          footer={
            <ListPagination
              page={page}
              totalPages={totalPages}
              totalItems={scopedEntries.length}
              pageSize={parsedState.pageSize}
              onPageSizeChange={(pageSize) => updateState({ pageSize, page: 1 })}
              onPageChange={(nextPage) => updateState({ page: nextPage })}
            />
          }
        >
          {parsedState.view === "table" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Títol</TableHead>
                  <TableHead>Estat</TableHead>
                  <TableHead>Prioritat</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Accions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="min-w-0 max-w-[44ch]">
                      <div className="flex flex-col gap-1">
                        <span className="truncate font-medium text-foreground" title={entry.title}>{entry.title}</span>
                        {entry.body ? <span className="truncate text-sm text-muted-foreground">{entry.body}</span> : null}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap"><EntryStatusBadge status={entry.status} /></TableCell>
                    <TableCell className="whitespace-nowrap">{entry.priority ? PRIORITY_CONFIG[entry.priority]?.label ?? "-" : "-"}</TableCell>
                    <TableCell className="whitespace-nowrap">{entry.date}</TableCell>
                    <TableCell>
                      <TableActionGroup className="ml-auto">
                        <EntryOpenSheetAction entry={entry} />
                      </TableActionGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-6">
              {pagedEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} columnContext="default" />
              ))}
            </div>
          )}
        </ListContainer>
      )}
    </div>
  )
}
