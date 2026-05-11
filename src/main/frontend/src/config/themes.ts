export const THEME_MODES = ["dark", "light"] as const

export type ThemeMode = (typeof THEME_MODES)[number]

export type ThemeIdentityId =
  | "indigo-deep"
  | "teal-night"
  | "warm-earth"
  | "steel-blue"
  | "ember-rose"
  | "jade-noir"
  | "sunset-amber"
  | "sage-mist"
  | "ocean-breeze"
  | "forest-moss"
  | "copper-dusk"

export interface ThemeVariant {
  identityId: ThemeIdentityId
  mode: ThemeMode
  className: string
  legacyIds: readonly string[]
}

export interface ThemeIdentity {
  id: ThemeIdentityId
  label: string
  variants: Record<ThemeMode, ThemeVariant>
}

function createIdentity(
  id: ThemeIdentityId,
  label: string,
  classes: { dark: string; light: string },
  legacyIds: { dark?: readonly string[]; light?: readonly string[] } = {},
): ThemeIdentity {
  return {
    id,
    label,
    variants: {
      dark: {
        identityId: id,
        mode: "dark",
        className: classes.dark,
        legacyIds: legacyIds.dark ?? [],
      },
      light: {
        identityId: id,
        mode: "light",
        className: classes.light,
        legacyIds: legacyIds.light ?? [],
      },
    },
  }
}

export const THEME_IDENTITIES = [
  createIdentity(
    "indigo-deep",
    "Indigo Deep",
    { dark: "indigo-deep-dark", light: "indigo-deep-light" },
    { dark: ["dark"], light: ["light"] },
  ),
  createIdentity(
    "teal-night",
    "Teal Night",
    { dark: "teal-night-dark", light: "teal-night-light" },
    { dark: ["teal-night"] },
  ),
  createIdentity(
    "warm-earth",
    "Warm Earth",
    { dark: "warm-earth-dark", light: "warm-earth-light" },
    { dark: ["warm-earth"] },
  ),
  createIdentity(
    "steel-blue",
    "Steel Blue",
    { dark: "steel-blue-dark", light: "steel-blue-light" },
    { dark: ["steel-blue"] },
  ),
  createIdentity(
    "ember-rose",
    "Ember Rose",
    { dark: "ember-rose-dark", light: "ember-rose-light" },
    { dark: ["ember-rose"] },
  ),
  createIdentity(
    "jade-noir",
    "Jade Noir",
    { dark: "jade-noir-dark", light: "jade-noir-light" },
    { dark: ["jade-noir"] },
  ),
  createIdentity(
    "sunset-amber",
    "Sunset Amber",
    { dark: "sunset-amber-dark", light: "sunset-amber-light" },
    { dark: ["sunset-amber"] },
  ),
  createIdentity(
    "sage-mist",
    "Sage Mist",
    { dark: "sage-mist-dark", light: "sage-mist-light" },
    { light: ["sage-mist"] },
  ),
  createIdentity(
    "ocean-breeze",
    "Ocean Breeze",
    { dark: "ocean-breeze-dark", light: "ocean-breeze-light" },
  ),
  createIdentity(
    "forest-moss",
    "Forest Moss",
    { dark: "forest-moss-dark", light: "forest-moss-light" },
  ),
  createIdentity(
    "copper-dusk",
    "Copper Dusk",
    { dark: "copper-dusk-dark", light: "copper-dusk-light" },
  ),
] as const satisfies readonly ThemeIdentity[]

export type ThemeIdentityEntry = (typeof THEME_IDENTITIES)[number]

export const DEFAULT_THEME_IDENTITY_ID: ThemeIdentityId = "indigo-deep"
export const DEFAULT_THEME_MODE: ThemeMode = "dark"

export interface ThemeSelection {
  id: ThemeIdentityId
  mode: ThemeMode
}

export const THEME_VARIANTS = THEME_IDENTITIES.flatMap(identity => [
  identity.variants.dark,
  identity.variants.light,
])

export function getThemeIdentityById(id: ThemeIdentityId): ThemeIdentity {
  return THEME_IDENTITIES.find(identity => identity.id === id) ?? THEME_IDENTITIES[0]
}

export function getThemeVariant(selection: ThemeSelection): ThemeVariant {
  return getThemeIdentityById(selection.id).variants[selection.mode]
}

export function getThemeIdentitiesByMode(mode: ThemeMode): ThemeIdentity[] {
  return THEME_IDENTITIES.filter(identity => Boolean(identity.variants[mode]))
}

