import { Button } from "@/components/ui/button"

interface ListPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ListPagination({ page, totalPages, onPageChange }: ListPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
      >
        Anterior
      </Button>
      <p className="text-sm text-muted-foreground">
        Pàgina {page} de {totalPages}
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
      >
        Següent
      </Button>
    </div>
  )
}
