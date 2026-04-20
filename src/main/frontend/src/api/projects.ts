import { api } from './client'
import type { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types'

export const fetchProjects = (active?: boolean) => {
  const query = active !== undefined ? `?active=${active}` : ''
  return api.get<Project[]>(`/projects${query}`)
}

export const createProject = (data: CreateProjectRequest) =>
  api.post<Project>('/projects', data)

export const updateProject = (id: number, data: UpdateProjectRequest) =>
  api.patch<Project>(`/projects/${id}`, data)

export const deleteProject = (id: number) =>
  api.delete(`/projects/${id}`)
