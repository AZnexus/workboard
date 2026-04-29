import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PageContentSkeleton } from "./PageContentSkeleton"

describe("PageContentSkeleton", () => {
  it("renders a structured skeleton container", () => {
    render(<PageContentSkeleton />)
    expect(screen.getByTestId("page-content-skeleton")).toBeInTheDocument()
  })
})