import { LayoutGrid, TableProperties } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ListView } from "./list-view"

interface ListViewToggleProps {
  value: ListView
  onChange: (value: ListView) => void
}

export function ListViewToggle({ value, onChange }: ListViewToggleProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
      <Button
        type="button"
        size="sm"
        variant={value === "table" ? "default" : "ghost"}
        aria-pressed={value === "table"}
        onClick={() => onChange("table")}
      >
        <TableProperties data-icon="inline-start" />
        Taula
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === "cards" ? "default" : "ghost"}
        aria-pressed={value === "cards"}
        onClick={() => onChange("cards")}
      >
        <LayoutGrid data-icon="inline-start" />
        Targetes
      </Button>
    </div>
  )
}
