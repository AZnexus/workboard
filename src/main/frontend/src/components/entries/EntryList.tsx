import { useState } from "react"
import { useEntries } from "@/hooks/useEntries"
import { EntryFilters } from "./EntryFilters"
import { EntryCard } from "./EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { useDebounce } from "@/hooks/useDebounce"

export function EntryList() {
  const [status, setStatus] = useState("")
  const [type, setType] = useState("")
  const [search, setSearch] = useState("")
  
  const debouncedSearch = useDebounce(search, 300)
  
  const { data, isLoading } = useEntries({ 
    status: (status as any) || undefined, 
    type: (type as any) || undefined, 
    q: debouncedSearch || undefined 
  })

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Totes les Entrades</h1>
      </div>
      
      <EntryFilters 
        status={status} setStatus={setStatus}
        type={type} setType={setType}
        search={search} setSearch={setSearch}
      />

      {isLoading ? (
        <div className="space-y-[16px]">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full rounded-[8px]" />)}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-[8px]">
          No hi ha cap entrada que coincideixi
        </div>
      ) : (
        <div className="space-y-[16px]">
          {data?.data?.map(entry => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}
