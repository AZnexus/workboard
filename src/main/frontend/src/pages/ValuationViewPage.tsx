import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getValuationStatusLabel } from "@/config/improvement-taxonomy"
import { useValuation } from "@/hooks/useImprovements"
import { PRIORITY_CONFIG } from "@/lib/priorities"

function formatDate(value: string | null) {
  if (!value) return "-"
  return value
}

export function ValuationViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const improvementId = id ? Number(id) : 0
  const { data: valuation, isLoading } = useValuation(improvementId)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!valuation) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Valoració no trobada</div>
  }

  const priorityLabel =
    valuation.priority != null ? PRIORITY_CONFIG[valuation.priority]?.label ?? String(valuation.priority) : "-"

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate(`/millores/${improvementId}`)} aria-label="Tornar a millora">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{valuation.derived_title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Vista de lectura inicial de la valoració.</p>
          </div>
        </div>

        <Button variant="outline" asChild>
          <Link to={`/millores/${improvementId}/valoracio/edit`}>Editar valoració</Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Resum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-[170px_1fr] gap-2">
              <span className="text-muted-foreground">Estat</span>
              <Badge variant="secondary">{getValuationStatusLabel(valuation.status)}</Badge>
            </div>
            <div className="grid grid-cols-[170px_1fr] gap-2">
              <span className="text-muted-foreground">Completitud</span>
              <span className="text-foreground">{valuation.completion_percentage}%</span>
            </div>
            <div className="grid grid-cols-[170px_1fr] gap-2">
              <span className="text-muted-foreground">Redmine fill</span>
              <span className="text-foreground">{valuation.redmine_child_ref}</span>
            </div>
            <div className="grid grid-cols-[170px_1fr] gap-2">
              <span className="text-muted-foreground">Data límit</span>
              <span className="text-foreground">{formatDate(valuation.due_date)}</span>
            </div>
            <div className="grid grid-cols-[170px_1fr] gap-2">
              <span className="text-muted-foreground">Prioritat</span>
              <span className="text-foreground">{priorityLabel}</span>
            </div>
            <div className="grid grid-cols-[170px_1fr] gap-2">
              <span className="text-muted-foreground">Versió</span>
              <span className="text-foreground">{valuation.version?.name ?? "-"}</span>
            </div>
            <div className="grid grid-cols-[170px_1fr] gap-2">
              <span className="text-muted-foreground">Etiquetes</span>
              <span className="flex flex-wrap gap-2">
                {valuation.tags.length > 0 ? (
                  valuation.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="uppercase tracking-wider">
                      {tag.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Estimacions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-[170px_1fr] gap-2">
              <span className="text-muted-foreground">Hores anàlisi</span>
              <span className="text-foreground">{valuation.analysis_hours != null ? `${valuation.analysis_hours} h` : "-"}</span>
            </div>
            <div className="grid grid-cols-[170px_1fr] gap-2">
              <span className="text-muted-foreground">Hores totals</span>
              <span className="text-foreground">
                {valuation.total_estimated_hours != null ? `${valuation.total_estimated_hours} h` : "-"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Textile (lectura)</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md border border-border bg-background p-4 text-sm text-foreground">
            {valuation.textile_body || "-"}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Estructura guardada</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md border border-border bg-background p-4 text-sm text-foreground">
            {valuation.structured_content_json || "-"}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
