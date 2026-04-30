import type { ReactNode } from "react"
import { Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
  filtersContent?: ReactNode
  className?: string
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
  filtersContent,
  className,
}: ListToolbarProps) {
  const showFiltersPanel = filtersOpen && filtersContent != null

  return (
    <section className={cn("overflow-hidden rounded-xl border border-border bg-surface-1 shadow-sm", className)}>
      <div className="p-4">
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

      {showFiltersPanel ? (
        <div id={filtersPanelId} className="border-t border-border/70 bg-surface-2/35 p-4">
          {filtersContent}
        </div>
      ) : null}
    </section>
  )
}
