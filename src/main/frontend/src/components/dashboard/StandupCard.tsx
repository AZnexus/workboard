import { useStandup } from "@/hooks/useDashboard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function StandupCard() {
  const { data, isLoading } = useStandup()

  if (isLoading) return <Skeleton className="h-64" />

  const standup = data

  const handleCopy = () => {
    if (!standup) return
    const text = `Ahir:
${standup.yesterday_done.map(e => `- ${e.title}`).join('\n')}

Avui:
${standup.today_plan.map(e => `- ${e.title}`).join('\n')}
`
    navigator.clipboard.writeText(text)
    toast.success("Copiat al porta-retalls")
  }

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Standup</h1>
        <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2">
          <Copy size={14} /> Copiar
        </Button>
      </div>

      <Card className="rounded-[8px] border-border bg-card shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">Ahir ({standup?.yesterday})</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {standup?.yesterday_done.length === 0 && <li>Cap element</li>}
              {standup?.yesterday_done.map(e => (
                <li key={e.id}>{e.title}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-sm mb-3 text-foreground">Avui ({standup?.today})</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              {standup?.today_plan.length === 0 && <li>Cap element</li>}
              {standup?.today_plan.map(e => (
                <li key={e.id}>{e.title}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
