import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { Pin } from "lucide-react"
import { PRIORITY_CONFIG } from "@/lib/priorities"
import type { EntryStatus, EntryType } from "@/types"
import { ENTRY_STATUS_OPTIONS, ENTRY_TYPE_OPTIONS } from "./entry-filter-options"

interface EntryFiltersProps {
  status: EntryStatus | "all"
  setStatus: (s: EntryStatus | "all") => void
  type: EntryType | "all"
  setType: (t: EntryType | "all") => void
  search: string
  setSearch: (s: string) => void
  dateFrom?: string
  setDateFrom: (d: string) => void
  dateTo?: string
  setDateTo: (d: string) => void
  tag?: string
  setTag: (t: string) => void
  pinned?: boolean
  setPinned: (p: boolean) => void
  priority: string
  setPriority: (p: string) => void
  compact?: boolean
  id?: string
  embedded?: boolean
}

export function EntryFilters({
  status, setStatus,
  type, setType,
  search, setSearch,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  tag, setTag,
  pinned, setPinned,
  priority, setPriority,
  compact = false,
  id,
  embedded = false,
}: EntryFiltersProps) {
  const shellClassName = embedded
    ? "space-y-4"
    : "rounded-xl border border-border bg-surface-1 p-4 shadow-sm space-y-4"

  if (compact) {
    return (
      <div id={id} className={shellClassName}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label htmlFor="entry-filters-status" className="text-xs font-medium text-muted-foreground">Estat</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="entry-filters-status" aria-label="Estat" className="h-10 w-full text-sm bg-background">
                <SelectValue placeholder="Estat" />
              </SelectTrigger>
              <SelectContent>
                {ENTRY_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="entry-filters-type" className="text-xs font-medium text-muted-foreground">Tipus</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="entry-filters-type" aria-label="Tipus" className="h-10 w-full text-sm bg-background">
                <SelectValue placeholder="Tipus" />
              </SelectTrigger>
              <SelectContent>
                {ENTRY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="entry-filters-priority" className="text-xs font-medium text-muted-foreground">Prioritat</label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="entry-filters-priority" aria-label="Prioritat" className="h-10 w-full text-sm bg-background">
                <SelectValue placeholder="Prioritat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Totes</SelectItem>
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Fixades</label>
            <Toggle
              aria-label="Fixades"
              pressed={pinned || false}
              onPressedChange={setPinned}
              variant="outline"
              className="h-10 w-full justify-center gap-2 bg-background px-3 data-[state=on]:border-accent-primary data-[state=on]:bg-accent-primary/10 data-[state=on]:text-accent-primary transition-colors"
            >
              <Pin size={14} className={pinned ? "text-accent-primary" : "text-muted-foreground"} />
              <span className="text-sm">Fixades</span>
            </Toggle>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <label htmlFor="entry-filters-tag" className="text-xs font-medium text-muted-foreground">Etiqueta</label>
            <Input
              id="entry-filters-tag"
              placeholder="Etiqueta concreta..."
              value={tag || ''}
              onChange={e => setTag(e.target.value)}
              className="h-10 w-full bg-background border-border text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Període</label>
            <div className="flex items-center rounded-md border border-border bg-background px-2 shadow-sm">
              <Input
                aria-label="Període des de"
                type="date"
                value={dateFrom || ''}
                onChange={e => setDateFrom(e.target.value)}
                className="h-8 w-full border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
                title="Des de"
              />
              <span className="px-1 text-xs text-muted-foreground/60">-</span>
              <Input
                aria-label="Període fins a"
                type="date"
                value={dateTo || ''}
                onChange={e => setDateTo(e.target.value)}
                className="h-8 w-full border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
                title="Fins a"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div id={id} className={shellClassName}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Filtres</p>
          <p className="text-sm text-muted-foreground/80">Refina el registre per contingut, estat, dates i context.</p>
        </div>
      </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)_minmax(0,0.95fr)]">
          <div className="space-y-2">
          <label htmlFor="entry-filters-search" className="text-xs font-medium text-muted-foreground">Cercar</label>
          <Input
            id="entry-filters-search"
            placeholder="Títol, detall o referència..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 w-full bg-background border-border text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label htmlFor="entry-filters-status" className="text-xs font-medium text-muted-foreground">Estat</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="entry-filters-status" aria-label="Estat" className="h-10 w-full text-sm bg-background">
                <SelectValue placeholder="Estat" />
              </SelectTrigger>
              <SelectContent>
                {ENTRY_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="entry-filters-type" className="text-xs font-medium text-muted-foreground">Tipus</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="entry-filters-type" aria-label="Tipus" className="h-10 w-full text-sm bg-background">
                <SelectValue placeholder="Tipus" />
              </SelectTrigger>
              <SelectContent>
                {ENTRY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Període</label>
            <div className="flex items-center rounded-md border border-border bg-background px-2 shadow-sm">
              <Input
                aria-label="Període des de"
                type="date"
                value={dateFrom || ''}
                onChange={e => setDateFrom(e.target.value)}
                className="h-8 w-full border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
                title="Des de"
              />
              <span className="px-1 text-xs text-muted-foreground/60">-</span>
              <Input
                aria-label="Període fins a"
                type="date"
                value={dateTo || ''}
                onChange={e => setDateTo(e.target.value)}
                className="h-8 w-full border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
                title="Fins a"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Fixades</label>
            <Toggle
              aria-label="Fixades"
              pressed={pinned || false}
              onPressedChange={setPinned}
              variant="outline"
              className="h-10 w-full justify-center gap-2 bg-background px-3 data-[state=on]:border-accent-primary data-[state=on]:bg-accent-primary/10 data-[state=on]:text-accent-primary transition-colors sm:w-auto"
            >
              <Pin size={14} className={pinned ? "text-accent-primary" : "text-muted-foreground"} />
              <span className="text-sm">Fixades</span>
            </Toggle>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="space-y-2">
          <label htmlFor="entry-filters-tag" className="text-xs font-medium text-muted-foreground">Etiqueta</label>
          <Input
            id="entry-filters-tag"
            placeholder="Etiqueta concreta..."
            value={tag || ''}
            onChange={e => setTag(e.target.value)}
            className="h-10 w-full bg-background border-border text-sm"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="entry-filters-priority" className="text-xs font-medium text-muted-foreground">Prioritat</label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger id="entry-filters-priority" aria-label="Prioritat" className="h-10 w-full text-sm bg-background">
              <SelectValue placeholder="Prioritat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Totes</SelectItem>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
