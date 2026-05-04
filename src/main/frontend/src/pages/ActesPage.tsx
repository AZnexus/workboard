import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { CheckSquare, Circle, CircleCheck, Copy, Loader, Pin, Users, XCircle } from "lucide-react"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/useDebounce"
import { useEntries, useCreateEntry } from "@/hooks/useEntries"
import { useTags } from "@/hooks/useTags"
import { PageHeader } from "@/components/layout/PageHeader"
import { ListToolbar } from "@/components/list/ListToolbar"
import { ListPagination } from "@/components/list/ListPagination"
import { ListContainer } from "@/components/list/ListContainer"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagMultiSelect } from "@/components/entries/TagMultiSelect"
import { cleanSearchParams, updatePageOnListStateChange } from "@/lib/list-state/listState"
import type { ListView } from "@/components/list/list-view"
import type { Entry } from "@/types"
import { cn } from "@/lib/utils"
import { TableActionGroup } from "@/components/list/TableActionGroup"

const STATUS_CONFIG = {
  OPEN: { label: "Obert", icon: Circle, bgClass: "bg-data-info/15", textClass: "text-data-info", borderClass: "border-data-info/30" },
  IN_PROGRESS: {
    label: "En Curs",
    icon: Loader,
    bgClass: "bg-data-warning/15",
    textClass: "text-data-warning",
    borderClass: "border-data-warning/30",
  },
  PAUSED: { label: "Pausat", icon: Circle, bgClass: "bg-data-warning/15", textClass: "text-data-warning", borderClass: "border-data-warning/30" },
  DONE: { label: "Fet", icon: CircleCheck, bgClass: "bg-data-positive/15", textClass: "text-data-positive", borderClass: "border-data-positive/30" },
  CANCELLED: {
    label: "Cancel·lat",
    icon: XCircle,
    bgClass: "bg-data-negative/15",
    textClass: "text-data-negative",
    borderClass: "border-data-negative/30",
  },
} as const

type ActesSort = "date" | "title-asc" | "title-desc" | "status"

interface ActesListState {
  view: ListView
  q: string
  page: number
  pageSize: number
  sort: ActesSort
  tagId: number | null
}

const DEFAULT_ACTES_LIST_STATE: ActesListState = {
  view: "table",
  q: "",
  page: 1,
  pageSize: 10,
  sort: "date",
  tagId: null,
}

function parseActesListState(searchParams: URLSearchParams): ActesListState {
  const rawPage = Number(searchParams.get("page") ?? DEFAULT_ACTES_LIST_STATE.page)
  const rawPageSize = Number(searchParams.get("pageSize") ?? DEFAULT_ACTES_LIST_STATE.pageSize)
  const sortParam = searchParams.get("sort")
  const rawTagId = Number(searchParams.get("tagId"))

  return {
    view: searchParams.get("view") === "cards" ? "cards" : "table",
    q: searchParams.get("q") ?? "",
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: rawPageSize === 10 || rawPageSize === 20 || rawPageSize === 50 || rawPageSize === 100 ? rawPageSize : DEFAULT_ACTES_LIST_STATE.pageSize,
    sort:
      sortParam === "title-asc" ||
      sortParam === "title-desc" ||
      sortParam === "status" ||
      sortParam === "date"
        ? sortParam
        : "date",
    tagId: Number.isFinite(rawTagId) && rawTagId > 0 ? rawTagId : null,
  }
}

function stringifyActesListState(state: ActesListState): URLSearchParams {
  return cleanSearchParams(state, {
    defaults: DEFAULT_ACTES_LIST_STATE,
  })
}

function sortEntries(entries: Entry[], sort: ActesSort): Entry[] {
  const sorted = [...entries]
  switch (sort) {
    case "date":
      return sorted.sort((a, b) => {
        const byDate = b.date.localeCompare(a.date)
        if (byDate !== 0) return byDate
        return b.updated_at.localeCompare(a.updated_at)
      })
    case "title-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title, "ca"))
    case "title-desc":
      return sorted.sort((a, b) => b.title.localeCompare(a.title, "ca"))
    case "status":
      return sorted.sort((a, b) => a.status.localeCompare(b.status))
    default:
      return sorted
  }
}

