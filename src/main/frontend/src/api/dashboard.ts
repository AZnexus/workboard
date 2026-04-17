import { api } from './client'
import type { DailyDashboard, StandupData, WeeklyData, DataResponse } from '@/types'

export const fetchDaily = (date?: string) => {
  const path = date ? `/dashboard/daily?date=${date}` : '/dashboard/daily'
  return api.get<DataResponse<DailyDashboard>>(path)
}

export const fetchStandup = (date?: string) => {
  const path = date ? `/dashboard/standup?date=${date}` : '/dashboard/standup'
  return api.get<DataResponse<StandupData>>(path)
}

export const fetchWeekly = (weekStart?: string) => {
  const path = weekStart ? `/dashboard/weekly?weekStart=${weekStart}` : '/dashboard/weekly'
  return api.get<DataResponse<WeeklyData>>(path)
}

export const fetchMarkdownExport = (date?: string): Promise<string> => {
  const base = '/api/v1'
  const path = date ? `/dashboard/export/markdown?date=${date}` : '/dashboard/export/markdown'
  return fetch(`${base}${path}`).then((r) => {
    if (!r.ok) throw new Error(`Export failed: ${r.status}`)
    return r.text()
  })
}
