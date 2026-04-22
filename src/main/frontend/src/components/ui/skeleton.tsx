import { cn } from "@/lib/utils"

function Skeleton({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(className)}
      style={{
        backgroundColor: "var(--surface-2)",
        borderRadius: "var(--radius-sm)",
        ...style,
      }}
      {...props}
    />
  )
}

export { Skeleton }
