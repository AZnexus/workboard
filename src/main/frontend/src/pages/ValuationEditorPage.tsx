import { useEffect, useMemo, useRef, useState } from "react"
import { ClipboardCopy, Loader2, Save } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"

import { ValuationEditor } from "@/components/improvements/ValuationEditor"
import { calculateValuationTotals } from "@/components/improvements/valuation-calculations"
import {
  buildValuationTextile,
  parseValuationStructuredContent,
  serializeValuationStructuredContent,
  type ValuationStructuredContent,
} from "@/components/improvements/valuation-textile"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useUpdateValuation, useValuation } from "@/hooks/useImprovements"
import { toast } from "sonner"

type TextileMode = "preview" | "manual"

type ValuationSnapshotSource = {
  structured_content_json: string | null
  textile_body: string | null
  textile_customized: boolean
  template: {
    textile_template: string
  } | null
}

function buildValuationSnapshot(valuation: ValuationSnapshotSource | null | undefined) {
  if (!valuation) return null

  return JSON.stringify({
    structuredContentJson: valuation.structured_content_json ?? null,
    textileBody: valuation.textile_body ?? null,
    textileCustomized: valuation.textile_customized ?? false,
    templateTextile: valuation.template?.textile_template ?? null,
  })
}

export function ValuationEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const improvementId = id ? Number(id) : 0
  const { data: valuation, isLoading } = useValuation(improvementId)
  const updateValuationMut = useUpdateValuation()

  const hasHydratedRef = useRef(false)
  const isDirtyRef = useRef(false)
  const lastLoadedSnapshotRef = useRef<string | null>(null)

  const initialContent = useMemo<ValuationStructuredContent>(() => {
    return parseValuationStructuredContent(valuation?.structured_content_json, valuation?.template?.textile_template)
  }, [valuation?.structured_content_json, valuation?.template?.textile_template])

  const [content, setContent] = useState<ValuationStructuredContent>(initialContent)
  const [textileMode, setTextileMode] = useState<TextileMode>("preview")
  const [manualTextileBody, setManualTextileBody] = useState("")
  const [textileCustomized, setTextileCustomized] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (!valuation) {
      return
    }

    const serverSnapshot = buildValuationSnapshot(valuation)
    const firstHydration = !hasHydratedRef.current
    const sourceChanged = serverSnapshot !== lastLoadedSnapshotRef.current

    if ((firstHydration || sourceChanged) && !isDirtyRef.current) {
      setContent(initialContent)
      const nextGenerated = buildValuationTextile(initialContent, valuation?.template?.textile_template)
      const serverTextile = valuation?.textile_body ?? ""
      const hasServerTextile = serverTextile.trim().length > 0
      const nextCustomized = valuation?.textile_customized === true || (hasServerTextile && serverTextile !== nextGenerated)

      setTextileCustomized(nextCustomized)
      setManualTextileBody(nextCustomized ? serverTextile : nextGenerated)
      setIsDirty(false)
      hasHydratedRef.current = true
      lastLoadedSnapshotRef.current = serverSnapshot
    }
  }, [initialContent, valuation?.structured_content_json, valuation?.template?.textile_template, valuation?.textile_body, valuation?.textile_customized])

  useEffect(() => {
    isDirtyRef.current = isDirty
  }, [isDirty])

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  const generatedTextileBody = useMemo(
    () => buildValuationTextile(content, valuation?.template?.textile_template),
    [content, valuation?.template?.textile_template],
  )

  const textileBody = textileCustomized ? manualTextileBody : generatedTextileBody
  const manualEditorValue = textileCustomized ? manualTextileBody : generatedTextileBody

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textileBody)
      toast.success("Textile copiat", { duration: 2000 })
    } catch {
      toast.error("No s'ha pogut copiar el Textile", { duration: 2500 })
    }
  }

  const handleSave = async () => {
    if (!improvementId) return
    if (!valuation) return

    try {
      const serialized = serializeValuationStructuredContent(content)
      const totals = calculateValuationTotals({
        analysisHours: content.analysisHours,
        dbApplies: content.db.applies,
        dbHours: content.db.hours,
        apisApplies: content.apis.applies,
        apiSubblockHours: content.apis.subblocks.map((item) => item.hours),
        websApplies: content.webs.applies,
        webSubblockHours: content.webs.subblocks.map((item) => item.hours),
        testHours: content.testHours,
        designHours: content.designHours,
        followUpHours: content.followUpHours,
      })

      await updateValuationMut.mutateAsync({
        improvementId,
        body: {
          structuredContentJson: serialized,
          textileBody,
          textileCustomized,
          analysisHours: content.analysisHours,
          totalEstimatedHours: totals.finalTotalHours,
        },
      })

      lastLoadedSnapshotRef.current = buildValuationSnapshot({
        ...valuation,
        structured_content_json: serialized,
        textile_body: textileBody,
        textile_customized: textileCustomized,
      })
      setIsDirty(false)
      toast.success("Valoració guardada", { duration: 2500 })
    } catch {
      toast.error("No s'ha pogut guardar la valoració", { duration: 3000 })
    }
  }

  const handleContentChange = (next: ValuationStructuredContent) => {
    setContent(next)
    setIsDirty(true)
  }

  const handleManualTextileChange = (nextTextileBody: string) => {
    setManualTextileBody(nextTextileBody)
    setTextileCustomized(true)
    setIsDirty(true)
  }

  const handleRegenerateFromBlocks = () => {
    setManualTextileBody(generatedTextileBody)
    setTextileCustomized(false)
    setIsDirty(true)
  }

  const handleBackToRead = () => {
    if (isDirtyRef.current) {
      const confirmed = window.confirm("Tens canvis sense guardar. Vols sortir igualment?")
      if (!confirmed) return
    }

    navigate(`/millores/${improvementId}/valoracio`)
  }

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

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">Editor de valoració</h1>
          <span className="text-sm text-muted-foreground">{valuation.derived_title}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleBackToRead}>
            Tornar a lectura
          </Button>
          <Button type="button" variant="ghost" onClick={handleCopy}>
            <ClipboardCopy className="h-4 w-4" />
            Copiar Textile
          </Button>
          <Button type="button" onClick={handleSave} disabled={updateValuationMut.isPending}>
            {updateValuationMut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 lg:grid-cols-2">
        <div className="min-h-0 overflow-y-auto border-r border-border p-6">
          <ValuationEditor value={content} onChange={handleContentChange} textileCustomized={textileCustomized} />
        </div>

        <div data-testid="valuation-preview-pane" className="min-h-0 overflow-y-auto bg-card/30 p-6">
          <Tabs
            value={textileMode}
            onValueChange={(nextMode) => setTextileMode(nextMode as TextileMode)}
            className="flex h-full min-h-0 flex-col"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="preview">Vista prèvia</TabsTrigger>
                <TabsTrigger value="manual">Textile manual</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Badge variant={textileCustomized ? "warning" : "info"}>
                  {textileCustomized ? "Textile personalitzat" : "Textile generat des de blocs"}
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateFromBlocks}
                  disabled={!textileCustomized}
                >
                  Regenerar des de blocs
                </Button>
              </div>
            </div>

            <TabsContent value="preview" className="mt-0 min-h-0 flex-1">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vista prèvia Textile</h2>
              <pre className="overflow-x-auto rounded-md border border-border bg-background p-4 text-sm text-foreground">
                {textileBody}
              </pre>
            </TabsContent>

            <TabsContent value="manual" className="mt-0 min-h-0 flex-1">
              <div className="space-y-2">
                <label htmlFor="valuation-manual-textile" className="text-sm font-medium text-muted-foreground">
                  Textile manual
                </label>
                <Textarea
                  id="valuation-manual-textile"
                  aria-label="Textile manual"
                  value={manualEditorValue}
                  onChange={(event) => handleManualTextileChange(event.target.value)}
                  className="min-h-96 font-mono"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
