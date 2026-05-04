import { describe, expect, it } from "vitest"
import { getActionStats, getBodyPreview } from "./ActesPage.helpers"

describe("ActesPage.helpers", () => {
  describe("getBodyPreview", () => {
    it("returns empty string for null or empty body", () => {
      expect(getBodyPreview(null)).toBe("")
      expect(getBodyPreview("")).toBe("")
    })

    it("removes markdown markers and flattens line breaks", () => {
      const body = "# Títol\n- Punt\n* Detall\n[ ] Revisar\n[x] Tancar\r\nÚltima línia"

      expect(getBodyPreview(body)).toBe("Títol Punt Detall Revisar Tancar Última línia")
    })

    it("truncates preview to 100 characters plus ellipsis", () => {
      const body = "a".repeat(101)

      expect(getBodyPreview(body)).toBe(`${"a".repeat(100)}...`)
    })
  })

  describe("getActionStats", () => {
    it("returns null for null/empty body or when no checkbox actions are present", () => {
      expect(getActionStats(null)).toBeNull()
      expect(getActionStats("")).toBeNull()
      expect(getActionStats("sense accions")).toBeNull()
    })

    it("counts total and completed actions from markdown checkboxes", () => {
      const body = "[ ] pendent\n[x] fet\n[X] també fet\n[-] ignorat"

      expect(getActionStats(body)).toEqual({ total: 3, completed: 2 })
    })
  })
})
