import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ListToolbar } from "./ListToolbar"

describe("ListToolbar", () => {
  it("renders search, filters trigger, and view toggle", () => {
    render(
      <ListToolbar
        searchValue=""
        onSearchChange={vi.fn()}
        filtersOpen={false}
        onFiltersToggle={vi.fn()}
        view="table"
        onViewChange={vi.fn()}
      />,
    )

    expect(screen.getByLabelText("Cercar")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /filtres/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /taula/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /targetes/i })).toBeInTheDocument()
  })

  it("exposes pressed and expanded state for controls", async () => {
    const user = userEvent.setup()
    const onFiltersToggle = vi.fn()
    const onViewChange = vi.fn()

    render(
      <ListToolbar
        searchValue=""
        onSearchChange={vi.fn()}
        filtersOpen
        onFiltersToggle={onFiltersToggle}
        view="table"
        onViewChange={onViewChange}
      />,
    )

    const filtersButton = screen.getByRole("button", { name: /filtres/i })
    const tableButton = screen.getByRole("button", { name: /taula/i })
    const cardsButton = screen.getByRole("button", { name: /targetes/i })

    expect(filtersButton).toHaveAttribute("aria-pressed", "true")
    expect(filtersButton).toHaveAttribute("aria-expanded", "true")
    expect(tableButton).toHaveAttribute("aria-pressed", "true")
    expect(cardsButton).toHaveAttribute("aria-pressed", "false")

    await user.click(filtersButton)
    await user.click(cardsButton)

    expect(onFiltersToggle).toHaveBeenCalledTimes(1)
    expect(onViewChange).toHaveBeenCalledWith("cards")
  })

  it("can hide the view toggle when a page only supports one presentation", () => {
    render(
      <ListToolbar
        searchValue=""
        onSearchChange={vi.fn()}
        filtersOpen={false}
        onFiltersToggle={vi.fn()}
        showViewToggle={false}
      />,
    )

    expect(screen.getByLabelText("Cercar")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /filtres/i })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /taula/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /targetes/i })).not.toBeInTheDocument()
  })
})
