import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { voucherApi } from "@/api/modules/voucher.api";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export function useCreateVoucherMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => voucherApi.create(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VOUCHERS }),
  });
}

export function useDeleteVoucherMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => voucherApi.delete(id).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.VOUCHERS }),
  });
}
