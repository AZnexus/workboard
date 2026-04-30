import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ActesPage } from "./ActesPage"

const setSearchParams = vi.fn()
let currentSearchParams = new URLSearchParams()
const mutateAsync = vi.fn().mockResolvedValue({ id: 1000 })

vi.mock("@/hooks/useEntries", () => ({
  useEntries: () => ({
    data: {
      data: [
        {
          id: 21,
          type: "MEETING_NOTE",
          title: "Acta sprint",
          body: "[ ] Revisar backlog",
          status: "OPEN",
          date: "2026-04-30",
          due_date: null,
          scheduled_today: false,
          external_ref: null,
          pinned: false,
          priority: null,
          tags: [{ id: 1, name: "equip", color: "#000000", created_at: "2026-04-30T00:00:00Z" }],
          created_at: "2026-04-30T10:00:00Z",
          updated_at: "2026-04-30T10:00:00Z",
        },
      ],
      meta: { total: 1, page: 0, size: 50, totalPages: 1 },
    },
    isLoading: false,
  }),
  useCreateEntry: () => ({ mutateAsync }),
}))

vi.mock("@/hooks/useTags", () => ({
  useTags: () => ({ data: [] }),
  useCreateTag: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [currentSearchParams, setSearchParams],
}))

describe("ActesPage", () => {
  beforeEach(() => {
    mutateAsync.mockClear()
    setSearchParams.mockClear()
    currentSearchParams = new URLSearchParams()
  })

  it("renders page header with title and description", () => {
    render(<ActesPage />)
    expect(screen.getByRole("heading", { name: "Actes de Reunió", level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Gestió i seguiment de les teves actes/i)).toBeInTheDocument()
  })

  it("uses table view by default", () => {
    render(<ActesPage />)
    expect(screen.getByRole("columnheader", { name: /títol/i })).toBeInTheDocument()
  })

  it("keeps duplicate action available in table mode", async () => {
    const user = userEvent.setup()

    render(<ActesPage />)

    await user.click(screen.getByRole("button", { name: /duplicar/i }))

    expect(mutateAsync).toHaveBeenCalledTimes(1)
  })

  it("keeps an explicit open path in the default table view", () => {
    render(<ActesPage />)

    expect(screen.getByRole("button", { name: /obrir/i })).toBeInTheDocument()
  })

  it("sorts acta rows by date in descending order by default", () => {
    render(<ActesPage />)

    const tableRows = screen.getAllByRole("row")
    expect(tableRows[1]).toHaveTextContent("Acta sprint")
  })

  it("keeps filter controls in shared filter panel", async () => {
    const user = userEvent.setup()

    render(<ActesPage />)

    await user.click(screen.getByRole("button", { name: /filtres/i }))

    expect(screen.getByLabelText("Etiquetes")).toBeInTheDocument()
    expect(screen.getByLabelText("Ordenar per")).toBeInTheDocument()
  })

  it("allows switching to cards fallback view", async () => {
    const user = userEvent.setup()

    render(<ActesPage />)

    await user.click(screen.getByRole("button", { name: /targetes/i }))

    expect(setSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams), { replace: true })
  })
})
