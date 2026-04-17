import { api } from './client'
import type {
  Entry,
  CreateEntryRequest,
  UpdateEntryRequest,
  PageResponse,
  DataResponse,
  EntryStatus,
  EntryType,
} from '@/types'

export interface EntriesParams {
  page?: number
  size?: number
  status?: EntryStatus
  type?: EntryType
  tag?: string
  q?: string
}

function buildQuery(params: EntriesParams): string {
  const p = new URLSearchParams()
  if (params.page != null) p.set('page', String(params.page))
  if (params.size != null) p.set('size', String(params.size))
  if (params.status) p.set('status', params.status)
  if (params.type) p.set('type', params.type)
  if (params.tag) p.set('tag', params.tag)
  if (params.q) p.set('q', params.q)
  const qs = p.toString()
  return qs ? `?${qs}` : ''
}

export const fetchEntries = (params: EntriesParams = {}) =>
  api.get<PageResponse<Entry>>(`/entries${buildQuery(params)}`)

export const fetchEntry = (id: number) =>
  api.get<DataResponse<Entry>>(`/entries/${id}`)

export const createEntry = (body: CreateEntryRequest) =>
  api.post<DataResponse<Entry>>('/entries', body)

export const updateEntry = (id: number, body: UpdateEntryRequest) =>
  api.patch<DataResponse<Entry>>(`/entries/${id}`, body)

export const deleteEntry = (id: number) =>
  api.delete(`/entries/${id}`)
