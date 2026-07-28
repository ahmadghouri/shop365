import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { easyBuyApi } from "@/api/modules/easy-buy.api";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export function useCreateEasyBuyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => easyBuyApi.create(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EASY_BUYS }),
  });
}

export function useUpdateEasyBuyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => easyBuyApi.update(id, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EASY_BUYS }),
  });
}

export function useDeleteEasyBuyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => easyBuyApi.delete(id).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EASY_BUYS }),
  });
}
