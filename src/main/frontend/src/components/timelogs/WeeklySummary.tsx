import { useWeekly } from "@/hooks/useDashboard"
import { useProjects } from "@/hooks/useProjects"
import { Skeleton } from "@/components/ui/skeleton"

export function WeeklySummary({ dateFrom }: { dateFrom?: string, dateTo?: string } = {}) {
  const { data, isLoading } = useWeekly(dateFrom)
  const { data: projects } = useProjects()

  if (isLoading) return (
    <div className="border border-border/50 rounded-[12px] bg-card p-5 shadow-sm space-y-4">
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-20 w-full" />
    </div>
  )

  const weekly = data
  const totalHours = weekly?.total_hours || 0
  const hoursByProject = Object.entries(weekly?.hours_by_project || {})
  
  hoursByProject.sort((a, b) => Number(b[1]) - Number(a[1]))

  const projectColorMap = new Map(projects?.map(p => [p.name, p.color]) || [])
  const fallbackColors = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#F43F5E", "#6366F1"]

  return (
    <div className="border border-border/50 rounded-[12px] bg-card shadow-sm overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/10">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">Resum Setmanal</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Setmana {weekly?.week}</p>
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-md flex flex-col items-end">
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">Total</span>
          <span className="text-lg font-bold leading-none">{totalHours.toFixed(2)}h</span>
        </div>
      </div>
      
      <div className="p-5 flex-1 space-y-5">
        {hoursByProject.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            Cap hora registrada.
          </div>
        ) : (
          <div className="space-y-4">
            {hoursByProject.map(([project, hours], index) => {
              const numHours = Number(hours)
              const percentage = totalHours > 0 ? (numHours / totalHours) * 100 : 0
              const projectColor = projectColorMap.get(project) || fallbackColors[index % fallbackColors.length]
              
              return (
                <div key={project} className="space-y-1.5">
                  <div className="flex justify-between items-end text-sm">
                    <div className="flex items-center gap-1.5 truncate pr-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: projectColor }} />
                      <span className="font-medium text-foreground truncate">{project}</span>
                    </div>
                    <span className="font-medium text-muted-foreground shrink-0">{numHours.toFixed(2)}h</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${percentage}%`, backgroundColor: projectColor }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground text-right">
                    {percentage.toFixed(0)}% del total
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
