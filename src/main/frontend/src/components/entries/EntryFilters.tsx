import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Toggle } from "@/components/ui/toggle"
import { Pin } from "lucide-react"
import { PRIORITY_CONFIG } from "@/lib/priorities"

interface EntryFiltersProps {
  status: string
  setStatus: (s: string) => void
  type: string
  setType: (t: string) => void
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
}

export function EntryFilters({
  status, setStatus,
  type, setType,
  search, setSearch,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  tag, setTag,
  pinned, setPinned,
  priority, setPriority
}: EntryFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Input
        placeholder="Cercar..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-40 sm:w-52 h-9 bg-background border-border text-sm"
      />

      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[120px] h-9 text-sm">
          <SelectValue placeholder="Estat" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tots</SelectItem>
          <SelectItem value="OPEN">Oberts</SelectItem>
          <SelectItem value="IN_PROGRESS">En Curs</SelectItem>
          <SelectItem value="DONE">Fets</SelectItem>
          <SelectItem value="CANCELLED">Cancel·lats</SelectItem>
        </SelectContent>
      </Select>

      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-[110px] h-9 text-sm">
          <SelectValue placeholder="Tipus" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tots</SelectItem>
          <SelectItem value="TASK">Tasca</SelectItem>
          <SelectItem value="NOTE">Nota</SelectItem>
          <SelectItem value="MEETING_NOTE">Reunió</SelectItem>
          <SelectItem value="REMINDER">Recordatori</SelectItem>
        </SelectContent>
      </Select>

      <Input
        type="date"
        value={dateFrom || ''}
        onChange={e => setDateFrom(e.target.value)}
        className="w-[130px] h-9 text-sm bg-background border-border"
        title="Des de"
      />
      <Input
        type="date"
        value={dateTo || ''}
        onChange={e => setDateTo(e.target.value)}
        className="w-[130px] h-9 text-sm bg-background border-border"
        title="Fins a"
      />

      <Input
        placeholder="Etiqueta..."
        value={tag || ''}
        onChange={e => setTag(e.target.value)}
        className="w-[120px] h-9 text-sm bg-background border-border"
      />

      <Toggle
        aria-label="Fixats"
        pressed={pinned || false}
        onPressedChange={setPinned}
        variant="outline"
        className="h-9 px-2.5 gap-1.5"
      >
        <Pin size={14} className={pinned ? "text-accent-primary" : "text-data-neutral"} />
      </Toggle>

      <Select value={priority} onValueChange={setPriority}>
        <SelectTrigger className="w-[110px] h-9 text-sm">
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
  )
}
