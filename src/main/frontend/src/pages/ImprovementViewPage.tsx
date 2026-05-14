import { useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react"

import { ValuationBootstrapDialog } from "@/components/improvements/ValuationBootstrapDialog"
import { ImprovementForm } from "@/components/improvements/ImprovementForm"
import { TableActionGroup, tableActionIntentClassName } from "@/components/list/TableActionGroup"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getImprovementStatusLabel, getValuationStatusLabel } from "@/config/improvement-taxonomy"
import {
  useCreateValuation,
  useImprovement,
  useImprovementEntries,
} from "@/hooks/useImprovements"
import { PRIORITY_CONFIG } from "@/lib/priorities"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function redmineIssueUrl(reference: string) {
  return `https://redmine.local/issues/${encodeURIComponent(reference)}`
}

function jiraIssueUrl(reference: string) {
  return `https://jira.local/browse/${encodeURIComponent(reference)}`
}

function formatDate(value: string | null) {
  if (!value) return "-"
  return value
}

export function ImprovementViewPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const isCreateRoute = location.pathname === "/millores/new"
  const isEditRoute = location.pathname.endsWith("/edit")

  const improvementId = id ? Number(id) : 0
  const shouldLoadImprovement = !isCreateRoute

  const { data: improvement, isLoading } = useImprovement(shouldLoadImprovement ? improvementId : 0)
  const { data: linkedEntries, isLoading: entriesLoading } = useImprovementEntries(improvementId, { page: 0, size: 20 })
  const createValuationMut = useCreateValuation()

  const [bootstrapOpen, setBootstrapOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isCreateRoute) {
    return (
      <ImprovementForm
        onCancel={() => navigate("/millores")}
        onSuccess={(createdId) => navigate(`/millores/${createdId}`)}
      />
    )
  }

  if (!improvement) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Millora no trobada</div>
  }

  if (isEditRoute) {
    return (
      <ImprovementForm
        improvement={improvement}
        onCancel={() => navigate(`/millores/${improvement.id}`)}
        onSuccess={(savedId) => navigate(`/millores/${savedId}`)}
      />
    )
  }

  const priorityLabel =
    improvement.priority != null ? PRIORITY_CONFIG[improvement.priority]?.label ?? String(improvement.priority) : "-"

  const handleCreateValuation = async (payload: {
    redmineChildRef: string
    dueDate: string
    priority: number | null
    textileBody: string
    structuredContentJson: string
    analysisHours: number | null
    totalEstimatedHours: number | null
  }): Promise<void> => {
    try {
      await createValuationMut.mutateAsync({
        improvementId,
        body: payload,
      })
      toast.success("Valoració creada", { duration: 2500 })
      setBootstrapOpen(false)
      navigate(`/millores/${improvementId}/valoracio`)
    } catch {
      toast.error("No s'ha pogut crear la valoració", { duration: 3000 })
      throw new Error("create-valuation-failed")
    }
  }

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-start gap-3">
          <Button type="button" variant="ghost" size="icon" onClick={() => navigate("/millores")} aria-label="Tornar a millores">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{improvement.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Resum funcional i context operatiu de la millora.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(`/millores/${improvement.id}/edit`)}>
            Editar
          </Button>

          {improvement.valuation_summary ? (
            <Button asChild>
              <Link to={`/millores/${improvement.id}/valoracio`}>Obrir valoració</Link>
            </Button>
          ) : (
            <Button type="button" onClick={() => setBootstrapOpen(true)}>
              Crear valoració
            </Button>
          )}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Dades principals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-[180px_1fr] gap-2">
              <span className="text-muted-foreground">Estat</span>
              <Badge variant="secondary">{getImprovementStatusLabel(improvement.status)}</Badge>
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-2">
              <span className="text-muted-foreground">Completitud</span>
              <span className="font-medium text-foreground">{improvement.completion_percentage}%</span>
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-2">
              <span className="text-muted-foreground">Prioritat</span>
              <span className="text-foreground">{priorityLabel}</span>
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-2">
              <span className="text-muted-foreground">Versió</span>
              <span className="text-foreground">{improvement.version?.name ?? "-"}</span>
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-2">
              <span className="text-muted-foreground">Data límit</span>
              <span className="text-foreground">{formatDate(improvement.due_date)}</span>
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-2">
              <span className="text-muted-foreground">Hores venudes</span>
              <span className="text-foreground">{improvement.sold_hours != null ? `${improvement.sold_hours} h` : "-"}</span>
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-2">
              <span className="text-muted-foreground">Redmine</span>
              <span className="text-foreground">
                {improvement.redmine_parent_ref ? (
                  <a
                    href={redmineIssueUrl(improvement.redmine_parent_ref)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-data-info hover:underline"
                  >
                    {improvement.redmine_parent_ref}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  "-"
                )}
              </span>
            </div>
            <div className="grid grid-cols-[180px_1fr] gap-2">
              <span className="text-muted-foreground">JIRA</span>
              <span className="text-foreground">
                {improvement.jira_ref ? (
                  <a
                    href={jiraIssueUrl(improvement.jira_ref)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-data-info hover:underline"
                  >
                    {improvement.jira_ref}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  "-"
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Valoració</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {improvement.valuation_summary ? (
              <>
                <div className="grid grid-cols-[180px_1fr] gap-2">
                  <span className="text-muted-foreground">Estat</span>
                  <span className="font-medium text-foreground">
                    {getValuationStatusLabel(improvement.valuation_summary.status)}
                  </span>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-2">
                  <span className="text-muted-foreground">Completitud</span>
                  <span className="text-foreground">{improvement.valuation_summary.completion_percentage}%</span>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-2">
                  <span className="text-muted-foreground">Hores anàlisi</span>
                  <span className="text-foreground">
                    {improvement.valuation_summary.analysis_hours != null
                      ? `${improvement.valuation_summary.analysis_hours} h`
                      : "-"}
                  </span>
                </div>
                <div className="grid grid-cols-[180px_1fr] gap-2">
                  <span className="text-muted-foreground">Hores totals</span>
                  <span className="text-foreground">
                    {improvement.valuation_summary.total_estimated_hours != null
                      ? `${improvement.valuation_summary.total_estimated_hours} h`
                      : "-"}
                  </span>
                </div>
              </>
            ) : (
              <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                Encara no hi ha valoració creada.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Requisits i notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-foreground">
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Requisits</h3>
            <p className="whitespace-pre-wrap">{improvement.requirements || "-"}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Context</h3>
              <p className="whitespace-pre-wrap">{improvement.note.context || "-"}</p>
            </div>
            <div>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Risc / dependència</h3>
              <p className="whitespace-pre-wrap">{improvement.note.risk_dependency || "-"}</p>
            </div>
            <div>
              <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Observacions</h3>
              <p className="whitespace-pre-wrap">{improvement.note.observations || "-"}</p>
            </div>
          </div>
          <div>
            <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Etiquetes</h3>
            <div className="flex flex-wrap gap-2">
              {improvement.tags.length > 0 ? (
                improvement.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="uppercase tracking-wider">
                    {tag.name}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wide text-muted-foreground">Tasques vinculades</CardTitle>
        </CardHeader>
        <CardContent>
          {entriesLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregant tasques...
            </div>
          ) : (linkedEntries?.data.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No hi ha tasques vinculades.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Títol</TableHead>
                  <TableHead>Estat</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Accions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linkedEntries?.data.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium text-foreground">{entry.title}</TableCell>
                    <TableCell>{entry.status}</TableCell>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>
                      <TableActionGroup className="ml-auto">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={cn(tableActionIntentClassName("open"))}
                          onClick={() => navigate(`/tasks?id=${entry.id}`)}
                        >
                          Obrir
                        </Button>
                      </TableActionGroup>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ValuationBootstrapDialog
        open={bootstrapOpen}
        onOpenChange={setBootstrapOpen}
        defaultPriority={improvement.priority}
        onConfirm={handleCreateValuation}
        isSubmitting={createValuationMut.isPending}
      />
    </div>
  )
}
