import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { NotesPage } from "./NotesPage"

vi.mock("@/hooks/useEntries", () => ({
  useEntries: () => ({ data: { data: [] }, isLoading: false }),
  useUpdateEntry: () => vi.fn(),
}))

describe("NotesPage", () => {
  it("renders page header with title and description", () => {
    render(<NotesPage />)
    expect(screen.getByRole("heading", { name: "Notes", level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Apunts ràpids/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Actives" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Arxivades" })).toHaveAttribute("aria-pressed", "false")
  })
})
