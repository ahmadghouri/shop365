import { useQuery } from "@tanstack/vue-query";
import { authApi } from "@/api/modules/auth.api";
import { QUERY_KEYS } from "./query-keys";

export function useProfileQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.PROFILE,
    queryFn: () => authApi.profile().then((r) => r.data.data),
    ...options,
  });
}

export function useRefreshUserQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.REFRESH_USER,
    queryFn: () => authApi.refreshUser().then((r) => r.data),
    ...options,
  });
}
