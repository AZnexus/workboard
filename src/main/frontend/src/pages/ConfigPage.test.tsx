import { beforeEach, describe, expect, it, vi } from "vitest"
import { screen } from "@testing-library/react"
import { fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ThemeProvider } from "@/hooks/useTheme"
import { renderWithQueryClient } from "@/test/test-utils"
import { ConfigPage } from "./ConfigPage"
import { toast } from "sonner"

const useValuationTemplatesMock = vi.fn()
const useCreateValuationTemplateMock = vi.fn()
const useUpdateValuationTemplateMock = vi.fn()
const useDeleteValuationTemplateMock = vi.fn()

vi.mock("@/hooks/useImprovements", () => ({
  useValuationTemplates: (...args: unknown[]) => useValuationTemplatesMock(...args),
  useCreateValuationTemplate: () => useCreateValuationTemplateMock(),
  useUpdateValuationTemplate: () => useUpdateValuationTemplateMock(),
  useDeleteValuationTemplate: () => useDeleteValuationTemplateMock(),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe("ConfigPage", () => {
  let createTemplateMutateAsync: ReturnType<typeof vi.fn>
  let updateTemplateMutateAsync: ReturnType<typeof vi.fn>
  let deleteTemplateMutateAsync: ReturnType<typeof vi.fn>

  beforeEach(() => {
    localStorage.clear()

    createTemplateMutateAsync = vi.fn().mockResolvedValue(undefined)
    updateTemplateMutateAsync = vi.fn().mockResolvedValue(undefined)
    deleteTemplateMutateAsync = vi.fn().mockResolvedValue(undefined)

    useValuationTemplatesMock.mockReturnValue({
      data: [
        {
          id: 200,
          name: "Plantilla base",
          textile_template: "h1. Base\n\n{{analysis}}\n\n{{valuation}}",
          is_default: true,
          active: true,
          created_at: "2026-05-01T00:00:00Z",
          updated_at: "2026-05-01T00:00:00Z",
        },
        {
          id: 201,
          name: "Plantilla avançada",
          textile_template: "h1. Avançada\n\n{{apis}}\n\n{{valuation}}",
          is_default: false,
          active: true,
          created_at: "2026-05-02T00:00:00Z",
          updated_at: "2026-05-02T00:00:00Z",
        },
        {
          id: 202,
          name: "Plantilla arxivada",
          textile_template: "h1. Arxivada\n\n{{db}}",
          is_default: false,
          active: false,
          created_at: "2026-05-03T00:00:00Z",
          updated_at: "2026-05-03T00:00:00Z",
        },
      ],
      isLoading: false,
    })
    useCreateValuationTemplateMock.mockReturnValue({ mutateAsync: createTemplateMutateAsync, isPending: false })
    useUpdateValuationTemplateMock.mockReturnValue({ mutateAsync: updateTemplateMutateAsync, isPending: false })
    useDeleteValuationTemplateMock.mockReturnValue({ mutateAsync: deleteTemplateMutateAsync, isPending: false })
    vi.clearAllMocks()
  })

  it("renders a Versions tab alongside the existing config sections", () => {
    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    expect(screen.getByRole("tab", { name: /versions/i })).toBeInTheDocument()
  })

  it("renders a valuation templates tab alongside other config sections", () => {
    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    expect(screen.getByRole("tab", { name: /plantilles/i })).toBeInTheDocument()
  })

  it("lists valuation templates inside configuració", async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /plantilles/i }))

    expect(screen.getByText("Plantilla base")).toBeInTheDocument()
    expect(screen.getByText("Plantilla avançada")).toBeInTheDocument()
    expect(screen.getByText("Predeterminada")).toBeInTheDocument()
  })

  it("creates a valuation template from Configuració", async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /plantilles/i }))
    await user.click(screen.getByRole("button", { name: /afegir/i }))

    await user.type(screen.getByPlaceholderText(/nom de la plantilla/i), "Plantilla client")
    fireEvent.change(screen.getByLabelText(/plantilla textile/i), {
      target: { value: "h1. Client\n\n{{analysis}}" },
    })
    await user.click(screen.getByRole("button", { name: /^crear$/i }))

    expect(createTemplateMutateAsync).toHaveBeenCalledWith({
      name: "Plantilla client",
      textileTemplate: "h1. Client\n\n{{analysis}}",
      isDefault: false,
      active: true,
    })
  })

  it("edits an existing valuation template", async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /plantilles/i }))
    await user.click(screen.getByRole("button", { name: /editar plantilla base/i }))

    const nameInput = screen.getByDisplayValue("Plantilla base")
    await user.clear(nameInput)
    await user.type(nameInput, "Plantilla base v2")

    const textileInput = screen.getByLabelText(/plantilla textile/i)
    await user.clear(textileInput)
    fireEvent.change(textileInput, {
      target: { value: "h1. Base v2\n\n{{analysis}}" },
    })

    await user.click(screen.getByRole("button", { name: /^guardar$/i }))

    expect(updateTemplateMutateAsync).toHaveBeenCalledWith({
      templateId: 200,
      body: {
        name: "Plantilla base v2",
        textileTemplate: "h1. Base v2\n\n{{analysis}}",
      },
    })
  })

  it("supports default toggle and active toggle on templates", async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /plantilles/i }))

    await user.click(screen.getByRole("button", { name: /marcar plantilla avançada com predeterminada/i }))
    await user.click(screen.getByRole("button", { name: /arxivar plantilla avançada/i }))

    expect(updateTemplateMutateAsync).toHaveBeenCalledWith({
      templateId: 201,
      body: { isDefault: true },
    })
    expect(updateTemplateMutateAsync).toHaveBeenCalledWith({
      templateId: 201,
      body: { active: false },
    })
  })

  it("duplicates an existing valuation template", async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /plantilles/i }))
    await user.click(screen.getByRole("button", { name: /duplicar plantilla base/i }))

    expect(createTemplateMutateAsync).toHaveBeenCalledWith({
      name: "Plantilla base (còpia)",
      textileTemplate: "h1. Base\n\n{{analysis}}\n\n{{valuation}}",
      isDefault: false,
      active: true,
    })
  })

  it("does not allow marking an archived template as default", async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /plantilles/i }))

    const archivedDefaultButton = screen.getByRole("button", { name: /marcar plantilla arxivada com predeterminada/i })
    expect(archivedDefaultButton).toBeDisabled()
  })

  it("disables default action immediately after archiving an active template", async () => {
    const user = userEvent.setup()

    updateTemplateMutateAsync.mockImplementation(async ({ body }: { body: { active?: boolean; isDefault?: boolean } }) => {
      if (body.active === false) {
        await new Promise<void>((resolve) => setTimeout(resolve, 0))
      }

      return undefined
    })

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /plantilles/i }))

    const archiveButton = screen.getByRole("button", { name: /arxivar plantilla avançada/i })
    await user.click(archiveButton)

    const defaultButton = screen.getByRole("button", { name: /marcar plantilla avançada com predeterminada/i })
    expect(defaultButton).toBeDisabled()

    await user.click(defaultButton)

    expect(updateTemplateMutateAsync).toHaveBeenCalledTimes(1)
    expect(updateTemplateMutateAsync).toHaveBeenCalledWith({
      templateId: 201,
      body: { active: false },
    })
  })

  it("shows protected delete feedback when template is in use", async () => {
    const user = userEvent.setup()
    deleteTemplateMutateAsync.mockRejectedValueOnce(new Error("still used by valuations"))

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /plantilles/i }))
    await user.click(screen.getByRole("button", { name: /esborrar plantilla avançada/i }))
    await user.click(screen.getByRole("button", { name: /^esborrar$/i }))

    expect(deleteTemplateMutateAsync).toHaveBeenCalledWith(201)
    expect(toast.error).toHaveBeenCalledWith("No es pot esborrar: la plantilla encara està en ús")
  })

  it("renders the theme tab with the available theme options", async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /tema/i }))

    expect(screen.getByText("Indigo Deep")).toBeInTheDocument()
    expect(screen.getByText("Teal Night")).toBeInTheDocument()
    expect(screen.getByText("Sage Mist")).toBeInTheDocument()
  })

  it("shows a mode-first selector and filters theme cards by selected mode", async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /tema/i }))

    expect(screen.getByRole("button", { name: /^dark$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^light$/i })).toBeInTheDocument()

    expect(screen.queryByText("Clar")).not.toBeInTheDocument()
    expect(screen.getAllByText("Fosc").length).toBeGreaterThan(0)

    await user.click(screen.getByRole("button", { name: /^light$/i }))

    expect(screen.queryByText("Fosc")).not.toBeInTheDocument()
    expect(screen.getAllByText("Clar").length).toBeGreaterThan(0)
  })

  it("preserves theme identity when switching between dark and light mode", async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /tema/i }))
    await user.click(screen.getByRole("button", { name: /^dark$/i }))

    const darkTealNight = await screen.findByRole("button", { name: "Teal Night (Dark)" })
    await user.click(darkTealNight)

    expect(darkTealNight).toHaveAttribute("aria-pressed", "true")

    await user.click(screen.getByRole("button", { name: /^light$/i }))

    const lightTealNight = screen.getByRole("button", { name: "Teal Night (Light)" })
    expect(lightTealNight).toHaveAttribute("aria-pressed", "true")
  })
})
