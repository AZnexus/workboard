import { useState } from "react"
import { useDaily, useStandup } from "@/hooks/useDashboard"
import { useTimeLogs } from "@/hooks/useTimeLogs"
import { QuickCapture } from "@/components/entries/QuickCapture"
import { PinnedEntries } from "./PinnedEntries"
import { EntryCard } from "@/components/entries/EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckSquare, FileText, Clock, MessageSquare, ChevronDown, ChevronUp, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { Entry, TimeLog } from "@/types"

export function DailyView() {
  const { data: dailyData, isLoading: isLoadingDaily } = useDaily()
  const { data: standupData } = useStandup()
  const { data: timeLogsData } = useTimeLogs({ date: new Date().toISOString().split('T')[0] })
  
  const [standupOpen, setStandupOpen] = useState(false)

  if (isLoadingDaily) {
    return <div className="space-y-6"><Skeleton className="h-12" /><Skeleton className="h-32" /></div>
  }

  const dashboard = dailyData
  const entries = dashboard?.entries || []
  
  const tasks = entries.filter(e => e.type === 'TASK')
  const notesAndMeetings = entries.filter(e => e.type !== 'TASK')
  
  const timeLogs = timeLogsData || []
  const standup = standupData

  const handleCopyStandup = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!standup) return
    const text = `Ahir:\n${standup.yesterdayDone.map(e => `- ${e.title}`).join('\n')}\n\nAvui:\n${standup.todayPlan.map(e => `- ${e.title}`).join('\n')}\n`
    navigator.clipboard.writeText(text)
    toast.success("Copiat al porta-retalls")
  }

  return (
    <div className="space-y-[24px]">
      <QuickCapture />
      
      {dashboard?.pinned && dashboard.pinned.length > 0 && (
        <PinnedEntries entries={dashboard.pinned} />
      )}


      <div className="space-y-[12px]">
        <div className="flex items-center gap-2">
          <CheckSquare size={16} className="text-muted-foreground" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tasques</h2>
          <div className="flex-1 h-px bg-border" />
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-border rounded-[8px]">
            Cap tasca per avui. Crea'n una amb la barra de dalt!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[12px]">
            {tasks.map(entry => <EntryCard key={entry.id} entry={entry} />)}
          </div>
        )}
      </div>


      {notesAndMeetings.length > 0 && (
        <div className="space-y-[12px]">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-muted-foreground" />
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Notes i Reunions</h2>
            <div className="flex-1 h-px bg-border" />
          </div>
          
          <div className="grid grid-cols-1 gap-[12px]">
            {notesAndMeetings.map(entry => <EntryCard key={entry.id} entry={entry} />)}
          </div>
        </div>
      )}


      <div className="space-y-[12px]">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-muted-foreground" />
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Temps Registrat</h2>
          <div className="flex-1 h-px bg-border" />
          {dashboard?.totalHours !== undefined && (
            <span className="text-xs font-medium text-primary">Total: {dashboard.totalHours}h</span>
          )}
        </div>
        
        {timeLogs.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm border border-dashed border-border rounded-[8px]">
            Cap hora registrada avui
          </div>
        ) : (
          <div className="bg-card border border-border rounded-[8px] divide-y divide-border overflow-hidden">
            {timeLogs.map((log: TimeLog) => (
              <div key={log.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-foreground">{log.project}</span>
                  {log.task_code && <span className="text-xs text-muted-foreground font-mono bg-muted px-1.5 py-0.5 rounded">{log.task_code}</span>}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-xs truncate max-w-[200px] sm:max-w-[400px]">{log.description}</span>
                  <span className="font-medium text-foreground whitespace-nowrap">{log.hours}h</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      <div className="space-y-[12px] pb-8">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setStandupOpen(!standupOpen)}
        >
          <MessageSquare size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
          <h2 className="text-xs font-semibold text-muted-foreground group-hover:text-foreground uppercase tracking-wider transition-colors">Standup</h2>
          <div className="flex-1 h-px bg-border" />
          {standupOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
        
        {standupOpen && (
          <div className="bg-card border border-border rounded-[8px] p-5 space-y-5 shadow-sm relative animate-in fade-in slide-in-from-top-2">
            <Button 
              onClick={handleCopyStandup} 
              variant="outline" 
              size="sm" 
              className="absolute top-4 right-4 h-8 gap-1.5"
            >
              <Copy size={13} /> Copiar
            </Button>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Ahir ({standup?.yesterday})</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {(!standup?.yesterdayDone || standup.yesterdayDone.length === 0) && <li>Cap element</li>}
                  {standup?.yesterdayDone.map((e: Entry) => (
                    <li key={e.id}>{e.title}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">Avui ({standup?.today})</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {(!standup?.todayPlan || standup.todayPlan.length === 0) && <li>Cap element</li>}
                  {standup?.todayPlan.map((e: Entry) => (
                    <li key={e.id}>{e.title}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}