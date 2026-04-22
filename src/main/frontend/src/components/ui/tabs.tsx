import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className
      )}
      {...props}
    />
  )
}

type TabsListVariant = "default" | "line"

const listVariantStyles: Record<TabsListVariant, React.CSSProperties> = {
  default: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--surface-2)",
    padding: "var(--space-1)",
    borderRadius: "var(--radius-full)",
    gap: "var(--space-1)",
  },
  line: {
    display: "flex",
    gap: "var(--space-6)",
    borderBottom: "1px solid var(--border-subtle)",
    backgroundColor: "transparent",
    padding: "0",
    borderRadius: "0",
  },
}

const tabsListVariants = (_opts?: { variant?: string }) => ""

function TabsList({
  className,
  variant = "default",
  style,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: TabsListVariant
}) {
  const resolvedVariant = variant ?? "default"
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={resolvedVariant}
      className={cn("group/tabs-list w-fit", className)}
      style={{ ...listVariantStyles[resolvedVariant], ...style }}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  style,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
        "text-[var(--text-secondary)]",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=default]/tabs-list:data-[state=active]:bg-[var(--accent-primary)] group-data-[variant=default]/tabs-list:data-[state=active]:text-white",
        "group-data-[variant=line]/tabs-list:border-b-2 group-data-[variant=line]/tabs-list:border-b-transparent group-data-[variant=line]/tabs-list:data-[state=active]:border-b-[var(--accent-primary)] group-data-[variant=line]/tabs-list:data-[state=active]:text-[var(--text-primary)]",
        className
      )}
      style={{
        padding: "var(--space-1) var(--space-4)",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--text-sm)",
        fontWeight: 500,
        transition: "all var(--duration-fast)",
        cursor: "pointer",
        ...style,
      }}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
