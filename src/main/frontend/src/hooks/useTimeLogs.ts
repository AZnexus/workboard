import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTimeLogs, createTimeLog, deleteTimeLog } from '@/api/timelogs'
import type { CreateTimeLogRequest } from '@/types'

const TIMELOGS_KEY = 'timelogs'

export function useTimeLogs(entryId: number) {
  return useQuery({
    queryKey: [TIMELOGS_KEY, entryId],
    queryFn: () => fetchTimeLogs(entryId),
    enabled: !!entryId,
  })
}

export function useCreateTimeLog(entryId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateTimeLogRequest) => createTimeLog(entryId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TIMELOGS_KEY, entryId] })
      qc.invalidateQueries({ queryKey: ['entries'] })
    },
  })
}

export function useDeleteTimeLog(entryId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (timeLogId: number) => deleteTimeLog(entryId, timeLogId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TIMELOGS_KEY, entryId] })
      qc.invalidateQueries({ queryKey: ['entries'] })
    },
  })
}
