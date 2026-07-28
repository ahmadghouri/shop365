import { useQuery } from "@tanstack/vue-query";
import { businessApi } from "@/api/modules/business.api";
import { QUERY_KEYS } from "./query-keys";

export function useBusinessesQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.BUSINESSES,
    queryFn: () => businessApi.getAll().then((r) => r.data.data),
    ...options,
  });
}

export function useBusinessQuery(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.BUSINESS(id),
    queryFn: () => businessApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  });
}

export function useSubBusinessesQuery(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.SUB_BUSINESSES(id),
    queryFn: () => businessApi.getSubBusinesses(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  });
}

export function useBusinessStatsQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.BUSINESS_STATS,
    queryFn: () => businessApi.getStats().then((r) => r.data.data),
    ...options,
  });
}
