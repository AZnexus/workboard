import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { EntryStatusCell } from "./EntryStatusCell"

describe("EntryStatusCell", () => {
  it("renders the status badge inside a nowrap table cell", () => {
    render(
      <table>
        <tbody>
          <tr>
            <EntryStatusCell status="OPEN" />
          </tr>
        </tbody>
      </table>,
    )

    const cell = screen.getByText("Nou").closest('[data-slot="table-cell"]')

    expect(cell).toHaveClass("whitespace-nowrap")
  })

  it("preserves note-specific archived status label variant", () => {
    render(
      <table>
        <tbody>
          <tr>
            <EntryStatusCell status="DONE" variant="note" />
          </tr>
        </tbody>
      </table>,
    )

    expect(screen.getByText("Arxivada")).toBeInTheDocument()
    expect(screen.queryByText("Fet")).not.toBeInTheDocument()
  })
})
