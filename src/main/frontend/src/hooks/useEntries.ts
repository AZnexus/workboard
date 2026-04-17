import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchEntries,
  fetchEntry,
  createEntry,
  updateEntry,
  deleteEntry,
  type EntriesParams,
} from '@/api/entries'
import type { CreateEntryRequest, UpdateEntryRequest } from '@/types'

export const ENTRIES_KEY = 'entries'

export function useEntries(params: EntriesParams = {}) {
  return useQuery({
    queryKey: [ENTRIES_KEY, params],
    queryFn: () => fetchEntries(params),
  })
}

export function useEntry(id: number) {
  return useQuery({
    queryKey: [ENTRIES_KEY, id],
    queryFn: () => fetchEntry(id),
    enabled: !!id,
  })
}

export function useCreateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateEntryRequest) => createEntry(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENTRIES_KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateEntryRequest }) =>
      updateEntry(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENTRIES_KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteEntry(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ENTRIES_KEY] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
