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
    <div className="space-y-[24px] w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Hores</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCurrentWeek}>
            Aquesta setmana
          </Button>
          <div className="flex items-center gap-1 bg-muted/50 rounded-md p-1 border border-border">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevWeek}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-sm font-medium px-2 min-w-[160px] text-center">
              {formatWeekRange(weekStart, weekEnd)}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextWeek}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>
      
      <TimeLogForm />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-3 overflow-x-auto border-r border-border/0 pr-0">
          <TimeLogTable params={{ dateFrom, dateTo }} />
        </div>
        <div className="lg:col-span-1 w-full">
          <WeeklySummary dateFrom={dateFrom} dateTo={dateTo} />
        </div>
      </div>
    </div>
  )
}
