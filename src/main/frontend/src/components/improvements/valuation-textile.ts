import type {
  ValuationStructuredAutoBlock as SharedValuationStructuredAutoBlock,
  ValuationStructuredContent as SharedValuationStructuredContent,
} from "@/types"

import { calculateValuationTotals, formatHours } from "./valuation-calculations"

export interface ValuationSubblock {
  id: string
  title: string
  detail: string
  hours: number
}

export interface ValuationAutoBlock extends SharedValuationStructuredAutoBlock {}

interface PersistedValuationSubblock {
  title: string
  detail: string
  hours: number
}

interface PersistedValuationStructuredContent {
  analysis: string
  taskSummary: string
  preAnalysis: string
  analysisHours: number
  db: {
    applies: boolean
    detail: string
    hours: number
  }
  apis: {
    applies: boolean
    subblocks: PersistedValuationSubblock[]
  }
  webs: {
    applies: boolean
    subblocks: PersistedValuationSubblock[]
  }
  valuation: string
  autoBlocks: ValuationAutoBlock[]
  testHours: number
  designHours: number
  followUpHours: number
}

export type ValuationStructuredContent = SharedValuationStructuredContent

const KNOWN_PLACEHOLDERS = ["analysis", "taskSummary", "preAnalysis", "db", "apis", "webs", "valuation"] as const
const KNOWN_PLACEHOLDER_SET = new Set<string>(KNOWN_PLACEHOLDERS)
const PENDING_AUTO_BLOCK_TEXT = "_Contingut pendent d'emplenar_"

export const DEFAULT_VALUATION_TEMPLATE = [
  "h1. Anàlisi",
  "{{analysis}}",
  "h3. Resum de tasques",
  "{{taskSummary}}",
  "h1. Pre-anàlisi",
  "{{preAnalysis}}",
  "h2. DB",
  "{{db}}",
  "h2. APIS",
  "{{apis}}",
  "h2. WEBS",
  "{{webs}}",
  "h2. Valoració",
  "{{valuation}}",
].join("\n\n")

interface LegacyValuationStructure {
  db?: boolean
  apis?: boolean
  webs?: boolean
  apiSubblocks?: string[]
  webSubblocks?: string[]
}

