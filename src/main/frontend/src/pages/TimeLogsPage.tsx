import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { TimeLogForm } from "@/components/timelogs/TimeLogForm"
import { TimeLogTable } from "@/components/timelogs/TimeLogTable"
import { WeeklySummary } from "@/components/timelogs/WeeklySummary"
import { useDebounce } from "@/hooks/useDebounce"
import { ListToolbar } from "@/components/list/ListToolbar"
import { ListPagination } from "@/components/list/ListPagination"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { PageHeader } from "@/components/layout/PageHeader"
import { cleanSearchParams, updatePageOnListStateChange } from "@/lib/list-state/listState"
import { useTimeLogs } from "@/hooks/useTimeLogs"

type FilterPreset = 'today' | 'this_week' | 'last_week' | 'this_month' | 'this_year' | 'custom'

interface TimeLogsListState {
  q: string
  page: number
  pageSize: number
  preset: FilterPreset
  offset: number
  from: string
  to: string
}

const getCurrentWeekRange = () => {
  const monday = getMonday(new Date())
  const sunday = new Date(monday)
  sunday.setDate(sunday.getDate() + 6)
  return {
    from: formatDateISO(monday),
    to: formatDateISO(sunday),
  }
}

const DEFAULT_TIMELOGS_LIST_STATE: TimeLogsListState = {
  q: "",
  page: 1,
  pageSize: 10,
  preset: "this_week",
  offset: 0,
  ...getCurrentWeekRange(),
}

function parseFilterPreset(value: string | null): FilterPreset {
  return value === "today" ||
    value === "this_week" ||
    value === "last_week" ||
    value === "this_month" ||
    value === "this_year" ||
    value === "custom"
    ? value
    : DEFAULT_TIMELOGS_LIST_STATE.preset
}

function parseTimeLogsListState(searchParams: URLSearchParams): TimeLogsListState {
  const rawPage = Number(searchParams.get("page") ?? DEFAULT_TIMELOGS_LIST_STATE.page)
  const rawPageSize = Number(searchParams.get("pageSize") ?? DEFAULT_TIMELOGS_LIST_STATE.pageSize)
  const rawOffset = Number(searchParams.get("offset") ?? DEFAULT_TIMELOGS_LIST_STATE.offset)

  return {
    q: searchParams.get("q") ?? "",
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
    pageSize: rawPageSize === 10 || rawPageSize === 20 || rawPageSize === 50 || rawPageSize === 100 ? rawPageSize : DEFAULT_TIMELOGS_LIST_STATE.pageSize,
    preset: parseFilterPreset(searchParams.get("preset")),
    offset: Number.isFinite(rawOffset) ? rawOffset : 0,
    from: searchParams.get("from") ?? DEFAULT_TIMELOGS_LIST_STATE.from,
    to: searchParams.get("to") ?? DEFAULT_TIMELOGS_LIST_STATE.to,
  }
}

