import type { ImprovementStatus, ValuationStatus } from "@/types"

type Option<TValue extends string | number | boolean> = {
  value: TValue
  label: string
}

export const IMPROVEMENT_STATUS_OPTIONS: Array<Option<ImprovementStatus>> = [
  { value: "NOVA", label: "Nova" },
  { value: "EN_VALORACIO", label: "En valoració" },
  { value: "VALORADA", label: "Valorada" },
  { value: "ENVIADA_A_CLIENT", label: "Enviada a client" },
  { value: "APROVADA", label: "Aprovada" },
  { value: "EN_DESENVOLUPAMENT", label: "En desenvolupament" },
  { value: "VALIDANT", label: "Validant" },
  { value: "PENDENT_DE_REVISIO", label: "Pendent de revisió" },
  { value: "FINALITZADA", label: "Finalitzada" },
  { value: "PENDENT_D_INTEGRAR", label: "Pendent d'integrar" },
  { value: "INTEGRADA", label: "Integrada" },
  { value: "BLOQUEJADA", label: "Bloquejada" },
  { value: "CANCEL_LADA", label: "Cancel·lada" },
]

export const IMPROVEMENT_STATUS_FILTER_OPTIONS: Array<Option<ImprovementStatus | "all">> = [
  { value: "all", label: "Tots" },
  ...IMPROVEMENT_STATUS_OPTIONS,
]

export const IMPROVEMENT_PRIORITY_FILTER_OPTIONS: Array<Option<number | "all">> = [
  { value: "all", label: "Totes" },
  { value: 1, label: "Immediata" },
  { value: 2, label: "Urgent" },
  { value: 3, label: "Alta" },
  { value: 4, label: "Normal" },
  { value: 5, label: "Baixa" },
]

export const HAS_VALUATION_OPTIONS: Array<Option<"all" | "with" | "without">> = [
  { value: "all", label: "Totes" },
  { value: "with", label: "Amb valoració" },
  { value: "without", label: "Sense valoració" },
]

export const VALUATION_STATUS_LABELS: Record<ValuationStatus, string> = {
  NO_COMENCADA: "No començada",
  EN_CURS: "En curs",
  PER_REVISAR: "Per revisar",
  PENDENT_DE_CANVIS: "Pendent de canvis",
  REVISADA: "Revisada",
  ENVIADA: "Enviada",
  TANCADA: "Tancada",
  BLOQUEJADA: "Bloquejada",
  CANCEL_LADA: "Cancel·lada",
}

export function getImprovementStatusLabel(status: ImprovementStatus) {
  return IMPROVEMENT_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
}

export function getValuationStatusLabel(status: ValuationStatus) {
  return VALUATION_STATUS_LABELS[status] ?? status
}
