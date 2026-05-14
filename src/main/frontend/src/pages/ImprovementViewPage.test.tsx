import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import type { ReactNode } from "react"

import { ImprovementViewPage } from "./ImprovementViewPage"
import { toast } from "sonner"

const navigate = vi.fn()
const createValuationMutateAsync = vi.fn()

let improvementData: unknown = null
let improvementLoading = false
let linkedEntriesData: unknown = { data: [], meta: { total: 0, page: 0, size: 20, totalPages: 0 } }
let linkedEntriesLoading = false

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
  return {
    ...actual,
    useNavigate: () => navigate,
    Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
  }
})

vi.mock("@/hooks/useImprovements", () => ({
  useImprovement: () => ({
    data: improvementData,
    isLoading: improvementLoading,
  }),
  useImprovementEntries: () => ({
    data: linkedEntriesData,
    isLoading: linkedEntriesLoading,
  }),
  useCreateValuation: () => ({
    mutateAsync: createValuationMutateAsync,
    isPending: false,
  }),
  useCreateImprovement: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateImprovement: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

vi.mock("@/hooks/useVersions", () => ({
  useVersions: () => ({ data: [] }),
}))

vi.mock("@/hooks/useTags", () => ({
  useTags: () => ({ data: [] }),
  useCreateTag: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

function renderImprovementRoute(initialEntry = "/millores/101") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/millores/new" element={<ImprovementViewPage />} />
        <Route path="/millores/:id" element={<ImprovementViewPage />} />
        <Route path="/millores/:id/edit" element={<ImprovementViewPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ImprovementViewPage", () => {
  beforeEach(() => {
    navigate.mockClear()
    createValuationMutateAsync.mockReset()
    createValuationMutateAsync.mockResolvedValue({ id: 900, improvement_id: 101 })

    improvementLoading = false
    linkedEntriesLoading = false

    improvementData = {
      id: 101,
      title: "Millora de valoració",
      requirements: "Cal afegir plantilla base i càlculs.",
      redmine_parent_ref: "RM-101",
      priority: 2,
      due_date: "2026-06-30",
      jira_ref: "WB-101",
      version: { id: 1, name: "v1.0", active: true, created_at: "2026-05-01T00:00:00Z" },
      tags: [{ id: 10, name: "api", color: "#000", created_at: "2026-05-01T00:00:00Z" }],
      sold_hours: 24,
      status: "EN_VALORACIO",
      completion_percentage: 35,
      note: {
        context: "Context funcional",
        risk_dependency: "Dependència externa",
        observations: "Cal validació client",
      },
      valuation_summary: {
        id: 700,
        status: "EN_CURS",
        completion_percentage: 20,
        analysis_hours: 4,
        total_estimated_hours: 16,
      },
      created_at: "2026-05-01T00:00:00Z",
      updated_at: "2026-05-02T00:00:00Z",
    }

    linkedEntriesData = {
      data: [
        {
          id: 12,
          type: "TASK",
          title: "Implementar APIs",
          body: "detall",
          status: "OPEN",
          date: "2026-05-20",
          due_date: "2026-05-25",
          scheduled_today: false,
          external_ref: "TASK-12",
          pinned: false,
          priority: 3,
          version: null,
          linked_improvement: { id: 101, title: "Millora de valoració" },
          tags: [],
          created_at: "2026-05-10T00:00:00Z",
          updated_at: "2026-05-10T00:00:00Z",
        },
      ],
      meta: { total: 1, page: 0, size: 20, totalPages: 1 },
    }
  })

  it("renders summary data and linked tasks", () => {
    renderImprovementRoute()

    expect(screen.getByRole("heading", { name: "Millora de valoració", level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/cal afegir plantilla base/i)).toBeInTheDocument()
    expect(screen.getByText("En valoració")).toBeInTheDocument()
    expect(screen.getByText("35%")).toBeInTheDocument()
    expect(screen.getByText("api")).toBeInTheDocument()
    expect(screen.getByText("v1.0")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "RM-101" })).toHaveAttribute("href", expect.stringContaining("RM-101"))
    expect(screen.getByRole("link", { name: "WB-101" })).toHaveAttribute("href", expect.stringContaining("WB-101"))
    expect(screen.getByText("24 h")).toBeInTheDocument()
    expect(screen.getByText("En curs")).toBeInTheDocument()
    expect(screen.getByText("Implementar APIs")).toBeInTheDocument()
  })

  it("renders creation form at /millores/new with all required fields", () => {
    renderImprovementRoute("/millores/new")

    expect(screen.getByRole("heading", { name: /nova millora/i, level: 1 })).toBeInTheDocument()
    expect(screen.getByLabelText(/títol/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/requisits/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/redmine pare/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^jira$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/prioritat/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/data límit/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/versió/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/hores venudes/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/percentatge de completitud/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^estat$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^context$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/risc \/ dependència/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/observacions/i)).toBeInTheDocument()
  })

  it("shows create valuation CTA only when valuation is missing", () => {
    improvementData = {
      ...(improvementData as Record<string, unknown>),
      valuation_summary: null,
    }

    renderImprovementRoute()

    expect(screen.getByRole("button", { name: /crear valoració/i })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: /obrir valoració/i })).not.toBeInTheDocument()
  })

  it("shows valuation read CTA when valuation exists", () => {
    renderImprovementRoute()

    expect(screen.getByRole("link", { name: /obrir valoració/i })).toHaveAttribute("href", "/millores/101/valoracio")
  })

  it("requires redmine child ref, due date and bootstrap choices to create valuation", async () => {
    const user = userEvent.setup()
    improvementData = {
      ...(improvementData as Record<string, unknown>),
      valuation_summary: null,
    }

    renderImprovementRoute()

    await user.click(screen.getByRole("button", { name: /crear valoració/i }))
    await user.click(screen.getByRole("button", { name: /crear valoració inicial/i }))

    expect(createValuationMutateAsync).not.toHaveBeenCalled()

    await user.type(screen.getByLabelText(/redmine fill/i), "RM-101-1")
    await user.type(screen.getByLabelText(/data límit/i), "2026-07-10")
    await user.click(screen.getByLabelText("DB"))
    await user.click(screen.getByLabelText("APIs"))
    await user.click(screen.getByLabelText("WEBs"))
    await user.type(screen.getByLabelText(/subblocs api/i), "Autenticació")
    await user.type(screen.getByLabelText(/subblocs web/i), "Portal")

    await user.click(screen.getByRole("button", { name: /crear valoració inicial/i }))

    expect(createValuationMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        improvementId: 101,
        body: expect.objectContaining({
          redmineChildRef: "RM-101-1",
          dueDate: "2026-07-10",
        }),
      }),
    )
  })

  it("keeps bootstrap dialog open and does not navigate when valuation creation fails", async () => {
    const user = userEvent.setup()
    improvementData = {
      ...(improvementData as Record<string, unknown>),
      valuation_summary: null,
    }
    createValuationMutateAsync.mockRejectedValueOnce(new Error("create failed"))

    renderImprovementRoute()

    await user.click(screen.getByRole("button", { name: /crear valoració/i }))
    await user.type(screen.getByLabelText(/redmine fill/i), "RM-101-1")
    await user.type(screen.getByLabelText(/data límit/i), "2026-07-10")
    await user.click(screen.getByLabelText("DB"))
    await user.click(screen.getByLabelText("APIs"))
    await user.click(screen.getByLabelText("WEBs"))
    await user.type(screen.getByLabelText(/subblocs api/i), "Autenticació")
    await user.type(screen.getByLabelText(/subblocs web/i), "Portal")

    await user.click(screen.getByRole("button", { name: /crear valoració inicial/i }))

    expect(createValuationMutateAsync).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalledWith("/millores/101/valoracio")
    expect(screen.getByRole("heading", { name: /crear valoració inicial/i })).toBeInTheDocument()
    expect(toast.error).toHaveBeenCalledWith("No s'ha pogut crear la valoració", { duration: 3000 })
  })
})
