import { useState, useMemo } from "react"
import { TimeLogForm } from "@/components/timelogs/TimeLogForm"
import { TimeLogTable } from "@/components/timelogs/TimeLogTable"
import { WeeklySummary } from "@/components/timelogs/WeeklySummary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, CalendarDays, Plus, X } from "lucide-react"

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
  const [showForm, setShowForm] = useState(false)
  
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
    <div className="space-y-8 max-w-[1200px] mx-auto w-full pb-10">
      <div className="bg-card/50 rounded-[16px] p-6 border border-border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Hores</h1>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-md leading-relaxed">
              Registra i gestiona el temps dedicat a cada projecte de forma eficient.
            </p>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-4">
            <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-1.5 rounded-xl border border-border/60">
              <Button variant={preset === 'today' ? "default" : "ghost"} size="sm" className="h-8 rounded-lg" onClick={() => handlePresetChange('today')}>
                Avui
              </Button>
              <Button variant={preset === 'this_week' ? "default" : "ghost"} size="sm" className="h-8 rounded-lg" onClick={() => handlePresetChange('this_week')}>
                Aquesta setmana
              </Button>
              <Button variant={preset === 'last_week' ? "default" : "ghost"} size="sm" className="h-8 rounded-lg" onClick={() => handlePresetChange('last_week')}>
                Setmana passada
              </Button>
              <Button variant={preset === 'this_month' ? "default" : "ghost"} size="sm" className="h-8 rounded-lg" onClick={() => handlePresetChange('this_month')}>
                Aquest mes
              </Button>
              <Button variant={preset === 'this_year' ? "default" : "ghost"} size="sm" className="h-8 rounded-lg" onClick={() => handlePresetChange('this_year')}>
                Aquest any
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button variant={preset === 'custom' ? "default" : "ghost"} size="sm" className="h-8 rounded-lg" onClick={() => handlePresetChange('custom')}>
                <CalendarDays className="w-4 h-4 mr-1.5" /> Personalitzat
              </Button>
            </div>
            
            <div className="flex items-center w-full md:w-auto justify-between md:justify-end gap-4">
              <div className="h-10 flex items-center shrink-0">
                {preset === 'custom' ? (
                  <div className="flex items-center gap-2 bg-background rounded-lg border border-border p-1 shadow-sm h-full w-full md:w-[280px]">
                    <Input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="h-full px-2 text-sm bg-transparent border-0 focus-visible:ring-1" />
                    <span className="text-muted-foreground">-</span>
                    <Input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="h-full px-2 text-sm bg-transparent border-0 focus-visible:ring-1" />
                  </div>
                ) : (
                  <div className="flex items-center bg-background rounded-lg border border-border shadow-sm h-full overflow-hidden">
                    <Button variant="ghost" size="icon" className="h-full w-10 rounded-none hover:bg-muted" onClick={handlePrev}>
                      <ChevronLeft size={16} />
                    </Button>
                    <div className="flex items-center justify-center min-w-[200px] border-x border-border/50 bg-muted/10 px-4 h-full">
                      <span className="text-sm font-medium text-foreground capitalize tracking-wide">
                        {displayLabel}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-full w-10 rounded-none hover:bg-muted" onClick={handleNext}>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={() => setShowForm(!showForm)} 
                variant={showForm ? "outline" : "default"}
                className="h-10 shadow-sm transition-all"
              >
                {showForm ? (
                  <><X size={16} className="mr-2" /> Tancar Formulari</>
                ) : (
                  <><Plus size={16} className="mr-2" /> Nou Registre</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {showForm && (
        <div className="bg-card rounded-[16px] border border-border shadow-sm p-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <TimeLogForm />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Llistat d'Hores
              <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">Detall</span>
            </h2>
          </div>
          <div className="bg-card rounded-[16px] border border-border shadow-sm overflow-hidden">
            <TimeLogTable params={{ dateFrom, dateTo }} />
          </div>
        </div>
        
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              Resum
              <span className="bg-muted text-muted-foreground text-xs font-medium px-2 py-0.5 rounded-full">Per Projecte</span>
            </h2>
          </div>
          <div className="bg-card/50 rounded-[16px] border border-border shadow-sm overflow-hidden">
            <WeeklySummary dateFrom={dateFrom} dateTo={dateTo} />
          </div>
        </div>
      </div>
    </div>
  )
}

