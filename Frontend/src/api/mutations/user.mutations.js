import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { userApi } from "@/api/modules/user.api";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export function useCreateAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => userApi.createAdmin(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_VENDORS }),
  });
}

export function useUpdateAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => userApi.updateAdmin(id, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_VENDORS }),
  });
}

export function useDeleteUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => userApi.delete(id).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminUsers"] }),
  });
}

export function useUpdateUserMutation() {
  return useMutation({
    mutationFn: ({ id, data }) => userApi.update(id, data).then((r) => r.data),
  });
}
