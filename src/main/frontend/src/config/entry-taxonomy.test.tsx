import { describe, expect, it } from "vitest"

import {
  ENTRY_FORM_STATUS_OPTIONS,
  ENTRY_FORM_TYPE_OPTIONS,
  ENTRY_STATUS_FILTER_OPTIONS,
  ENTRY_TYPE_CONFIG,
  NOTE_QUICK_CAPTURE_TYPE_OPTIONS,
} from "./entry-taxonomy"

describe("entry taxonomy config", () => {
  it("keeps the canonical task/note labels for forms and display", () => {
    expect(ENTRY_FORM_TYPE_OPTIONS.map((option) => option.label)).toEqual(["Tasca", "Nota"])
    expect(ENTRY_TYPE_CONFIG.TASK.label).toBe("Tasca")
    expect(ENTRY_TYPE_CONFIG.NOTE.label).toBe("Nota")
    expect(ENTRY_TYPE_CONFIG.MEETING_NOTE.label).toBe("Reunió")
    expect(ENTRY_TYPE_CONFIG.REMINDER.label).toBe("Recordatori")
  })

  it("keeps the canonical status labels for forms and filters", () => {
    expect(ENTRY_FORM_STATUS_OPTIONS.map((option) => option.label)).toEqual([
      "Nou",
      "En Curs",
      "Pausada",
      "Fet",
      "Cancel·lat",
    ])

    expect(ENTRY_STATUS_FILTER_OPTIONS.map((option) => option.label)).toEqual([
      "Tots",
      "Oberts",
      "En Curs",
      "Pausats",
      "Fets",
      "Cancel·lats",
    ])
  })

  it("keeps quick capture limited to reminder and quick note", () => {
    expect(NOTE_QUICK_CAPTURE_TYPE_OPTIONS.map((option) => option.value)).toEqual(["REMINDER", "NOTE"])
    expect(NOTE_QUICK_CAPTURE_TYPE_OPTIONS.map((option) => option.label)).toEqual(["Recordatori", "Nota ràpida"])
  })
})
