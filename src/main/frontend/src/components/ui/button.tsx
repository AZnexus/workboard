import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center whitespace-nowrap",
    "outline-none disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "",
        destructive: "",
        outline: "",
        secondary: "",
        ghost: "",
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "",
        xs: "",
        sm: "",
        lg: "",
        icon: "",
        "icon-xs": "",
        "icon-sm": "",
        "icon-lg": "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const variantStyles: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--accent-primary)",
    color: "#fff",
  },
  destructive: {
    backgroundColor: "var(--data-negative)",
    color: "#fff",
  },
  outline: {
    backgroundColor: "var(--surface-2)",
    color: "var(--text-primary)",
    border: "1px solid var(--border-subtle)",
  },
  secondary: {
    backgroundColor: "var(--surface-2)",
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
}

const sizeStyles: Record<string, React.CSSProperties> = {
  default: {
    height: "40px",
    padding: "0 var(--space-4)",
    gap: "var(--space-2)",
    fontSize: "var(--text-sm)",
    fontWeight: 500,
    borderRadius: "var(--radius-md)",
  },
  xs: {
    height: "24px",
    padding: "0 var(--space-2)",
    gap: "4px",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    borderRadius: "var(--radius-md)",
  },
  sm: {
    height: "32px",
    padding: "0 var(--space-3)",
    gap: "6px",
    fontSize: "var(--text-xs)",
    fontWeight: 500,
    borderRadius: "var(--radius-md)",
  },
  lg: {
    height: "40px",
    padding: "0 var(--space-6)",
    gap: "var(--space-2)",
    fontSize: "var(--text-sm)",
    fontWeight: 500,
    borderRadius: "var(--radius-md)",
  },
  icon: {
    width: "36px",
    height: "36px",
    padding: "0",
    borderRadius: "var(--radius-md)",
  },
  "icon-xs": {
    width: "24px",
    height: "24px",
    padding: "0",
    borderRadius: "var(--radius-md)",
  },
  "icon-sm": {
    width: "32px",
    height: "32px",
    padding: "0",
    borderRadius: "var(--radius-md)",
  },
  "icon-lg": {
    width: "40px",
    height: "40px",
    padding: "0",
    borderRadius: "var(--radius-md)",
  },
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  style,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  const resolvedVariant = variant ?? "default"
  const resolvedSize = size ?? "default"

  const combinedStyle: React.CSSProperties = {
    transition: `all var(--duration-fast)`,
    ...sizeStyles[resolvedSize],
    ...variantStyles[resolvedVariant],
    ...style,
  }

  return (
    <Comp
      data-slot="button"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(buttonVariants({ variant, size, className }))}
      style={combinedStyle}
      {...props}
    />
  )
}

export { Button, buttonVariants }
