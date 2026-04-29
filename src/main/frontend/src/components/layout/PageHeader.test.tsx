import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PageHeader } from "./PageHeader"
import { Clock } from "lucide-react"

describe("PageHeader", () => {
  it("renders title, icon and description", () => {
    render(<PageHeader icon={Clock} title="Hores" description="Registra el temps" />)
    expect(screen.getByText("Hores")).toBeInTheDocument()
    expect(screen.getByText("Registra el temps")).toBeInTheDocument()
    expect(screen.getByTestId("page-header-icon")).toBeInTheDocument()
  })

  it("renders date if provided", () => {
    render(<PageHeader icon={Clock} title="El meu dia" date="Dilluns, 1 de Gener" />)
    expect(screen.getByText("Dilluns, 1 de Gener")).toBeInTheDocument()
  })

  it("renders children controls", () => {
    render(
      <PageHeader icon={Clock} title="Tasques">
        <button>Filtre</button>
      </PageHeader>
    )
    expect(screen.getByRole("button", { name: "Filtre" })).toBeInTheDocument()
  })
})
