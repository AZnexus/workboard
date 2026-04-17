import { api } from './client'
import type { TimeLog, CreateTimeLogRequest, PageResponse, DataResponse } from '@/types'

export const fetchTimeLogs = (entryId: number) =>
  api.get<PageResponse<TimeLog>>(`/entries/${entryId}/timelogs`)

export const createTimeLog = (entryId: number, body: CreateTimeLogRequest) =>
  api.post<DataResponse<TimeLog>>(`/entries/${entryId}/timelogs`, body)

export const deleteTimeLog = (entryId: number, timeLogId: number) =>
  api.delete(`/entries/${entryId}/timelogs/${timeLogId}`)
