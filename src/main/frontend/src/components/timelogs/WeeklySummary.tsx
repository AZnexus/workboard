import { useWeekly } from "@/hooks/useDashboard"
import { useProjects } from "@/hooks/useProjects"
import { Skeleton } from "@/components/ui/skeleton"

type FilterPreset = 'today' | 'this_week' | 'last_week' | 'this_month' | 'this_year' | 'custom'

function formatDateCatalan(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString("ca-ES", { day: 'numeric', month: 'short', year: 'numeric' })
}

function getSummaryTitle(preset?: FilterPreset): string {
  switch (preset) {
    case 'today': return 'Resum Diari'
    case 'this_week': case 'last_week': return 'Resum Setmanal'
    case 'this_month': return 'Resum Mensual'
    case 'this_year': return 'Resum Anual'
    case 'custom': return 'Resum del Període'
    default: return 'Resum Setmanal'
  }
}

export function WeeklySummary({ dateFrom, dateTo, preset }: { dateFrom?: string, dateTo?: string, preset?: FilterPreset }) {
  const { data, isLoading } = useWeekly(dateFrom)
  const { data: projects } = useProjects()

  if (isLoading) return (
    <div className="border border-border/50 rounded-lg bg-card p-5 shadow-sm space-y-4">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  )

  const weekly = data
  const totalHours = weekly?.total_hours || 0
  const hoursByProject = Object.entries(weekly?.hours_by_project || {})
  
  hoursByProject.sort((a, b) => Number(b[1]) - Number(a[1]))

  const projectColorMap = new Map(projects?.map(p => [p.name, p.color]) || [])
  const fallbackColors = ["var(--data-info)", "var(--data-positive)", "var(--tag-2)", "var(--data-warning)", "var(--data-negative)", "var(--accent-primary)"]

  return (
    <div className="border border-border/50 rounded-lg bg-card shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">{getSummaryTitle(preset)}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {dateFrom && dateTo && dateFrom === dateTo
              ? formatDateCatalan(dateFrom)
              : dateFrom && dateTo
                ? `${formatDateCatalan(dateFrom)} — ${formatDateCatalan(dateTo)}`
                : weekly?.week ? `Setmana ${weekly.week}` : ''}
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex flex-col items-end">
          <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Total</span>
          <span className="text-2xl font-black leading-none mt-1">{totalHours.toFixed(2)}h</span>
        </div>
      </div>
      
      <div className="p-6 flex-1 space-y-6">
        {hoursByProject.length === 0 ? (
          <div className="text-base text-muted-foreground text-center py-8">
            Cap hora registrada.
          </div>
        ) : (
          <div className="space-y-5">
            {hoursByProject.map(([project, hours], index) => {
              const numHours = Number(hours)
              const percentage = totalHours > 0 ? (numHours / totalHours) * 100 : 0
              const projectColor = projectColorMap.get(project) || fallbackColors[index % fallbackColors.length]
              
              return (
                <div key={project} className="space-y-2.5">
                  <div className="flex justify-between items-end text-base">
                    <div className="flex items-center gap-2.5 truncate pr-3">
                      <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: projectColor }} />
                      <span className="font-semibold text-foreground truncate">{project}</span>
                    </div>
                    <span className="font-bold text-foreground shrink-0">{numHours.toFixed(2)}h</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${percentage}%`, backgroundColor: projectColor }}
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground w-12 text-right shrink-0">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
