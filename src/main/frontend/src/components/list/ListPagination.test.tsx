import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ListPagination } from "./ListPagination"

describe("ListPagination", () => {
  it("renders pagination context for a single page", () => {
    render(<ListPagination page={1} totalPages={1} totalItems={12} pageSize={20} onPageChange={vi.fn()} />)

    expect(screen.getByText("Pàgina 1 de 1")).toBeInTheDocument()
    expect(screen.getByText("1-12 de 12")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /següent/i })).toBeDisabled()
  })

  it("calls onPageChange with previous and next page", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(<ListPagination page={2} totalPages={4} totalItems={80} pageSize={20} onPageChange={onPageChange} />)

    await user.click(screen.getByRole("button", { name: /anterior/i }))
    await user.click(screen.getByRole("button", { name: /següent/i }))

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3)
  })

  it("calls onPageSizeChange with the selected value", async () => {
    const user = userEvent.setup()
    const onPageSizeChange = vi.fn()

    render(
      <ListPagination
        page={1}
        totalPages={3}
        totalItems={55}
        pageSize={20}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={vi.fn()}
        onPageSizeChange={onPageSizeChange}
      />,
    )

    await user.click(screen.getByRole("combobox", { name: /elements per pàgina/i }))
    await user.click(screen.getByRole("option", { name: "50" }))

    expect(onPageSizeChange).toHaveBeenCalledWith(50)
  })
})
