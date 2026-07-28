import { useQuery } from "@tanstack/vue-query";
import { voucherApi } from "@/api/modules/voucher.api";
import { QUERY_KEYS } from "./query-keys";

export function useVouchersQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.VOUCHERS,
    queryFn: () => voucherApi.getAll().then((r) => r.data.data),
    ...options,
  });
}
