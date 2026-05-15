import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FolderKanban, Palette, FileDown, Settings, Tags, Check, GitBranch, Files } from "lucide-react"
import { ProjectsPage } from "./ProjectsPage"
import { TagsPage } from "./TagsPage"
import { VersionsPage } from "./VersionsPage"
import { ExportView } from "@/components/export/ExportView"
import { useTheme } from "@/hooks/useTheme"
import { THEME_IDENTITIES, THEME_PREVIEW_COLORS, type ThemeMode } from "@/config/themes"
import { cn } from "@/lib/utils"
import { ValuationTemplatesSection } from "@/components/improvements/ValuationTemplatesSection"

function ThemeSection() {
  const { theme, mode, setMode, setTheme } = useTheme()

  const themesForMode = THEME_IDENTITIES.filter(identity => Boolean(identity.variants[mode]))

  const modeLabel: Record<ThemeMode, string> = {
    dark: "Dark",
    light: "Light",
  }

  const modeDescription: Record<ThemeMode, string> = {
    dark: "Fosc",
    light: "Clar",
  }

  const modeButtonBaseClass =
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-4 py-1 rounded-full text-sm font-medium transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-foreground">Tema visual</h2>

      <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 p-1">
        {(["dark", "light"] as const).map((candidateMode) => {
          const selected = mode === candidateMode

          return (
            <button
              key={candidateMode}
              type="button"
              onClick={() => setMode(candidateMode)}
              className={cn(
                modeButtonBaseClass,
                selected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
              )}
              aria-pressed={selected}
            >
              {modeLabel[candidateMode]}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {themesForMode.map((identity) => {
          const colors = THEME_PREVIEW_COLORS[identity.id][mode]
          const isSelected = theme.id === identity.id && theme.variants[mode].mode === mode

          return (
            <button
              key={identity.id}
              type="button"
              onClick={() => setTheme(identity.id, mode)}
              aria-label={`${identity.label} (${modeLabel[mode]})`}
              aria-pressed={isSelected}
              className={cn(
                "group relative flex flex-col gap-3 rounded-xl border-2 p-3 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div
                className="w-full h-[130px] rounded-md overflow-hidden border ring-1 ring-black/5 dark:ring-white/5 shadow-sm transition-transform group-hover:scale-[1.02]"
                style={{ backgroundColor: colors.bg }}
              >
                <div className="flex h-full w-full">
                  <div
                    className="w-[28%] h-full flex flex-col gap-2 p-2 border-r"
                    style={{ backgroundColor: colors.card, borderColor: colors.accent }}
                  >
                    <div
                      className="w-full h-3 rounded-sm mb-1"
                      style={{ backgroundColor: colors.primary, opacity: 0.8 }}
                    />
                    <div
                      className="w-3/4 h-2 rounded-sm"
                      style={{ backgroundColor: colors.text, opacity: 0.3 }}
                    />
                    <div
                      className="w-full h-2 rounded-sm"
                      style={{ backgroundColor: colors.text, opacity: 0.3 }}
                    />
                    <div
                      className="w-5/6 h-2 rounded-sm"
                      style={{ backgroundColor: colors.text, opacity: 0.3 }}
                    />
                  </div>

                  <div className="flex-1 flex flex-col h-full">
                    <div
                      className="h-7 border-b flex items-center justify-between px-2"
                      style={{ backgroundColor: colors.bg, borderColor: colors.accent }}
                    >
                      <div
                        className="w-12 h-2 rounded-sm"
                        style={{ backgroundColor: colors.text, opacity: 0.2 }}
                      />
                      <div className="flex gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: colors.accent }}
                        />
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: colors.primary }}
                        />
                      </div>
                    </div>

                    <div
                      className="flex-1 p-2 flex flex-col gap-2"
                      style={{ backgroundColor: colors.bg }}
                    >
                      <div
                        className="w-1/2 h-2.5 rounded-sm"
                        style={{ backgroundColor: colors.text, opacity: 0.8 }}
                      />

                      <div className="grid grid-cols-2 gap-2 mt-auto pb-0.5">
                        <div
                          className="h-11 rounded border shadow-sm p-1.5 flex flex-col justify-center gap-1.5"
                          style={{ backgroundColor: colors.card, borderColor: colors.accent }}
                        >
                          <div
                            className="w-2/3 h-1.5 rounded-sm"
                            style={{ backgroundColor: colors.text, opacity: 0.4 }}
                          />
                          <div
                            className="w-full h-2.5 rounded-sm"
                            style={{ backgroundColor: colors.primary, opacity: 0.9 }}
                          />
                        </div>
                        <div
                          className="h-11 rounded border shadow-sm p-1.5 flex flex-col justify-center gap-1.5"
                          style={{ backgroundColor: colors.card, borderColor: colors.accent }}
                        >
                          <div
                            className="w-1/2 h-1.5 rounded-sm"
                            style={{ backgroundColor: colors.text, opacity: 0.4 }}
                          />
                          <div
                            className="w-4/5 h-2.5 rounded-sm"
                            style={{ backgroundColor: colors.primary, opacity: 0.9 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full px-0.5">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{identity.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {modeDescription[mode]}
                  </span>
                </div>
                {isSelected && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function ConfigPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings size={20} className="text-muted-foreground" />
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Configuració</h1>
      </div>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects" className="gap-1.5">
            <FolderKanban size={14} /> Projectes
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-1.5">
            <Tags size={14} /> Etiquetes
          </TabsTrigger>
          <TabsTrigger value="versions" className="gap-1.5">
            <GitBranch size={14} /> Versions
          </TabsTrigger>
          <TabsTrigger value="valuation-templates" className="gap-1.5">
            <Files size={14} /> Plantilles
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-1.5">
            <Palette size={14} /> Tema
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-1.5">
            <FileDown size={14} /> Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-4">
          <ProjectsPage />
        </TabsContent>

        <TabsContent value="tags" className="mt-4">
          <TagsPage />
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          <VersionsPage />
        </TabsContent>

        <TabsContent value="valuation-templates" className="mt-4">
          <ValuationTemplatesSection />
        </TabsContent>

        <TabsContent value="theme" className="mt-4">
          <ThemeSection />
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <ExportView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
