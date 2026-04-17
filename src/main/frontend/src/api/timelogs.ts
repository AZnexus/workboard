import { api } from './client'
import type { TimeLog, CreateTimeLogRequest, UpdateTimeLogRequest, DataResponse } from '@/types'

export const fetchTimeLogs = (params?: Record<string, string>) => {
  const query = params ? '?' + new URLSearchParams(params).toString() : ''
  return api.get<{ data: TimeLog[] }>(`/timelogs${query}`)
}

export const createTimeLog = (body: CreateTimeLogRequest) =>
  api.post<DataResponse<TimeLog>>('/timelogs', body)

export const updateTimeLog = (id: number, body: UpdateTimeLogRequest) =>
  api.patch<DataResponse<TimeLog>>(`/timelogs/${id}`, body)

export const deleteTimeLog = (id: number) =>
  api.delete(`/timelogs/${id}`)

export const fetchProjects = () => 
  api.get<string[]>('/timelogs/projects')
