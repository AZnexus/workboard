import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface ValuationTemplateFormValues {
  name: string
  textileTemplate: string
}

interface ValuationTemplateFormProps {
  initialValues?: ValuationTemplateFormValues
  submitLabel: string
  isSubmitting?: boolean
  onSubmit: (values: ValuationTemplateFormValues) => Promise<void>
  onCancel: () => void
}

export function ValuationTemplateForm({
  initialValues,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: ValuationTemplateFormProps) {
  const [name, setName] = useState(initialValues?.name ?? "")
  const [textileTemplate, setTextileTemplate] = useState(initialValues?.textileTemplate ?? "")

  const canSubmit = name.trim() !== "" && textileTemplate.trim() !== ""

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault()
    if (!canSubmit) return

    await onSubmit({
      name: name.trim(),
      textileTemplate: textileTemplate.trim(),
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <label htmlFor="valuation-template-name" className="text-xs font-medium text-muted-foreground">
          Nom de la plantilla
        </label>
        <Input
          id="valuation-template-name"
          placeholder="Nom de la plantilla..."
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="valuation-template-textile" className="text-xs font-medium text-muted-foreground">
          Plantilla Textile
        </label>
        <Textarea
          id="valuation-template-textile"
          aria-label="Plantilla Textile"
          placeholder="h1. Valoració\n\n{{analysis}}\n\n{{valuation}}"
          className="min-h-48"
          value={textileTemplate}
          onChange={(event) => setTextileTemplate(event.target.value)}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel·lar
        </Button>
        <Button type="submit" disabled={!canSubmit || isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
