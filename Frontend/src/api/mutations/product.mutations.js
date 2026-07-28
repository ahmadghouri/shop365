import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { productApi } from "@/api/modules/product.api";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => productApi.create(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => productApi.update(id, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => productApi.delete(id).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useToggleActiveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => productApi.toggleActive(id).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useApplyDiscountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }) => productApi.applyDiscountToProduct(productId, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useUpdateDiscountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => productApi.updateDiscount(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useRemoveDiscountMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => productApi.removeDiscount().then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}

export function useAddProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => productApi.addProduct(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });
}
