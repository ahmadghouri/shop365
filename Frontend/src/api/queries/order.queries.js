import { useQuery } from "@tanstack/vue-query";
import { orderApi } from "@/api/modules/order.api";
import { QUERY_KEYS } from "./query-keys";

export function useOrdersQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.ORDERS,
    queryFn: () => orderApi.getAll().then((r) => r.data.data),
    ...options,
  });
}

export function useOrderQuery(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.ORDER(id),
    queryFn: () => orderApi.getById(id).then((r) => r.data.data || r.data),
    enabled: !!id,
    ...options,
  });
}

export function useRestaurantOrdersQuery(params, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.RESTAURANT_ORDERS(params),
    queryFn: () => orderApi.getRestaurantOrders(params).then((r) => r.data.data),
    ...options,
  });
}

export function useAdminBusinessOrdersQuery(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_BUSINESS_ORDERS(id),
    queryFn: () => orderApi.getBusinessOrders(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  });
}

export function useGroceryUsersQuery(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.GROCERY_USERS(id),
    queryFn: () => orderApi.getGroceryUsers(id).then((r) => r.data),
    enabled: !!id,
    ...options,
  });
}
