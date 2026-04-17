import { api } from './client'
import type { DailyDashboard, StandupData, WeeklyData, DataResponse } from '@/types'

export const fetchDaily = (date?: string) => {
  const query = date ? `?date=${date}` : ''
  return api.get<DataResponse<DailyDashboard>>(`/dashboard/daily${query}`)
}

export const fetchStandup = () =>
  api.get<DataResponse<StandupData>>('/dashboard/standup')

export const fetchWeekly = (weekStart?: string) => {
  const query = weekStart ? `?weekStart=${weekStart}` : ''
  return api.get<DataResponse<WeeklyData>>(`/dashboard/weekly${query}`)
}

export const fetchMarkdownExport = (params: Record<string, string>): Promise<string> => {
  const query = '?' + new URLSearchParams(params).toString()
  return fetch(`/api/v1/export/markdown${query}`).then(r => {
    if (!r.ok) throw new Error(`Export failed: ${r.status}`)
    return r.text()
  })
}