function stringifyTimeLogsListState(state: TimeLogsListState): URLSearchParams {
  return cleanSearchParams(state, { defaults: DEFAULT_TIMELOGS_LIST_STATE })
}

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateISO(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatWeekRange(start: Date, end: Date): string {
  const startDay = start.getDate()
  const endDay = end.getDate()
  const month = end.toLocaleDateString("ca-ES", { month: "short" })
  const year = end.getFullYear()
  
  if (start.getMonth() !== end.getMonth()) {
      const startMonth = start.toLocaleDateString("ca-ES", { month: "short" })
      return `${startDay} ${startMonth}. - ${endDay} ${month}. ${year}`
  }
  
  return `${startDay} - ${endDay} ${month}. ${year}`
}


export function TimeLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const parsedState = useMemo(() => parseTimeLogsListState(searchParams), [searchParams])
  const [search, setSearch] = useState(parsedState.q)
  const debouncedSearch = useDebounce(search, 300)
  const [filtersOpen, setFiltersOpen] = useState(
    () =>
      parsedState.preset !== DEFAULT_TIMELOGS_LIST_STATE.preset ||
      parsedState.offset !== DEFAULT_TIMELOGS_LIST_STATE.offset ||
      parsedState.from !== DEFAULT_TIMELOGS_LIST_STATE.from ||
      parsedState.to !== DEFAULT_TIMELOGS_LIST_STATE.to,
  )

  useEffect(() => {
    setSearch(parsedState.q)
  }, [parsedState.q])

  useEffect(() => {
    if (
      parsedState.preset !== DEFAULT_TIMELOGS_LIST_STATE.preset ||
      parsedState.offset !== DEFAULT_TIMELOGS_LIST_STATE.offset ||
      parsedState.from !== DEFAULT_TIMELOGS_LIST_STATE.from ||
      parsedState.to !== DEFAULT_TIMELOGS_LIST_STATE.to
    ) {
      setFiltersOpen(true)
    }
  }, [parsedState.preset, parsedState.offset, parsedState.from, parsedState.to])

  const updateState = (partial: Partial<TimeLogsListState>) => {
    const next = {
      ...parsedState,
      ...partial,
    }

    const nextWithPage = {
      ...next,
      page: partial.page ?? updatePageOnListStateChange(parsedState, next),
    }

    setSearchParams(stringifyTimeLogsListState(nextWithPage), { replace: true })
  }

  useEffect(() => {
    if (debouncedSearch !== parsedState.q) {
      updateState({ q: debouncedSearch })
    }
  }, [debouncedSearch, parsedState.q])

  const handlePresetChange = (preset: FilterPreset) => {
    const partial: Partial<TimeLogsListState> = { preset, offset: 0 }
    updateState(partial)
  }

  const handlePrev = () => updateState({ offset: parsedState.offset - 1 })
  const handleNext = () => updateState({ offset: parsedState.offset + 1 })
  
  const { dateFrom, dateTo, displayLabel } = useMemo(() => {
    if (parsedState.preset === 'custom') {
      return { dateFrom: parsedState.from, dateTo: parsedState.to, displayLabel: '' }
    }
    
    const today = new Date()
    today.setHours(0,0,0,0)
    
    let fromDate = new Date(today)
    let toDate = new Date(today)
    let label = ''

    if (parsedState.preset === 'today') {
      fromDate.setDate(today.getDate() + parsedState.offset)
      toDate = new Date(fromDate)
      label = fromDate.toLocaleDateString("ca-ES", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    } 
    else if (parsedState.preset === 'this_week' || parsedState.preset === 'last_week') {
      const mon = getMonday(today)
      if (parsedState.preset === 'last_week') mon.setDate(mon.getDate() - 7)
      mon.setDate(mon.getDate() + (parsedState.offset * 7))
      const sun = new Date(mon)
      sun.setDate(sun.getDate() + 6)
      fromDate = mon
      toDate = sun
      label = formatWeekRange(fromDate, toDate)
    }
    else if (parsedState.preset === 'this_month') {
      fromDate = new Date(today.getFullYear(), today.getMonth() + parsedState.offset, 1)
      toDate = new Date(today.getFullYear(), today.getMonth() + parsedState.offset + 1, 0)
      const monthName = fromDate.toLocaleDateString("ca-ES", { month: 'long' })
      label = monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + fromDate.getFullYear()
    }
    else if (parsedState.preset === 'this_year') {
      fromDate = new Date(today.getFullYear() + parsedState.offset, 0, 1)
      toDate = new Date(today.getFullYear() + parsedState.offset, 11, 31)
      label = fromDate.getFullYear().toString()
    }
    
    return { dateFrom: formatDateISO(fromDate), dateTo: formatDateISO(toDate), displayLabel: label }
  }, [parsedState.preset, parsedState.from, parsedState.to, parsedState.offset])

  const { data: logs = [] } = useTimeLogs({ dateFrom, dateTo })

  const searchedLogs = useMemo(() => {
    const query = parsedState.q.trim().toLowerCase()
    if (!query) {
      return logs
    }

    return logs.filter((log) => {
      const project = log.project.toLowerCase()
      const taskCode = log.task_code?.toLowerCase() ?? ""
      const description = log.description?.toLowerCase() ?? ""
      const date = log.date.toLowerCase()
      return project.includes(query) || taskCode.includes(query) || description.includes(query) || date.includes(query)
    })
  }, [logs, parsedState.q])

  const totalPages = Math.max(1, Math.ceil(searchedLogs.length / parsedState.pageSize))
  const page = Math.min(parsedState.page, totalPages)
  const pageStart = (page - 1) * parsedState.pageSize
  const pagedLogs = searchedLogs.slice(pageStart, pageStart + parsedState.pageSize)

  useEffect(() => {
    if (page !== parsedState.page) {
      updateState({ page })
    }
  }, [page, parsedState.page])

  const isCustomPreset = parsedState.preset === "custom"

  const filtersActions = (
    <div className="flex items-center shrink-0 w-full sm:w-auto">
      {isCustomPreset ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-background rounded-lg border border-border p-1 shadow-sm w-full sm:w-auto">
          <Input
            aria-label="Data inicial"
            type="date"
            value={parsedState.from}
            onChange={(event) => updateState({ from: event.target.value })}
            className="h-10 sm:h-8 px-2 text-sm bg-transparent border-0 focus-visible:ring-1 min-w-0"
          />
          <span className="hidden sm:inline text-muted-foreground shrink-0">-</span>
          <Input
            aria-label="Data final"
            type="date"
            value={parsedState.to}
            onChange={(event) => updateState({ to: event.target.value })}
            className="h-10 sm:h-8 px-2 text-sm bg-transparent border-0 focus-visible:ring-1 min-w-0"
          />
        </div>
      ) : (
        <div className="flex items-center bg-background rounded-lg border border-border shadow-sm h-10 overflow-hidden w-full sm:w-auto">
          <Button aria-label="Període anterior" variant="ghost" size="icon" className="h-full w-10 rounded-none hover:bg-muted shrink-0" onClick={handlePrev}>
            <ChevronLeft size={16} />
          </Button>
          <div className="flex items-center justify-center min-w-[180px] flex-1 sm:flex-initial border-x border-border/50 bg-muted/10 px-4 h-full">
            <span className="text-sm font-medium text-foreground tracking-wide whitespace-nowrap">{displayLabel}</span>
          </div>
          <Button aria-label="Període següent" variant="ghost" size="icon" className="h-full w-10 rounded-none hover:bg-muted shrink-0" onClick={handleNext}>
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader 
        icon={Clock} 
        title="Hores" 
        description="Registra i gestiona el temps dedicat a cada projecte. Utilitza els filtres per analitzar diferents períodes."
      />

      <ListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        filtersOpen={filtersOpen}
        onFiltersToggle={() => setFiltersOpen((value) => !value)}
        showViewToggle={false}
        filtersPanelId="timelogs-list-filters"
        filtersContent={
          <div className="space-y-4">
            <div className="flex w-full flex-nowrap items-center gap-1 overflow-x-auto rounded-lg border border-border/60 bg-muted/40 p-1 hide-scrollbar sm:w-auto" role="group" aria-label="Període de temps">
              <Button aria-pressed={parsedState.preset === 'today'} variant={parsedState.preset === 'today' ? "default" : "ghost"} size="sm" className="h-8 shrink-0 rounded-md px-3" onClick={() => handlePresetChange('today')}>
                Avui
              </Button>
              <Button aria-pressed={parsedState.preset === 'this_week'} variant={parsedState.preset === 'this_week' ? "default" : "ghost"} size="sm" className="h-8 shrink-0 rounded-md px-3" onClick={() => handlePresetChange('this_week')}>
                Aquesta Setmana
              </Button>
              <Button aria-pressed={parsedState.preset === 'last_week'} variant={parsedState.preset === 'last_week' ? "default" : "ghost"} size="sm" className="h-8 shrink-0 rounded-md px-3" onClick={() => handlePresetChange('last_week')}>
                Setmana Passada
              </Button>
              <Button aria-pressed={parsedState.preset === 'this_month'} variant={parsedState.preset === 'this_month' ? "default" : "ghost"} size="sm" className="h-8 shrink-0 rounded-md px-3" onClick={() => handlePresetChange('this_month')}>
                Aquest Mes
              </Button>
              <Button aria-pressed={parsedState.preset === 'this_year'} variant={parsedState.preset === 'this_year' ? "default" : "ghost"} size="sm" className="h-8 shrink-0 rounded-md px-3" onClick={() => handlePresetChange('this_year')}>
                Aquest Any
              </Button>
              <div className="mx-1 h-4 w-px shrink-0 bg-border/60" />
              <Button aria-pressed={parsedState.preset === 'custom'} variant={parsedState.preset === 'custom' ? "default" : "ghost"} size="sm" className="h-8 shrink-0 rounded-md px-3" onClick={() => handlePresetChange('custom')}>
                Personalitzat
              </Button>
            </div>

            {filtersActions}
          </div>
        }
      />

      <div className="bg-card rounded-xl border border-border shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold text-foreground">Nou Registre d'Hores</h2>
        </div>
        <TimeLogForm />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
          <div className="p-4 md:p-6 border-b border-border/50 bg-muted/10 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Llistat d'Hores</h2>
            <span className="bg-background border border-border text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-md">
              {searchedLogs.length} registre{searchedLogs.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <TimeLogTable params={{ dateFrom, dateTo }} logs={pagedLogs} />
          </div>
          <div className="border-t border-border/50 px-4 pb-4 md:px-6 md:pb-6">
            <ListPagination
              page={page}
              totalPages={totalPages}
              totalItems={searchedLogs.length}
              pageSize={parsedState.pageSize}
              onPageSizeChange={(pageSize) => updateState({ pageSize, page: 1 })}
              onPageChange={(nextPage) => updateState({ page: nextPage })}
            />
          </div>
        </div>
        
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <WeeklySummary dateFrom={dateFrom} dateTo={dateTo} preset={parsedState.preset} />
        </div>
      </div>
    </div>
  )
}
