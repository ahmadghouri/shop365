import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { orderApi } from "@/api/modules/order.api";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export function usePlaceOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => orderApi.place(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART_ITEM_COUNT });
    },
  });
}

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => orderApi.updateStatus(id, { status }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      queryClient.invalidateQueries({ queryKey: ["restaurantOrders"] });
    },
  });
}

export function useReorderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId) => orderApi.reorder(orderId).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART_ITEM_COUNT });
    },
  });
}
