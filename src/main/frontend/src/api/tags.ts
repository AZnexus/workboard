import { api } from './client'
import type { Tag, CreateTagRequest, UpdateTagRequest } from '@/types'

export const fetchTags = () =>
  api.get<Tag[]>('/tags')

export const createTag = (data: CreateTagRequest) =>
  api.post<Tag>('/tags', data)

export const updateTag = (id: number, data: UpdateTagRequest) =>
  api.patch<Tag>(`/tags/${id}`, data)

export const deleteTag = (id: number) =>
  api.delete(`/tags/${id}`)
