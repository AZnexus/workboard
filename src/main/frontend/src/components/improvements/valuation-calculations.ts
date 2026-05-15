export interface ValuationCalculationInput {
  analysisHours: number
  dbApplies: boolean
  dbHours: number
  apisApplies: boolean
  apiSubblockHours: number[]
  websApplies: boolean
  webSubblockHours: number[]
  testHours: number
  designHours: number
  followUpHours: number
}

export interface ValuationCalculationTotals {
  dbSubtotal: number
  apisSubtotal: number
  websSubtotal: number
  managementHours: number
  managementPlusJirasHours: number
  finalTotalHours: number
}

function sanitizeHours(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

function sumHours(values: number[]): number {
  return values.reduce((acc, current) => acc + sanitizeHours(current), 0)
}

export function calculateValuationTotals(input: ValuationCalculationInput): ValuationCalculationTotals {
  const analysisHours = sanitizeHours(input.analysisHours)
  const dbSubtotal = input.dbApplies ? sanitizeHours(input.dbHours) : 0
  const apisSubtotal = input.apisApplies ? sumHours(input.apiSubblockHours) : 0
  const websSubtotal = input.websApplies ? sumHours(input.webSubblockHours) : 0
  const testHours = sanitizeHours(input.testHours)
  const designHours = sanitizeHours(input.designHours)
  const followUpHours = sanitizeHours(input.followUpHours)

  const managementHours = (analysisHours + dbSubtotal + apisSubtotal + websSubtotal + testHours) / 2
  const managementPlusJirasHours = managementHours / 4
  const finalTotalHours =
    analysisHours +
    dbSubtotal +
    apisSubtotal +
    websSubtotal +
    testHours +
    designHours +
    managementHours +
    managementPlusJirasHours +
    followUpHours

  return {
    dbSubtotal,
    apisSubtotal,
    websSubtotal,
    managementHours,
    managementPlusJirasHours,
    finalTotalHours,
  }
}

export function formatHours(value: number): string {
  const normalized = sanitizeHours(value)
  if (Number.isInteger(normalized)) return `${normalized}`
  return normalized.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")
}
