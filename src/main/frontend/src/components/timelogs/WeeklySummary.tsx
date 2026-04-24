import { useTimeLogs } from "@/hooks/useTimeLogs"
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
  const params: Record<string, string> = {}
  if (dateFrom) params.dateFrom = dateFrom
  if (dateTo) params.dateTo = dateTo
  const { data: logs, isLoading } = useTimeLogs(params)
  const { data: projects } = useProjects()

  if (isLoading) return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 space-y-4 h-full min-h-[500px]">
      <Skeleton className="h-6 w-1/2 bg-muted/40" />
      <Skeleton className="h-20 w-full bg-muted/40" />
      <Skeleton className="h-20 w-full bg-muted/40" />
    </div>
  )

  let totalHours = 0
  const hoursMap: Record<string, number> = {}

  if (logs) {
    logs.forEach(log => {
      totalHours += log.hours
      hoursMap[log.project] = (hoursMap[log.project] || 0) + log.hours
    })
  }

  const hoursByProject = Object.entries(hoursMap)
  hoursByProject.sort((a, b) => b[1] - a[1])

  const projectColorMap = new Map(projects?.map(p => [p.name, p.color]) || [])
  const fallbackColors = ["var(--data-info)", "var(--data-positive)", "var(--tag-2)", "var(--data-warning)", "var(--data-negative)", "var(--accent-primary)"]

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm flex flex-col h-full min-h-[500px]">
      <div className="p-4 md:p-6 border-b border-border/50 bg-muted/10 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">{getSummaryTitle(preset)}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {dateFrom && dateTo && dateFrom === dateTo
              ? formatDateCatalan(dateFrom)
              : dateFrom && dateTo
                ? `${formatDateCatalan(dateFrom)} — ${formatDateCatalan(dateTo)}`
                : ''}
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-md flex flex-col items-end">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Total</span>
          <span className="text-xl font-black leading-none">{totalHours.toFixed(2)}h</span>
        </div>
      </div>
      
      <div className="p-4 md:p-6 flex-1 overflow-y-auto">
        {hoursByProject.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground opacity-70 mt-12">
            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <p className="text-sm">Cap hora registrada</p>
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            {hoursByProject.map(([project, hours], index) => {
              const numHours = Number(hours)
              const percentage = totalHours > 0 ? (numHours / totalHours) * 100 : 0
              const projectColor = projectColorMap.get(project) || fallbackColors[index % fallbackColors.length]
              
              return (
                <div key={project} className="space-y-2">
                  <div className="flex justify-between items-end text-sm">
                    <div className="flex items-center gap-2.5 truncate pr-3">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: projectColor }} />
                      <span className="font-medium text-foreground truncate">{project}</span>
                    </div>
                    <span className="font-semibold text-foreground shrink-0">{numHours.toFixed(2)}h</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${percentage}%`, backgroundColor: projectColor }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground w-10 text-right shrink-0">
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
