import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { EntryList } from "./EntryList"

const setSearchParams = vi.fn()
let currentSearchParams = new URLSearchParams()
const defaultEntries = [
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
    version: { id: 11, name: "2026.05", color: "#123456", active: true, created_at: "2026-04-01T00:00:00Z" },
    tags: [],
    created_at: "2026-04-30T10:00:00Z",
    updated_at: "2026-04-30T10:00:00Z",
  },
  {
    id: 2,
    type: "NOTE",
    title: "Nota sense resum",
    body: "",
    status: "OPEN",
    date: "2026-04-29",
    due_date: null,
    scheduled_today: false,
    external_ref: null,
    pinned: false,
    priority: null,
    version: null,
    tags: [],
    created_at: "2026-04-29T10:00:00Z",
    updated_at: "2026-04-29T10:00:00Z",
  },
] as const

let mockedEntries = [...defaultEntries]

vi.mock("@/hooks/useEntries", () => ({
  useEntries: () => ({
    data: {
      data: mockedEntries,
      meta: { total: mockedEntries.length, page: 0, size: 50, totalPages: mockedEntries.length > 0 ? 1 : 0 },
    },
    isLoading: false,
  }),
  useUpdateEntry: () => ({ mutate: vi.fn() }),
}))

vi.mock("react-router-dom", () => ({
  useNavigate: () => vi.fn(),
  useSearchParams: () => [currentSearchParams, setSearchParams],
}))

describe("EntryList", () => {
  beforeEach(() => {
    setSearchParams.mockClear()
    currentSearchParams = new URLSearchParams()
    mockedEntries = [...defaultEntries]
  })

  it("shows the table by default", () => {
    render(<EntryList />)

    expect(screen.getByRole("heading", { name: "Registre", level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Cerca, filtra i explora/i)).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /tipus/i })).toBeInTheDocument()
  })

  it("shows entry title and optional body preview in the default table title cell", () => {
    const { container } = render(<EntryList />)

    const titlePreviewCells = container.querySelectorAll('[data-slot="entry-title-preview-cell"]')

    expect(screen.getByText("Preparar la reunió")).toBeInTheDocument()
    expect(screen.getByText("Resum curt")).toBeInTheDocument()
    expect(screen.getByText("Nota sense resum")).toBeInTheDocument()
    expect(titlePreviewCells).toHaveLength(2)
    expect(titlePreviewCells[1]).toHaveTextContent(/^Nota sense resum$/)
  })

  it("renders localized status badges in table view", () => {
    render(<EntryList />)

    expect(screen.getAllByText("Nou")).toHaveLength(2)
    expect(screen.queryByText("OPEN")).not.toBeInTheDocument()
  })

  it("renders a colored version badge in table view when an entry has version", () => {
    render(<EntryList />)

    const versionBadge = screen.getAllByText(/2026\.05/)[0].closest('[data-slot="badge"]')

    expect(versionBadge).toBeInTheDocument()
    expect(versionBadge).toHaveStyle({ color: "#123456" })
    expect(versionBadge).toHaveStyle({ borderColor: "#123456" })
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

  it("shows the current empty state copy when filters return no entries", () => {
    mockedEntries = []

    const { container } = render(<EntryList />)

    expect(screen.getByText("Cap resultat")).toBeInTheDocument()
    expect(screen.getByText("No hi ha cap entrada que coincideixi amb els filtres")).toBeInTheDocument()
    expect(container.querySelector('[data-slot="entry-list-empty-state"]')).toBeInTheDocument()
    expect(screen.queryByRole("columnheader", { name: /tipus/i })).not.toBeInTheDocument()
  })

  it("keeps list region and pagination in one shared container", () => {
    const { container } = render(<EntryList />)

    expect(screen.getByText("Pàgina 1 de 1")).toBeInTheDocument()
    expect(container.querySelectorAll("section.overflow-hidden.rounded-xl").length).toBeGreaterThan(1)
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

  it("offers an explicit open action in table rows", () => {
    render(<EntryList />)

    const openButtons = screen.getAllByRole("button", { name: /obrir/i })

    expect(openButtons).toHaveLength(2)

    openButtons.forEach((openButton) => {
      expect(openButton).toHaveClass("hover:text-data-info")
      expect(openButton.closest('[data-slot="table-action-group"]')).toBeInTheDocument()
      expect(openButton.querySelector("svg")).toBeInTheDocument()
    })
  })
})
