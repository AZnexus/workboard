import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTimeLog, updateTimeLog, deleteTimeLog, fetchTimeLogs } from '@/api/timelogs'
import type { CreateTimeLogRequest, UpdateTimeLogRequest } from '@/types'

export function useTimeLogs(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['timelogs', params],
    queryFn: () => fetchTimeLogs(params),
  })
}

export function useCreateTimeLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTimeLogRequest) => createTimeLog(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timelogs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useUpdateTimeLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdateTimeLogRequest }) => updateTimeLog(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timelogs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export function useDeleteTimeLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTimeLog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['timelogs'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
