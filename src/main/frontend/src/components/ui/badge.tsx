import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
  | "positive" | "negative" | "warning" | "info"

const badgeBaseStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: "24px",
  padding: "0 var(--space-2)",
  fontSize: "var(--text-xs)",
  fontWeight: 600,
  borderRadius: "var(--radius-full)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
  overflow: "hidden",
  gap: "4px",
  border: "1px solid transparent",
  transition: "color var(--duration-fast), background-color var(--duration-fast)",
}

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--accent-primary)",
    color: "hsl(0, 0%, 100%)",
  },
  secondary: {
    backgroundColor: "var(--surface-2)",
    color: "var(--text-secondary)",
  },
  destructive: {
    backgroundColor: "color-mix(in srgb, var(--background) 85%, var(--data-negative))",
    color: "var(--data-negative)",
  },
  outline: {
    backgroundColor: "transparent",
    color: "var(--text-primary)",
    border: "1px solid var(--border-subtle)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--text-secondary)",
  },
  link: {
    backgroundColor: "transparent",
    color: "var(--accent-primary)",
  },
  positive: {
    backgroundColor: "color-mix(in srgb, var(--background) 85%, var(--data-positive))",
    color: "var(--data-positive)",
  },
  negative: {
    backgroundColor: "color-mix(in srgb, var(--background) 85%, var(--data-negative))",
    color: "var(--data-negative)",
  },
  warning: {
    backgroundColor: "color-mix(in srgb, var(--background) 85%, var(--data-warning))",
    color: "var(--data-warning)",
  },
  info: {
    backgroundColor: "color-mix(in srgb, var(--background) 85%, var(--data-info))",
    color: "var(--data-info)",
  },
}

// Keep badgeVariants export for backwards compatibility (consumers may import it)
const badgeVariants = (_opts?: { variant?: string }) => ""

function Badge({
  className,
  variant = "default",
  asChild = false,
  style,
  ...props
}: React.ComponentProps<"span"> & {
  variant?: BadgeVariant
  asChild?: boolean
}) {
  const Comp = asChild ? Slot.Root : "span"
  const resolvedVariant = variant ?? "default"

  const combinedStyle: React.CSSProperties = {
    ...badgeBaseStyle,
    ...variantStyles[resolvedVariant],
    ...style,
  }

  return (
    <Comp
      data-slot="badge"
      data-variant={resolvedVariant}
      className={cn("[&>svg]:pointer-events-none [&>svg]:size-3", className)}
      style={combinedStyle}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
