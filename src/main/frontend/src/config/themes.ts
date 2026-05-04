export const THEMES = [
  { id: "dark", label: "Indigo Deep", isDark: true },
  { id: "light", label: "Indigo Clar", isDark: false },
  { id: "teal-night", label: "Teal Night", isDark: true },
  { id: "warm-earth", label: "Warm Earth", isDark: true },
  { id: "steel-blue", label: "Steel Blue", isDark: true },
  { id: "ember-rose", label: "Ember Rose", isDark: true },
  { id: "jade-noir", label: "Jade Noir", isDark: true },
  { id: "sunset-amber", label: "Sunset Amber", isDark: true },
  { id: "sage-mist", label: "Sage Mist", isDark: false },
] as const

export type ThemeId = (typeof THEMES)[number]["id"]

export const THEME_PREVIEW_COLORS: Record<ThemeId, { bg: string; card: string; primary: string; accent: string; text: string }> = {
  dark: { bg: "#17181f", card: "#1c2029", primary: "#707bdb", accent: "#272c36", text: "#eaebef" },
  light: { bg: "#f3f4f6", card: "#ffffff", primary: "#6366f1", accent: "#e5e7eb", text: "#1f2937" },
  "teal-night": { bg: "#171e1e", card: "#1f2727", primary: "#3bbfa0", accent: "#292f2f", text: "#edeee8" },
  "warm-earth": { bg: "#1c1a17", card: "#282520", primary: "#c4a83d", accent: "#35322c", text: "#ebe5d8" },
  "steel-blue": { bg: "#15181f", card: "#1c2029", primary: "#7a6ad4", accent: "#272c36", text: "#e6e8ee" },
  "ember-rose": { bg: "#1b1819", card: "#251f20", primary: "#d1576b", accent: "#2f292a", text: "#eeeaeb" },
  "jade-noir": { bg: "#181b1a", card: "#202624", primary: "#39ad78", accent: "#29302d", text: "#eaeeec" },
  "sunset-amber": { bg: "#1b1918", card: "#26211f", primary: "#e08c38", accent: "#302b29", text: "#eeeeeb" },
  "sage-mist": { bg: "#f5f7f6", card: "#ffffff", primary: "#4b9b78", accent: "#eff2f0", text: "#1c211f" },
}
