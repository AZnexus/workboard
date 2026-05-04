import { Button } from "@/components/ui/button"

interface BinaryScopeSelectorProps {
  label: string
  firstLabel: string
  secondLabel: string
  isFirstSelected: boolean
  onFirstSelect: () => void
  onSecondSelect: () => void
}

export function BinaryScopeSelector({
  label,
  firstLabel,
  secondLabel,
  isFirstSelected,
  onFirstSelect,
  onSecondSelect,
}: BinaryScopeSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex gap-2">
        <Button
          type="button"
          aria-pressed={isFirstSelected}
          variant={isFirstSelected ? "default" : "outline"}
          size="sm"
          onClick={onFirstSelect}
        >
          {firstLabel}
        </Button>
        <Button
          type="button"
          aria-pressed={!isFirstSelected}
          variant={!isFirstSelected ? "default" : "outline"}
          size="sm"
          onClick={onSecondSelect}
        >
          {secondLabel}
        </Button>
      </div>
    </div>
  )
}
