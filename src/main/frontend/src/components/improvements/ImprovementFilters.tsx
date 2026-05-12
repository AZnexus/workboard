import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  HAS_VALUATION_OPTIONS,
  IMPROVEMENT_PRIORITY_FILTER_OPTIONS,
  IMPROVEMENT_STATUS_FILTER_OPTIONS,
} from "@/config/improvement-taxonomy"
import type { ImprovementStatus, Tag, Version } from "@/types"

interface ImprovementFiltersProps {
  status: ImprovementStatus | "all"
  onStatusChange: (value: ImprovementStatus | "all") => void
  priority: "all" | "1" | "2" | "3" | "4" | "5"
  onPriorityChange: (value: "all" | "1" | "2" | "3" | "4" | "5") => void
  versionId: "all" | string
  onVersionIdChange: (value: "all" | string) => void
  tag: string
  onTagChange: (value: string) => void
  hasValuation: "all" | "with" | "without"
  onHasValuationChange: (value: "all" | "with" | "without") => void
  completionFrom: string
  onCompletionFromChange: (value: string) => void
  completionTo: string
  onCompletionToChange: (value: string) => void
  dueDateFrom: string
  onDueDateFromChange: (value: string) => void
  dueDateTo: string
  onDueDateToChange: (value: string) => void
  versions: Version[]
  tags: Tag[]
}

export function ImprovementFilters({
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  versionId,
  onVersionIdChange,
  tag,
  onTagChange,
  hasValuation,
  onHasValuationChange,
  completionFrom,
  onCompletionFromChange,
  completionTo,
  onCompletionToChange,
  dueDateFrom,
  onDueDateFromChange,
  dueDateTo,
  onDueDateToChange,
  versions,
  tags,
}: ImprovementFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-2">
        <label htmlFor="improvements-status" className="text-xs font-medium text-muted-foreground">Estat</label>
        <Select value={status} onValueChange={(value) => onStatusChange(value as ImprovementStatus | "all")}>
          <SelectTrigger id="improvements-status" aria-label="Estat" className="h-10 w-full text-sm bg-background">
            <SelectValue placeholder="Estat" />
          </SelectTrigger>
          <SelectContent>
            {IMPROVEMENT_STATUS_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="improvements-priority" className="text-xs font-medium text-muted-foreground">Prioritat</label>
        <Select value={priority} onValueChange={(value) => onPriorityChange(value as "all" | "1" | "2" | "3" | "4" | "5")}>
          <SelectTrigger id="improvements-priority" aria-label="Prioritat" className="h-10 w-full text-sm bg-background">
            <SelectValue placeholder="Prioritat" />
          </SelectTrigger>
          <SelectContent>
            {IMPROVEMENT_PRIORITY_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="improvements-version" className="text-xs font-medium text-muted-foreground">Versió</label>
        <Select value={versionId} onValueChange={onVersionIdChange}>
          <SelectTrigger id="improvements-version" aria-label="Versió" className="h-10 w-full text-sm bg-background">
            <SelectValue placeholder="Versió" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Totes</SelectItem>
            {versions.map((version) => (
              <SelectItem key={version.id} value={String(version.id)}>
                {version.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="improvements-tag" className="text-xs font-medium text-muted-foreground">Etiqueta</label>
        <Select value={tag || "all"} onValueChange={(value) => onTagChange(value === "all" ? "" : value)}>
          <SelectTrigger id="improvements-tag" aria-label="Etiqueta" className="h-10 w-full text-sm bg-background">
            <SelectValue placeholder="Etiqueta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Totes</SelectItem>
            {tags.map((item) => (
              <SelectItem key={item.id} value={item.name}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="improvements-valuation" className="text-xs font-medium text-muted-foreground">Valoració</label>
        <Select value={hasValuation} onValueChange={(value) => onHasValuationChange(value as "all" | "with" | "without")}>
          <SelectTrigger id="improvements-valuation" aria-label="Valoració" className="h-10 w-full text-sm bg-background">
            <SelectValue placeholder="Valoració" />
          </SelectTrigger>
          <SelectContent>
            {HAS_VALUATION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label htmlFor="improvements-completion-from" className="text-xs font-medium text-muted-foreground">% des de</label>
        <Input
          id="improvements-completion-from"
          aria-label="% des de"
          placeholder="0"
          type="number"
          min={0}
          max={100}
          value={completionFrom}
          onChange={(event) => onCompletionFromChange(event.target.value)}
          className="h-10 w-full bg-background border-border text-sm"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="improvements-completion-to" className="text-xs font-medium text-muted-foreground">% fins a</label>
        <Input
          id="improvements-completion-to"
          aria-label="% fins a"
          placeholder="100"
          type="number"
          min={0}
          max={100}
          value={completionTo}
          onChange={(event) => onCompletionToChange(event.target.value)}
          className="h-10 w-full bg-background border-border text-sm"
        />
      </div>

      <div className="space-y-2 md:col-span-2 xl:col-span-2">
        <label className="text-xs font-medium text-muted-foreground">Període</label>
        <div className="flex items-center rounded-md border border-border bg-background px-2 shadow-sm">
          <Input
            aria-label="Període des de"
            type="date"
            value={dueDateFrom}
            onChange={(event) => onDueDateFromChange(event.target.value)}
            className="h-8 w-full border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
            title="Des de"
          />
          <span className="px-1 text-xs text-muted-foreground/60">-</span>
          <Input
            aria-label="Període fins a"
            type="date"
            value={dueDateTo}
            onChange={(event) => onDueDateToChange(event.target.value)}
            className="h-8 w-full border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
            title="Fins a"
          />
        </div>
      </div>
    </div>
  )
}
