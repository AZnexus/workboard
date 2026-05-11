import { describe, expect, it, vi } from "vitest"
import { screen } from "@testing-library/react"
import { fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { renderWithQueryClient } from "@/test/test-utils"
import { VersionsPage } from "./VersionsPage"

const useVersionsMock = vi.fn()
const useCreateVersionMock = vi.fn()
const useUpdateVersionMock = vi.fn()
const useDeleteVersionMock = vi.fn()

vi.mock("@/hooks/useVersions", () => ({
  useVersions: (...args: unknown[]) => useVersionsMock(...args),
  useCreateVersion: () => useCreateVersionMock(),
  useUpdateVersion: () => useUpdateVersionMock(),
  useDeleteVersion: () => useDeleteVersionMock(),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe("VersionsPage", () => {
  it("shows an empty state and add action when no versions exist", () => {
    useVersionsMock.mockReturnValue({ data: [], isLoading: false })
    useCreateVersionMock.mockReturnValue({ mutateAsync: vi.fn() })
    useUpdateVersionMock.mockReturnValue({ mutateAsync: vi.fn() })
    useDeleteVersionMock.mockReturnValue({ mutateAsync: vi.fn() })

    renderWithQueryClient(<VersionsPage />)

    expect(screen.getByRole("button", { name: /afegir/i })).toBeInTheDocument()
    expect(screen.getByText(/cap versió/i)).toBeInTheDocument()
  })

  it("renders active and archived versions in separate sections", () => {
    useVersionsMock.mockReturnValue({
      data: [
        { id: 1, name: "2026.05", color: "#3B82F6", active: true, created_at: "2026-05-01T00:00:00Z" },
        { id: 2, name: "2026.04", color: "#EF4444", active: false, created_at: "2026-04-01T00:00:00Z" },
      ],
      isLoading: false,
    })
    useCreateVersionMock.mockReturnValue({ mutateAsync: vi.fn() })
    useUpdateVersionMock.mockReturnValue({ mutateAsync: vi.fn() })
    useDeleteVersionMock.mockReturnValue({ mutateAsync: vi.fn() })

    renderWithQueryClient(<VersionsPage />)

    expect(screen.getByText("Versions actives")).toBeInTheDocument()
    expect(screen.getByText("Versions arxivades")).toBeInTheDocument()
    expect(screen.getByText("2026.05")).toBeInTheDocument()
    expect(screen.getByText("2026.04")).toBeInTheDocument()
  })

  it("shows a color picker in add form and sends selected color on create", async () => {
    const user = userEvent.setup()
    const createMutateAsync = vi.fn().mockResolvedValue(undefined)

    useVersionsMock.mockReturnValue({ data: [], isLoading: false })
    useCreateVersionMock.mockReturnValue({ mutateAsync: createMutateAsync })
    useUpdateVersionMock.mockReturnValue({ mutateAsync: vi.fn() })
    useDeleteVersionMock.mockReturnValue({ mutateAsync: vi.fn() })

    renderWithQueryClient(<VersionsPage />)

    await user.click(screen.getByRole("button", { name: /afegir/i }))

    await user.type(screen.getByPlaceholderText(/nom de la versió/i), "2026.06")
    fireEvent.change(screen.getByTitle("Color personalitzat"), { target: { value: "#123456" } })
    await user.click(screen.getByRole("button", { name: "Crear" }))

    expect(createMutateAsync).toHaveBeenCalledWith({ name: "2026.06", color: "#123456" })
  })
})
