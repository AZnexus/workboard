import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { EntryList } from "./EntryList"

vi.mock("@/hooks/useEntries", () => ({
  useEntries: () => ({ data: { data: [] }, isLoading: false }),
}))

vi.mock("react-router-dom", () => ({
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}))

describe("EntryList", () => {
  it("renders page header with title and description", () => {
    render(<EntryList />)
    expect(screen.getByRole("heading", { name: "Registre", level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Cerca, filtra i explora/i)).toBeInTheDocument()
    expect(screen.getByLabelText("Cercar")).toBeInTheDocument()
    expect(screen.getByLabelText("Estat")).toBeInTheDocument()
    expect(screen.getByLabelText("Tipus")).toBeInTheDocument()
    expect(screen.getByLabelText("Període des de")).toBeInTheDocument()
    expect(screen.getByLabelText("Període fins a")).toBeInTheDocument()
  })
})
