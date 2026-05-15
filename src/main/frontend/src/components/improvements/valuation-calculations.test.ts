import { describe, expect, it } from "vitest"

import { calculateValuationTotals } from "./valuation-calculations"

describe("valuation-calculations", () => {
  it("calculates subtotals, derived management values, and final total", () => {
    const totals = calculateValuationTotals({
      analysisHours: 10,
      dbApplies: true,
      dbHours: 4,
      apisApplies: true,
      apiSubblockHours: [6],
      websApplies: true,
      webSubblockHours: [2],
      testHours: 4,
      designHours: 1,
      followUpHours: 3,
    })

    expect(totals.dbSubtotal).toBe(4)
    expect(totals.apisSubtotal).toBe(6)
    expect(totals.websSubtotal).toBe(2)
    expect(totals.managementHours).toBe(13)
    expect(totals.managementPlusJirasHours).toBe(3.25)
    expect(totals.finalTotalHours).toBe(46.25)
  })

  it("maps BO to DB subtotal and ignores non-applicable blocks", () => {
    const totals = calculateValuationTotals({
      analysisHours: 8,
      dbApplies: false,
      dbHours: 999,
      apisApplies: false,
      apiSubblockHours: [7],
      websApplies: false,
      webSubblockHours: [5],
      testHours: 4,
      designHours: 1,
      followUpHours: 2,
    })

    expect(totals.dbSubtotal).toBe(0)
    expect(totals.apisSubtotal).toBe(0)
    expect(totals.websSubtotal).toBe(0)
    expect(totals.managementHours).toBe(6)
    expect(totals.managementPlusJirasHours).toBe(1.5)
    expect(totals.finalTotalHours).toBe(22.5)
  })
})
