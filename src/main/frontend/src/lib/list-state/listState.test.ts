import { describe, expect, it } from "vitest"
import { cleanSearchParams, updatePageOnListStateChange } from "./listState"

describe("listState helpers", () => {
  it("removes empty and default values from URL params", () => {
    const params = cleanSearchParams(
      {
        view: "table",
        q: "",
        page: 1,
        sort: "date-desc",
        status: "all",
      },
      {
        defaults: { view: "table", page: 1, sort: "date-desc", status: "all" },
      },
    )

    expect(params.toString()).toBe("")
  })

  it("resets page to 1 when non-page filters change", () => {
    expect(updatePageOnListStateChange({ page: 4, q: "abc" }, { page: 4, q: "xyz" })).toBe(1)
  })

  it("resets page to 1 when page size changes", () => {
    expect(updatePageOnListStateChange({ page: 3, pageSize: 20 }, { page: 3, pageSize: 50 })).toBe(1)
  })
})
