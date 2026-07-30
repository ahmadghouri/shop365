import { useQuery } from '@tanstack/vue-query'
import { categoryApi } from '@/api/modules/category.api'
import { QUERY_KEYS } from './query-keys'

export function useCategoriesQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.CATEGORIES,
    queryFn: () => categoryApi.getAll({ all: true }).then((response) => response.data.data),
    ...options,
  })
}

export function useActiveCategoriesQuery(options = {}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CATEGORIES, 'active'],
    queryFn: () => categoryApi.getAll().then((response) => response.data.data),
    ...options,
  })
}
