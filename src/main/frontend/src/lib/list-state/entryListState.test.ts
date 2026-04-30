import { describe, expect, it } from "vitest"
import {
  DEFAULT_ENTRY_LIST_STATE,
  parseEntryListState,
  stringifyEntryListState,
} from "./entryListState"

describe("entryListState", () => {
  it("parses URL params into typed entry list state", () => {
    const params = new URLSearchParams(
      "view=cards&q=acta&page=3&sort=priority-desc&status=OPEN&type=TASK&dateFrom=2026-04-01&dateTo=2026-04-30&tag=urgent&pinned=true&priority=3",
    )

    expect(parseEntryListState(params)).toEqual({
      view: "cards",
      q: "acta",
      page: 3,
      pageSize: 10,
      status: "OPEN",
      type: "TASK",
      dateFrom: "2026-04-01",
      dateTo: "2026-04-30",
      tag: "urgent",
      pinned: true,
      priority: "3",
    })
  })

  it("defaults to table view and strips defaults from URL", () => {
    const params = stringifyEntryListState(DEFAULT_ENTRY_LIST_STATE)

    expect(params.toString()).toBe("")
    expect(parseEntryListState(new URLSearchParams())).toEqual(DEFAULT_ENTRY_LIST_STATE)
  })

  it("rejects malformed URL values back to safe defaults", () => {
    const params = new URLSearchParams(
      "view=matrix&page=-2&sort=unknown&status=WAITING&type=IDEA&priority=abc&pinned=yes",
    )

    expect(parseEntryListState(params)).toEqual({
      ...DEFAULT_ENTRY_LIST_STATE,
      pinned: false,
    })
  })

  it("does not persist unsupported sort state in the current slice", () => {
    const params = stringifyEntryListState({
      ...DEFAULT_ENTRY_LIST_STATE,
      q: "demo",
    })

    expect(params.toString()).toBe("q=demo")
    expect(parseEntryListState(new URLSearchParams("sort=priority-desc&q=demo"))).toEqual({
      ...DEFAULT_ENTRY_LIST_STATE,
      q: "demo",
    })
  })
})