export function serializeThemeSelection(selection: ThemeSelection): string {
  return `${selection.id}:${selection.mode}`
}

export function parseThemeSelection(raw: string | null): ThemeSelection | null {
  if (!raw) return null

  const [identityCandidate, modeCandidate] = raw.split(":")
  if (identityCandidate && modeCandidate && THEME_MODES.includes(modeCandidate as ThemeMode)) {
    const identity = THEME_IDENTITIES.find(item => item.id === identityCandidate)
    if (identity) {
      return { id: identity.id, mode: modeCandidate as ThemeMode }
    }
  }

  for (const identity of THEME_IDENTITIES) {
    for (const mode of THEME_MODES) {
      if (identity.variants[mode].legacyIds.includes(raw)) {
        return { id: identity.id, mode }
      }
    }
  }

  return null
}

export const THEME_PREVIEW_COLORS: Record<ThemeIdentityId, Record<ThemeMode, { bg: string; card: string; primary: string; accent: string; text: string }>> = {
  "indigo-deep": {
    dark: { bg: "#17181f", card: "#202128", primary: "#707bdb", accent: "#2a2c35", text: "#eaebef" },
    light: { bg: "#f4f4f7", card: "#ffffff", primary: "#636ee0", accent: "#ececf1", text: "#1e2233" },
  },
  "teal-night": {
    dark: { bg: "#171e1e", card: "#1f2727", primary: "#3bbfa0", accent: "#292f2f", text: "#edeee8" },
    light: { bg: "#f2f7f6", card: "#ffffff", primary: "#2da88a", accent: "#e8efee", text: "#1d2725" },
  },
  "warm-earth": {
    dark: { bg: "#1c1a17", card: "#282520", primary: "#c4a83d", accent: "#35322c", text: "#ebe5d8" },
    light: { bg: "#f7f4ef", card: "#ffffff", primary: "#b7922d", accent: "#eee8df", text: "#2b2419" },
  },
  "steel-blue": {
    dark: { bg: "#15181f", card: "#1c2029", primary: "#7a6ad4", accent: "#272c36", text: "#e6e8ee" },
    light: { bg: "#f3f5f9", card: "#ffffff", primary: "#6e5ecd", accent: "#e8ecf2", text: "#1d2432" },
  },
  "ember-rose": {
    dark: { bg: "#1b1819", card: "#251f20", primary: "#d1576b", accent: "#2f292a", text: "#eeeaeb" },
    light: { bg: "#f8f2f4", card: "#ffffff", primary: "#c94a60", accent: "#efe4e7", text: "#2e1f22" },
  },
  "jade-noir": {
    dark: { bg: "#181b1a", card: "#202624", primary: "#39ad78", accent: "#29302d", text: "#eaeeec" },
    light: { bg: "#f2f7f4", card: "#ffffff", primary: "#2f9967", accent: "#e7efe9", text: "#1d2822" },
  },
  "sunset-amber": {
    dark: { bg: "#1b1918", card: "#26211f", primary: "#e08c38", accent: "#302b29", text: "#eeeeeb" },
    light: { bg: "#f8f4ef", card: "#ffffff", primary: "#cf7c2a", accent: "#eee5dc", text: "#2f241b" },
  },
  "sage-mist": {
    dark: { bg: "#1b201d", card: "#242b28", primary: "#5fae89", accent: "#2e3532", text: "#e8eee9" },
    light: { bg: "#f5f7f6", card: "#ffffff", primary: "#4b9b78", accent: "#eff2f0", text: "#1c211f" },
  },
  "ocean-breeze": {
    dark: { bg: "#121a22", card: "#1a2632", primary: "#3ea0ff", accent: "#243241", text: "#e7eef8" },
    light: { bg: "#f2f7fc", card: "#ffffff", primary: "#2e8de6", accent: "#e7edf5", text: "#1a2b3d" },
  },
  "forest-moss": {
    dark: { bg: "#171d17", card: "#1f2820", primary: "#77b255", accent: "#29342a", text: "#e9efe8" },
    light: { bg: "#f3f7f2", card: "#ffffff", primary: "#5f9a40", accent: "#e8eee6", text: "#1f2a1d" },
  },
  "copper-dusk": {
    dark: { bg: "#211915", card: "#2f221c", primary: "#d07a4f", accent: "#3d2d25", text: "#f2e8e2" },
    light: { bg: "#faf4ef", card: "#ffffff", primary: "#b7683f", accent: "#f0e5dc", text: "#2f2119" },
  },
}
