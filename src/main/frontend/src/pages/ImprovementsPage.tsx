import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Lightbulb } from "lucide-react"

import { ImprovementFilters } from "@/components/improvements/ImprovementFilters"
import { ImprovementSummaryCard } from "@/components/improvements/ImprovementSummaryCard"
import { EntryTitlePreviewCell } from "@/components/list/EntryTitlePreviewCell"
import { ListContainer } from "@/components/list/ListContainer"
import { ListPagination } from "@/components/list/ListPagination"
import { ListToolbar } from "@/components/list/ListToolbar"
import type { ListView } from "@/components/list/list-view"
import { PageHeader } from "@/components/layout/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useImprovements } from "@/hooks/useImprovements"
import { useDebounce } from "@/hooks/useDebounce"
import { useTags } from "@/hooks/useTags"
import { useVersions } from "@/hooks/useVersions"
import { getImprovementStatusLabel, getValuationStatusLabel } from "@/config/improvement-taxonomy"
import { PRIORITY_CONFIG } from "@/lib/priorities"
import { cleanSearchParams, parseListPageSize, updatePageOnListStateChange } from "@/lib/list-state/listState"
import type { ImprovementStatus } from "@/types"

interface ImprovementsListState {
  view: ListView
  q: string
  status: ImprovementStatus | "all"
  priority: "all" | "1" | "2" | "3" | "4" | "5"
  versionId: "all" | string
  tag: string
  hasValuation: "all" | "with" | "without"
  completionFrom: string
  completionTo: string
  dueDateFrom: string
  dueDateTo: string
  page: number
  pageSize: number
}

const DEFAULT_IMPROVEMENTS_LIST_STATE: ImprovementsListState = {
  view: "table",
  q: "",
  status: "all",
  priority: "all",
  versionId: "all",
  tag: "",
  hasValuation: "all",
  completionFrom: "",
  completionTo: "",
  dueDateFrom: "",
  dueDateTo: "",
  page: 1,
  pageSize: 10,
}

function parseImprovementsListState(searchParams: URLSearchParams): ImprovementsListState {
  const rawPage = Number(searchParams.get("page") ?? DEFAULT_IMPROVEMENTS_LIST_STATE.page)
  const rawPageSize = Number(searchParams.get("pageSize") ?? DEFAULT_IMPROVEMENTS_LIST_STATE.pageSize)

  const status = (searchParams.get("status") ?? "all") as ImprovementsListState["status"]
  const priority = (searchParams.get("priority") ?? "all") as ImprovementsListState["priority"]
  const hasValuation = (searchParams.get("hasValuation") ?? "all") as ImprovementsListState["hasValuation"]
  const versionId = searchParams.get("versionId") ?? "all"

  return {
    view: searchParams.get("view") === "cards" ? "cards" : "table",
    q: searchParams.get("q") ?? "",
    status,
    priority,
    versionId,
    tag: searchParams.get("tag") ?? "",
    hasValuation,
    completionFrom: searchParams.get("completionFrom") ?? "",
    completionTo: searchParams.get("completionTo") ?? "",
    dueDateFrom: searchParams.get("dueDateFrom") ?? "",
    dueDateTo: searchParams.get("dueDateTo") ?? "",
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: parseListPageSize(rawPageSize, DEFAULT_IMPROVEMENTS_LIST_STATE.pageSize),
  }
}

function stringifyImprovementsListState(state: ImprovementsListState): URLSearchParams {
  return cleanSearchParams(state, { defaults: DEFAULT_IMPROVEMENTS_LIST_STATE })
}

