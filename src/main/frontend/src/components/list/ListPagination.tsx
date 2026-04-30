import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ListPaginationProps {
  page: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

function getVisibleRange(page: number, pageSize: number, totalItems: number): string {
  if (totalItems === 0) {
    return "0 de 0"
  }

  const start = (page - 1) * pageSize + 1
  const end = Math.min(totalItems, start + pageSize - 1)
  return `${start}-${end} de ${totalItems}`
}

export function ListPagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
}: ListPaginationProps) {
  const countLabel = totalItems != null && pageSize != null ? getVisibleRange(page, pageSize, totalItems) : null

  return (
    <div className="flex flex-col gap-3 pt-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-1 text-sm text-muted-foreground">
        <p>Pàgina {page} de {totalPages}</p>
        {countLabel ? <p>{countLabel}</p> : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {pageSize != null && onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Elements per pàgina</span>
            <Select value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger aria-label="Elements per pàgina" className="h-10 w-[130px] bg-background text-sm">
                <SelectValue placeholder="Elements per pàgina" />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Següent
          </Button>
        </div>
      </div>
    </div>
  )
}
