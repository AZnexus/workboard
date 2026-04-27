import { useNavigate, useParams } from "react-router-dom"
import { useEntry } from "@/hooks/useEntries"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Pencil, Pin } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { formatGroupDate } from "@/lib/date-utils"

function bodyContainsTitleAndDate(body: string | null | undefined) {
  if (!body) return false

  const hasMarkdownTitle = /^#\s+.+/m.test(body)
  const hasMarkdownDate = /^\*\*Data:\*\*\s+.+/m.test(body)

  return hasMarkdownTitle && hasMarkdownDate
}

export function ActaViewPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: entry, isLoading } = useEntry(id ? Number(id) : 0)

  const usesMarkdownHeader = bodyContainsTitleAndDate(entry?.body)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        Acta no trobada
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/actes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              {!usesMarkdownHeader && <h1 className="text-xl font-semibold text-foreground">{entry.title}</h1>}
              {entry.pinned && <Pin size={14} className="text-primary fill-primary/20" />}
            </div>
            {!usesMarkdownHeader && (
              <span className="text-sm text-muted-foreground capitalize">{formatGroupDate(entry.date)}</span>
            )}
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => navigate(`/actes/${entry.id}/edit`)}>
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </div>

      {entry.tags.length > 0 && (
        <div className="flex items-center gap-2 py-3 border-b border-border">
          {entry.tags.map(tag => (
            <Badge
              key={tag.id ?? tag.name}
              variant="secondary"
              className="rounded-sm text-xs px-1.5 py-0 font-normal border"
              style={{ backgroundColor: tag.color + "20", color: tag.color, borderColor: tag.color + "40" }}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      <div 
        className="flex-1 overflow-y-auto py-6 max-w-none 
                   [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1:first-child]:mt-0 [&_h1]:text-foreground
                   [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-6 [&_h2:first-child]:mt-0 [&_h2]:text-foreground [&_h2]:border-b [&_h2]:border-border [&_h2]:pb-2
                   [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-foreground
                   [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul>li]:mb-2 [&_ul>li]:text-foreground
                   [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol>li]:mb-2 [&_ol>li]:text-foreground
                   [&_p]:mb-4 [&_p]:text-foreground leading-relaxed
                   [&_strong]:font-semibold [&_strong]:text-foreground
                   [&_em]:italic [&_em]:text-foreground
                   [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:mb-4
                   [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_code]:font-mono
                   [&_hr]:my-8 [&_hr]:border-border
                   [&_li]:marker:text-muted-foreground
                   [&_li>input[type=checkbox]]:mt-1 [&_li>input[type=checkbox]]:mr-2 [&_li.task-list-item]:list-none [&_ul.contains-task-list]:pl-0"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {entry.body || ""}
        </ReactMarkdown>
      </div>
    </div>
  )
}
