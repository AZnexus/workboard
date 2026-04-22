import * as React from "react"

import { cn } from "@/lib/utils"

const inputBaseStyle: React.CSSProperties = {
  height: "40px",
  width: "100%",
  minWidth: 0,
  backgroundColor: "var(--surface-2)",
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-sm)",
  padding: "0 var(--space-3)",
  color: "var(--text-primary)",
  fontSize: "var(--text-sm)",
  transition: "border var(--duration-fast), box-shadow var(--duration-fast)",
  outline: "none",
}

function Input({ className, type, style, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:italic",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-[var(--accent-primary)] focus-visible:shadow-[var(--shadow-glow)]",
        "aria-invalid:border-[var(--data-negative)]",
        className
      )}
      style={{
        ...inputBaseStyle,
        ...style,
      }}
      {...props}
    />
  )
}

export { Input }
