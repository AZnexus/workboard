import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { ValuationViewPage } from "./ValuationViewPage"

let valuationLoading = false
let valuationData: unknown = null

vi.mock("@/hooks/useImprovements", () => ({
  useValuation: () => ({
    data: valuationData,
    isLoading: valuationLoading,
  }),
}))

function renderValuationRoute(initialEntry = "/millores/101/valoracio") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/millores/:id/valoracio" element={<ValuationViewPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ValuationViewPage", () => {
  beforeEach(() => {
    valuationLoading = false
    valuationData = {
      id: 200,
      improvement_id: 101,
      derived_title: "Valoració - Millora de valoració",
      redmine_child_ref: "RM-101-1",
      due_date: "2026-07-10",
      status: "NO_COMENCADA",
      completion_percentage: 0,
      priority: 2,
      version: { id: 1, name: "v1.0", active: true, created_at: "2026-05-01T00:00:00Z" },
      tags: [{ id: 10, name: "api", color: "#000", created_at: "2026-05-01T00:00:00Z" }],
      textile_body: "h1. Anàlisi\n\nh2. DB\n\n_No aplica_\n\nh2. APIS\n\n* Autenticació",
      structured_content_json: "{\"db\":false,\"apis\":[\"Autenticació\"],\"webs\":[\"Portal\"]}",
      analysis_hours: 2,
      total_estimated_hours: 10,
      created_at: "2026-05-02T00:00:00Z",
      updated_at: "2026-05-03T00:00:00Z",
    }
  })

  it("renders valuation in read-only mode by default", () => {
    renderValuationRoute()

    expect(screen.getByRole("heading", { name: /valoració - millora de valoració/i, level: 1 })).toBeInTheDocument()
    expect(screen.getByText("No començada")).toBeInTheDocument()
    expect(screen.getByText("RM-101-1")).toBeInTheDocument()
    expect(screen.getByText("v1.0")).toBeInTheDocument()
    expect(screen.getByText("api")).toBeInTheDocument()

    expect(screen.getByText(/h1\. anàlisi/i)).toBeInTheDocument()
    expect(screen.getByText(/h2\. db/i)).toBeInTheDocument()
    expect(screen.getByText(/_No aplica_/i)).toBeInTheDocument()
    expect(screen.getByText(/\"apis\":\[\"Autenticació\"\]/i)).toBeInTheDocument()

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /guardar/i })).not.toBeInTheDocument()
  })
})
