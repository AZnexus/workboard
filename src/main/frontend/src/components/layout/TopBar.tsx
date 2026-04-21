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
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-card px-4 lg:px-6 gap-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" className="h-9 gap-1.5 shrink-0 bg-blue-600 hover:bg-blue-700 text-white border-0">
            <Sparkles size={14} className="text-amber-300" />
            <span>Nou</span>
            <ChevronDown size={12} className="text-blue-200" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuItem onClick={() => openCreate("TASK")} className="gap-2.5">
            <CheckSquare size={14} className="text-blue-500" /> Nova Tasca
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => openCreate("NOTE")} className="gap-2.5">
            <FileText size={14} className="text-emerald-500" /> Nova Nota
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/actes/new")} className="gap-2.5">
            <Users size={14} className="text-violet-500" /> Nova Acta
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex-1 max-w-[720px]">
        <QuickCapture compact />
      </div>

      <div className="flex-1" />

      <div className="relative w-60 shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
        <Input
          type="text"
          placeholder="Cercar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-9 w-full pl-8 bg-background border-border text-sm"
        />
      </div>
    </header>
  )
}
