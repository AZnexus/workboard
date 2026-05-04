import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FolderKanban, Palette, FileDown, Settings, Tags, Check } from "lucide-react"
import { ProjectsPage } from "./ProjectsPage"
import { TagsPage } from "./TagsPage"
import { ExportView } from "@/components/export/ExportView"
import { useTheme } from "@/hooks/useTheme"
import { THEMES, THEME_PREVIEW_COLORS } from "@/config/themes"
import { cn } from "@/lib/utils"

function ThemeSection() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Tema visual</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {THEMES.map((t) => {
          const colors = THEME_PREVIEW_COLORS[t.id]
          const isSelected = theme === t.id

          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
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
                  <span className="text-sm font-medium text-foreground">{t.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {t.isDark ? "Fosc" : "Clar"}
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
