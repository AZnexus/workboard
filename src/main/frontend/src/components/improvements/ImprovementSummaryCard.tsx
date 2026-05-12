import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getImprovementStatusLabel, getValuationStatusLabel } from "@/config/improvement-taxonomy"
import { PRIORITY_CONFIG } from "@/lib/priorities"
import type { Improvement } from "@/types"

interface ImprovementSummaryCardProps {
  improvement: Improvement
}

export function ImprovementSummaryCard({ improvement }: ImprovementSummaryCardProps) {
  const priorityLabel = improvement.priority != null ? PRIORITY_CONFIG[improvement.priority]?.label ?? String(improvement.priority) : "-"

  return (
    <Card className="gap-3 p-4">
      <CardHeader className="gap-2 p-0">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold leading-tight">{improvement.title}</CardTitle>
          <Badge variant="secondary">{getImprovementStatusLabel(improvement.status)}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 p-0 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-2">
          <span>Prioritat: <strong className="text-foreground">{priorityLabel}</strong></span>
          <span>·</span>
          <span>Progrés: <strong className="text-foreground">{improvement.completion_percentage}%</strong></span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span>JIRA: <strong className="text-foreground">{improvement.jira_ref ?? "-"}</strong></span>
          <span>·</span>
          <span>Versió: <strong className="text-foreground">{improvement.version?.name ?? "-"}</strong></span>
        </div>
        <div>
          Valoració:{" "}
          <strong className="text-foreground">
            {improvement.valuation_summary ? getValuationStatusLabel(improvement.valuation_summary.status) : "Sense valoració"}
          </strong>
        </div>
      </CardContent>
    </Card>
  )
}
