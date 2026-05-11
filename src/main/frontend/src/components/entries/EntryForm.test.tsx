import { describe, expect, it, vi } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { EntryForm } from "./EntryForm"
import { renderWithQueryClient } from "@/test/test-utils"

const useVersionsMock = vi.fn()

vi.mock("./TagMultiSelect", () => ({
  TagMultiSelect: () => <div data-testid="tag-multiselect" />,
}))

vi.mock("@/hooks/useVersions", () => ({
  useVersions: (...args: unknown[]) => useVersionsMock(...args),
}))

vi.mock("@/hooks/useEntries", () => ({
  useCreateEntry: () => ({ mutateAsync: vi.fn() }),
  useUpdateEntry: () => ({ mutateAsync: vi.fn() }),
  useDeleteEntry: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe("EntryForm", () => {
  it("shows the version selector for tasks only", () => {
    useVersionsMock.mockReturnValue({
      data: [{ id: 1, name: "2026.05", active: true, created_at: "2026-05-01T00:00:00Z" }],
    })

    renderWithQueryClient(<EntryForm initialType="TASK" onSuccess={vi.fn()} />)

    expect(screen.getByText("Versió")).toBeInTheDocument()
  })

  it("does not show the version selector for notes or meeting notes", () => {
    useVersionsMock.mockReturnValue({ data: [] })

    const { rerender } = renderWithQueryClient(<EntryForm initialType="NOTE" onSuccess={vi.fn()} />)

    expect(screen.queryByText("Versió")).not.toBeInTheDocument()

    rerender(<EntryForm initialType="MEETING_NOTE" onSuccess={vi.fn()} />)

    expect(screen.queryByText("Versió")).not.toBeInTheDocument()
  })

  it("keeps the assigned archived version available when editing a task", async () => {
    const user = userEvent.setup()

    useVersionsMock.mockReturnValue({
      data: [
        { id: 1, name: "2026.05", active: false, created_at: "2026-05-01T00:00:00Z" },
        { id: 2, name: "2026.06", active: true, created_at: "2026-06-01T00:00:00Z" },
      ],
    })

    renderWithQueryClient(
      <EntryForm
        entry={{
          id: 3,
          type: "TASK",
          title: "Task amb versió arxivada",
          body: null,
          status: "OPEN",
          date: "2026-05-04",
          due_date: null,
          scheduled_today: false,
          external_ref: null,
          pinned: false,
          priority: 4,
          version: { id: 1, name: "2026.05", active: false, created_at: "2026-05-01T00:00:00Z" },
          tags: [],
          created_at: "2026-05-04T08:00:00Z",
          updated_at: "2026-05-04T08:00:00Z",
        }}
        onSuccess={vi.fn()}
      />,
    )

    await user.click(screen.getAllByRole("combobox")[1])

    expect(screen.getAllByText("2026.05 (arxivada)").length).toBeGreaterThan(0)
    expect(screen.getAllByText("2026.06").length).toBeGreaterThan(0)
  })

  it("keeps the current type selectable when editing a meeting note", () => {
    useVersionsMock.mockReturnValue({ data: [] })

    renderWithQueryClient(
      <EntryForm
        entry={{
          id: 1,
          type: "MEETING_NOTE",
          title: "Acta de seguiment",
          body: "## Punts tractats",
          status: "OPEN",
          date: "2026-05-04",
          due_date: null,
          scheduled_today: false,
          external_ref: null,
          pinned: false,
          priority: null,
          version: null,
          tags: [],
          created_at: "2026-05-04T08:00:00Z",
          updated_at: "2026-05-04T08:00:00Z",
        }}
        onSuccess={vi.fn()}
      />,
    )

    expect(screen.queryByText("Tipus")).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Editar Entrada" })).toBeInTheDocument()
  })

  it("uses archive wording for note statuses when editing notes", async () => {
    const user = userEvent.setup()
    useVersionsMock.mockReturnValue({ data: [] })

    renderWithQueryClient(
      <EntryForm
        entry={{
          id: 2,
          type: "NOTE",
          title: "Nota arxivada",
          body: "Detall",
          status: "DONE",
          date: "2026-05-04",
          due_date: null,
          scheduled_today: false,
          external_ref: null,
          pinned: false,
          priority: null,
          version: null,
          tags: [],
          created_at: "2026-05-04T08:00:00Z",
          updated_at: "2026-05-04T08:00:00Z",
        }}
        onSuccess={vi.fn()}
      />,
    )

    await user.click(screen.getAllByRole("combobox")[1])

    expect(screen.getAllByText("Arxivada").length).toBeGreaterThan(0)
    expect(screen.queryByText("Fet")).not.toBeInTheDocument()
  })
})
