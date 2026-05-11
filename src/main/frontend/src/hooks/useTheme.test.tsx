import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { describe, expect, it, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { THEME_VARIANTS } from "@/config/themes"
import { ThemeProvider, useTheme } from "./useTheme"

function ThemeHarness() {
  const { theme, mode, setMode, setTheme } = useTheme()

  return (
    <div>
      <span data-testid="theme-id">{theme.id}</span>
      <span data-testid="theme-mode">{mode}</span>
      <button type="button" onClick={() => setMode("light")}>Canvia a light</button>
      <button type="button" onClick={() => setMode("dark")}>Canvia a dark</button>
      <button type="button" onClick={() => setTheme("teal-night", "dark")}>Teal Night Dark</button>
    </div>
  )
}

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ""
  })

  it("migrates old stored ids and keeps identity when switching mode", async () => {
    const user = userEvent.setup()
    localStorage.setItem("theme", "teal-night")

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    )

    expect(screen.getByTestId("theme-id")).toHaveTextContent("teal-night")
    expect(screen.getByTestId("theme-mode")).toHaveTextContent("dark")

    await user.click(screen.getByRole("button", { name: "Canvia a light" }))

    expect(screen.getByTestId("theme-id")).toHaveTextContent("teal-night")
    expect(screen.getByTestId("theme-mode")).toHaveTextContent("light")
  })

  it("applies the correct root classes for light and dark variants", async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    )

    await user.click(screen.getByRole("button", { name: "Teal Night Dark" }))

    expect(document.documentElement.classList.contains("dark")).toBe(true)
    expect(document.documentElement.classList.contains("teal-night-dark")).toBe(true)

    await user.click(screen.getByRole("button", { name: "Canvia a light" }))

    expect(document.documentElement.classList.contains("light")).toBe(true)
    expect(document.documentElement.classList.contains("teal-night-light")).toBe(true)
  })

  it("migrates legacy base ids light and dark to default identity pair", async () => {
    localStorage.setItem("theme", "light")

    render(
      <ThemeProvider>
        <ThemeHarness />
      </ThemeProvider>
    )

    expect(screen.getByTestId("theme-id")).toHaveTextContent("indigo-deep")
    expect(screen.getByTestId("theme-mode")).toHaveTextContent("light")
    expect(localStorage.getItem("theme")).toBe("indigo-deep:light")
  })

  it("defines a concrete css class for every declared theme variant", async () => {
    const cssContent = readFileSync(resolve(import.meta.dirname, "../index.css"), "utf8")

    for (const variant of THEME_VARIANTS) {
      expect(cssContent).toContain(`.${variant.className} {`)
    }
  })
})
