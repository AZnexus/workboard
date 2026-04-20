import { useState, useMemo } from "react"
import { TimeLogForm } from "@/components/timelogs/TimeLogForm"
import { TimeLogTable } from "@/components/timelogs/TimeLogTable"
import { WeeklySummary } from "@/components/timelogs/WeeklySummary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"

type FilterPreset = 'today' | 'this_week' | 'last_week' | 'this_month' | 'this_year' | 'custom'

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

function getPresetDates(preset: FilterPreset): { from: string; to: string } {
  const today = new Date()
  today.setHours(0,0,0,0)
  const todayStr = formatDateISO(today)
  
  switch (preset) {
    case 'today': return { from: todayStr, to: todayStr }
    case 'this_week': {
      const mon = getMonday(today)
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
      return { from: formatDateISO(mon), to: formatDateISO(sun) }
    }
    case 'last_week': {
      const mon = getMonday(today); mon.setDate(mon.getDate() - 7)
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
      return { from: formatDateISO(mon), to: formatDateISO(sun) }
    }
    case 'this_month': {
      const first = new Date(today.getFullYear(), today.getMonth(), 1)
      const last = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      return { from: formatDateISO(first), to: formatDateISO(last) }
    }
    case 'this_year': {
      return { from: `${today.getFullYear()}-01-01`, to: `${today.getFullYear()}-12-31` }
    }
    case 'custom': return { from: '', to: '' } 
  }
}

export function TimeLogsPage() {
  const [preset, setPreset] = useState<FilterPreset>('this_week')
  
  const [customFrom, setCustomFrom] = useState<string>(() => formatDateISO(getMonday(new Date())))
  const [customTo, setCustomTo] = useState<string>(() => {
    const sun = getMonday(new Date())
    sun.setDate(sun.getDate() + 6)
    return formatDateISO(sun)
  })

  const [weekOffset, setWeekOffset] = useState<number>(0)

  const handlePresetChange = (p: FilterPreset) => {
    setPreset(p)
    setWeekOffset(0)
  }

  const handlePrevWeek = () => setWeekOffset(prev => prev - 1)
  const handleNextWeek = () => setWeekOffset(prev => prev + 1)
  
  const { dateFrom, dateTo } = useMemo(() => {
    if (preset === 'custom') {
      return { dateFrom: customFrom, dateTo: customTo }
    }
    
    let { from, to } = getPresetDates(preset)
    
    if ((preset === 'this_week' || preset === 'last_week') && weekOffset !== 0) {
      const fromDate = new Date(from)
      fromDate.setDate(fromDate.getDate() + (weekOffset * 7))
      const toDate = new Date(fromDate)
      toDate.setDate(toDate.getDate() + 6)
      from = formatDateISO(fromDate)
      to = formatDateISO(toDate)
    }
    
    return { dateFrom: from, dateTo: to }
  }, [preset, customFrom, customTo, weekOffset])

  const showWeekNav = preset === 'this_week' || preset === 'last_week'
  const weekStartDisplay = new Date(dateFrom)
  const weekEndDisplay = new Date(dateTo)

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Hores</h1>
          <p className="text-sm text-muted-foreground mt-1">Registra i gestiona el temps dedicat a cada projecte.</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-wrap items-center gap-1.5 bg-muted/30 p-1 rounded-lg border border-border/50">
            <Button variant={preset === 'today' ? "default" : "ghost"} size="sm" className="h-8" onClick={() => handlePresetChange('today')}>
              Avui
            </Button>
            <Button variant={preset === 'this_week' ? "default" : "ghost"} size="sm" className="h-8" onClick={() => handlePresetChange('this_week')}>
              Aquesta setmana
            </Button>
            <Button variant={preset === 'last_week' ? "default" : "ghost"} size="sm" className="h-8" onClick={() => handlePresetChange('last_week')}>
              Setmana passada
            </Button>
            <Button variant={preset === 'this_month' ? "default" : "ghost"} size="sm" className="h-8" onClick={() => handlePresetChange('this_month')}>
              Aquest mes
            </Button>
            <Button variant={preset === 'this_year' ? "default" : "ghost"} size="sm" className="h-8" onClick={() => handlePresetChange('this_year')}>
              Aquest any
            </Button>
            <Button variant={preset === 'custom' ? "default" : "ghost"} size="sm" className="h-8" onClick={() => handlePresetChange('custom')}>
              <CalendarDays className="w-4 h-4 mr-1.5" /> Personalitzat
            </Button>
          </div>
          
          {showWeekNav && (
            <div className="flex items-center bg-card rounded-md border border-border shadow-sm">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none rounded-l-md hover:bg-muted" onClick={handlePrevWeek}>
                <ChevronLeft size={16} />
              </Button>
              <div className="flex items-center justify-center min-w-[160px] border-x border-border/50 bg-muted/20 px-3 h-9">
                <span className="text-sm font-medium text-foreground">
                  {formatWeekRange(weekStartDisplay, weekEndDisplay)}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none rounded-r-md hover:bg-muted" onClick={handleNextWeek}>
                <ChevronRight size={16} />
              </Button>
            </div>
          )}
          
          {preset === 'custom' && (
            <div className="flex items-center gap-2 bg-card rounded-md border border-border p-1 shadow-sm">
              <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="h-8 text-sm bg-transparent border-0 focus-visible:ring-1" />
              <span className="text-muted-foreground">-</span>
              <Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="h-8 text-sm bg-transparent border-0 focus-visible:ring-1" />
            </div>
          )}
        </div>
      </div>
      
      <div className="max-w-2xl">
        <div className="bg-card rounded-[12px] border border-border shadow-sm p-1">
          <TimeLogForm />
        </div>
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
