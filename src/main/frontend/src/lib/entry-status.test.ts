import { describe, expect, it } from "vitest"
import { isEntryClosed } from "./entry-status"

describe("isEntryClosed", () => {
  it("returns true only for DONE and CANCELLED entries", () => {
    expect(isEntryClosed({ status: "DONE" })).toBe(true)
    expect(isEntryClosed({ status: "CANCELLED" })).toBe(true)
    expect(isEntryClosed({ status: "OPEN" })).toBe(false)
    expect(isEntryClosed({ status: "IN_PROGRESS" })).toBe(false)
    expect(isEntryClosed({ status: "PAUSED" })).toBe(false)
  })
})
