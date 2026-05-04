import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ColorPicker } from "./color-picker"

const PALETTE = [
  "#3B82F6",
  "#EF4444",
  "#22C55E",
  "#EAB308",
  "#F97316",
  "#EC4899",
  "#14B8A6",
  "#8B5CF6",
  "#6B7280",
  "#A855F7",
]

describe("ColorPicker", () => {
  it("renders exactly 8 palette swatch buttons", () => {
    render(<ColorPicker palette={PALETTE} value={PALETTE[0]} onChange={vi.fn()} />)

    expect(screen.getAllByRole("button")).toHaveLength(8)
  })

  it("calls onChange with swatch color when a swatch is clicked", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<ColorPicker palette={PALETTE} value={PALETTE[0]} onChange={onChange} />)

    const swatches = screen.getAllByRole("button")
    await user.click(swatches[2])

    expect(onChange).toHaveBeenCalledWith(PALETTE[2])
  })

  it("calls onChange with custom color from color input", () => {
    const onChange = vi.fn()

    render(<ColorPicker palette={PALETTE} value={PALETTE[0]} onChange={onChange} />)

    const input = screen.getByTitle("Color personalitzat")
    fireEvent.change(input, { target: { value: "#112233" } })

    expect(onChange).toHaveBeenCalledWith("#112233")
  })

  it("marks custom color circle as selected when value is outside visible palette", () => {
    render(<ColorPicker palette={PALETTE} value="#112233" onChange={vi.fn()} />)

    const customPickerContainer = screen.getByTitle("Color personalitzat").parentElement
    expect(customPickerContainer).toHaveClass("scale-110", "z-10")
  })
})
