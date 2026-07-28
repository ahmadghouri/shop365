import { useQuery } from "@tanstack/vue-query";
import { userApi } from "@/api/modules/user.api";
import { QUERY_KEYS } from "./query-keys";

export function useAdminUsersQuery(params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_USERS(params),
    queryFn: () => userApi.getAll(params).then((r) => r.data.data),
    ...options,
  });
}

export function useAdminUserQuery(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_USER(id),
    queryFn: () => userApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  });
}

export function useRecentUsersQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_RECENT_USERS,
    queryFn: () => userApi.getRecentUsers().then((r) => r.data.data),
    ...options,
  });
}

export function useVendorsQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_VENDORS,
    queryFn: () => userApi.getVendors().then((r) => r.data.data),
    ...options,
  });
}

export function usePosProductsQuery(params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.POS_PRODUCTS(params),
    queryFn: async () => {
      const { posProductApi } = await import("@/api/modules/pos-product.api");
      return posProductApi.getAll(params).then((r) => r.data.data);
    },
    ...options,
  });
}

export function useInternshipAppsQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.INTERNSHIP_APPS,
    queryFn: async () => {
      const { internshipApi } = await import("@/api/modules/internship.api");
      return internshipApi.getAll().then((r) => r.data.data || r.data);
    },
    ...options,
  });
}
