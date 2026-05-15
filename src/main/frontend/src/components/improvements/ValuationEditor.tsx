import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { calculateValuationTotals, formatHours } from "./valuation-calculations"

import {
  createValuationSubblock,
  type ValuationStructuredContent,
  type ValuationSubblock,
} from "./valuation-textile"

interface ValuationEditorProps {
  value: ValuationStructuredContent
  textileCustomized?: boolean
  onChange: (next: ValuationStructuredContent) => void
}

function StackSection({
  title,
  appliesLabel,
  enabled,
  subblocks,
  addLabel,
  onEnabledChange,
  onAddSubblock,
  onRemoveSubblock,
  onSubblockChange,
}: {
  title: string
  appliesLabel: string
  enabled: boolean
  subblocks: ValuationSubblock[]
  addLabel: string
  onEnabledChange: (value: boolean) => void
  onAddSubblock: () => void
  onRemoveSubblock: (id: string) => void
  onSubblockChange: (id: string, field: "title" | "detail" | "hours", value: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <label className="inline-flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            aria-label={appliesLabel}
            checked={enabled}
            onChange={(event) => onEnabledChange(event.target.checked)}
            className="h-4 w-4 rounded border-border text-primary"
          />
          Aplica
        </label>

        {enabled ? (
          <div className="space-y-3">
            {subblocks.map((subblock, index) => (
              <div key={subblock.id} className="space-y-2 rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor={`${title}-subblock-title-${subblock.id}`}
                    className="text-sm font-medium text-muted-foreground"
                  >
                    Subbloc {index + 1}
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Eliminar subbloc ${title} ${index + 1}`}
                    onClick={() => onRemoveSubblock(subblock.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id={`${title}-subblock-title-${subblock.id}`}
                  aria-label={`Nom subbloc ${title} ${index + 1}`}
                  value={subblock.title}
                  onChange={(event) => onSubblockChange(subblock.id, "title", event.target.value)}
                  placeholder={`Nom subbloc ${title}`}
                />
                <Textarea
                  aria-label={`Detall subbloc ${title} ${index + 1}`}
                  value={subblock.detail}
                  onChange={(event) => onSubblockChange(subblock.id, "detail", event.target.value)}
                  placeholder="Detall del subbloc"
                />
                <div className="space-y-1">
                  <label htmlFor={`${title}-subblock-hours-${subblock.id}`} className="text-xs text-muted-foreground">
                    Hores
                  </label>
                  <Input
                    id={`${title}-subblock-hours-${subblock.id}`}
                    aria-label={`Hores subbloc ${title} ${index + 1}`}
                    type="number"
                    min="0"
                    step="0.25"
                    value={subblock.hours}
                    onChange={(event) => onSubblockChange(subblock.id, "hours", event.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={onAddSubblock}>
              <Plus className="h-4 w-4" />
              {addLabel}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function ValuationEditor({ value, textileCustomized = false, onChange }: ValuationEditorProps) {
  const totals = calculateValuationTotals({
    analysisHours: value.analysisHours,
    dbApplies: value.db.applies,
    dbHours: value.db.hours,
    apisApplies: value.apis.applies,
    apiSubblockHours: value.apis.subblocks.map((item) => item.hours),
    websApplies: value.webs.applies,
    webSubblockHours: value.webs.subblocks.map((item) => item.hours),
    testHours: value.testHours,
    designHours: value.designHours,
    followUpHours: value.followUpHours,
  })

  const parseHoursInput = (raw: string) => {
    const parsed = Number(raw)
    if (!Number.isFinite(parsed) || parsed < 0) return 0
    return parsed
  }

  const update = (partial: Partial<ValuationStructuredContent>) => {
    onChange({
      ...value,
      ...partial,
    })
  }

  const updateApiSubblocks = (subblocks: ValuationSubblock[]) => {
    update({
      apis: {
        ...value.apis,
        subblocks,
      },
    })
  }

  const updateWebSubblocks = (subblocks: ValuationSubblock[]) => {
    update({
      webs: {
        ...value.webs,
        subblocks,
      },
    })
  }

  const updateAutoBlock = (key: string, nextValue: string) => {
    update({
      autoBlocks: value.autoBlocks.map((autoBlock) =>
        autoBlock.key === key
          ? {
              ...autoBlock,
              value: nextValue,
            }
          : autoBlock,
      ),
    })
  }

  return (
    <div data-testid="valuation-editor-pane" className="space-y-4">
      {textileCustomized ? (
        <div className="rounded-md border border-[var(--data-warning)]/50 bg-[color-mix(in_srgb,var(--background)_85%,var(--data-warning))] px-3 py-2 text-sm text-[var(--data-warning)]">
          El Textile està personalitzat. Els canvis per blocs no sobreescriuen el text manual fins a regenerar explícitament.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Anàlisi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="valuation-analysis" className="text-sm font-medium text-muted-foreground">
              Anàlisi
            </label>
            <Textarea
              id="valuation-analysis"
              aria-label="Anàlisi"
              value={value.analysis}
              onChange={(event) => update({ analysis: event.target.value })}
              placeholder="Context i objectiu de l'anàlisi"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="valuation-analysis-hours" className="text-sm font-medium text-muted-foreground">
              Hores anàlisi
            </label>
            <Input
              id="valuation-analysis-hours"
              aria-label="Hores anàlisi"
              type="number"
              min="0"
              step="0.25"
              value={value.analysisHours}
              onChange={(event) => update({ analysisHours: parseHoursInput(event.target.value) })}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="valuation-task-summary" className="text-sm font-medium text-muted-foreground">
              Resum de tasques
            </label>
            <Textarea
              id="valuation-task-summary"
              aria-label="Resum de tasques"
              value={value.taskSummary}
              onChange={(event) => update({ taskSummary: event.target.value })}
              placeholder="Llista breu de tasques previstes"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pre-anàlisi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="valuation-pre-analysis" className="text-sm font-medium text-muted-foreground">
              Pre-anàlisi
            </label>
            <Textarea
              id="valuation-pre-analysis"
              aria-label="Pre-anàlisi"
              value={value.preAnalysis}
              onChange={(event) => update({ preAnalysis: event.target.value })}
              placeholder="Dependències, risc i impacte"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DB</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="inline-flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              aria-label="DB aplica"
              checked={value.db.applies}
              onChange={(event) =>
                update({
                  db: {
                    ...value.db,
                    applies: event.target.checked,
                  },
                })
              }
              className="h-4 w-4 rounded border-border text-primary"
            />
            Aplica
          </label>

          {value.db.applies ? (
            <div className="space-y-2">
              <label htmlFor="valuation-db-detail" className="text-sm font-medium text-muted-foreground">
                Detall DB
              </label>
              <Textarea
                id="valuation-db-detail"
                aria-label="Detall DB"
                value={value.db.detail}
                onChange={(event) =>
                  update({
                    db: {
                      ...value.db,
                      detail: event.target.value,
                    },
                  })
                }
                placeholder="Impacte sobre model de dades, migracions, índexs..."
              />
              <div className="space-y-2">
                <label htmlFor="valuation-db-hours" className="text-sm font-medium text-muted-foreground">
                  Hores DB
                </label>
                <Input
                  id="valuation-db-hours"
                  aria-label="Hores DB"
                  type="number"
                  min="0"
                  step="0.25"
                  value={value.db.hours}
                  onChange={(event) =>
                    update({
                      db: {
                        ...value.db,
                        hours: parseHoursInput(event.target.value),
                      },
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>
          ) : null}

          <p className="text-sm text-muted-foreground">Subtotal DB: {formatHours(totals.dbSubtotal)}h</p>
        </CardContent>
      </Card>

      <StackSection
        title="API"
        appliesLabel="APIS aplica"
        enabled={value.apis.applies}
        subblocks={value.apis.subblocks}
        addLabel="Afegir subbloc API"
        onEnabledChange={(enabled) =>
          update({
            apis: {
              ...value.apis,
              applies: enabled,
            },
          })
        }
        onAddSubblock={() => updateApiSubblocks([...value.apis.subblocks, createValuationSubblock()])}
        onRemoveSubblock={(id) => updateApiSubblocks(value.apis.subblocks.filter((item) => item.id !== id))}
        onSubblockChange={(id, field, fieldValue) =>
          updateApiSubblocks(
            value.apis.subblocks.map((item) =>
              item.id === id
                ? {
                    ...item,
                    [field]: field === "hours" ? parseHoursInput(fieldValue) : fieldValue,
                  }
                : item,
            ),
          )
        }
      />

      <p className="text-sm text-muted-foreground">Subtotal APIs: {formatHours(totals.apisSubtotal)}h</p>

      <StackSection
        title="WEB"
        appliesLabel="WEBS aplica"
        enabled={value.webs.applies}
        subblocks={value.webs.subblocks}
        addLabel="Afegir subbloc WEB"
        onEnabledChange={(enabled) =>
          update({
            webs: {
              ...value.webs,
              applies: enabled,
            },
          })
        }
        onAddSubblock={() => updateWebSubblocks([...value.webs.subblocks, createValuationSubblock()])}
        onRemoveSubblock={(id) => updateWebSubblocks(value.webs.subblocks.filter((item) => item.id !== id))}
        onSubblockChange={(id, field, fieldValue) =>
          updateWebSubblocks(
            value.webs.subblocks.map((item) =>
              item.id === id
                ? {
                    ...item,
                    [field]: field === "hours" ? parseHoursInput(fieldValue) : fieldValue,
                  }
                : item,
            ),
          )
        }
      />

      <p className="text-sm text-muted-foreground">Subtotal WEBs: {formatHours(totals.websSubtotal)}h</p>

      <Card>
        <CardHeader>
          <CardTitle>Valoració</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <label htmlFor="valuation-final" className="text-sm font-medium text-muted-foreground">
            Valoració
          </label>
          <Textarea
            id="valuation-final"
            aria-label="Valoració"
            value={value.valuation}
            onChange={(event) => update({ valuation: event.target.value })}
            placeholder="Conclusió, estimació final i observacions"
          />

          <div className="space-y-2">
            <label htmlFor="valuation-test-hours" className="text-sm font-medium text-muted-foreground">
              Hores proves
            </label>
            <Input
              id="valuation-test-hours"
              aria-label="Hores proves"
              type="number"
              min="0"
              step="0.25"
              value={value.testHours}
              onChange={(event) => update({ testHours: parseHoursInput(event.target.value) })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="valuation-design-hours" className="text-sm font-medium text-muted-foreground">
              Hores disseny
            </label>
            <Input
              id="valuation-design-hours"
              aria-label="Hores disseny"
              type="number"
              min="0"
              step="0.25"
              value={value.designHours}
              onChange={(event) => update({ designHours: parseHoursInput(event.target.value) })}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="valuation-followup-hours" className="text-sm font-medium text-muted-foreground">
              Hores seguiment
            </label>
            <Input
              id="valuation-followup-hours"
              aria-label="Hores seguiment"
              type="number"
              min="0"
              step="0.25"
              value={value.followUpHours}
              onChange={(event) => update({ followUpHours: parseHoursInput(event.target.value) })}
              placeholder="0"
            />
          </div>

          <div className="rounded-md border border-border bg-background p-3">
            <p className="text-sm text-foreground">Gestió: {formatHours(totals.managementHours)}h</p>
            <p className="text-sm text-foreground">Gestió + jiras: {formatHours(totals.managementPlusJirasHours)}h</p>
            <p className="text-sm font-semibold text-foreground">Total: {formatHours(totals.finalTotalHours)}h</p>
          </div>
        </CardContent>
      </Card>

      {value.autoBlocks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Blocs automàtics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {value.autoBlocks.map((autoBlock) => (
              <div key={autoBlock.key} className="space-y-2">
                <label htmlFor={`valuation-auto-block-${autoBlock.key}`} className="text-sm font-medium text-muted-foreground">
                  Bloc automàtic {autoBlock.key}
                </label>
                <Textarea
                  id={`valuation-auto-block-${autoBlock.key}`}
                  aria-label={`Bloc automàtic ${autoBlock.key}`}
                  value={autoBlock.value}
                  onChange={(event) => updateAutoBlock(autoBlock.key, event.target.value)}
                  placeholder="Contingut del bloc automàtic"
                />
                {!autoBlock.value.trim() ? (
                  <p className="text-xs text-amber-600">Contingut pendent d'emplenar</p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
