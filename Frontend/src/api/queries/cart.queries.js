import { useQuery } from "@tanstack/vue-query";
import { cartApi } from "@/api/modules/cart.api";
import { QUERY_KEYS } from "./query-keys";

export function useCartQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.CART,
    queryFn: () => cartApi.getAll().then((r) => r.data.data),
    ...options,
  });
}

export function useCartItemCountQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.CART_ITEM_COUNT,
    queryFn: () => cartApi.getItemCount().then((r) => r.data.data),
    ...options,
  });
}
