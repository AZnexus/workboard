import { useState, useEffect, useRef, useMemo } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useCreateEntry, useUpdateEntry, useEntry, useEntries } from "@/hooks/useEntries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagMultiSelect } from "@/components/entries/TagMultiSelect"
import { Pin, ArrowLeft, Loader2, Save, Bold, Italic, List, ListOrdered, CheckSquare, Heading2, Heading3, Minus, ClipboardCopy, Printer, ExternalLink, CalendarDays, Tags, Users, Eye } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const getDefaultBody = () => `# \n\n**Data:** ${new Date().toISOString().split('T')[0]}\n\n## Assistents\n\n- \n\n## Punts tractats\n\n- \n\n## Acords\n\n- \n\n## Accions\n\n- [ ] `

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
  const [body, setBody] = useState(getDefaultBody)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [tagsIds, setTagsIds] = useState<number[]>([])
  const [pinned, setPinned] = useState(false)
  const [attendeesInput, setAttendeesInput] = useState(() => extractAttendees(getDefaultBody()))
  
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

  const updateTitleInBody = (newTitle: string) => {
    setBody(prev => {
      if (/^# .*/m.test(prev)) {
        return prev.replace(/^# .*/m, `# ${newTitle}`)
      } else {
        return `# ${newTitle}\n\n${prev}`
      }
    })
  }

  const updateDateInBody = (newDate: string) => {
    setBody(prev => {
      if (/\*\*Data:\*\* .*/m.test(prev)) {
        return prev.replace(/\*\*Data:\*\* .*/m, `**Data:** ${newDate}`)
      } else {
        if (/^# .*/m.test(prev)) {
          return prev.replace(/^# .*/m, `$&` + `\n\n**Data:** ${newDate}`)
        }
        return `**Data:** ${newDate}\n\n${prev}`
      }
    })
  }

  const updateAttendeesInBody = (names: string) => {
    setBody(prev => {
      const listItems = names.split(',').map(n => n.trim()).filter(Boolean).map(n => `- ${n}`).join('\n')
      const newSection = `## Assistents\n\n${listItems || '- '}`
      if (/## Assistents\n\n[\s\S]*?(?=\n\n##|$)/.test(prev)) {
        return prev.replace(/## Assistents\n\n[\s\S]*?(?=\n\n##|$)/, newSection)
      } else {
        return prev + `\n\n${newSection}`
      }
    })
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
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
      {/* Top Actions Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/actes")} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-border/60 mx-1"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">{isEditing ? "Editar Acta" : "Nova Acta"}</span>
            {isDirty && <span className="flex h-2 w-2 rounded-full bg-amber-500" title="Canvis sense guardar"></span>}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/actes")} className="h-8 text-muted-foreground">Cancel·lar</Button>
          
          <div className="h-4 w-px bg-border/60 mx-1"></div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleCopy} className="h-8 w-8 text-muted-foreground">
                  <ClipboardCopy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copiar Markdown</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => window.print()} className="h-8 w-8 text-muted-foreground">
                  <Printer className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Imprimir</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button onClick={handleSave} disabled={createMut.isPending || updateMut.isPending} size="sm" className="h-8 gap-2 ml-2">
            {(createMut.isPending || updateMut.isPending) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </Button>
        </div>
      </div>

      {/* FULL WIDTH METADATA STRIP */}
      <div className="px-6 md:px-8 py-5 shrink-0 border-b border-border/50 bg-background z-10">
        <Input 
          value={title} 
          onChange={(e) => {
            setTitle(e.target.value)
            updateTitleInBody(e.target.value)
          }} 
          placeholder="Títol de l'acta..." 
          className="text-3xl md:text-4xl font-bold border-0 focus-visible:ring-0 px-0 h-auto shadow-none bg-transparent placeholder:text-muted-foreground/50 mb-4"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 max-w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0 min-w-0">
              <CalendarDays className="h-4 w-4" />
              <span>Data</span>
            </div>
            <Input type="date" value={date} onChange={e => { setDate(e.target.value); updateDateInBody(e.target.value); }} className="h-8 w-[150px] text-sm bg-transparent border-border/40 hover:border-border focus:border-border focus-visible:ring-1 transition-colors px-2" />
          </div>
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0 min-w-0">
              <Tags className="h-4 w-4" />
              <span>Etiquetes</span>
            </div>
            <div className="min-w-0 flex-1">
              <TagMultiSelect selectedIds={tagsIds} onChange={setTagsIds} />
            </div>
          </div>
          
          <div className="flex items-center gap-3 min-w-0 lg:col-span-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0 min-w-0">
              <Users className="h-4 w-4" />
              <span>Assistents</span>
            </div>
            <Input 
              value={attendeesInput}
              onChange={(e) => {
                setAttendeesInput(e.target.value)
                updateAttendeesInBody(e.target.value)
              }}
              placeholder="Noms separats per coma..."
              list="attendees-suggestions"
              className="h-8 flex-1 text-sm bg-transparent border-border/40 hover:border-border focus:border-border focus-visible:ring-1 transition-colors px-2"
            />
            <datalist id="attendees-suggestions">
              {knownAttendees.map(name => <option key={name} value={name} />)}
            </datalist>
          </div>
          
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0 min-w-0">
              <Pin className="h-4 w-4" />
              <span>Fixació</span>
            </div>
            <Button
              type="button"
              variant={pinned ? "secondary" : "ghost"}
              size="sm"
              className={cn("h-8 gap-2 px-2 border border-transparent", pinned ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20" : "text-muted-foreground hover:bg-muted/50 border-border/40")}
              onClick={() => setPinned(!pinned)}
            >
              <Pin size={14} className={cn(pinned ? "fill-amber-600" : "")} />
              {pinned ? "Fixada a l'inici" : "Sense fixar"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        
        {/* Left Column: Metadata & Editor */}
        <div className="flex h-full min-h-0 w-1/2 flex-col border-r border-border bg-background relative z-0">
          
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            {/* Toolbar */}
            <div className="sticky top-0 z-10 flex h-10 shrink-0 items-center border-b border-border/50 bg-background/95 px-6 backdrop-blur md:px-8">
              <TooltipProvider>
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => insertMarkdown("**", "**")}>
                        <Bold className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Negreta</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => insertMarkdown("*", "*")}>
                        <Italic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Cursiva</TooltipContent>
                  </Tooltip>
                  <div className="w-px h-4 bg-border mx-1"></div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => insertMarkdown("\n- ", "")}>
                        <List className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Llista</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => insertMarkdown("\n1. ", "")}>
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Llista numerada</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => insertMarkdown("\n- [ ] ", "")}>
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Casella de verificació</TooltipContent>
                  </Tooltip>
                  <div className="w-px h-4 bg-border mx-1"></div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => insertMarkdown("\n## ", "")}>
                        <Heading2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Títol 2</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => insertMarkdown("\n### ", "")}>
                        <Heading3 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Títol 3</TooltipContent>
                  </Tooltip>
                  <div className="w-px h-4 bg-border mx-1"></div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => insertMarkdown("\n---\n", "")}>
                        <Minus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Línia separadora</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>

            {/* Textarea */}
            <Textarea 
              ref={textareaRef}
              value={body}
              onChange={(e) => {
                const newBody = e.target.value;
                setBody(newBody);
                
                const matchTitle = newBody.match(/^# (.*)/m);
                if (matchTitle) setTitle(matchTitle[1].trim());
                else setTitle("");
                
                const matchDate = newBody.match(/\*\*Data:\*\* (.*)/m);
                if (matchDate) setDate(matchDate[1].trim());
                
                const extractedAtt = extractAttendees(newBody);
                setAttendeesInput(extractedAtt);
              }}
              onKeyDown={handleKeyDown}
              className="min-h-[420px] flex-1 w-full resize-none border-0 rounded-none bg-transparent px-6 py-4 font-mono text-sm leading-relaxed focus-visible:ring-0 md:px-8"
              placeholder="Escriu l'acta aquí en Markdown..."
            />
          </div>
          
          <div className="bg-muted/5 py-2 px-6 md:px-8 border-t border-border shrink-0 text-xs text-muted-foreground flex justify-between items-center">
            <span>{wordCount} paraules · ~{readingTime} min lectura</span>
            <span className="flex items-center gap-1"><CheckSquare className="h-3 w-3" /> Markdown compatible</span>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="relative flex h-full min-h-0 w-1/2 flex-col bg-card/30">
          <div className="sticky top-0 z-10 flex h-10 shrink-0 items-center justify-between border-b border-border/50 bg-card/60 px-6 backdrop-blur-sm md:px-8">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Eye className="h-3.5 w-3.5" />
              Vista Prèvia
            </span>
          </div>
          <div 
            ref={previewRef}
            className="min-h-0 flex-1 overflow-y-auto px-6 py-4 md:px-8
                       [&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:mt-2 [&_h1:first-child]:mt-0 [&_h1]:text-foreground [&_h1]:border-b [&_h1]:border-border [&_h1]:pb-4
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
