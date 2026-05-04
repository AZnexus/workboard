import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TasksPage } from "./TasksPage"

const setSearchParams = vi.fn()
let currentSearchParams = new URLSearchParams()

vi.mock("@/hooks/useEntries", () => ({
  useEntries: () => ({
    data: {
      data: [
        {
          id: 1,
          type: "TASK",
          title: "Preparar release",
          body: "Revisar canvis",
          status: "OPEN",
          date: "2026-04-30",
          due_date: null,
          scheduled_today: false,
          external_ref: null,
          pinned: false,
          priority: 2,
          tags: [],
          created_at: "2026-04-30T10:00:00Z",
          updated_at: "2026-04-30T10:00:00Z",
        },
        {
          id: 2,
          type: "TASK",
          title: "Tanca incidència",
          body: null,
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
  useUpdateEntry: () => ({ mutate: vi.fn() }),
}))

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [currentSearchParams, setSearchParams],
}))

describe("TasksPage", () => {
  beforeEach(() => {
    setSearchParams.mockClear()
    currentSearchParams = new URLSearchParams()
  })

  it("renders page header with title and description", () => {
    render(<TasksPage />)
    expect(screen.getByRole("heading", { name: "Tasques", level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Gestiona les teves tasques/i)).toBeInTheDocument()
  })

  it("uses table view by default", () => {
    render(<TasksPage />)
    expect(screen.getByRole("columnheader", { name: /títol/i })).toBeInTheDocument()
  })

  it("renders localized status badges in table view", () => {
    render(<TasksPage />)

    expect(screen.getByText("Nou")).toBeInTheDocument()
    expect(screen.queryByText("OPEN")).not.toBeInTheDocument()
  })

  it("keeps Actives/Tancades behavior URL-backed", async () => {
    const user = userEvent.setup()

    render(<TasksPage />)

    await user.click(screen.getByRole("button", { name: /filtres/i }))
    await user.click(screen.getByRole("button", { name: "Tancades" }))

    expect(setSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams), { replace: true })
  })

  it("shows the filter panel when scope comes from URL", () => {
    currentSearchParams = new URLSearchParams("scope=closed")

    render(<TasksPage />)

    expect(screen.getByRole("button", { name: /filtres/i })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("button", { name: "Tancades" })).toBeInTheDocument()
  })

  it("allows switching to cards fallback view", async () => {
    const user = userEvent.setup()

    render(<TasksPage />)

    await user.click(screen.getByRole("button", { name: /targetes/i }))

    expect(setSearchParams).toHaveBeenCalledWith(expect.any(URLSearchParams), { replace: true })
  })

  it("shows pagination context and page size selector", () => {
    render(<TasksPage />)

    expect(screen.getByText("Pàgina 1 de 1")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: /elements per pàgina/i })).toBeInTheDocument()
  })

  it("offers an explicit open action in table mode", () => {
    render(<TasksPage />)

    const openButton = screen.getByRole("button", { name: /obrir/i })

    expect(openButton).toBeInTheDocument()
    expect(openButton).toHaveClass("text-muted-foreground")
    expect(openButton.closest('[data-slot="table-action-group"]')).toBeInTheDocument()
    expect(openButton.querySelector("svg")).toBeInTheDocument()
  })

  it("uses truncation-safe defaults on table title cells", () => {
    const { container } = render(<TasksPage />)

    expect(container.querySelector("td.min-w-0")).toBeInTheDocument()
    expect(container.querySelector("span.truncate")).toBeInTheDocument()
  })
})
