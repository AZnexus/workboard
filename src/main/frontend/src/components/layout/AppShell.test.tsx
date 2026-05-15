import { beforeAll, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"

import { AppShell } from "./AppShell"

vi.mock("./TopBar", () => ({
  TopBar: () => <div data-testid="top-bar" />,
}))

vi.mock("@/hooks/useGlobalCreate", () => ({
  GlobalCreateProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useGlobalCreate: () => ({
    dialogOpen: false,
    dialogType: "TASK",
    openCreateRoute: vi.fn(),
    closeCreate: vi.fn(),
  }),
}))

vi.mock("@/components/entries/EntryForm", () => ({
  EntryForm: () => <div data-testid="entry-form" />,
}))

describe("AppShell", () => {
  beforeAll(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it("renders the expected sidebar navigation entries", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <AppShell />
      </MemoryRouter>,
    )

    expect(screen.getByRole("link", { name: /el meu dia/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /hores/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /tasques/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /notes/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /millores/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /actes/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /registre/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /configuració/i })).toBeInTheDocument()
  })

  it("keeps home route in full-width mode", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/"]}>
        <AppShell />
      </MemoryRouter>,
    )

    expect(container.querySelector("main > div")).toHaveClass("w-full", "h-full", "min-h-0", "p-6")
    expect(container.querySelector("main > div")).not.toHaveClass("max-w-[1600px]")
  })

  it("keeps notes route in constrained layout mode", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/notes"]}>
        <AppShell />
      </MemoryRouter>,
    )

    expect(container.querySelector("main > div")).toHaveClass("mx-auto", "w-full", "max-w-[1600px]", "p-6", "space-y-6")
  })

  it("keeps parameterized valuation editor route in full-width mode", () => {
    const { container } = render(
      <MemoryRouter initialEntries={["/millores/101/valoracio/edit"]}>
        <AppShell />
      </MemoryRouter>,
    )

    expect(container.querySelector("main > div")).toHaveClass("w-full", "h-full", "min-h-0", "p-6")
    expect(container.querySelector("main > div")).not.toHaveClass("max-w-[1600px]")
  })
})
