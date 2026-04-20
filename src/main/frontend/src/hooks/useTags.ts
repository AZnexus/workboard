import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTags, createTag, updateTag, deleteTag } from '@/api/tags'
import type { CreateTagRequest, UpdateTagRequest } from '@/types'

const TAGS_KEY = 'tags'

export function useTags() {
  return useQuery({
    queryKey: [TAGS_KEY],
    queryFn: fetchTags,
  })
}

export function useCreateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTagRequest) => createTag(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TAGS_KEY] }),
  })
}

export function useUpdateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTagRequest }) => updateTag(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TAGS_KEY] }),
  })
}

export function useDeleteTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTag(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [TAGS_KEY] }),
  })
}
