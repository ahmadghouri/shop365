import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { authApi } from "@/api/modules/auth.api";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => authApi.login(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE }),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (data) => authApi.register(data).then((r) => r.data),
  });
}

export function useUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (data) => authApi.updatePassword(data).then((r) => r.data),
  });
}

export function useAddDetailsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => authApi.addDetails(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE }),
  });
}
