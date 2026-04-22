import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useCreateEntry, useUpdateEntry, useEntry } from "@/hooks/useEntries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagMultiSelect } from "@/components/entries/TagMultiSelect"
import { Pin, ArrowLeft, Loader2, Save, Bold, Italic, List, ListOrdered, CheckSquare, Heading2, Heading3, Minus } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const DEFAULT_BODY = "## Assistents\n\n- \n\n## Punts tractats\n\n- \n\n## Acords\n\n- \n\n## Accions\n\n- [ ] "

export function ActaEditorPage() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  
  const { data: entry, isLoading: isLoadingEntry } = useEntry(id ? Number(id) : 0)
  
  const [title, setTitle] = useState("")
  const [body, setBody] = useState(DEFAULT_BODY)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [tagsIds, setTagsIds] = useState<number[]>([])
  const [pinned, setPinned] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const checkboxIndexRef = useRef(0)

  checkboxIndexRef.current = 0

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

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    const newText = before + prefix + selected + suffix + after;
    setBody(newText);
    
    const newCursorPos = start + prefix.length + selected.length;
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        insertMarkdown("**", "**");
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        insertMarkdown("*", "*");
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSave();
      }
    }
  };

  const handleCheckboxClick = (index: number) => {
    let currentMatch = -1;
    const newBody = body.replace(/\[([ x])\]/gi, (match, p1) => {
      currentMatch++;
      if (currentMatch === index) {
        return p1 === ' ' ? '[x]' : '[ ]';
      }
      return match;
    });
    setBody(newBody);
  };

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
          <div className="bg-muted/30 py-2 px-4 border-b border-border shrink-0 flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Editor (Markdown)</span>
          </div>
          <TooltipProvider>
            <div className="bg-muted/30 border-b border-border px-4 py-1 flex items-center gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("**", "**")}>
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Negreta</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("*", "*")}>
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Cursiva</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("\n- ", "")}>
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Llista</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("\n1. ", "")}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Llista numerada</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("\n- [ ] ", "")}>
                    <CheckSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Casella de verificació</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("\n## ", "")}>
                    <Heading2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Títol 2</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("\n### ", "")}>
                    <Heading3 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Títol 3</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => insertMarkdown("\n---\n", "")}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Línia separadora</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          <Textarea 
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
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
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                input: ({ node, checked, ...props }) => {
                  if (props.type === "checkbox") {
                    const index = checkboxIndexRef.current++;
                    return (
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCheckboxClick(index)}
                        className="mt-1 mr-2"
                      />
                    );
                  }
                  return <input {...props} />;
                }
              }}
            >
              {body}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  )
}

