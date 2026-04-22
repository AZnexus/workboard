import * as React from "react"

import { cn } from "@/lib/utils"

const cardBaseStyle: React.CSSProperties = {
  backgroundColor: "var(--surface-1)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-6)",
  border: "1px solid var(--border-subtle)",
  boxShadow: "var(--shadow-sm)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-4)",
  transition: "transform var(--duration-fast), box-shadow var(--duration-fast)",
}

function Card({ className, style, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(className)}
      style={{ ...cardBaseStyle, ...style }}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none", className)}
      style={{ fontWeight: 600, color: "var(--text-primary)" }}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(className)}
      style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
