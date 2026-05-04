import { describe, expect, it } from "vitest"
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { ThemeProvider } from "@/hooks/useTheme"
import { renderWithQueryClient } from "@/test/test-utils"
import { ConfigPage } from "./ConfigPage"

describe("ConfigPage", () => {
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
})
