import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createImprovement,
  createValuation,
  fetchImprovement,
  fetchImprovementEntries,
  fetchImprovements,
  fetchValuation,
  updateImprovement,
  updateValuation,
  type ImprovementEntriesParams,
  type ImprovementsParams,
} from "@/api/improvements"
import type {
  CreateImprovementRequest,
  CreateValuationRequest,
  UpdateImprovementRequest,
  UpdateValuationRequest,
} from "@/types"

export const IMPROVEMENTS_KEY = "improvements"
export const IMPROVEMENTS_VALUATION_KEY = "improvement-valuation"
export const IMPROVEMENTS_ENTRIES_KEY = "improvement-entries"

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

export function useValuation(improvementId: number) {
  return useQuery({
    queryKey: [IMPROVEMENTS_VALUATION_KEY, improvementId],
    queryFn: () => fetchValuation(improvementId),
    enabled: !!improvementId,
  })
}

export function useImprovementEntries(improvementId: number, params: ImprovementEntriesParams = {}) {
  return useQuery({
    queryKey: [IMPROVEMENTS_ENTRIES_KEY, improvementId, params],
    queryFn: () => fetchImprovementEntries(improvementId, params),
    enabled: !!improvementId,
  })
}

export function useCreateImprovement() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateImprovementRequest) => createImprovement(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_KEY] })
    },
  })
}

export function useUpdateImprovement() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateImprovementRequest }) => updateImprovement(id, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_KEY] })
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_KEY, variables.id] })
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_VALUATION_KEY, variables.id] })
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_ENTRIES_KEY, variables.id] })
    },
  })
}

export function useCreateValuation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ improvementId, body }: { improvementId: number; body: CreateValuationRequest }) =>
      createValuation(improvementId, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_KEY] })
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_KEY, variables.improvementId] })
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_VALUATION_KEY, variables.improvementId] })
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_ENTRIES_KEY, variables.improvementId] })
    },
  })
}

export function useUpdateValuation() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ improvementId, body }: { improvementId: number; body: UpdateValuationRequest }) =>
      updateValuation(improvementId, body),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_KEY] })
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_KEY, variables.improvementId] })
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_VALUATION_KEY, variables.improvementId] })
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_ENTRIES_KEY, variables.improvementId] })
    },
  })
}
