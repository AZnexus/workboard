import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import type { ReactNode } from "react"
import { DailyView } from "./DailyView"
import * as dashboardHooks from "@/hooks/useDashboard"
import * as timeLogHooks from "@/hooks/useTimeLogs"
import * as entryHooks from "@/hooks/useEntries"
import type { DailyDashboard, TimeLog } from "@/types"
import type { UseMutationResult } from "@tanstack/react-query"

vi.mock("@/hooks/useDashboard", () => ({
  useDaily: vi.fn()
}))

vi.mock("@/hooks/useTimeLogs", () => ({
  useTimeLogs: vi.fn()
}))

vi.mock("@/hooks/useEntries", () => ({
  useUpdateEntry: vi.fn()
}))

// Mock DndContext to avoid drag-and-drop complexity in simple rendering tests
vi.mock("@dnd-kit/core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@dnd-kit/core")>()
  return {
    ...actual,
    DndContext: ({ children }: { children: ReactNode }) => <div data-testid="dnd-context">{children}</div>,
    DragOverlay: () => null,
  }
})

function makeTimeLogsHookResult(data: TimeLog[] = []) {
  return {
    data,
    isLoading: false,
  } as ReturnType<typeof timeLogHooks.useTimeLogs>
}

function makeUpdateEntryHookResult() {
  const result: UseMutationResult = {
    context: undefined,
    data: undefined,
    error: null,
    failureCount: 0,
    failureReason: null,
    isError: false,
    isIdle: true,
    isPaused: false,
    isPending: false,
    isSuccess: false,
    mutate: vi.fn(),
    mutateAsync: vi.fn(),
    reset: vi.fn(),
    status: "idle",
    submittedAt: 0,
    variables: undefined,
  }

  return result as ReturnType<typeof entryHooks.useUpdateEntry>
}

function makeDailyHookResult(data: DailyDashboard | null, isLoading: boolean) {
  return {
    data,
    isLoading,
  } as ReturnType<typeof dashboardHooks.useDaily>
}

describe("DailyView", () => {
  beforeEach(() => {
    vi.mocked(timeLogHooks.useTimeLogs).mockReturnValue(makeTimeLogsHookResult())
    vi.mocked(entryHooks.useUpdateEntry).mockReturnValue(makeUpdateEntryHookResult())
  })

  it("renders page header and skeleton while loading", () => {
    vi.mocked(dashboardHooks.useDaily).mockReturnValue(makeDailyHookResult(null, true))
    
    render(<DailyView />)
    
    // Header is visible
    expect(screen.getByText("El meu dia")).toBeInTheDocument()
    expect(screen.getByText(/Organitza les teves tasques prioritàries/i)).toBeInTheDocument()
    expect(screen.getByTestId("page-header-icon")).toBeInTheDocument()
    
    // Skeleton is visible
    expect(screen.getByTestId("page-content-skeleton")).toBeInTheDocument()
  })

  it("renders dashboard content when loaded", () => {
    vi.mocked(dashboardHooks.useDaily).mockReturnValue(makeDailyHookResult({ 
        entries: [],
        yesterday_done: [],
        backlog: [],
        reminders: [],
        pinned: [],
        time_logs: [],
        total_hours: 0,
        date: "2026-04-29",
      }, false))
    
    render(<DailyView />)
    
    // Header is still visible
    expect(screen.getByText("El meu dia")).toBeInTheDocument()
    
    // Skeleton is gone
    expect(screen.queryByTestId("page-content-skeleton")).not.toBeInTheDocument()
    
    // Main sections are rendered
    expect(screen.getByText("Avui")).toBeInTheDocument()
    expect(screen.getByText("Pendent")).toBeInTheDocument()
  })

  it("shows the current date in the page header", () => {
    vi.mocked(dashboardHooks.useDaily).mockReturnValue(makeDailyHookResult({
      entries: [],
      yesterday_done: [],
      backlog: [],
      reminders: [],
      pinned: [],
      time_logs: [],
      total_hours: 0,
      date: "2026-04-29",
    }, false))

    render(<DailyView />)

    expect(screen.getByText(/\d{1,2} .*\d{4}/i)).toBeInTheDocument()
  })
})
