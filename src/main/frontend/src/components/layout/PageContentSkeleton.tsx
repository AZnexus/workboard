import { Skeleton } from "@/components/ui/skeleton"

export function PageContentSkeleton() {
  return (
    <div className="space-y-4" data-testid="page-content-skeleton">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-3 p-4 border border-border/60 rounded-xl bg-card/30">
          <Skeleton className="h-6 w-[40%] max-w-[200px] rounded-md" />
          <Skeleton className="h-4 w-[70%] max-w-[400px] rounded-md" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
