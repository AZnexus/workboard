import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function TopBar() {
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim() !== '') {
      navigate(`/entries?q=${encodeURIComponent(search.trim())}`)
      setSearch("")
    }
  }

  const dateStr = new Intl.DateTimeFormat("ca-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date())

  return (
    <header className="flex h-[48px] shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="text-sm font-medium text-muted-foreground capitalize">
        {dateStr}
      </div>
      <div className="relative w-64">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          type="text"
          placeholder="Cercar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 w-full pl-8 bg-background border-border text-sm"
        />
      </div>
    </header>
  )
}
