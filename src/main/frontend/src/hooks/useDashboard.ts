import { useQuery } from '@tanstack/react-query'
import { fetchDaily, fetchStandup, fetchWeekly } from '@/api/dashboard'

const DASHBOARD_KEY = 'dashboard'

export function useDaily(date?: string) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'daily', date],
    queryFn: () => fetchDaily(date),
  })
}

export function useStandup(date?: string) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'standup', date],
    queryFn: () => fetchStandup(date),
  })
}

export function useWeekly(weekStart?: string) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'weekly', weekStart],
    queryFn: () => fetchWeekly(weekStart),
  })
}
