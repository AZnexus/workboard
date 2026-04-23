import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useGlobalCreate } from "@/hooks/useGlobalCreate"
import { QuickCapture } from "@/components/entries/QuickCapture"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, ChevronDown, CheckSquare, FileText, Users, Sparkles } from "lucide-react"

export function TopBar() {
  const [search, setSearch] = useState("")
  const navigate = useNavigate()
  const { openCreate } = useGlobalCreate()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      navigate(`/entries?q=${encodeURIComponent(search.trim())}`)
      setSearch("")
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border bg-card px-4 lg:px-6 gap-4 sticky top-0 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="secondary"
            className="gap-2 shrink-0 border border-primary/20 bg-primary/10 text-primary shadow-sm hover:bg-primary/14"
          >
            <Sparkles size={14} className="text-accent-primary" />
            <span className="font-semibold">Nou</span>
            <ChevronDown size={14} className="text-primary/80" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem onClick={() => openCreate("TASK")} className="gap-2.5">
            <CheckSquare size={14} className="text-accent-primary" /> Nova Tasca
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openCreate("NOTE")} className="gap-2.5">
            <FileText size={14} className="text-data-positive" /> Nova Nota
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/actes/new")} className="gap-2.5">
            <Users size={14} className="text-data-info" /> Nova Acta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1 min-w-0 flex justify-center">
        <QuickCapture compact />
      </div>

      <div className="flex h-9 w-64 shrink-0 items-center gap-2 rounded-md border border-border/50 bg-muted/50 px-3 transition-colors focus-within:border-primary/40 focus-within:bg-background">
        <Search className="shrink-0 text-muted-foreground/85" size={15} />
        <Input
          type="text"
          placeholder="Cercar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-full w-full border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
        />
      </div>
    </header>
  )
}
