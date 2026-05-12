import { useQuery } from "@tanstack/react-query"
import { fetchImprovement, fetchImprovements, type ImprovementsParams } from "@/api/improvements"

export const IMPROVEMENTS_KEY = "improvements"

export function useImprovements(params: ImprovementsParams = {}) {
  return useQuery({
    queryKey: [IMPROVEMENTS_KEY, params],
    queryFn: () => fetchImprovements(params),
  })
}

export function useImprovement(id: number) {
  return useQuery({
    queryKey: [IMPROVEMENTS_KEY, id],
    queryFn: () => fetchImprovement(id),
    enabled: !!id,
  })
}
