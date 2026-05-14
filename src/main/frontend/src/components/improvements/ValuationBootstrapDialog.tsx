import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ValuationBootstrapPayload {
  redmineChildRef: string
  dueDate: string
  priority: number | null
  textileBody: string
  structuredContentJson: string
  analysisHours: number | null
  totalEstimatedHours: number | null
}

interface ValuationBootstrapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultPriority?: number | null
  onConfirm: (payload: ValuationBootstrapPayload) => Promise<void>
  isSubmitting?: boolean
}

interface ValuationStructure {
  db: boolean
  apis: boolean
  webs: boolean
  apiSubblocks: string[]
  webSubblocks: string[]
}

function splitSubblocks(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function toBulletList(values: string[]) {
  if (values.length === 0) return "_Sense afectació_"
  return values.map((item) => `* ${item}`).join("\n")
}

function buildTextile(structure: ValuationStructure) {
  const dbSection = structure.db ? "_Pendent de detall_" : "_No aplica_"
  const apiSection = structure.apis ? toBulletList(structure.apiSubblocks) : "_No aplica_"
  const webSection = structure.webs ? toBulletList(structure.webSubblocks) : "_No aplica_"

  return [
    "h1. Anàlisi",
    "",
    "h3. Resum de tasques",
    "",
    "_Pendent de detall_",
    "",
    "h1. Pre-anàlisi",
    "",
    "h2. DB",
    "",
    dbSection,
    "",
    "h2. APIS",
    "",
    apiSection,
    "",
    "h2. WEBS",
    "",
    webSection,
    "",
    "h2. Valoració",
    "",
    "_Pendent de detall_",
  ].join("\n")
}

export function ValuationBootstrapDialog({
  open,
  onOpenChange,
  defaultPriority,
  onConfirm,
  isSubmitting = false,
}: ValuationBootstrapDialogProps) {
  const [redmineChildRef, setRedmineChildRef] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [priority, setPriority] = useState<string>(defaultPriority != null ? String(defaultPriority) : "none")
  const [dbEnabled, setDbEnabled] = useState(false)
  const [apisEnabled, setApisEnabled] = useState(false)
  const [websEnabled, setWebsEnabled] = useState(false)
  const [apiSubblocksRaw, setApiSubblocksRaw] = useState("")
  const [webSubblocksRaw, setWebSubblocksRaw] = useState("")

  const apiSubblocks = useMemo(() => splitSubblocks(apiSubblocksRaw), [apiSubblocksRaw])
  const webSubblocks = useMemo(() => splitSubblocks(webSubblocksRaw), [webSubblocksRaw])

  const canSubmit = redmineChildRef.trim() !== "" && dueDate.trim() !== ""

  const resetState = () => {
    setRedmineChildRef("")
    setDueDate("")
    setPriority(defaultPriority != null ? String(defaultPriority) : "none")
    setDbEnabled(false)
    setApisEnabled(false)
    setWebsEnabled(false)
    setApiSubblocksRaw("")
    setWebSubblocksRaw("")
  }

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      resetState()
    }
  }

  const handleConfirm = async () => {
    if (!canSubmit) return

    const structure: ValuationStructure = {
      db: dbEnabled,
      apis: apisEnabled,
      webs: websEnabled,
      apiSubblocks,
      webSubblocks,
    }

    await onConfirm({
      redmineChildRef: redmineChildRef.trim(),
      dueDate,
      priority: priority === "none" ? null : Number(priority),
      textileBody: buildTextile(structure),
      structuredContentJson: JSON.stringify(structure),
      analysisHours: null,
      totalEstimatedHours: null,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear valoració inicial</DialogTitle>
          <DialogDescription>
            Defineix les dades obligatòries i l&apos;estructura base (DB/APIs/WEBs) abans d&apos;obrir l&apos;editor.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="valuation-redmine-child-ref" className="text-xs font-medium text-muted-foreground">
              Redmine fill
            </label>
            <Input
              id="valuation-redmine-child-ref"
              aria-label="Redmine fill"
              value={redmineChildRef}
              onChange={(event) => setRedmineChildRef(event.target.value)}
              placeholder="RM-101-1"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="valuation-due-date" className="text-xs font-medium text-muted-foreground">
              Data límit
            </label>
            <Input
              id="valuation-due-date"
              aria-label="Data límit"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="valuation-priority" className="text-xs font-medium text-muted-foreground">
              Prioritat inicial
            </label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="valuation-priority" aria-label="Prioritat inicial" className="w-full">
                <SelectValue placeholder="Heretar de la millora" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Heretar de la millora</SelectItem>
                <SelectItem value="1">Immediata</SelectItem>
                <SelectItem value="2">Urgent</SelectItem>
                <SelectItem value="3">Alta</SelectItem>
                <SelectItem value="4">Normal</SelectItem>
                <SelectItem value="5">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <fieldset className="space-y-2 md:col-span-2">
            <legend className="text-xs font-medium text-muted-foreground">Estructura base</legend>
            <div className="flex flex-wrap gap-4 rounded-md border border-border bg-background px-3 py-2">
              <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={dbEnabled}
                  onChange={(event) => setDbEnabled(event.target.checked)}
                  aria-label="DB"
                  className="h-4 w-4 rounded border-border text-primary"
                />
                DB
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={apisEnabled}
                  onChange={(event) => setApisEnabled(event.target.checked)}
                  aria-label="APIs"
                  className="h-4 w-4 rounded border-border text-primary"
                />
                APIs
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={websEnabled}
                  onChange={(event) => setWebsEnabled(event.target.checked)}
                  aria-label="WEBs"
                  className="h-4 w-4 rounded border-border text-primary"
                />
                WEBs
              </label>
            </div>
          </fieldset>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="valuation-api-subblocks" className="text-xs font-medium text-muted-foreground">
              Subblocs API (un per línia)
            </label>
            <Textarea
              id="valuation-api-subblocks"
              aria-label="Subblocs API"
              value={apiSubblocksRaw}
              onChange={(event) => setApiSubblocksRaw(event.target.value)}
              placeholder="Autenticació\nIntegracions\nValidacions"
              className="min-h-24"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="valuation-web-subblocks" className="text-xs font-medium text-muted-foreground">
              Subblocs WEB (un per línia)
            </label>
            <Textarea
              id="valuation-web-subblocks"
              aria-label="Subblocs WEB"
              value={webSubblocksRaw}
              onChange={(event) => setWebSubblocksRaw(event.target.value)}
              placeholder="Portal client\nBackoffice\nAdmin"
              className="min-h-24"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel·lar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!canSubmit || isSubmitting}>
            Crear valoració inicial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
