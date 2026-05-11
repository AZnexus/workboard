import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createVersion, deleteVersion, fetchVersions, updateVersion } from '@/api/versions'
import type { CreateVersionRequest, UpdateVersionRequest } from '@/types'

const VERSIONS_KEY = 'versions'

export function useVersions(active?: boolean) {
  return useQuery({
    queryKey: [VERSIONS_KEY, active],
    queryFn: () => fetchVersions(active),
  })
}

export function useCreateVersion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateVersionRequest) => createVersion(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VERSIONS_KEY] }),
  })
}

export function useUpdateVersion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVersionRequest }) => updateVersion(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VERSIONS_KEY] }),
  })
}

export function useDeleteVersion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteVersion(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [VERSIONS_KEY] }),
  })
}
