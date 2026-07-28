import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { cartApi } from "@/api/modules/cart.api";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => cartApi.add(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART_ITEM_COUNT });
    },
  });
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => cartApi.remove(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART_ITEM_COUNT });
    },
  });
}

export function useUpdateCartQuantityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity }) => cartApi.updateQuantity(id, { quantity }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART_ITEM_COUNT });
    },
  });
}

export function useApplyVoucherMutation() {
  return useMutation({
    mutationFn: (data) => cartApi.applyVoucher(data).then((r) => r.data),
  });
}
