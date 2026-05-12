import { api } from "./client"
import type { Improvement, PageResponse } from "@/types"

export interface ImprovementsParams {
  q?: string
  status?: string
  priority?: number
  versionId?: number
  tag?: string
  hasValuation?: boolean
  completionFrom?: number
  completionTo?: number
  dueDateFrom?: string
  dueDateTo?: string
  page?: number
  size?: number
}

function buildQuery(params: ImprovementsParams): string {
  const searchParams = new URLSearchParams()

  if (params.q) searchParams.set("q", params.q)
  if (params.status) searchParams.set("status", params.status)
  if (params.priority != null) searchParams.set("priority", String(params.priority))
  if (params.versionId != null) searchParams.set("versionId", String(params.versionId))
  if (params.tag) searchParams.set("tag", params.tag)
  if (params.hasValuation != null) searchParams.set("hasValuation", String(params.hasValuation))
  if (params.completionFrom != null) searchParams.set("completionFrom", String(params.completionFrom))
  if (params.completionTo != null) searchParams.set("completionTo", String(params.completionTo))
  if (params.dueDateFrom) searchParams.set("dueDateFrom", params.dueDateFrom)
  if (params.dueDateTo) searchParams.set("dueDateTo", params.dueDateTo)
  if (params.page != null) searchParams.set("page", String(params.page))
  if (params.size != null) searchParams.set("size", String(params.size))

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

export const fetchImprovements = (params: ImprovementsParams = {}) =>
  api.get<PageResponse<Improvement>>(`/improvements${buildQuery(params)}`)

export const fetchImprovement = (id: number) =>
  api.get<Improvement>(`/improvements/${id}`)
