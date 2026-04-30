import type { ReactNode } from "react"
import { Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ListViewToggle } from "./ListViewToggle"
import type { ListView } from "./list-view"

interface ListToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filtersOpen: boolean
  onFiltersToggle: () => void
  view?: ListView
  onViewChange?: (value: ListView) => void
  showViewToggle?: boolean
  actions?: ReactNode
  filtersPanelId?: string
}

export function ListToolbar({
  searchValue,
  onSearchChange,
  filtersOpen,
  onFiltersToggle,
  view,
  onViewChange,
  showViewToggle = true,
  actions,
  filtersPanelId,
}: ListToolbarProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input
          aria-label="Cercar"
          placeholder="Cercar..."
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-10 lg:max-w-md"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            onClick={onFiltersToggle}
            aria-pressed={filtersOpen}
            aria-expanded={filtersOpen}
            aria-controls={filtersPanelId}
          >
            <Filter data-icon="inline-start" />
            Filtres
          </Button>
          {showViewToggle && view != null && onViewChange != null ? <ListViewToggle value={view} onChange={onViewChange} /> : null}
          {actions}
        </div>
      </div>
    </div>
  )
}
