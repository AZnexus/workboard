import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchMarkdownExport } from "@/api/dashboard"
import { Copy, Download } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function ExportView() {
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!dateFrom && !dateTo) return
    setLoading(true)
    fetchMarkdownExport({ dateFrom, dateTo })
      .then(setContent)
      .catch(() => toast.error("❌ Error al carregar exportació"))
      .finally(() => setLoading(false))
  }, [dateFrom, dateTo])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    toast.success("✅ Copiat al porta-retalls")
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `export-${dateFrom}-to-${dateTo}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-[24px] h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Exportar</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">De:</span>
            <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 w-auto border-border bg-background text-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">A:</span>
            <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 w-auto border-border bg-background text-foreground" />
          </div>
          <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2"><Copy size={14} /> Copiar</Button>
          <Button onClick={handleDownload} size="sm" className="gap-2"><Download size={14} /> .md</Button>
        </div>
      </div>

<div className="flex-1 min-h-0 bg-card border border-border rounded-md p-4 overflow-auto">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
          </div>
        ) : (
          <pre className="text-sm font-mono text-muted-foreground whitespace-pre-wrap break-words">{content}</pre>
        )}
      </div>
    </div>
  )
}
