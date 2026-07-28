import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { businessApi } from "@/api/modules/business.api";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export function useCreateBusinessMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => businessApi.create(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUSINESSES }),
  });
}

export function useUpdateBusinessMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => businessApi.update(id, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUSINESSES }),
  });
}

export function useDeleteBusinessMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => businessApi.delete(id).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUSINESSES }),
  });
}
