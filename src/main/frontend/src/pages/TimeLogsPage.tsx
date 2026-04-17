import { TimeLogForm } from "@/components/timelogs/TimeLogForm"
import { TimeLogTable } from "@/components/timelogs/TimeLogTable"
import { WeeklySummary } from "@/components/timelogs/WeeklySummary"

export function TimeLogsPage() {
  return (
    <div className="space-y-[24px]">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Hores</h1>
      <TimeLogForm />
      <TimeLogTable />
      <WeeklySummary />
    </div>
  )
}
