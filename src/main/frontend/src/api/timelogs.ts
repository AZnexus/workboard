import { api } from './client'
import type { TimeLog, CreateTimeLogRequest, UpdateTimeLogRequest } from '@/types'

export const fetchTimeLogs = (params?: Record<string, string>) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  return api.get<TimeLog[]>(`/timelogs${query}`)
}

export const createTimeLog = (body: CreateTimeLogRequest) =>
  api.post<TimeLog>('/timelogs', body)

export const updateTimeLog = (id: number, body: UpdateTimeLogRequest) =>
  api.patch<TimeLog>(`/timelogs/${id}`, body)

export const deleteTimeLog = (id: number) =>
  api.delete(`/timelogs/${id}`)

export const fetchProjects = () => 
  api.get<string[]>('/timelogs/projects')
