import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { TasksPage } from "./TasksPage"

vi.mock("@/hooks/useEntries", () => ({
  useEntries: () => ({ data: { data: [] }, isLoading: false }),
}))

describe("TasksPage", () => {
  it("renders page header with title and description", () => {
    render(<TasksPage />)
    expect(screen.getByRole("heading", { name: "Tasques", level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Gestiona les teves tasques/i)).toBeInTheDocument()
  })

  it("renders Actives and Tancades buttons", () => {
    render(<TasksPage />)
    expect(screen.getByRole("button", { name: "Actives" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Tancades" })).toHaveAttribute("aria-pressed", "false")
  })
})
