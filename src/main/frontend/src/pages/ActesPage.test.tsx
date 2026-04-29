import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ActesPage } from "./ActesPage"

vi.mock("@/hooks/useEntries", () => ({
  useEntries: () => ({ data: { data: [] }, isLoading: false }),
  useCreateEntry: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock("@/hooks/useTags", () => ({
  useTags: () => ({ data: [] }),
  useCreateTag: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
}))

describe("ActesPage", () => {
  it("renders page header with title and description", () => {
    render(<ActesPage />)
    expect(screen.getByRole("heading", { name: "Actes de Reunió", level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Gestió i seguiment de les teves actes/i)).toBeInTheDocument()
    expect(screen.getByLabelText("Cercar")).toBeInTheDocument()
    expect(screen.getByLabelText("Etiquetes")).toBeInTheDocument()
    expect(screen.getByLabelText("Ordenar per")).toBeInTheDocument()
  })
})
