import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useCreateEntry, useUpdateEntry, useEntry } from "@/hooks/useEntries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagMultiSelect } from "@/components/entries/TagMultiSelect"
import { Pin, ArrowLeft, Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

function parseInline(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/__(.*?)__/gim, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/gim, "<em>$1</em>")
    .replace(/_(.*?)_/gim, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}

function parseCheckbox(text: string) {
  if (text.startsWith('[x] ')) {
    return `<label class="flex items-start"><input type="checkbox" checked disabled class="mt-1 mr-2" /><span class="flex-1">${text.slice(4)}</span></label>`;
  }
  if (text.startsWith('[ ] ')) {
    return `<label class="flex items-start"><input type="checkbox" disabled class="mt-1 mr-2" /><span class="flex-1">${text.slice(4)}</span></label>`;
  }
  return text;
}

function parseMarkdown(text: string) {
  if (!text) return "";
  const blocks = text.split(/\n\n+/);
  
  return blocks.map(block => {
    if (block.startsWith('### ')) return `<h3>${parseInline(block.replace(/^### /, ''))}</h3>`;
    if (block.startsWith('## ')) return `<h2>${parseInline(block.replace(/^## /, ''))}</h2>`;
    if (block.startsWith('# ')) return `<h1>${parseInline(block.replace(/^# /, ''))}</h1>`;
    
    if (block.match(/^\s*-\s/m)) {
      const items = block.split('\n').filter(l => l.trim()).map(line => {
        let content = line.replace(/^\s*-\s/, '');
        const hasCheckbox = content.startsWith('[x] ') || content.startsWith('[ ] ');
        content = parseCheckbox(content);
        return `<li class="${hasCheckbox ? 'list-none -ml-5' : ''}">${hasCheckbox ? content : parseInline(content)}</li>`;
      });
      return `<ul>${items.join('')}</ul>`;
    }
    
    return `<p>${parseInline(block)}</p>`;
  }).join('\n');
}

export function ActaEditorPage() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  
  const { data: entry, isLoading: isLoadingEntry } = useEntry(id ? Number(id) : 0)
  
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("## Punts tractats\n\n- \n\n## Acords\n\n- \n\n## Accions\n\n- [ ] ")
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [tagsIds, setTagsIds] = useState<number[]>([])
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    if (isEditing && entry) {
      setTitle(entry.title)
      setBody(entry.body || "")
      setDate(entry.date)
      setTagsIds(entry.tags?.map(t => t.id).filter((id): id is number => id != null) || [])
      setPinned(entry.pinned || false)
    }
  }, [isEditing, entry])

  const createMut = useCreateEntry()
  const updateMut = useUpdateEntry()

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("El títol és obligatori")
      return
    }

    try {
      if (isEditing && entry) {
        await updateMut.mutateAsync({
          id: entry.id,
          body: {
            type: "MEETING_NOTE",
            title,
            body,
            date,
            tagIds: tagsIds,
            pinned,
            status: entry.status,
          }
        })
        toast.success("Acta actualitzada", { duration: 2500 })
      } else {
        await createMut.mutateAsync({
          type: "MEETING_NOTE",
          title,
          body,
          date,
          tagIds: tagsIds,
        })
        toast.success("Acta creada", { duration: 2500 })
      }
      navigate("/actes")
    } catch (error) {
      toast.error("Error al guardar l'acta")
    }
  }

  if (isEditing && isLoadingEntry) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)] overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
        <div className="flex items-center gap-4 flex-1">
          <Button variant="ghost" size="icon" onClick={() => navigate("/actes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold whitespace-nowrap">{isEditing ? "Editar Acta" : "Nova Acta"}</h1>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Títol de l'acta..." 
            className="max-w-md bg-background text-foreground font-medium text-base h-10 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/actes")}>Cancel·lar</Button>
          <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} className="gap-2">
            {(createMut.isPending || updateMut.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6 py-3 border-b border-border shrink-0 bg-muted/20 px-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Data</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 w-[140px] bg-background border-border text-sm" />
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Etiquetes</label>
          <div className="flex-1">
            <TagMultiSelect selectedIds={tagsIds} onChange={setTagsIds} />
          </div>
        </div>
        <div className="flex items-center">
          <Button
            type="button"
            variant={pinned ? "default" : "outline"}
            size="sm"
            className="h-8 gap-2"
            onClick={() => setPinned(!pinned)}
          >
            <Pin size={14} className={cn(pinned ? "fill-primary-foreground" : "")} />
            {pinned ? "Fixada" : "Fixar"}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 h-full border-r border-border flex flex-col">
          <div className="bg-muted/30 py-2 px-4 border-b border-border shrink-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Editor (Markdown)</span>
          </div>
          <Textarea 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="flex-1 w-full resize-none border-0 focus-visible:ring-0 rounded-none bg-background text-foreground font-mono text-sm p-4 leading-relaxed"
            placeholder="Escriu l'acta aquí en Markdown..."
          />
        </div>

        <div className="w-1/2 h-full flex flex-col bg-card">
          <div className="bg-muted/30 py-2 px-4 border-b border-border shrink-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vista Prèvia</span>
          </div>
          <div 
            className="flex-1 overflow-y-auto p-6 max-w-none 
                       [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:mt-6 [&>h1:first-child]:mt-0 [&>h1]:text-foreground
                       [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:mb-3 [&>h2]:mt-6 [&>h2:first-child]:mt-0 [&>h2]:text-foreground [&>h2]:border-b [&>h2]:border-border [&>h2]:pb-2
                       [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mb-2 [&>h3]:mt-4 [&>h3]:text-foreground
                       [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ul>li]:mb-2 [&>ul>li]:text-foreground
                       [&>p]:mb-4 [&>p]:text-foreground leading-relaxed
                       [&_strong]:font-semibold [&_strong]:text-foreground
                       [&_em]:italic [&_em]:text-foreground"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(body) }}
          />
        </div>
      </div>
    </div>
  )
}
