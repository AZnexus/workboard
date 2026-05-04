import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { NotesPage } from "./NotesPage"

const setSearchParams = vi.fn()
let currentSearchParams = new URLSearchParams()
const mutate = vi.fn()

vi.mock("@/hooks/useEntries", () => ({
  useEntries: () => ({
    data: {
      data: [
        {
          id: 11,
          type: "NOTE",
          title: "Nota activa",
          body: "Recordatori de projecte",
          status: "OPEN",
          date: "2026-04-30",
          due_date: null,
          scheduled_today: false,
          external_ref: null,
          pinned: false,
          priority: null,
          tags: [],
          created_at: "2026-04-30T10:00:00Z",
          updated_at: "2026-04-30T10:00:00Z",
        },
        {
          id: 12,
          type: "NOTE",
          title: "Nota arxivada",
          body: "Històric",
          status: "DONE",
          date: "2026-04-29",
          due_date: null,
          scheduled_today: false,
          external_ref: null,
          pinned: false,
          priority: null,
          tags: [],
          created_at: "2026-04-29T10:00:00Z",
          updated_at: "2026-04-29T10:00:00Z",
        },
      ],
      meta: { total: 2, page: 0, size: 100, totalPages: 1 },
    },
    isLoading: false,
  }),
  useUpdateEntry: () => ({ mutate }),
}))

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [currentSearchParams, setSearchParams],
}))

describe("NotesPage", () => {
  beforeEach(() => {
    setSearchParams.mockClear()
    mutate.mockClear()
    currentSearchParams = new URLSearchParams()
  })

  it("renders page header with title and description", () => {
    render(<NotesPage />)
    expect(screen.getByRole("heading", { name: "Notes", level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Apunts ràpids/i)).toBeInTheDocument()
  })

  it("uses table view by default", () => {
    render(<NotesPage />)
    expect(screen.getByRole("columnheader", { name: /títol/i })).toBeInTheDocument()
  })

  it("renders localized status badges in table view", () => {
    render(<NotesPage />)

    expect(screen.getByText("Nou")).toBeInTheDocument()
    expect(screen.queryByText("OPEN")).not.toBeInTheDocument()
  })

  it("uses archive-specific status labels for archived notes", () => {
    currentSearchParams = new URLSearchParams("scope=archived")

    render(<NotesPage />)

    expect(screen.getByText("Arxivada")).toBeInTheDocument()
    expect(screen.queryByText("Fet")).not.toBeInTheDocument()
  })

  it("keeps archive-specific status labels in cards view", () => {
    currentSearchParams = new URLSearchParams("scope=archived&view=cards")

    render(<NotesPage />)

    expect(screen.getByText("Arxivada")).toBeInTheDocument()
    expect(screen.queryByText("Fet")).not.toBeInTheDocument()
  })

  it("keeps convert and archive actions available in table mode", async () => {
    const user = userEvent.setup()

    render(<NotesPage />)

    await user.click(screen.getByRole("button", { name: /convertir/i }))
    await user.click(screen.getByRole("button", { name: /arxivar/i }))

    expect(mutate).toHaveBeenCalledTimes(2)
  })

  it("keeps Actives/Arxivades toggle URL-backed", async () => {
    const user = userEvent.setup()

    render(<NotesPage />)

    await user.click(screen.getByRole("button", { name: /filtres/i }))
    await user.click(screen.getByRole("button", { name: "Arxivades" }))

    expect(setSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams), { replace: true })
  })

  it("shows the filter panel when scope comes from URL", () => {
    currentSearchParams = new URLSearchParams("scope=archived")

    render(<NotesPage />)

    expect(screen.getByRole("button", { name: /filtres/i })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: "Arxivades" })).toBeInTheDocument()
  })

  it("allows switching to cards fallback view", async () => {
    const user = userEvent.setup()

    render(<NotesPage />)

    await user.click(screen.getByRole("button", { name: /targetes/i }))

    expect(setSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams), { replace: true })
  })

  it("shows pagination context and page size selector", () => {
    render(<NotesPage />)

    expect(screen.getByText("Pàgina 1 de 1")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: /elements per pàgina/i })).toBeInTheDocument()
  })

  it("offers an explicit open action in table mode", () => {
    render(<NotesPage />)

    const openButton = screen.getByRole("button", { name: /obrir/i })
    const convertButton = screen.getByRole("button", { name: /convertir/i })
    const archiveButton = screen.getByRole("button", { name: /arxivar/i })

    expect(openButton).toBeInTheDocument()
    expect(openButton).toHaveClass("hover:text-data-info")
    expect(openButton.closest('[data-slot="table-action-group"]')).toBeInTheDocument()
    expect(openButton.querySelector("svg")).toBeInTheDocument()
    expect(convertButton).toHaveClass("hover:text-accent-primary")
    expect(archiveButton).toHaveClass("hover:text-data-warning")
  })
})
