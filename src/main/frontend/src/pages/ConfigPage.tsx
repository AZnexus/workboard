import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { FolderKanban, Palette, FileDown, Settings } from "lucide-react"
import { ProjectsPage } from "./ProjectsPage"
import { ExportView } from "@/components/export/ExportView"
import { THEMES, useTheme } from "@/hooks/useTheme"
import { cn } from "@/lib/utils"

function ThemeSection() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Tema visual</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {THEMES.map(t => (
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
            <span className="text-sm font-medium text-foreground">{t.label}</span>
            <span className="text-[10px] text-muted-foreground">{t.isDark ? "Fosc" : "Clar"}</span>
            {theme === t.id && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        ))}
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
