import { useState } from "react"
import { TimeLogForm } from "@/components/timelogs/TimeLogForm"
import { TimeLogTable } from "@/components/timelogs/TimeLogTable"
import { WeeklySummary } from "@/components/timelogs/WeeklySummary"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

function getMonday(d: Date): Date {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function formatDateISO(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function formatWeekRange(start: Date, end: Date): string {
  const startDay = start.getDate()
  const endDay = end.getDate()
  const month = end.toLocaleDateString("ca-ES", { month: "short" })
  const year = end.getFullYear()
  
  if (start.getMonth() !== end.getMonth()) {
      const startMonth = start.toLocaleDateString("ca-ES", { month: "short" })
      return `${startDay} ${startMonth}. - ${endDay} ${month}. ${year}`
  }
  
  return `${startDay} - ${endDay} ${month}. ${year}`
}

export function TimeLogsPage() {
  const [weekStart, setWeekStart] = useState<Date>(getMonday(new Date()))
  
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  const dateFrom = formatDateISO(weekStart)
  const dateTo = formatDateISO(weekEnd)
  
  const handlePrevWeek = () => {
    const prev = new Date(weekStart)
    prev.setDate(prev.getDate() - 7)
    setWeekStart(prev)
  }
  
  const handleNextWeek = () => {
    const next = new Date(weekStart)
    next.setDate(next.getDate() + 7)
    setWeekStart(next)
  }
  
  const handleCurrentWeek = () => {
    setWeekStart(getMonday(new Date()))
  }

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Hores</h1>
          <p className="text-sm text-muted-foreground mt-1">Registra i gestiona el temps dedicat a cada projecte.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleCurrentWeek} className="h-9 shadow-sm">
            Aquesta setmana
          </Button>
          <div className="flex items-center bg-card rounded-md border border-border shadow-sm">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none rounded-l-md hover:bg-muted" onClick={handlePrevWeek}>
              <ChevronLeft size={16} />
            </Button>
            <div className="flex items-center justify-center min-w-[160px] border-x border-border/50 bg-muted/20 px-3 h-9">
              <span className="text-sm font-medium text-foreground">
                {formatWeekRange(weekStart, weekEnd)}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none rounded-r-md hover:bg-muted" onClick={handleNextWeek}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-[12px] border border-border shadow-sm p-1">
        <TimeLogForm />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 w-full">
          <TimeLogTable params={{ dateFrom, dateTo }} />
        </div>
        <div className="lg:col-span-1 w-full">
          <WeeklySummary dateFrom={dateFrom} dateTo={dateTo} />
        </div>
      </div>
    </div>
  )
}
