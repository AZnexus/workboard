import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { fetchMarkdownExport } from "@/api/dashboard"
import { Copy, Download } from "lucide-react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export function ExportView() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!date) return
    setLoading(true)
    fetchMarkdownExport({ date })
      .then(setContent)
      .catch(() => toast.error("Error al carregar exportació"))
      .finally(() => setLoading(false))
  }, [date])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    toast.success("Copiat al porta-retalls")
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `export-${date}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-[24px] h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Exportar</h1>
        <div className="flex items-center gap-2">
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-9 w-auto border-border bg-background text-foreground" />
          <Button onClick={handleCopy} variant="outline" size="sm" className="gap-2"><Copy size={14} /> Copiar</Button>
          <Button onClick={handleDownload} size="sm" className="gap-2 bg-accent hover:bg-accent/90 text-white"><Download size={14} /> .md</Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 bg-surface border border-border rounded-[8px] p-4 overflow-auto">
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
