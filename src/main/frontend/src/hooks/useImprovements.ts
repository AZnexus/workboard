import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createValuationTemplate,
  createImprovement,
  createValuation,
  deleteValuationTemplate,
  fetchImprovement,
  fetchImprovementEntries,
  fetchImprovements,
  fetchValuationTemplates,
  fetchValuation,
  updateValuationTemplate,
  updateImprovement,
  updateValuation,
  type ImprovementEntriesParams,
  type ImprovementsParams,
} from "@/api/improvements"
import type {
  CreateValuationTemplateRequest,
  CreateImprovementRequest,
  CreateValuationRequest,
  UpdateValuationTemplateRequest,
  UpdateImprovementRequest,
  UpdateValuationRequest,
} from "@/types"

export const IMPROVEMENTS_KEY = "improvements"
export const IMPROVEMENTS_VALUATION_KEY = "improvement-valuation"
export const IMPROVEMENTS_ENTRIES_KEY = "improvement-entries"
export const IMPROVEMENTS_VALUATION_TEMPLATES_KEY = "improvement-valuation-templates"

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

export function useValuationTemplates() {
  return useQuery({
    queryKey: [IMPROVEMENTS_VALUATION_TEMPLATES_KEY],
    queryFn: fetchValuationTemplates,
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

export function useCreateValuationTemplate() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateValuationTemplateRequest) => createValuationTemplate(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_VALUATION_TEMPLATES_KEY] })
    },
  })
}

export function useUpdateValuationTemplate() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      templateId,
      body,
    }: {
      templateId: number
      body: UpdateValuationTemplateRequest
    }) => updateValuationTemplate(templateId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_VALUATION_TEMPLATES_KEY] })
    },
  })
}

export function useDeleteValuationTemplate() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (templateId: number) => deleteValuationTemplate(templateId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [IMPROVEMENTS_VALUATION_TEMPLATES_KEY] })
    },
  })
}