function getBodyPreview(body: string | null): string {
  if (!body) return ""
  const cleanText = body.replace(/^[#\-*]+\s/gm, "").replace(/\[[ xX]\]\s/g, "").replace(/\r?\n/g, " ").trim()
  return cleanText.length > 100 ? `${cleanText.slice(0, 100)}...` : cleanText
}

function getActionStats(body: string | null): { total: number; completed: number } | null {
  if (!body) return null
  const matches = body.match(/\[([ xX])\]/g)
  if (!matches) return null
  const total = matches.length
  const completed = matches.filter((item) => item.includes("x") || item.includes("X")).length
  return { total, completed }
}

function ActaCard({ entry, onDuplicate }: { entry: Entry; onDuplicate: (entry: Entry) => void }) {
  const navigate = useNavigate()
  const config = STATUS_CONFIG[entry.status] || STATUS_CONFIG.OPEN
  const preview = getBodyPreview(entry.body)
  const actionStats = getActionStats(entry.body)

  return (
    <Card onClick={() => navigate(`/actes/${entry.id}`)} className="group cursor-pointer bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-full">
        <CardContent className="flex flex-1 items-center gap-3 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-px text-xs font-medium", config.bgClass, config.textClass, config.borderClass)}>
                <config.icon size={11} className={cn(entry.status === "IN_PROGRESS" && "animate-spin")} />
                {config.label}
              </span>
              {entry.pinned ? <Pin size={11} className="fill-primary/20 text-primary" /> : null}
              {entry.tags.map((tag) => (
                <Badge key={tag.id ?? tag.name} variant="secondary" className="uppercase tracking-wider">
                  {tag.name}
                </Badge>
              ))}
            </div>

            <h3 className={cn("text-sm font-medium leading-tight text-foreground", entry.status === "DONE" && "line-through text-muted-foreground")}>
              {entry.title}
            </h3>

            {preview ? <p className="mt-1 truncate text-xs text-muted-foreground">{preview}</p> : null}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="whitespace-nowrap text-xs text-muted-foreground">{entry.date}</span>
            {actionStats && actionStats.total > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-sm bg-muted/50 px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                <CheckSquare size={10} />
                {actionStats.completed}/{actionStats.total}
              </span>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Duplicar"
              className="mt-auto h-6 w-6 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation()
                onDuplicate(entry)
              }}
            >
              <Copy />
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export function ActesPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const parsedState = useMemo(() => parseActesListState(searchParams), [searchParams])
  const [search, setSearch] = useState(parsedState.q)
  const [filtersOpen, setFiltersOpen] = useState(() => parsedState.tagId != null || parsedState.sort !== "date")

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setSearch(parsedState.q)
  }, [parsedState.q])

  useEffect(() => {
    if (parsedState.tagId != null || parsedState.sort !== DEFAULT_ACTES_LIST_STATE.sort) {
      setFiltersOpen(true)
    }
  }, [parsedState.sort, parsedState.tagId])

  const updateState = (partial: Partial<ActesListState>) => {
    const next = {
      ...parsedState,
      ...partial,
    }

    const nextWithPage = {
      ...next,
      page: partial.page ?? updatePageOnListStateChange(parsedState, next),
    }

    setSearchParams(stringifyActesListState(nextWithPage), { replace: true })
  }

  useEffect(() => {
    if (debouncedSearch !== parsedState.q) {
      updateState({ q: debouncedSearch })
    }
  }, [debouncedSearch, parsedState.q])

  const { data: tagsData = [] } = useTags()
  const selectedTagName = parsedState.tagId != null ? tagsData.find((tag) => tag.id === parsedState.tagId)?.name : undefined

  const { data, isLoading } = useEntries({
    type: "MEETING_NOTE",
    q: parsedState.q || undefined,
    tag: selectedTagName,
    size: 500,
  })

  const { mutateAsync: createEntry } = useCreateEntry()

  const entries = useMemo(() => sortEntries(data?.data ?? [], parsedState.sort), [data?.data, parsedState.sort])

  const totalPages = Math.max(1, Math.ceil(entries.length / parsedState.pageSize))
  const page = Math.min(parsedState.page, totalPages)
  const pageStart = (page - 1) * parsedState.pageSize
  const pagedEntries = entries.slice(pageStart, pageStart + parsedState.pageSize)

  useEffect(() => {
    if (page !== parsedState.page) {
      updateState({ page })
    }
  }, [page, parsedState.page])

  const handleDuplicate = async (entry: Entry) => {
    try {
      await createEntry({
        type: "MEETING_NOTE",
        title: `${entry.title} (còpia)`,
        body: entry.body ?? "",
        date: new Date().toISOString().split("T")[0],
        tagIds: entry.tags.map((tag) => tag.id).filter((id): id is number => id != null),
      })
      toast.success("Acta duplicada", { duration: 2500 })
    } catch {
      toast.error("Error al duplicar l'acta")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Actes de Reunió"
        description="Gestió i seguiment de les teves actes de reunió. Filtra i ordena ràpidament."
      />

      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        filtersOpen={filtersOpen}
        onFiltersToggle={() => setFiltersOpen((value) => !value)}
        view={parsedState.view}
        onViewChange={(view) => updateState({ view })}
        filtersPanelId="actes-list-filters"
        filtersContent={
          <div className="grid gap-3 lg:grid-cols-[260px_200px]">
            <div className="space-y-2">
              <label htmlFor="actes-tags" className="text-xs font-medium text-muted-foreground">
                Etiquetes
              </label>
              <div className="rounded-md bg-background">
                <TagMultiSelect
                  inputId="actes-tags"
                  inputAriaLabel="Etiquetes"
                  selectedIds={parsedState.tagId != null ? [parsedState.tagId] : []}
                  onChange={(ids) => updateState({ tagId: ids[0] ?? null })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="actes-sort" className="text-xs font-medium text-muted-foreground">
                Ordenar per
              </label>
              <Select value={parsedState.sort} onValueChange={(value) => updateState({ sort: value as ActesSort })}>
                <SelectTrigger id="actes-sort" aria-label="Ordenar per" className="h-10 w-full bg-background text-sm">
                  <SelectValue placeholder="Ordenar per..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Data</SelectItem>
                  <SelectItem value="title-asc">Títol (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Títol (Z-A)</SelectItem>
                  <SelectItem value="status">Estat</SelectItem>
                </SelectContent>
              </Select>
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
          Cap acta de reunió. Crea la primera!
        </div>
      ) : (
        <ListContainer
          footer={
            <ListPagination
              page={page}
              totalPages={totalPages}
              totalItems={entries.length}
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
                  <TableHead>Etiquetes</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Accions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="max-w-[42ch]">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-foreground">{entry.title}</span>
                        {entry.body ? <span className="truncate text-sm text-muted-foreground">{getBodyPreview(entry.body)}</span> : null}
                      </div>
                    </TableCell>
                    <TableCell>{STATUS_CONFIG[entry.status]?.label ?? entry.status}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.length > 0 ? (
                          entry.tags.map((tag) => (
                            <Badge key={tag.id ?? tag.name} variant="secondary" className="uppercase tracking-wider">
                              {tag.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>
                      <TableActionGroup className="ml-auto">
                        <Button type="button" variant="outline" size="sm" onClick={() => navigate(`/actes/${entry.id}`)}>
                          Obrir
                        </Button>
                        <Button type="button" variant="outline" size="sm" aria-label="Duplicar" onClick={() => handleDuplicate(entry)}>
                          <Copy data-icon="inline-start" />
                          Duplicar
                        </Button>
                      </TableActionGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-2 p-4 md:p-6">
              {pagedEntries.map((entry) => (
                <ActaCard key={entry.id} entry={entry} onDuplicate={handleDuplicate} />
              ))}
            </div>
          )}
        </ListContainer>
      )}
    </div>
  )
}
