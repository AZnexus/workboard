import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { BinaryScopeSelector } from "./BinaryScopeSelector"

describe("BinaryScopeSelector", () => {
  it("renders the Estat block with both options", () => {
    render(
      <BinaryScopeSelector
        label="Estat"
        firstLabel="Actives"
        secondLabel="Tancades"
        isFirstSelected
        onFirstSelect={vi.fn()}
        onSecondSelect={vi.fn()}
      />,
    )

    expect(screen.getByText("Estat")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Actives" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Tancades" })).toBeInTheDocument()
  })

  it("keeps pressed and variant states aligned with selection", () => {
    render(
      <BinaryScopeSelector
        label="Estat"
        firstLabel="Actives"
        secondLabel="Arxivades"
        isFirstSelected={false}
        onFirstSelect={vi.fn()}
        onSecondSelect={vi.fn()}
      />,
    )

    const firstButton = screen.getByRole("button", { name: "Actives" })
    const secondButton = screen.getByRole("button", { name: "Arxivades" })

    expect(firstButton).toHaveAttribute("aria-pressed", "false")
    expect(firstButton).toHaveAttribute("data-variant", "outline")
    expect(secondButton).toHaveAttribute("aria-pressed", "true")
    expect(secondButton).toHaveAttribute("data-variant", "default")
  })

  it("calls each option callback when clicked", async () => {
    const user = userEvent.setup()
    const onFirstSelect = vi.fn()
    const onSecondSelect = vi.fn()

    render(
      <BinaryScopeSelector
        label="Estat"
        firstLabel="Actives"
        secondLabel="Tancades"
        isFirstSelected
        onFirstSelect={onFirstSelect}
        onSecondSelect={onSecondSelect}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Actives" }))
    await user.click(screen.getByRole("button", { name: "Tancades" }))

    expect(onFirstSelect).toHaveBeenCalledTimes(1)
    expect(onSecondSelect).toHaveBeenCalledTimes(1)
  })
})
