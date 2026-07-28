import { useQuery } from "@tanstack/vue-query";
import { easyBuyApi } from "@/api/modules/easy-buy.api";
import { QUERY_KEYS } from "./query-keys";

export function useEasyBuysQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.EASY_BUYS,
    queryFn: () => easyBuyApi.getAll().then((r) => r.data.data || r.data),
    ...options,
  });
}

export function useEasyBuyQuery(id, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.EASY_BUY(id),
    queryFn: () => easyBuyApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  });
}
