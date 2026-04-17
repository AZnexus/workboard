import { useQuery } from '@tanstack/react-query'
import { fetchDaily, fetchStandup, fetchWeekly } from '@/api/dashboard'

const DASHBOARD_KEY = 'dashboard'

export function useDaily(date?: string) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'daily', date],
    queryFn: () => fetchDaily(date),
  })
}

export function useStandup() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'standup'],
    queryFn: () => fetchStandup(),
  })
}

export function useWeekly(weekStart?: string) {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'weekly', weekStart],
    queryFn: () => fetchWeekly(weekStart),
  })
}
