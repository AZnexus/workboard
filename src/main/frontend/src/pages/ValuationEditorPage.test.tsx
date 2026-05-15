import { beforeEach, describe, expect, it, vi } from "vitest"
import { screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"

import { renderWithQueryClient } from "@/test/test-utils"
import { ValuationEditorPage } from "./ValuationEditorPage"

const navigate = vi.fn()
const updateValuationMutateAsync = vi.fn()

let valuationLoading = false
let valuationData: unknown = null
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
  return {
    ...actual,
    useNavigate: () => navigate,
  }
})

vi.mock("@/hooks/useImprovements", () => ({
  useValuation: () => ({
    data: valuationData,
    isLoading: valuationLoading,
  }),
  useUpdateValuation: () => ({
    mutateAsync: updateValuationMutateAsync,
    isPending: false,
  }),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

function renderRoute(initialEntry = "/millores/101/valoracio/edit") {
  return renderWithQueryClient(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/millores/:id/valoracio/edit" element={<ValuationEditorPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe("ValuationEditorPage", () => {
  beforeEach(() => {
    navigate.mockClear()
    updateValuationMutateAsync.mockReset()
    updateValuationMutateAsync.mockResolvedValue({ id: 200 })

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
      tags: [],
      textile_body: null,
      structured_content_json: null,
      template: {
        id: 200,
        name: "Plantilla base",
        textile_template:
          "h1. Anàlisi\n\n{{analysis}}\n\nh3. Resum de tasques\n\n{{taskSummary}}\n\nh1. Pre-anàlisi\n\n{{preAnalysis}}\n\nh2. DB\n\n{{db}}\n\nh2. APIS\n\n{{apis}}\n\nh2. WEBS\n\n{{webs}}\n\nh2. Valoració\n\n{{valuation}}",
        is_default: true,
        active: true,
        created_at: "2026-05-01T00:00:00Z",
        updated_at: "2026-05-01T00:00:00Z",
      },
      textile_customized: false,
      analysis_hours: null,
      total_estimated_hours: null,
      created_at: "2026-05-02T00:00:00Z",
      updated_at: "2026-05-03T00:00:00Z",
    }

    vi.spyOn(window, "confirm").mockReturnValue(true)
  })

  it("renders split editor + preview with fixed and structural sections", () => {
    renderRoute()

    expect(screen.getByTestId("valuation-editor-pane")).toBeInTheDocument()
    expect(screen.getByTestId("valuation-preview-pane")).toBeInTheDocument()

    expect(screen.getByLabelText("Anàlisi")).toBeInTheDocument()
    expect(screen.getByLabelText("Resum de tasques")).toBeInTheDocument()
    expect(screen.getByLabelText("Pre-anàlisi")).toBeInTheDocument()
    expect(screen.getByLabelText("Valoració")).toBeInTheDocument()

    expect(screen.getByText(/h1\. Anàlisi/i)).toBeInTheDocument()
    expect(screen.getByText(/h3\. Resum de tasques/i)).toBeInTheDocument()
    expect(screen.getByText(/h1\. Pre-anàlisi/i)).toBeInTheDocument()
    expect(screen.getByText(/h2\. DB/i)).toBeInTheDocument()
    expect(screen.getByText(/h2\. APIS/i)).toBeInTheDocument()
    expect(screen.getByText(/h2\. WEBS/i)).toBeInTheDocument()
    expect(screen.getByText(/h2\. Valoració/i)).toBeInTheDocument()
  })

  it("offers guided preview and manual Textile modes", async () => {
    const user = userEvent.setup()
    renderRoute()

    expect(screen.getByRole("tab", { name: /vista prèvia/i })).toBeInTheDocument()
    const manualTab = screen.getByRole("tab", { name: /textile manual/i })
    expect(manualTab).toBeInTheDocument()

    await user.click(manualTab)
    expect(screen.getByRole("textbox", { name: /textile manual/i })).toBeInTheDocument()
  })

  it("marks valuation as customized after manual Textile edit", async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.click(screen.getByRole("tab", { name: /textile manual/i }))
    const manualTextarea = screen.getByRole("textbox", { name: /textile manual/i })
    await user.clear(manualTextarea)
    await user.type(manualTextarea, "h1. Document personalitzat\n\nText lliure")

    expect(screen.getByText(/textile personalitzat/i)).toBeInTheDocument()
  })

  it("does not silently overwrite customized Textile on block edits or refetch", async () => {
    const user = userEvent.setup()
    valuationData = {
      ...(valuationData as Record<string, unknown>),
      textile_body: "h1. Manual existent\n\nContingut manual",
      textile_customized: true,
      structured_content_json: JSON.stringify({
        analysis: "Anàlisi inicial",
        taskSummary: "",
        preAnalysis: "",
        db: { applies: false, detail: "" },
        apis: { applies: false, subblocks: [] },
        webs: { applies: false, subblocks: [] },
        valuation: "",
      }),
    }

    const view = renderRoute()

    await user.click(screen.getByRole("tab", { name: /textile manual/i }))
    const manualTextarea = screen.getByRole("textbox", { name: /textile manual/i })
    expect(manualTextarea).toHaveValue("h1. Manual existent\n\nContingut manual")

    await user.type(screen.getByLabelText("Anàlisi"), "actualitzat")
    expect(manualTextarea).toHaveValue("h1. Manual existent\n\nContingut manual")

    valuationData = {
      ...(valuationData as Record<string, unknown>),
      structured_content_json: JSON.stringify({
        analysis: "Servidor refet",
        taskSummary: "",
        preAnalysis: "",
        db: { applies: false, detail: "" },
        apis: { applies: false, subblocks: [] },
        webs: { applies: false, subblocks: [] },
        valuation: "",
      }),
    }

    view.rerender(
      <MemoryRouter initialEntries={["/millores/101/valoracio/edit"]}>
        <Routes>
          <Route path="/millores/:id/valoracio/edit" element={<ValuationEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole("textbox", { name: /textile manual/i })).toHaveValue("h1. Manual existent\n\nContingut manual")
  })

  it("regenerates Textile from blocks explicitly", async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.click(screen.getByRole("tab", { name: /textile manual/i }))
    const manualTextarea = screen.getByRole("textbox", { name: /textile manual/i })
    await user.clear(manualTextarea)
    await user.type(manualTextarea, "h1. Manual temporal")

    await user.click(screen.getByRole("button", { name: /regenerar des de blocs/i }))

    expect((screen.getByRole("textbox", { name: /textile manual/i }) as HTMLTextAreaElement).value).toMatch(/h1\. Anàlisi/i)
    expect(screen.getByText(/textile generat des de blocs/i)).toBeInTheDocument()
  })

  it("keeps DB/APIS/WEBS in textile with _No aplica_ or _Sense afectació_", async () => {
    const user = userEvent.setup()
    renderRoute()

    expect(screen.getByText(/_No aplica_/i)).toBeInTheDocument()

    await user.click(screen.getByLabelText("APIS aplica"))
    await waitFor(() => {
      expect(screen.getByText(/_Sense afectació_/i)).toBeInTheDocument()
    })
  })

  it("allows adding API and WEB subblocks without editing raw textile", async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.click(screen.getByLabelText("APIS aplica"))
    await user.click(screen.getByRole("button", { name: /afegir subbloc api/i }))
    await user.type(screen.getByLabelText("Nom subbloc API 1"), "Autenticació")

    await user.click(screen.getByLabelText("WEBS aplica"))
    await user.click(screen.getByRole("button", { name: /afegir subbloc web/i }))
    await user.type(screen.getByLabelText("Nom subbloc WEB 1"), "Portal client")

    expect(screen.getByText(/Autenticació/i)).toBeInTheDocument()
    expect(screen.getByText(/Portal client/i)).toBeInTheDocument()
    expect(screen.queryByRole("textbox", { name: /textile manual/i })).not.toBeInTheDocument()
  })

  it("recalculates block subtotals, derived values, and total live", async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.type(screen.getByLabelText("Hores anàlisi"), "8")

    await user.click(screen.getByLabelText("DB aplica"))
    await user.type(screen.getByLabelText("Hores DB"), "4")

    await user.click(screen.getByLabelText("APIS aplica"))
    await user.click(screen.getByRole("button", { name: /afegir subbloc api/i }))
    await user.type(screen.getByLabelText("Hores subbloc API 1"), "6")

    await user.click(screen.getByLabelText("WEBS aplica"))
    await user.click(screen.getByRole("button", { name: /afegir subbloc web/i }))
    await user.type(screen.getByLabelText("Hores subbloc WEB 1"), "2")

    await user.type(screen.getByLabelText("Hores proves"), "4")
    await user.type(screen.getByLabelText("Hores disseny"), "1")
    await user.type(screen.getByLabelText("Hores seguiment"), "3")

    expect(screen.getByText("Subtotal DB: 4h")).toBeInTheDocument()
    expect(screen.getByText("Subtotal APIs: 6h")).toBeInTheDocument()
    expect(screen.getByText("Subtotal WEBs: 2h")).toBeInTheDocument()
    expect(screen.getByText("Gestió: 12h")).toBeInTheDocument()
    expect(screen.getByText("Gestió + jiras: 3h")).toBeInTheDocument()
    expect(screen.getByText("Total: 43h")).toBeInTheDocument()

    const analysisHoursInput = screen.getByLabelText("Hores anàlisi")
    await user.clear(analysisHoursInput)
    await user.type(analysisHoursInput, "10")

    expect(screen.getByText("Gestió: 13h")).toBeInTheDocument()
    expect(screen.getByText("Gestió + jiras: 3.25h")).toBeInTheDocument()
    expect(screen.getByText("Total: 46.25h")).toBeInTheDocument()
  })

  it("renders calculated valuation lines in Textile preview", async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.type(screen.getByLabelText("Hores anàlisi"), "8")
    await user.click(screen.getByLabelText("DB aplica"))
    await user.type(screen.getByLabelText("Hores DB"), "4")
    await user.type(screen.getByLabelText("Hores proves"), "4")
    await user.type(screen.getByLabelText("Hores disseny"), "1")
    await user.type(screen.getByLabelText("Hores seguiment"), "2")

    const preview = screen.getByTestId("valuation-preview-pane")

    expect(preview).toHaveTextContent(/\*Anàlisi: 8h\*/i)
    expect(preview).toHaveTextContent(/\*BD: 4h\*/i)
    expect(preview).toHaveTextContent(/\*Proves: 4h\*/i)
    expect(preview).toHaveTextContent(/\*Disseny: 1h\*/i)
    expect(preview).toHaveTextContent(/\*Gestió:\* \(Analisi\+BO\+APIs\+WEBs\+Proves\)\/2 = \*8h\*/i)
    expect(preview).toHaveTextContent(/\*Gestió \+ jiras:\*\s+Gestió\/4 = \*2h\*/i)
    expect(preview).toHaveTextContent(/\*Seguiment: 2h\*/i)
    expect(preview).toHaveTextContent(/\*\*Total: 29h\*\*/i)
  })

  it("renders a custom template body and exposes unknown placeholders as auto-blocks", async () => {
    const user = userEvent.setup()
    valuationData = {
      ...(valuationData as Record<string, unknown>),
      template: {
        id: 201,
        name: "Plantilla client",
        textile_template: "h1. Document client\n\n{{analysis}}\n\nh2. Riscos\n\n{{risks}}\n\n{{valuation}}",
        is_default: false,
        active: true,
        created_at: "2026-05-01T00:00:00Z",
        updated_at: "2026-05-01T00:00:00Z",
      },
    }

    renderRoute()

    const preview = screen.getByTestId("valuation-preview-pane")
    expect(preview).toHaveTextContent(/h1\. Document client/i)
    expect(preview).toHaveTextContent(/h2\. Riscos/i)
    expect(preview).toHaveTextContent(/_Contingut pendent d'emplenar_/i)

    await user.type(screen.getByLabelText("Bloc automàtic risks"), "Hi ha dependències externes")

    expect(preview).toHaveTextContent(/Hi ha dependències externes/i)
  })

  it("keeps valuation breakdown generation inside the {{valuation}} fragment", async () => {
    const user = userEvent.setup()
    valuationData = {
      ...(valuationData as Record<string, unknown>),
      template: {
        id: 202,
        name: "Plantilla compacta",
        textile_template: "h1. Resum client\n\n{{valuation}}",
        is_default: false,
        active: true,
        created_at: "2026-05-01T00:00:00Z",
        updated_at: "2026-05-01T00:00:00Z",
      },
    }

    renderRoute()

    await user.type(screen.getByLabelText("Hores anàlisi"), "4")
    await user.click(screen.getByLabelText("DB aplica"))
    await user.type(screen.getByLabelText("Hores DB"), "2")
    await user.click(screen.getByLabelText("APIS aplica"))
    await user.click(screen.getByRole("button", { name: /afegir subbloc api/i }))
    await user.type(screen.getByLabelText("Nom subbloc API 1"), "Seguretat")
    await user.type(screen.getByLabelText("Hores subbloc API 1"), "3")
    await user.click(screen.getByLabelText("WEBS aplica"))
    await user.click(screen.getByRole("button", { name: /afegir subbloc web/i }))
    await user.type(screen.getByLabelText("Nom subbloc WEB 1"), "Portal")
    await user.type(screen.getByLabelText("Hores subbloc WEB 1"), "1")

    const preview = screen.getByTestId("valuation-preview-pane")
    expect(preview).toHaveTextContent(/h1\. Resum client/i)
    expect(preview).toHaveTextContent(/\*BD: 2h\*/i)
    expect(preview).toHaveTextContent(/\*API Seguretat: 3h\*/i)
    expect(preview).toHaveTextContent(/\*WEB Portal: 1h\*/i)
  })

  it("removes API and WEB summary lines from Textile when blocks are disabled", async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.click(screen.getByLabelText("APIS aplica"))
    await user.click(screen.getByRole("button", { name: /afegir subbloc api/i }))
    await user.type(screen.getByLabelText("Nom subbloc API 1"), "Autenticació")
    await user.type(screen.getByLabelText("Hores subbloc API 1"), "5")

    await user.click(screen.getByLabelText("WEBS aplica"))
    await user.click(screen.getByRole("button", { name: /afegir subbloc web/i }))
    await user.type(screen.getByLabelText("Nom subbloc WEB 1"), "Portal")
    await user.type(screen.getByLabelText("Hores subbloc WEB 1"), "3")

    const preview = screen.getByTestId("valuation-preview-pane")
    expect(preview).toHaveTextContent(/\*API Autenticació: 5h\*/i)
    expect(preview).toHaveTextContent(/\*WEB Portal: 3h\*/i)

    await user.click(screen.getByLabelText("APIS aplica"))
    await user.click(screen.getByLabelText("WEBS aplica"))

    expect(preview).not.toHaveTextContent(/\*API Autenticació: 5h\*/i)
    expect(preview).not.toHaveTextContent(/\*WEB Portal: 3h\*/i)
    expect(screen.getByText("Subtotal APIs: 0h")).toBeInTheDocument()
    expect(screen.getByText("Subtotal WEBs: 0h")).toBeInTheDocument()
  })

  it("saves both structuredContentJson and textileBody", async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.type(screen.getByLabelText("Anàlisi"), "Context inicial")
    await user.type(screen.getByLabelText("Hores anàlisi"), "5")
    await user.type(screen.getByLabelText("Hores proves"), "3")
    await user.click(screen.getByRole("button", { name: /guardar/i }))

    await waitFor(() => {
      expect(updateValuationMutateAsync).toHaveBeenCalledTimes(1)
    })

    expect(updateValuationMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        improvementId: 101,
        body: expect.objectContaining({
          structuredContentJson: expect.any(String),
          textileBody: expect.any(String),
          analysisHours: 5,
          totalEstimatedHours: 13,
        }),
      }),
    )
  })

  it("saves customized manual Textile body when edited directly", async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.click(screen.getByRole("tab", { name: /textile manual/i }))
    const manualTextarea = screen.getByRole("textbox", { name: /textile manual/i })
    await user.clear(manualTextarea)
    await user.type(manualTextarea, "h1. Output final manual")
    await user.click(screen.getByRole("button", { name: /guardar/i }))

    await waitFor(() => {
      expect(updateValuationMutateAsync).toHaveBeenCalledTimes(1)
    })

    expect(updateValuationMutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        improvementId: 101,
        body: expect.objectContaining({
          textileBody: "h1. Output final manual",
          textileCustomized: true,
        }),
      }),
    )
  })

  it("saves regenerated Textile body after explicit regenerate", async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.click(screen.getByRole("tab", { name: /textile manual/i }))
    const manualTextarea = screen.getByRole("textbox", { name: /textile manual/i })
    await user.clear(manualTextarea)
    await user.type(manualTextarea, "h1. Temporal")
    await user.click(screen.getByRole("button", { name: /regenerar des de blocs/i }))
    await user.click(screen.getByRole("button", { name: /guardar/i }))

    await waitFor(() => {
      expect(updateValuationMutateAsync).toHaveBeenCalledTimes(1)
    })

    const payload = updateValuationMutateAsync.mock.calls[0][0] as {
      body: { textileBody: string; textileCustomized: boolean }
    }

    expect(payload.body.textileBody).toMatch(/h1\. Anàlisi/i)
    expect(payload.body.textileBody).not.toContain("h1. Temporal")
    expect(payload.body.textileCustomized).toBe(false)
  })

  it("does not persist UI-only subblock ids in structuredContentJson", async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.click(screen.getByLabelText("APIS aplica"))
    await user.click(screen.getByRole("button", { name: /afegir subbloc api/i }))
    await user.type(screen.getByLabelText("Nom subbloc API 1"), "Seguretat")
    await user.click(screen.getByRole("button", { name: /guardar/i }))

    await waitFor(() => {
      expect(updateValuationMutateAsync).toHaveBeenCalledTimes(1)
    })

    const payload = updateValuationMutateAsync.mock.calls[0][0] as {
      body: { structuredContentJson: string }
    }
    const parsed = JSON.parse(payload.body.structuredContentJson) as {
      apis: { subblocks: Array<Record<string, unknown>> }
    }

    expect(parsed.apis.subblocks.length).toBe(1)
    expect(parsed.apis.subblocks[0]).toEqual(
      expect.objectContaining({
        title: "Seguretat",
      }),
    )
    expect(parsed.apis.subblocks[0]).not.toHaveProperty("id")
  })

  it("keeps in-progress edits when valuation query refetches", async () => {
    const user = userEvent.setup()
    valuationData = {
      ...(valuationData as Record<string, unknown>),
      structured_content_json: JSON.stringify({
        analysis: "Servidor inicial",
        taskSummary: "",
        preAnalysis: "",
        db: { applies: false, detail: "" },
        apis: { applies: false, subblocks: [] },
        webs: { applies: false, subblocks: [] },
        valuation: "",
      }),
    }

    const view = renderRoute()
    const analysisInput = screen.getByLabelText("Anàlisi")
    await user.clear(analysisInput)
    await user.type(analysisInput, "Edició local")

    valuationData = {
      ...(valuationData as Record<string, unknown>),
      structured_content_json: JSON.stringify({
        analysis: "Valor refet del servidor",
        taskSummary: "",
        preAnalysis: "",
        db: { applies: false, detail: "" },
        apis: { applies: false, subblocks: [] },
        webs: { applies: false, subblocks: [] },
        valuation: "",
      }),
    }

    view.rerender(
      <MemoryRouter initialEntries={["/millores/101/valoracio/edit"]}>
        <Routes>
          <Route path="/millores/:id/valoracio/edit" element={<ValuationEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByLabelText("Anàlisi")).toHaveValue("Edició local")
  })

  it("asks confirmation before leaving with unsaved changes", async () => {
    const user = userEvent.setup()
    vi.mocked(window.confirm).mockReturnValue(false)

    renderRoute()
    await user.type(screen.getByLabelText("Anàlisi"), "Canvis pendents")
    await user.click(screen.getByRole("button", { name: /tornar a lectura/i }))

    expect(window.confirm).toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })

  it("registers beforeunload guard when there are unsaved changes", async () => {
    const user = userEvent.setup()
    renderRoute()

    await user.type(screen.getByLabelText("Anàlisi"), "Canvis locals")

    const event = new Event("beforeunload", { cancelable: true })
    window.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })

  it("allows leaving without prompt after save", async () => {
    const user = userEvent.setup()
    vi.mocked(window.confirm).mockClear()

    renderRoute()
    await user.type(screen.getByLabelText("Anàlisi"), "Canvis guardables")
    await user.click(screen.getByRole("button", { name: /guardar/i }))

    await waitFor(() => {
      expect(updateValuationMutateAsync).toHaveBeenCalledTimes(1)
    })

    await user.click(screen.getByRole("button", { name: /tornar a lectura/i }))

    expect(window.confirm).not.toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith("/millores/101/valoracio")
  })

  it("derives unknown auto-blocks from template even when loading legacy structured content", () => {
    valuationData = {
      ...(valuationData as Record<string, unknown>),
      template: {
        id: 203,
        name: "Plantilla legacy",
        textile_template: "h1. Legacy\n\n{{analysis}}\n\nh2. Risks\n\n{{risks}}",
        is_default: false,
        active: true,
        created_at: "2026-05-01T00:00:00Z",
        updated_at: "2026-05-01T00:00:00Z",
      },
      structured_content_json: JSON.stringify({
        db: true,
        apis: false,
        webs: false,
        apiSubblocks: [],
        webSubblocks: [],
      }),
    }

    renderRoute()

    expect(screen.getByLabelText("Bloc automàtic risks")).toBeInTheDocument()
    expect(screen.getAllByText(/contingut pendent d'emplenar/i)).toHaveLength(2)
  })

  it("hydrates persisted manual Textile when valuation loads after initial empty render", async () => {
    valuationLoading = true
    valuationData = null

    const view = renderRoute()

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
      tags: [],
      textile_body: "h1. Manual carregat\n\nCos manual",
      structured_content_json: null,
      template: {
        id: 200,
        name: "Plantilla base",
        textile_template:
          "h1. Anàlisi\n\n{{analysis}}\n\nh3. Resum de tasques\n\n{{taskSummary}}\n\nh1. Pre-anàlisi\n\n{{preAnalysis}}\n\nh2. DB\n\n{{db}}\n\nh2. APIS\n\n{{apis}}\n\nh2. WEBS\n\n{{webs}}\n\nh2. Valoració\n\n{{valuation}}",
        is_default: true,
        active: true,
        created_at: "2026-05-01T00:00:00Z",
        updated_at: "2026-05-01T00:00:00Z",
      },
      textile_customized: true,
      analysis_hours: null,
      total_estimated_hours: null,
      created_at: "2026-05-02T00:00:00Z",
      updated_at: "2026-05-03T00:00:00Z",
    }

    view.rerender(
      <MemoryRouter initialEntries={["/millores/101/valoracio/edit"]}>
        <Routes>
          <Route path="/millores/:id/valoracio/edit" element={<ValuationEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/textile personalitzat/i)).toBeInTheDocument()
    })

    await userEvent.setup().click(screen.getByRole("tab", { name: /textile manual/i }))
    expect(screen.getByRole("textbox", { name: /textile manual/i })).toHaveValue("h1. Manual carregat\n\nCos manual")
  })

  it("refreshes local state when clean refetch changes only server textile snapshot", async () => {
    const user = userEvent.setup()
    const view = renderRoute()

    await user.click(screen.getByRole("tab", { name: /textile manual/i }))
    expect((screen.getByRole("textbox", { name: /textile manual/i }) as HTMLTextAreaElement).value).toContain(
      "h1. Anàlisi",
    )

    valuationData = {
      ...(valuationData as Record<string, unknown>),
      textile_body: "h1. Manual remot\n\nNova versió",
      textile_customized: true,
      structured_content_json: null,
    }

    view.rerender(
      <MemoryRouter initialEntries={["/millores/101/valoracio/edit"]}>
        <Routes>
          <Route path="/millores/:id/valoracio/edit" element={<ValuationEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/textile personalitzat/i)).toBeInTheDocument()
    })

    expect(screen.getByRole("textbox", { name: /textile manual/i })).toHaveValue("h1. Manual remot\n\nNova versió")
  })

  it("preserves empty customized Textile on clean refetch", async () => {
    const user = userEvent.setup()
    const view = renderRoute()

    await user.click(screen.getByRole("tab", { name: /textile manual/i }))

    valuationData = {
      ...(valuationData as Record<string, unknown>),
      textile_body: "",
      textile_customized: true,
      structured_content_json: null,
    }

    view.rerender(
      <MemoryRouter initialEntries={["/millores/101/valoracio/edit"]}>
        <Routes>
          <Route path="/millores/:id/valoracio/edit" element={<ValuationEditorPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(screen.getByText(/textile personalitzat/i)).toBeInTheDocument()
    })

    expect(screen.getByRole("textbox", { name: /textile manual/i })).toHaveValue("")
  })
})
