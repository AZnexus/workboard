import { api } from './client'
import type {
  Entry,
  CreateEntryRequest,
  UpdateEntryRequest,
  PageResponse,
  EntryStatus,
  EntryType,
} from '@/types'

export interface EntriesParams {
  page?: number
  size?: number
  date?: string
  dateFrom?: string
  dateTo?: string
  status?: EntryStatus
  type?: EntryType
  tag?: string
  q?: string
  pinned?: boolean
}

function buildQuery(params: EntriesParams): string {
  const p = new URLSearchParams()
  if (params.page != null) p.set('page', String(params.page))
  if (params.size != null) p.set('size', String(params.size))
  if (params.date) p.set('date', params.date)
  if (params.dateFrom) p.set('date_from', params.dateFrom)
  if (params.dateTo) p.set('date_to', params.dateTo)
  if (params.status) p.set('status', params.status)
  if (params.type) p.set('type', params.type)
  if (params.tag) p.set('tag', params.tag)
  if (params.q) p.set('q', params.q)
  if (params.pinned != null) p.set('pinned', String(params.pinned))
  const qs = p.toString()
  return qs ? `?${qs}` : ''
}

export const fetchEntries = (params: EntriesParams = {}) =>
  api.get<PageResponse<Entry>>(`/entries${buildQuery(params)}`)

export const fetchEntry = (id: number) =>
  api.get<Entry>(`/entries/${id}`)

export const createEntry = (body: CreateEntryRequest) =>
  api.post<Entry>('/entries', body)

export const updateEntry = (id: number, body: UpdateEntryRequest) =>
  api.patch<Entry>(`/entries/${id}`, body)

export const deleteEntry = (id: number) =>
  api.delete(`/entries/${id}`)
