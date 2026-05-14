import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"

import { Sidebar } from "@/components/layout/Sidebar"
import { TopBar } from "@/components/layout/TopBar"
import { ImprovementsPage } from "./ImprovementsPage"
import { ImprovementViewPage } from "./ImprovementViewPage"

const openCreate = vi.fn()
const openCreateRoute = vi.fn()

let improvementsLoading = false
let improvementsData: unknown = {
  data: [],
  meta: { total: 0, page: 0, size: 10, totalPages: 0 },
}

vi.mock("@/hooks/useGlobalCreate", () => ({
  useGlobalCreate: () => ({
    openCreate,
    openCreateRoute,
  }),
}))

vi.mock("@/components/entries/QuickCapture", () => ({
  QuickCapture: () => <div data-testid="quick-capture" />,
}))

vi.mock("@/hooks/useImprovements", () => ({
  useImprovements: () => ({
    isLoading: improvementsLoading,
    data: improvementsData,
  }),
  useImprovement: () => ({
    isLoading: false,
    data: null,
  }),
  useImprovementEntries: () => ({
    isLoading: false,
    data: { data: [], meta: { total: 0, page: 0, size: 20, totalPages: 0 } },
  }),
  useCreateImprovement: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateImprovement: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateValuation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock("@/hooks/useVersions", () => ({
  useVersions: () => ({
    data: [
      { id: 1, name: "v1.0", active: true, created_at: "2026-05-01T00:00:00Z" },
      { id: 2, name: "v1.1", active: true, created_at: "2026-05-01T00:00:00Z" },
    ],
  }),
}))

vi.mock("@/hooks/useTags", () => ({
  useTags: () => ({
    data: [
      { id: 10, name: "api", color: "#000", created_at: "2026-05-01T00:00:00Z" },
      { id: 11, name: "web", color: "#111", created_at: "2026-05-01T00:00:00Z" },
    ],
  }),
  useCreateTag: () => ({
    mutateAsync: vi.fn(),
  }),
}))

function LocationPath() {
  const location = useLocation()
  return <span data-testid="location-path">{location.pathname}</span>
}

function LocationSearch() {
  const location = useLocation()
  return <span data-testid="location-search">{location.search}</span>
}

function renderImprovements(initialEntry = "/millores") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/millores" element={<><ImprovementsPage /><LocationSearch /></>} />
        <Route path="/millores/new" element={<><ImprovementViewPage /><LocationSearch /></>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("Millores Task 2 shell behavior", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  beforeEach(() => {
    openCreate.mockClear()
    openCreateRoute.mockClear()
  })

  it("renders Millores in sidebar navigation", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
      </MemoryRouter>,
    )

    expect(screen.getByRole("link", { name: /millores/i })).toBeInTheDocument()
  })

  it("shows Nova Millora in top-bar dropdown and navigates by route", async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={["/tasks"]}>
        <Routes>
          <Route
            path="*"
            element={(
              <>
                <TopBar />
                <LocationPath />
              </>
            )}
          />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole("button", { name: /nou/i }))
    await user.click(screen.getByRole("menuitem", { name: /nova millora/i }))

    expect(openCreateRoute).toHaveBeenCalledWith("/millores/new")
    expect(openCreate).not.toHaveBeenCalled()
  })
})

describe("ImprovementsPage", () => {
  beforeEach(() => {
    improvementsLoading = false
    improvementsData = {
      data: [],
      meta: { total: 0, page: 0, size: 10, totalPages: 0 },
    }
  })

  it("renders empty state with search and filters", async () => {
    const user = userEvent.setup()

    renderImprovements()

    expect(screen.getByRole("heading", { name: /millores/i, level: 1 })).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Cercar" })).toBeInTheDocument()
    expect(screen.getByText(/cap millora/i)).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /filtres/i }))

    expect(screen.getByLabelText("Estat")).toBeInTheDocument()
    expect(screen.getByLabelText("Prioritat")).toBeInTheDocument()
    expect(screen.getByLabelText("Versió")).toBeInTheDocument()
    expect(screen.getByLabelText("Etiqueta")).toBeInTheDocument()
  })

  it("renders table rows from API data", () => {
    improvementsData = {
      data: [
        {
          id: 101,
          title: "Millora de permisos",
          requirements: "Detall",
          redmine_parent_ref: "RM-10",
          priority: 2,
          due_date: "2026-06-15",
          jira_ref: "WB-123",
          version: { id: 1, name: "v1.0", active: true, created_at: "2026-05-01T00:00:00Z" },
          tags: [{ id: 10, name: "api", color: "#000", created_at: "2026-05-01T00:00:00Z" }],
          sold_hours: 10,
          status: "NOVA",
          completion_percentage: 15,
          note: { context: "ctx", risk_dependency: "risk", observations: "obs" },
          valuation_summary: null,
          created_at: "2026-05-01T00:00:00Z",
          updated_at: "2026-05-02T00:00:00Z",
        },
      ],
      meta: { total: 1, page: 0, size: 10, totalPages: 1 },
    }

    renderImprovements()

    expect(screen.getByRole("columnheader", { name: /títol/i })).toBeInTheDocument()
    expect(screen.getByText("Millora de permisos")).toBeInTheDocument()
    expect(screen.getByText("WB-123")).toBeInTheDocument()
  })

  it("renders cards view from URL state", () => {
    improvementsData = {
      data: [
        {
          id: 202,
          title: "Millora de desplegament",
          requirements: null,
          redmine_parent_ref: null,
          priority: 3,
          due_date: null,
          jira_ref: null,
          version: null,
          tags: [],
          sold_hours: null,
          status: "EN_VALORACIO",
          completion_percentage: 50,
          note: { context: "", risk_dependency: "", observations: "" },
          valuation_summary: {
            id: 44,
            status: "EN_CURS",
            completion_percentage: 30,
            analysis_hours: 5,
            total_estimated_hours: 18,
          },
          created_at: "2026-05-01T00:00:00Z",
          updated_at: "2026-05-02T00:00:00Z",
        },
      ],
      meta: { total: 1, page: 0, size: 10, totalPages: 1 },
    }

    renderImprovements("/millores?view=cards")

    expect(screen.queryByRole("columnheader", { name: /títol/i })).not.toBeInTheDocument()
    expect(screen.getByText("Millora de desplegament")).toBeInTheDocument()
  })

  it("resolves /millores/new to the creation form route", () => {
    renderImprovements("/millores/new")

    expect(screen.getByRole("heading", { name: /nova millora/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/títol/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/requisits/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/context/i)).toBeInTheDocument()
  })

  it("keeps URL-backed search state and resets page when query changes", async () => {
    const user = userEvent.setup()

    improvementsData = {
      data: [
        {
          id: 501,
          title: "Millora inicial",
          requirements: null,
          redmine_parent_ref: null,
          priority: null,
          due_date: null,
          jira_ref: null,
          version: null,
          tags: [],
          sold_hours: null,
          status: "NOVA",
          completion_percentage: 0,
          note: { context: "", risk_dependency: "", observations: "" },
          valuation_summary: null,
          created_at: "2026-05-01T00:00:00Z",
          updated_at: "2026-05-01T00:00:00Z",
        },
      ],
      meta: { total: 40, page: 2, size: 10, totalPages: 4 },
    }

    renderImprovements("/millores?page=3")

    const searchInput = screen.getByRole("textbox", { name: "Cercar" })
    await user.type(searchInput, "api")

    await waitFor(() => {
      expect(screen.getByTestId("location-search")).toHaveTextContent("q=api")
    })
    expect(screen.getByTestId("location-search")).not.toHaveTextContent("page=3")
  })
})
