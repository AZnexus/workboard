import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { EntryStatusBadge } from "./entry-status"

describe("EntryStatusBadge", () => {
  it("keeps semantic styling and natural sentence casing", () => {
    render(<EntryStatusBadge status="PAUSED" />)

    const badge = screen.getByText("Pausada").closest('[data-slot="badge"]')

    expect(badge).toHaveClass("bg-data-warning/15")
    expect(badge).toHaveClass("text-data-warning")
    expect(badge).toHaveClass("border-data-warning/30")
    expect(badge).toHaveClass("normal-case")
    expect(badge).toHaveClass("tracking-normal")
  })

  it("uses archive-specific labels for notes", () => {
    render(<EntryStatusBadge status="DONE" variant="note" />)

    expect(screen.getByText("Arxivada")).toBeInTheDocument()
    expect(screen.queryByText("Fet")).not.toBeInTheDocument()
  })
})