function createSubblockId() {
  return `sb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function extractUnknownPlaceholders(templateTextile: string) {
  const placeholders = new Set<string>()
  const matcher = /{{\s*([a-zA-Z][a-zA-Z0-9]*)\s*}}/g

  for (const match of templateTextile.matchAll(matcher)) {
    const key = match[1]
    if (!KNOWN_PLACEHOLDER_SET.has(key)) {
      placeholders.add(key)
    }
  }

  return [...placeholders]
}

function mergeAutoBlocks(autoBlocks: ValuationAutoBlock[], templateTextile: string): ValuationAutoBlock[] {
  const byKey = new Map(autoBlocks.map((autoBlock) => [autoBlock.key, autoBlock]))

  return extractUnknownPlaceholders(templateTextile).map((key) => byKey.get(key) ?? { key, value: "" })
}

export function createValuationSubblock(title = "", detail = ""): ValuationSubblock {
  return {
    id: createSubblockId(),
    title,
    detail,
    hours: 0,
  }
}

export function createDefaultValuationStructuredContent(templateTextile = DEFAULT_VALUATION_TEMPLATE): ValuationStructuredContent {
  return {
    analysis: "",
    taskSummary: "",
    preAnalysis: "",
    analysisHours: 0,
    db: {
      applies: false,
      detail: "",
      hours: 0,
    },
    apis: {
      applies: false,
      subblocks: [],
    },
    webs: {
      applies: false,
      subblocks: [],
    },
    valuation: "",
    autoBlocks: mergeAutoBlocks([], templateTextile),
    testHours: 0,
    designHours: 0,
    followUpHours: 0,
  }
}

function toPersistedSubblock(subblock: ValuationSubblock): PersistedValuationSubblock {
  return {
    title: subblock.title,
    detail: subblock.detail,
    hours: subblock.hours,
  }
}

export function serializeValuationStructuredContent(content: ValuationStructuredContent): string {
  const persisted: PersistedValuationStructuredContent = {
    analysis: content.analysis,
    taskSummary: content.taskSummary,
    preAnalysis: content.preAnalysis,
    analysisHours: content.analysisHours,
    db: {
      applies: content.db.applies,
      detail: content.db.detail,
      hours: content.db.hours,
    },
    apis: {
      applies: content.apis.applies,
      subblocks: content.apis.subblocks.map(toPersistedSubblock),
    },
    webs: {
      applies: content.webs.applies,
      subblocks: content.webs.subblocks.map(toPersistedSubblock),
    },
    valuation: content.valuation,
    autoBlocks: content.autoBlocks.map((autoBlock) => ({
      key: autoBlock.key,
      value: autoBlock.value,
    })),
    testHours: content.testHours,
    designHours: content.designHours,
    followUpHours: content.followUpHours,
  }

  return JSON.stringify(persisted)
}

export function createValuationStructuredContentFromBootstrap(input: {
  dbApplies: boolean
  apisApplies: boolean
  websApplies: boolean
  apiSubblockTitles: string[]
  webSubblockTitles: string[]
  templateTextile?: string
}): ValuationStructuredContent {
  return {
    ...createDefaultValuationStructuredContent(input.templateTextile),
    db: {
      applies: input.dbApplies,
      detail: "",
      hours: 0,
    },
    apis: {
      applies: input.apisApplies,
      subblocks: input.apiSubblockTitles.map((title) => createValuationSubblock(title, "")),
    },
    webs: {
      applies: input.websApplies,
      subblocks: input.webSubblockTitles.map((title) => createValuationSubblock(title, "")),
    },
  }
}

function normalizeSubblocks(raw: unknown): ValuationSubblock[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null

      const maybeRecord = item as Partial<ValuationSubblock>
      const title = typeof maybeRecord.title === "string" ? maybeRecord.title : ""
      const detail = typeof maybeRecord.detail === "string" ? maybeRecord.detail : ""
      const hours = typeof maybeRecord.hours === "number" ? maybeRecord.hours : 0
      const id = typeof maybeRecord.id === "string" && maybeRecord.id.trim() ? maybeRecord.id : createSubblockId()

      return { id, title, detail, hours }
    })
    .filter((item): item is ValuationSubblock => item != null)
}

function normalizeAutoBlocks(raw: unknown): ValuationAutoBlock[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null

      const maybeRecord = item as Partial<ValuationAutoBlock>
      const key = typeof maybeRecord.key === "string" ? maybeRecord.key.trim() : ""
      const value = typeof maybeRecord.value === "string" ? maybeRecord.value : ""

      if (!key) return null
      return { key, value }
    })
    .filter((item): item is ValuationAutoBlock => item != null)
}

function fromLegacyStructure(legacy: LegacyValuationStructure, templateTextile = DEFAULT_VALUATION_TEMPLATE): ValuationStructuredContent {
  return {
    ...createDefaultValuationStructuredContent(templateTextile),
    db: {
      applies: legacy.db === true,
      detail: "",
      hours: 0,
    },
    apis: {
      applies: legacy.apis === true,
      subblocks: Array.isArray(legacy.apiSubblocks)
        ? legacy.apiSubblocks.map((title) => createValuationSubblock(title, ""))
        : [],
    },
    webs: {
      applies: legacy.webs === true,
      subblocks: Array.isArray(legacy.webSubblocks)
        ? legacy.webSubblocks.map((title) => createValuationSubblock(title, ""))
        : [],
    },
  }
}

export function parseValuationStructuredContent(
  value: string | null | undefined,
  templateTextile = DEFAULT_VALUATION_TEMPLATE,
): ValuationStructuredContent {
  if (!value) return createDefaultValuationStructuredContent(templateTextile)

  try {
    const parsed = JSON.parse(value) as unknown
    if (!parsed || typeof parsed !== "object") return createDefaultValuationStructuredContent(templateTextile)

    const record = parsed as Record<string, unknown>
    const hasModernShape =
      "analysis" in record ||
      "taskSummary" in record ||
      "preAnalysis" in record ||
      "valuation" in record

    if (!hasModernShape) {
      return fromLegacyStructure(record as LegacyValuationStructure, templateTextile)
    }

    const defaults = createDefaultValuationStructuredContent(templateTextile)
    const autoBlocks = mergeAutoBlocks(normalizeAutoBlocks(record.autoBlocks), templateTextile)

    return {
      analysis: typeof record.analysis === "string" ? record.analysis : defaults.analysis,
      taskSummary: typeof record.taskSummary === "string" ? record.taskSummary : defaults.taskSummary,
      preAnalysis: typeof record.preAnalysis === "string" ? record.preAnalysis : defaults.preAnalysis,
      analysisHours: typeof record.analysisHours === "number" ? record.analysisHours : defaults.analysisHours,
      db: {
        applies:
          typeof (record.db as { applies?: unknown })?.applies === "boolean"
            ? ((record.db as { applies: boolean }).applies)
            : defaults.db.applies,
        detail:
          typeof (record.db as { detail?: unknown })?.detail === "string"
            ? ((record.db as { detail: string }).detail)
            : defaults.db.detail,
        hours:
          typeof (record.db as { hours?: unknown })?.hours === "number"
            ? ((record.db as { hours: number }).hours)
            : defaults.db.hours,
      },
      apis: {
        applies:
          typeof (record.apis as { applies?: unknown })?.applies === "boolean"
            ? ((record.apis as { applies: boolean }).applies)
            : defaults.apis.applies,
        subblocks: normalizeSubblocks((record.apis as { subblocks?: unknown })?.subblocks),
      },
      webs: {
        applies:
          typeof (record.webs as { applies?: unknown })?.applies === "boolean"
            ? ((record.webs as { applies: boolean }).applies)
            : defaults.webs.applies,
        subblocks: normalizeSubblocks((record.webs as { subblocks?: unknown })?.subblocks),
      },
      valuation: typeof record.valuation === "string" ? record.valuation : defaults.valuation,
      autoBlocks,
      testHours: typeof record.testHours === "number" ? record.testHours : defaults.testHours,
      designHours: typeof record.designHours === "number" ? record.designHours : defaults.designHours,
      followUpHours: typeof record.followUpHours === "number" ? record.followUpHours : defaults.followUpHours,
    }
  } catch {
    return createDefaultValuationStructuredContent(templateTextile)
  }
}

function getSectionText(value: string) {
  const trimmed = value.trim()
  return trimmed ? trimmed : "_Sense afectació_"
}

function getDbText(content: ValuationStructuredContent) {
  if (!content.db.applies) return "_No aplica_"
  return getSectionText(content.db.detail)
}

function getStackText(
  applies: boolean,
  label: string,
  subblocks: ValuationSubblock[],
) {
  if (!applies) return "_No aplica_"
  if (subblocks.length === 0) return "_Sense afectació_"

  return subblocks
    .map((subblock, index) => {
      const title = subblock.title.trim() || `${label} ${index + 1}`
      const detail = getSectionText(subblock.detail)
      return `h3. ${title}\n\n${detail}\n\n*Hores: ${formatHours(subblock.hours)}h*`
    })
    .join("\n\n")
}

function buildValuationSummaryText(content: ValuationStructuredContent) {
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

  const apiSummaryLines = content.apis.applies
    ? content.apis.subblocks.map(
        (subblock, index) =>
          `*API ${subblock.title.trim() || index + 1}: ${formatHours(subblock.hours)}h*`,
      )
    : []

  const webSummaryLines = content.webs.applies
    ? content.webs.subblocks.map(
        (subblock, index) =>
          `*WEB ${subblock.title.trim() || index + 1}: ${formatHours(subblock.hours)}h*`,
      )
    : []

  return [
    `*Anàlisi: ${formatHours(content.analysisHours)}h*`,
    "",
    `*BD: ${formatHours(totals.dbSubtotal)}h*`,
    ...apiSummaryLines,
    ...webSummaryLines,
    `*Proves: ${formatHours(content.testHours)}h*`,
    `*Disseny: ${formatHours(content.designHours)}h*`,
    "",
    `*Gestió:* (Analisi+BO+APIs+WEBs+Proves)/2 = *${formatHours(totals.managementHours)}h*`,
    `*Gestió + jiras:*  Gestió/4 = *${formatHours(totals.managementPlusJirasHours)}h*`,
    `*Seguiment: ${formatHours(content.followUpHours)}h*`,
    "",
    `**Total: ${formatHours(totals.finalTotalHours)}h**`,
  ].join("\n")
}

function getAutoBlockText(content: ValuationStructuredContent, key: string) {
  const autoBlock = content.autoBlocks.find((candidate) => candidate.key === key)
  if (!autoBlock) return PENDING_AUTO_BLOCK_TEXT

  const trimmed = autoBlock.value.trim()
  return trimmed ? trimmed : PENDING_AUTO_BLOCK_TEXT
}

export function buildValuationTextile(
  content: ValuationStructuredContent,
  templateTextile = DEFAULT_VALUATION_TEMPLATE,
) {
  const replacements = new Map<string, string>([
    ["analysis", getSectionText(content.analysis)],
    ["taskSummary", getSectionText(content.taskSummary)],
    ["preAnalysis", getSectionText(content.preAnalysis)],
    ["db", getDbText(content)],
    ["apis", getStackText(content.apis.applies, "API", content.apis.subblocks)],
    ["webs", getStackText(content.webs.applies, "WEB", content.webs.subblocks)],
    ["valuation", [getSectionText(content.valuation), buildValuationSummaryText(content)].join("\n\n")],
  ])

  return templateTextile.replace(/{{\s*([a-zA-Z][a-zA-Z0-9]*)\s*}}/g, (_match, key: string) => {
    return replacements.get(key) ?? getAutoBlockText(content, key)
  })
}
