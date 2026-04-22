import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, style, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content w-full outline-none",
        "placeholder:italic",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[var(--accent-primary)] focus-visible:shadow-[var(--shadow-glow)]",
        "aria-invalid:border-[var(--data-negative)]",
        className
      )}
      style={{
        minHeight: "64px",
        backgroundColor: "var(--surface-2)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-sm)",
        padding: "var(--space-2) var(--space-3)",
        fontSize: "var(--text-sm)",
        color: "var(--text-primary)",
        transition: "border var(--duration-fast), box-shadow var(--duration-fast)",
        ...style,
      }}
      {...props}
    />
  )
}

export { Textarea }
