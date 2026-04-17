import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Toggle } from "@/components/ui/toggle"
import { Input } from "@/components/ui/input"
import { Pin } from "lucide-react"

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
}

export function EntryFilters({ 
  status, setStatus, 
  type, setType, 
  search, setSearch,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  tag, setTag,
  pinned, setPinned
}: EntryFiltersProps) {
  return (
    <div className="flex flex-col gap-4 p-4 bg-card rounded-[8px] border border-border">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between w-full">
        <div className="flex flex-wrap gap-4">
          <ToggleGroup type="single" value={status} onValueChange={setStatus} className="justify-start">
            <ToggleGroupItem value="" aria-label="Tots">Tots</ToggleGroupItem>
            <ToggleGroupItem value="OPEN" aria-label="Oberts">Oberts</ToggleGroupItem>
            <ToggleGroupItem value="IN_PROGRESS" aria-label="En Curs">En Curs</ToggleGroupItem>
            <ToggleGroupItem value="DONE" aria-label="Fets">Fets</ToggleGroupItem>
          </ToggleGroup>
          
          <div className="h-8 w-px bg-border hidden sm:block" />
          
          <ToggleGroup type="single" value={type} onValueChange={setType} className="justify-start">
            <ToggleGroupItem value="" aria-label="Tots">Tots</ToggleGroupItem>
            <ToggleGroupItem value="TASK" aria-label="Tasques">Tasca</ToggleGroupItem>
            <ToggleGroupItem value="NOTE" aria-label="Notes">Nota</ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Input 
          placeholder="Cercar text..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          className="w-full sm:w-64 bg-background border-border text-foreground"
        />
      </div>

      <div className="flex flex-wrap gap-4 items-center border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <label htmlFor="dateFrom" className="text-sm font-medium whitespace-nowrap">De:</label>
          <Input 
            id="dateFrom"
            type="date"
            value={dateFrom || ''} 
            onChange={e => setDateFrom(e.target.value)}
            className="w-[140px] bg-background border-border text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="dateTo" className="text-sm font-medium whitespace-nowrap">A:</label>
          <Input 
            id="dateTo"
            type="date"
            value={dateTo || ''} 
            onChange={e => setDateTo(e.target.value)}
            className="w-[140px] bg-background border-border text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="tagFilter" className="text-sm font-medium whitespace-nowrap">Etiqueta:</label>
          <Input 
            id="tagFilter"
            placeholder="Cercar etiqueta..."
            value={tag || ''} 
            onChange={e => setTag(e.target.value)}
            className="w-[160px] bg-background border-border text-sm"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Toggle 
            aria-label="Fixats"
            pressed={pinned || false}
            onPressedChange={setPinned}
            variant="outline"
            className="gap-2"
          >
            <Pin size={16} /> Fixats
          </Toggle>
        </div>
      </div>
    </div>
  )
}
