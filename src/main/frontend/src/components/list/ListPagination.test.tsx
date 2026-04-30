import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ListPagination } from "./ListPagination"

describe("ListPagination", () => {
  it("renders nothing for a single page", () => {
    const { container } = render(<ListPagination page={1} totalPages={1} onPageChange={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("calls onPageChange with previous and next page", async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()

    render(<ListPagination page={2} totalPages={4} onPageChange={onPageChange} />)

    await user.click(screen.getByRole("button", { name: /anterior/i }))
    await user.click(screen.getByRole("button", { name: /següent/i }))

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1)
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3)
  })
})
