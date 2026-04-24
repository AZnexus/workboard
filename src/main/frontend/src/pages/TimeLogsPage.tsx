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


export function TimeLogsPage() {
  const [preset, setPreset] = useState<FilterPreset>('this_week')
  
  const [customFrom, setCustomFrom] = useState<string>(() => formatDateISO(getMonday(new Date())))
  const [customTo, setCustomTo] = useState<string>(() => {
    const sun = getMonday(new Date())
    sun.setDate(sun.getDate() + 6)
    return formatDateISO(sun)
  })

  const [offset, setOffset] = useState<number>(0)

  const handlePresetChange = (p: FilterPreset) => {
    setPreset(p)
    setOffset(0)
  }

  const handlePrev = () => setOffset(prev => prev - 1)
  const handleNext = () => setOffset(prev => prev + 1)
  
  const { dateFrom, dateTo, displayLabel } = useMemo(() => {
    if (preset === 'custom') {
      return { dateFrom: customFrom, dateTo: customTo, displayLabel: '' }
    }
    
    const today = new Date()
    today.setHours(0,0,0,0)
    
    let fromDate = new Date(today)
    let toDate = new Date(today)
    let label = ''

    if (preset === 'today') {
      fromDate.setDate(today.getDate() + offset)
      toDate = new Date(fromDate)
      label = fromDate.toLocaleDateString("ca-ES", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    } 
    else if (preset === 'this_week' || preset === 'last_week') {
      const mon = getMonday(today)
      if (preset === 'last_week') mon.setDate(mon.getDate() - 7)
      mon.setDate(mon.getDate() + (offset * 7))
      const sun = new Date(mon)
      sun.setDate(sun.getDate() + 6)
      fromDate = mon
      toDate = sun
      label = formatWeekRange(fromDate, toDate)
    }
    else if (preset === 'this_month') {
      fromDate = new Date(today.getFullYear(), today.getMonth() + offset, 1)
      toDate = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0)
      const monthName = fromDate.toLocaleDateString("ca-ES", { month: 'long' })
      label = monthName.charAt(0).toUpperCase() + monthName.slice(1) + ' ' + fromDate.getFullYear()
    }
    else if (preset === 'this_year') {
      fromDate = new Date(today.getFullYear() + offset, 0, 1)
      toDate = new Date(today.getFullYear() + offset, 11, 31)
      label = fromDate.getFullYear().toString()
    }
    
    return { dateFrom: formatDateISO(fromDate), dateTo: formatDateISO(toDate), displayLabel: label }
  }, [preset, customFrom, customTo, offset])

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full pb-12 px-4 md:px-6 mt-6">
      {/* Header Card */}
      <div className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Hores</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Registra i gestiona el temps dedicat a cada projecte. Utilitza els filtres per analitzar diferents períodes.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
          {/* Presets */}
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/60 overflow-x-auto w-full sm:w-auto flex-nowrap hide-scrollbar">
            <Button variant={preset === 'today' ? "default" : "ghost"} size="sm" className="h-8 rounded-md shrink-0 px-3" onClick={() => handlePresetChange('today')}>
              Avui
            </Button>
            <Button variant={preset === 'this_week' ? "default" : "ghost"} size="sm" className="h-8 rounded-md shrink-0 px-3" onClick={() => handlePresetChange('this_week')}>
              Aquesta Setmana
            </Button>
            <Button variant={preset === 'last_week' ? "default" : "ghost"} size="sm" className="h-8 rounded-md shrink-0 px-3" onClick={() => handlePresetChange('last_week')}>
              Setmana Passada
            </Button>
            <Button variant={preset === 'this_month' ? "default" : "ghost"} size="sm" className="h-8 rounded-md shrink-0 px-3" onClick={() => handlePresetChange('this_month')}>
              Aquest Mes
            </Button>
            <Button variant={preset === 'this_year' ? "default" : "ghost"} size="sm" className="h-8 rounded-md shrink-0 px-3" onClick={() => handlePresetChange('this_year')}>
              Aquest Any
            </Button>
            <div className="w-px h-4 bg-border/60 mx-1 shrink-0" />
            <Button variant={preset === 'custom' ? "default" : "ghost"} size="sm" className="h-8 rounded-md shrink-0 px-3" onClick={() => handlePresetChange('custom')}>
              Personalitzat
            </Button>
          </div>
          
          {/* Navigator */}
          <div className="flex items-center shrink-0 w-full sm:w-auto">
            {preset === 'custom' ? (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-background rounded-lg border border-border p-1 shadow-sm w-full sm:w-auto">
                <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="h-10 sm:h-8 px-2 text-sm bg-transparent border-0 focus-visible:ring-1 min-w-0" />
                <span className="hidden sm:inline text-muted-foreground shrink-0">-</span>
                <Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="h-10 sm:h-8 px-2 text-sm bg-transparent border-0 focus-visible:ring-1 min-w-0" />
              </div>
            ) : (
              <div className="flex items-center bg-background rounded-lg border border-border shadow-sm h-10 overflow-hidden w-full sm:w-auto">
                <Button variant="ghost" size="icon" className="h-full w-10 rounded-none hover:bg-muted shrink-0" onClick={handlePrev}>
                  <ChevronLeft size={16} />
                </Button>
                <div className="flex items-center justify-center min-w-[180px] flex-1 sm:flex-initial border-x border-border/50 bg-muted/10 px-4 h-full">
                  <span className="text-sm font-medium text-foreground tracking-wide whitespace-nowrap">
                    {displayLabel}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-full w-10 rounded-none hover:bg-muted shrink-0" onClick={handleNext}>
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Form Card */}
      <div className="bg-card rounded-xl border border-border shadow-sm p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-base font-semibold text-foreground">Nou Registre d'Hores</h2>
        </div>
        <TimeLogForm />
      </div>
      
      {/* Data Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
          <div className="p-4 md:p-6 border-b border-border/50 bg-muted/10 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Llistat d'Hores</h2>
            <span className="bg-background border border-border text-muted-foreground text-xs font-medium px-2.5 py-1 rounded-md">
              Detall
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <TimeLogTable params={{ dateFrom, dateTo }} />
          </div>
        </div>
        
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <WeeklySummary dateFrom={dateFrom} dateTo={dateTo} preset={preset} />
        </div>
      </div>
    </div>
  )
}

