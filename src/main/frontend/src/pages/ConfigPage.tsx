import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FolderKanban, Palette, FileDown, Settings, Tags } from "lucide-react"
import { ProjectsPage } from "./ProjectsPage"
import { TagsPage } from "./TagsPage"
import { ExportView } from "@/components/export/ExportView"
import { THEMES, useTheme } from "@/hooks/useTheme"
import { cn } from "@/lib/utils"

const THEME_COLORS: Record<string, { bg: string; card: string; primary: string; accent: string; text: string }> = {
  light: { bg: "#FAFAF9", card: "#FFFFFF", primary: "#2563EB", accent: "#F5F5F4", text: "#1C1917" },
  dark: { bg: "#0C0A09", card: "#1C1917", primary: "#60A5FA", accent: "#292524", text: "#FAFAF9" },
  matrix: { bg: "#000000", card: "#050505", primary: "#00FF41", accent: "#0a0a0a", text: "#00FF41" },
  dragonball: { bg: "#1a0b00", card: "#2d1300", primary: "#f59e0b", accent: "#5c2c00", text: "#fff2e6" },
  cyberpunk: { bg: "#090214", card: "#12042b", primary: "#06b6d4", accent: "#3b0764", text: "#fdf4ff" },
  nord: { bg: "#2E3440", card: "#3B4252", primary: "#88C0D0", accent: "#4C566A", text: "#ECEFF4" },
  monokai: { bg: "#272822", card: "#3E3D32", primary: "#A6E22E", accent: "#49483E", text: "#F8F8F2" },
}

function ThemeSection() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Tema visual</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {THEMES.map(t => {
          const colors = THEME_COLORS[t.id] || THEME_COLORS.light
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary/50",
                theme === t.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <div className="w-full h-8 rounded-md flex overflow-hidden border border-black/10 dark:border-white/10">
                <div style={{ backgroundColor: colors.bg }} className="flex-1" />
                <div style={{ backgroundColor: colors.card }} className="flex-1" />
                <div style={{ backgroundColor: colors.primary }} className="flex-1" />
                <div style={{ backgroundColor: colors.accent }} className="flex-1" />
              </div>
              <span className="text-sm font-medium text-foreground">{t.label}</span>
              <span className="text-[10px] text-muted-foreground">{t.isDark ? "Fosc" : "Clar"}</span>
              {theme === t.id && (
                <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary ring-2 ring-background" />
              )}
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
