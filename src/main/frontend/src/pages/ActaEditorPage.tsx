import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useCreateEntry, useUpdateEntry, useEntry, useEntries } from "@/hooks/useEntries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagMultiSelect } from "@/components/entries/TagMultiSelect"
import { Pin, ArrowLeft, Loader2, Save, Bold, Italic, List, ListOrdered, CheckSquare, Heading2, Heading3, Minus, ClipboardCopy, Printer, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const DEFAULT_BODY = "## Assistents\n\n- \n\n## Punts tractats\n\n- \n\n## Acords\n\n- \n\n## Accions\n\n- [ ] "

const extractAttendees = (text: string) => {
  const match = text.match(/## Assistents\n\n([\s\S]*?)(?=\n\n##|$)/)
  if (!match) return ""
  return match[1].split('\n').map((l: string) => l.replace(/^[\s\-*]+/, '').trim()).filter(Boolean).join(", ")
}

export function ActaEditorPage() {
  const { id } = useParams()
  const isEditing = !!id
  const navigate = useNavigate()
  
  const { data: entry, isLoading: isLoadingEntry } = useEntry(id ? Number(id) : 0)
  const { data: allActesData } = useEntries({ type: "MEETING_NOTE", size: 100 })
  
  const [title, setTitle] = useState("")
  const [body, setBody] = useState(DEFAULT_BODY)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [tagsIds, setTagsIds] = useState<number[]>([])
  const [pinned, setPinned] = useState(false)
  const [attendeesInput, setAttendeesInput] = useState(extractAttendees(DEFAULT_BODY))
  
  const [isDirty, setIsDirty] = useState(false)
  const initialLoadRef = useRef(true)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const checkboxIndexRef = useRef(0)

  const wordCount = useMemo(() => {
    const words = body.trim().split(/\s+/).filter(w => w.length > 0)
    return words.length
  }, [body])
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  const knownAttendees = useMemo(() => {
    const allEntries = allActesData?.data || []
    const names = new Set<string>()
    for (const e of allEntries) {
      if (!e.body) continue
      const match = e.body.match(/## Assistents\n\n([\s\S]*?)(?=\n##|$)/)
      if (!match) continue
      match[1].split('\n').forEach((line: string) => {
        const name = line.replace(/^[\s\-*]+/, '').trim()
        if (name) names.add(name)
      })
    }
    return Array.from(names).sort()
  }, [allActesData])

  const updateAttendeesInBody = (names: string) => {
    const listItems = names.split(',').map(n => n.trim()).filter(Boolean).map(n => `- ${n}`).join('\n')
    const newSection = `## Assistents\n\n${listItems || '- '}`
    const newBody = body.replace(/## Assistents\n\n[\s\S]*?(?=\n\n##|$)/, newSection)
    setBody(newBody)
  }

  const handleCopy = async () => {
    if (!previewRef.current) return
    const html = previewRef.current.innerHTML
    const blob = new Blob([html], { type: "text/html" })
    await navigator.clipboard.write([new ClipboardItem({ "text/html": blob })])
    toast.success("Acta copiada al portapapers", { duration: 2000 })
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  useEffect(() => {
    if (!initialLoadRef.current) {
      setIsDirty(true)
    }
  }, [title, body, date, tagsIds, pinned])

  checkboxIndexRef.current = 0

  useEffect(() => {
    if (isEditing && entry) {
      setTitle(entry.title)
      setBody(entry.body || "")
      setDate(entry.date)
      setTagsIds(entry.tags?.map(t => t.id).filter((id): id is number => id != null) || [])
      setPinned(entry.pinned || false)
      setAttendeesInput(extractAttendees(entry.body || ""))
      setTimeout(() => { initialLoadRef.current = false }, 0)
    } else if (!isEditing) {
      initialLoadRef.current = false
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
      setIsDirty(false)
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
    const newBody = body.replace(/\[([ xX])\]/gi, (match, p1) => {
      currentMatch++;
      if (currentMatch === index) {
        return p1 === ' ' ? '[x]' : '[ ]';
      }
      return match;
    });
    setBody(newBody);
  };

  const handleCreateTaskFromAction = async (checkboxIndex: number) => {
    const lines = body.split('\n')
    let currentIdx = -1
    let actionText = ""
    for (const line of lines) {
      if (/\[([ xX])\]/.test(line)) {
        currentIdx++
        if (currentIdx === checkboxIndex) {
          actionText = line.replace(/^[\s\-*]*\[([ xX])\]\s*/, '').trim()
          break
        }
      }
    }
    if (!actionText) return
    try {
      await createMut.mutateAsync({
        type: "TASK",
        title: actionText,
        dueDate: date,
      })
      toast.success(`Tasca creada: "${actionText}"`, { duration: 2500 })
    } catch {
      toast.error("Error al crear la tasca")
    }
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
            className="max-w-md font-medium text-base h-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/actes")}>Cancel·lar</Button>
          <Button variant="outline" size="icon" onClick={handleCopy} title="Copiar al portapapers">
            <ClipboardCopy className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.print()} title="Imprimir">
            <Printer className="h-4 w-4" />
          </Button>
          <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} className="gap-2">
            {(createMut.isPending || updateMut.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-6 py-3 border-b border-border shrink-0 bg-muted/20 px-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Data</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-8 w-[140px] text-sm" />
        </div>
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Etiquetes</label>
          <div className="flex-1">
            <TagMultiSelect selectedIds={tagsIds} onChange={setTagsIds} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-muted-foreground whitespace-nowrap">Assistents</label>
          <Input 
            value={attendeesInput}
            onChange={(e) => {
              setAttendeesInput(e.target.value)
              updateAttendeesInBody(e.target.value)
            }}
            placeholder="Noms separats per coma..."
            list="attendees-suggestions"
            className="h-8 w-[250px] text-sm"
          />
          <datalist id="attendees-suggestions">
            {knownAttendees.map(name => <option key={name} value={name} />)}
          </datalist>
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
            className="flex-1 w-full resize-none border-0 focus-visible:ring-0 rounded-none font-mono text-sm p-4 leading-relaxed"
            placeholder="Escriu l'acta aquí en Markdown..."
          />
      <div className="bg-muted/30 py-1.5 px-4 border-t border-border shrink-0 text-xs text-muted-foreground">
            {wordCount} paraules · ~{readingTime} min lectura
          </div>
        </div>

        <div className="w-1/2 h-full flex flex-col bg-card">
          <div className="bg-muted/30 py-2 px-4 border-b border-border shrink-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vista Prèvia</span>
          </div>
          <div 
            ref={previewRef}
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
                      <>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleCheckboxClick(index)}
                          className="mt-1 mr-2"
                        />
                        {!checked && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCreateTaskFromAction(index);
                            }}
                            className="ml-1 inline-flex items-center text-xs text-primary/60 hover:text-primary transition-colors"
                            title="Crear tasca"
                          >
                            <ExternalLink size={10} />
                          </button>
                        )}
                      </>
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
