import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Table, TableBody, TableRow } from "@/components/ui/table"
import { EntryTitlePreviewCell } from "./EntryTitlePreviewCell"

describe("EntryTitlePreviewCell", () => {
  it("does not render a preview row when preview is an empty string", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <EntryTitlePreviewCell title="Preparar release" preview="" />
          </TableRow>
        </TableBody>
      </Table>,
    )

    expect(screen.getByText("Preparar release")).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="entry-title-preview-cell"] span').length).toBe(1)
  })
})
