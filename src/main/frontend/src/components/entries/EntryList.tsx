import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useEntries } from "@/hooks/useEntries"
import { EntryFilters } from "./EntryFilters"
import { EntryCard } from "./EntryCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/useDebounce"

export function EntryList() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialQ = searchParams.get("q") || ""

  const [status, setStatus] = useState("")
  const [type, setType] = useState("")
  const [search, setSearch] = useState(initialQ)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [tag, setTag] = useState("")
  const [pinned, setPinned] = useState(false)
  const [page, setPage] = useState(0)
  
  const debouncedSearch = useDebounce(search, 300)
  const debouncedTag = useDebounce(tag, 300)
  
  useEffect(() => {
    setPage(0)
  }, [status, type, debouncedSearch, dateFrom, dateTo, debouncedTag, pinned])

  const { data, isLoading } = useEntries({ 
    status: (status as any) || undefined, 
    type: (type as any) || undefined, 
    q: debouncedSearch || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    tag: debouncedTag || undefined,
    pinned: pinned ? true : undefined,
    page,
    size: 20
  })

  useEffect(() => {
    if (initialQ && debouncedSearch === "") {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete("q")
      setSearchParams(newParams)
    }
  }, [debouncedSearch, initialQ, searchParams, setSearchParams])

  const totalPages = data?.meta?.totalPages || 0
  const currentPage = data?.meta?.page || 0

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Totes les Entrades</h1>
      </div>
      
      <EntryFilters 
        status={status} setStatus={setStatus}
        type={type} setType={setType}
        search={search} setSearch={setSearch}
        dateFrom={dateFrom} setDateFrom={setDateFrom}
        dateTo={dateTo} setDateTo={setDateTo}
        tag={tag} setTag={setTag}
        pinned={pinned} setPinned={setPinned}
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
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
              >
                Anterior
              </Button>
              <div className="text-sm text-muted-foreground">
                Pàgina {currentPage + 1} de {totalPages}
              </div>
              <Button 
                variant="outline" 
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
              >
                Següent
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
