import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TimeLogsPage } from "./TimeLogsPage"

const setSearchParams = vi.fn()
let currentSearchParams = new URLSearchParams()

const timeLogTableMock = vi.fn<(props?: unknown) => void>()
const weeklySummaryMock = vi.fn<(props?: unknown) => void>()

const mockLogs = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  entry_id: null,
  date: `2026-04-${String((index % 28) + 1).padStart(2, "0")}`,
  hours: 1,
  project: index % 2 === 0 ? "Projecte Alpha" : "Projecte Beta",
  description: `Descripció ${index + 1}`,
  task_code: null,
  created_at: "2026-04-30T10:00:00Z",
}))

vi.mock("react-router-dom", () => ({
  useSearchParams: () => [currentSearchParams, setSearchParams],
}))

vi.mock("@/hooks/useTimeLogs", () => ({
  useTimeLogs: () => ({
    data: mockLogs,
    isLoading: false,
  }),
}))

vi.mock("@/components/timelogs/TimeLogForm", () => ({
  TimeLogForm: () => <div data-testid="time-log-form" />,
}))

vi.mock("@/components/timelogs/TimeLogTable", () => ({
  TimeLogTable: (props: unknown) => {
    timeLogTableMock(props)
    return <div data-testid="time-log-table" />
  },
}))

vi.mock("@/components/timelogs/WeeklySummary", () => ({
  WeeklySummary: (props: unknown) => {
    weeklySummaryMock(props)
    return <div data-testid="weekly-summary" />
  },
}))

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe("TimeLogsPage", () => {
  beforeEach(() => {
    setSearchParams.mockClear()
    currentSearchParams = new URLSearchParams()
    timeLogTableMock.mockClear()
    weeklySummaryMock.mockClear()
  })

  it("renders page header and presets", () => {
    const { container } = render(<TimeLogsPage />)
    
    expect(screen.getByRole("heading", { name: "Hores", level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Registra i gestiona el temps/i)).toBeInTheDocument()
    expect(screen.getByRole("textbox", { name: "Cercar" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Filtres" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Taula" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Targetes" })).not.toBeInTheDocument()
    expect(screen.getByTestId("time-log-form")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Filtres" })).toHaveAttribute("aria-expanded", "false")
    expect(container.firstChild).toHaveClass("space-y-6")
    expect(container.firstChild).not.toHaveClass("max-w-[1400px]", "mx-auto", "px-4", "md:px-6", "mt-6")
  })

  it("keeps period controls in shared filters panel", async () => {
    const user = userEvent.setup()
    render(<TimeLogsPage />)

    await user.click(screen.getByRole("button", { name: "Filtres" }))

    expect(screen.getByRole("button", { name: "Aquesta Setmana" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Període anterior" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Període següent" })).toBeInTheDocument()
  })

  it("shows filters panel when URL contains non-default period state", () => {
    currentSearchParams = new URLSearchParams("preset=custom&from=2026-04-01&to=2026-04-07")

    render(<TimeLogsPage />)

    expect(screen.getByRole("button", { name: "Filtres" })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByLabelText("Data inicial")).toHaveValue("2026-04-01")
    expect(screen.getByLabelText("Data final")).toHaveValue("2026-04-07")
  })

  it("syncs period preset changes to URL", async () => {
    const user = userEvent.setup()
    render(<TimeLogsPage />)

    await user.click(screen.getByRole("button", { name: "Filtres" }))
    await user.click(screen.getByRole("button", { name: "Aquest Mes" }))

    const [params] = setSearchParams.mock.calls.at(-1) as [URLSearchParams]
    expect(params.get("preset")).toBe("this_month")
    expect(params.get("offset")).toBeNull()
  })

  it("applies client-side pagination with URL-backed page state", async () => {
    const user = userEvent.setup()
    render(<TimeLogsPage />)

    expect(timeLogTableMock).toHaveBeenLastCalledWith(expect.objectContaining({ logs: expect.arrayContaining(mockLogs.slice(0, 10)) }))

    await user.click(screen.getByRole("button", { name: "Següent" }))

    const [params] = setSearchParams.mock.calls.at(-1) as [URLSearchParams]
    expect(params.get("page")).toBe("2")
  })

  it("labels custom date inputs when custom range is active in URL", () => {
    currentSearchParams = new URLSearchParams("preset=custom&from=2026-04-10&to=2026-04-20")

    render(<TimeLogsPage />)

    expect(screen.getByLabelText("Data inicial")).toHaveValue("2026-04-10")
    expect(screen.getByLabelText("Data final")).toHaveValue("2026-04-20")
  })

  it("keeps weekly summary synced with effective period", () => {
    currentSearchParams = new URLSearchParams("preset=custom&from=2026-04-10&to=2026-04-20")

    render(<TimeLogsPage />)

    expect(weeklySummaryMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        dateFrom: "2026-04-10",
        dateTo: "2026-04-20",
        preset: "custom",
      }),
    )
  })

  it("shows pagination context and page size selector", () => {
    render(<TimeLogsPage />)

    expect(screen.getByText("Pàgina 1 de 3")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: /elements per pàgina/i })).toBeInTheDocument()
  })
})
