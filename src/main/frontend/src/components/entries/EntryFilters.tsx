import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Input } from "@/components/ui/input"

interface EntryFiltersProps {
  status: string
  setStatus: (s: string) => void
  type: string
  setType: (t: string) => void
  search: string
  setSearch: (s: string) => void
}

export function EntryFilters({ status, setStatus, type, setType, search, setSearch }: EntryFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-surface rounded-[8px] border border-border">
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
        placeholder="Cercar..." 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        className="w-full sm:w-64 bg-background border-border text-foreground"
      />
    </div>
  )
}
