import { describe, it, expect, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TimeLogsPage } from "./TimeLogsPage"
vi.mock("@/components/timelogs/TimeLogForm", () => ({
  TimeLogForm: () => <div data-testid="time-log-form" />,
}))

vi.mock("@/components/timelogs/TimeLogTable", () => ({
  TimeLogTable: () => <div data-testid="time-log-table" />,
}))

vi.mock("@/components/timelogs/WeeklySummary", () => ({
  WeeklySummary: () => <div data-testid="weekly-summary" />,
}))

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("TimeLogsPage", () => {
  it("renders page header and presets", () => {
    const { container } = render(<TimeLogsPage />)
    
    expect(screen.getByRole("heading", { name: "Hores", level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Registra i gestiona el temps/i)).toBeInTheDocument()
    expect(screen.getByText("Aquesta Setmana")).toBeInTheDocument()
    expect(screen.getByTestId("time-log-form")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Aquesta Setmana" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Període anterior" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Període següent" })).toBeInTheDocument()
    expect(container.firstChild).toHaveClass("space-y-6")
    expect(container.firstChild).not.toHaveClass("max-w-[1400px]", "mx-auto", "px-4", "md:px-6", "mt-6")
  })

  it("labels custom date inputs when custom range is selected", () => {
    const user = userEvent.setup()
    render(<TimeLogsPage />)

    user.click(screen.getByRole("button", { name: "Personalitzat" }))

    return waitFor(() => {
      expect(screen.getByLabelText("Data inicial")).toBeInTheDocument()
      expect(screen.getByLabelText("Data final")).toBeInTheDocument()
    })
  })
})
