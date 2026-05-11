import { api } from './client'
import type { CreateVersionRequest, UpdateVersionRequest, Version } from '@/types'

export const fetchVersions = (active?: boolean) => {
  const query = active !== undefined ? `?active=${active}` : ''
  return api.get<Version[]>(`/versions${query}`)
}

export const createVersion = (data: CreateVersionRequest) =>
  api.post<Version>('/versions', data)

export const updateVersion = (id: number, data: UpdateVersionRequest) =>
  api.patch<Version>(`/versions/${id}`, data)

export const deleteVersion = (id: number) =>
  api.delete(`/versions/${id}`)
