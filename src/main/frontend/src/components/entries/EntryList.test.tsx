import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { EntryList } from "./EntryList"

const setSearchParams = vi.fn()
let currentSearchParams = new URLSearchParams()

vi.mock("@/hooks/useEntries", () => ({
  useEntries: () => ({
    data: {
      data: [
        {
          id: 1,
          type: "TASK",
          title: "Preparar la reunió",
          body: "Resum curt",
          status: "OPEN",
          date: "2026-04-30",
          due_date: null,
          scheduled_today: false,
          external_ref: null,
          pinned: false,
          priority: 3,
          tags: [],
          created_at: "2026-04-30T10:00:00Z",
          updated_at: "2026-04-30T10:00:00Z",
        },
      ],
      meta: { total: 1, page: 0, size: 50, totalPages: 1 },
    },
    isLoading: false,
  }),
  useUpdateEntry: () => ({ mutate: vi.fn() }),
}))

vi.mock("react-router-dom", () => ({
  useSearchParams: () => [currentSearchParams, setSearchParams],
}))

describe("EntryList", () => {
  beforeEach(() => {
    setSearchParams.mockClear()
    currentSearchParams = new URLSearchParams()
  })

  it("shows the table by default", () => {
    render(<EntryList />)

    expect(screen.getByRole("heading", { name: "Registre", level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Cerca, filtra i explora/i)).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /tipus/i })).toBeInTheDocument()
  })

  it("allows switching to cards view", async () => {
    const user = userEvent.setup()

    render(<EntryList />)

    await user.click(screen.getByRole("button", { name: /targetes/i }))

    expect(setSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams), { replace: true })
  })

  it("hydrates filters from URL, including paused status", () => {
    currentSearchParams = new URLSearchParams("status=PAUSED&priority=abc&pinned=true")

    render(<EntryList />)

    expect(screen.getByRole("button", { name: /filtres/i })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: /filtres/i })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: /fixades/i })).toHaveAttribute("data-state", "on")
  })

  it("shows pagination context and page size selector on a single page", () => {
    render(<EntryList />)

    expect(screen.getByText("Pàgina 1 de 1")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: /elements per pàgina/i })).toBeInTheDocument()
  })

  it("persists page size changes to URL", async () => {
    const user = userEvent.setup()

    render(<EntryList />)

    await user.click(screen.getByRole("combobox", { name: /elements per pàgina/i }))
    await user.click(screen.getByRole("option", { name: "50" }))

    expect(setSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams), { replace: true })
    const [params] = setSearchParams.mock.calls.at(-1) as [URLSearchParams]
    expect(params.get("pageSize")).toBe("50")
    expect(params.get("page")).toBeNull()
  })
})
