import { describe, expect, it, vi } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { EntryForm } from "./EntryForm"
import { renderWithQueryClient } from "@/test/test-utils"

vi.mock("./TagMultiSelect", () => ({
  TagMultiSelect: () => <div data-testid="tag-multiselect" />,
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
  it("keeps the current type selectable when editing a meeting note", () => {
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