export function ImprovementsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const parsedState = useMemo(() => parseImprovementsListState(searchParams), [searchParams])

  const [search, setSearch] = useState(parsedState.q)
  const [filtersOpen, setFiltersOpen] = useState(
    () =>
      parsedState.status !== DEFAULT_IMPROVEMENTS_LIST_STATE.status ||
      parsedState.priority !== DEFAULT_IMPROVEMENTS_LIST_STATE.priority ||
      parsedState.versionId !== DEFAULT_IMPROVEMENTS_LIST_STATE.versionId ||
      parsedState.tag !== DEFAULT_IMPROVEMENTS_LIST_STATE.tag ||
      parsedState.hasValuation !== DEFAULT_IMPROVEMENTS_LIST_STATE.hasValuation ||
      parsedState.completionFrom !== DEFAULT_IMPROVEMENTS_LIST_STATE.completionFrom ||
      parsedState.completionTo !== DEFAULT_IMPROVEMENTS_LIST_STATE.completionTo ||
      parsedState.dueDateFrom !== DEFAULT_IMPROVEMENTS_LIST_STATE.dueDateFrom ||
      parsedState.dueDateTo !== DEFAULT_IMPROVEMENTS_LIST_STATE.dueDateTo,
  )

  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    setSearch(parsedState.q)
  }, [parsedState.q])

  useEffect(() => {
    if (
      parsedState.status !== DEFAULT_IMPROVEMENTS_LIST_STATE.status ||
      parsedState.priority !== DEFAULT_IMPROVEMENTS_LIST_STATE.priority ||
      parsedState.versionId !== DEFAULT_IMPROVEMENTS_LIST_STATE.versionId ||
      parsedState.tag !== DEFAULT_IMPROVEMENTS_LIST_STATE.tag ||
      parsedState.hasValuation !== DEFAULT_IMPROVEMENTS_LIST_STATE.hasValuation ||
      parsedState.completionFrom !== DEFAULT_IMPROVEMENTS_LIST_STATE.completionFrom ||
      parsedState.completionTo !== DEFAULT_IMPROVEMENTS_LIST_STATE.completionTo ||
      parsedState.dueDateFrom !== DEFAULT_IMPROVEMENTS_LIST_STATE.dueDateFrom ||
      parsedState.dueDateTo !== DEFAULT_IMPROVEMENTS_LIST_STATE.dueDateTo
    ) {
      setFiltersOpen(true)
    }
  }, [
    parsedState.status,
    parsedState.priority,
    parsedState.versionId,
    parsedState.tag,
    parsedState.hasValuation,
    parsedState.completionFrom,
    parsedState.completionTo,
    parsedState.dueDateFrom,
    parsedState.dueDateTo,
  ])

  const updateState = (partial: Partial<ImprovementsListState>) => {
    const next = {
      ...parsedState,
      ...partial,
    }

    const nextWithPage = {
      ...next,
      page: partial.page ?? updatePageOnListStateChange(parsedState, next),
    }

    setSearchParams(stringifyImprovementsListState(nextWithPage), { replace: true })
  }

  useEffect(() => {
    if (debouncedSearch !== parsedState.q) {
      updateState({ q: debouncedSearch })
    }
  }, [debouncedSearch, parsedState.q])

  const { data: versions = [] } = useVersions(true)
  const { data: tags = [] } = useTags()

  const { data, isLoading } = useImprovements({
    q: parsedState.q || undefined,
    status: parsedState.status === "all" ? undefined : parsedState.status,
    priority: parsedState.priority === "all" ? undefined : Number(parsedState.priority),
    versionId: parsedState.versionId === "all" ? undefined : Number(parsedState.versionId),
    tag: parsedState.tag || undefined,
    hasValuation:
      parsedState.hasValuation === "with"
        ? true
        : parsedState.hasValuation === "without"
          ? false
          : undefined,
    completionFrom: parsedState.completionFrom ? Number(parsedState.completionFrom) : undefined,
    completionTo: parsedState.completionTo ? Number(parsedState.completionTo) : undefined,
    dueDateFrom: parsedState.dueDateFrom || undefined,
    dueDateTo: parsedState.dueDateTo || undefined,
    page: parsedState.page - 1,
    size: parsedState.pageSize,
  })

  const entries = data?.data ?? []
  const totalItems = data?.meta.total ?? entries.length
  const totalPages = Math.max(1, data?.meta.totalPages ?? Math.ceil(totalItems / parsedState.pageSize) ?? 1)
  const page = Math.min(parsedState.page, totalPages)

  useEffect(() => {
    if (page !== parsedState.page) {
      updateState({ page })
    }
  }, [page, parsedState.page])

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Lightbulb}
        title="Millores"
        description="Segueix i prioriza les millores amb valoració i estat de progrés."
      />

      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        filtersOpen={filtersOpen}
        onFiltersToggle={() => setFiltersOpen((value) => !value)}
        view={parsedState.view}
        onViewChange={(view) => updateState({ view })}
        filtersPanelId="improvements-list-filters"
        filtersContent={
          <ImprovementFilters
            status={parsedState.status}
            onStatusChange={(status) => updateState({ status })}
            priority={parsedState.priority}
            onPriorityChange={(priority) => updateState({ priority })}
            versionId={parsedState.versionId}
            onVersionIdChange={(versionId) => updateState({ versionId })}
            tag={parsedState.tag}
            onTagChange={(tag) => updateState({ tag })}
            hasValuation={parsedState.hasValuation}
            onHasValuationChange={(hasValuation) => updateState({ hasValuation })}
            completionFrom={parsedState.completionFrom}
            onCompletionFromChange={(completionFrom) => updateState({ completionFrom })}
            completionTo={parsedState.completionTo}
            onCompletionToChange={(completionTo) => updateState({ completionTo })}
            dueDateFrom={parsedState.dueDateFrom}
            onDueDateFromChange={(dueDateFrom) => updateState({ dueDateFrom })}
            dueDateTo={parsedState.dueDateTo}
            onDueDateToChange={(dueDateTo) => updateState({ dueDateTo })}
            versions={versions}
            tags={tags}
          />
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-16 text-center text-muted-foreground">
          Cap millora. Crea la primera!
        </div>
      ) : (
        <ListContainer
          footer={
            <ListPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
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
                  <TableHead>Versió</TableHead>
                  <TableHead>JIRA</TableHead>
                  <TableHead>Valoració</TableHead>
                  <TableHead>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((improvement) => (
                  <TableRow key={improvement.id}>
                    <EntryTitlePreviewCell title={improvement.title} preview={improvement.requirements} />
                    <TableCell>
                      <Badge variant="secondary">{getImprovementStatusLabel(improvement.status)}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {improvement.priority != null ? PRIORITY_CONFIG[improvement.priority]?.label ?? "-" : "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{improvement.version?.name ?? "-"}</TableCell>
                    <TableCell className="whitespace-nowrap">{improvement.jira_ref ?? "-"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {improvement.valuation_summary ? getValuationStatusLabel(improvement.valuation_summary.status) : "Sense valoració"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{improvement.completion_percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 md:p-6">
              {entries.map((improvement) => (
                <ImprovementSummaryCard key={improvement.id} improvement={improvement} />
              ))}
            </div>
          )}
        </ListContainer>
      )}
    </div>
  )
}
