import { beforeEach, describe, expect, it } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ThemeProvider } from "@/hooks/useTheme"
import { renderWithQueryClient } from "@/test/test-utils"
import { ConfigPage } from "./ConfigPage"

describe("ConfigPage", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("renders a Versions tab alongside the existing config sections", () => {
    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    expect(screen.getByRole("tab", { name: /versions/i })).toBeInTheDocument()
  })

  it("renders the theme tab with the available theme options", async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /tema/i }))

    expect(screen.getByText("Indigo Deep")).toBeInTheDocument()
    expect(screen.getByText("Teal Night")).toBeInTheDocument()
    expect(screen.getByText("Sage Mist")).toBeInTheDocument()
  })

  it("shows a mode-first selector and filters theme cards by selected mode", async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /tema/i }))

    expect(screen.getByRole("button", { name: /^dark$/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^light$/i })).toBeInTheDocument()

    expect(screen.queryByText("Clar")).not.toBeInTheDocument()
    expect(screen.getAllByText("Fosc").length).toBeGreaterThan(0)

    await user.click(screen.getByRole("button", { name: /^light$/i }))

    expect(screen.queryByText("Fosc")).not.toBeInTheDocument()
    expect(screen.getAllByText("Clar").length).toBeGreaterThan(0)
  })

  it("preserves theme identity when switching between dark and light mode", async () => {
    const user = userEvent.setup()

    renderWithQueryClient(
      <ThemeProvider>
        <ConfigPage />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("tab", { name: /tema/i }))
    await user.click(screen.getByRole("button", { name: /^dark$/i }))

    const darkTealNight = await screen.findByRole("button", { name: "Teal Night (Dark)" })
    await user.click(darkTealNight)

    expect(darkTealNight).toHaveAttribute("aria-pressed", "true")

    await user.click(screen.getByRole("button", { name: /^light$/i }))

    const lightTealNight = screen.getByRole("button", { name: "Teal Night (Light)" })
    expect(lightTealNight).toHaveAttribute("aria-pressed", "true")
  })
})
