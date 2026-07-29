import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { categoryApi } from '@/api/modules/category.api'
import { QUERY_KEYS } from '@/api/queries/query-keys'

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data) => categoryApi.create(data).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES }),
  })
}

export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => categoryApi.update(id, data).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES }),
  })
}

export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id) => categoryApi.delete(id).then((response) => response.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CATEGORIES }),
  })
}
