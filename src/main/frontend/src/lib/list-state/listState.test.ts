import { describe, expect, it } from "vitest"
import { parseListPageSize } from "./listState"

describe("parseListPageSize", () => {
  it("returns supported page sizes and falls back to the provided default otherwise", () => {
    expect(parseListPageSize(10, 20)).toBe(10)
    expect(parseListPageSize(20, 10)).toBe(20)
    expect(parseListPageSize(50, 10)).toBe(50)
    expect(parseListPageSize(100, 10)).toBe(100)

    expect(parseListPageSize(0, 10)).toBe(10)
    expect(parseListPageSize(15, 10)).toBe(10)
    expect(parseListPageSize(Number.NaN, 10)).toBe(10)
    expect(parseListPageSize(Number.POSITIVE_INFINITY, 10)).toBe(10)
  })
})
