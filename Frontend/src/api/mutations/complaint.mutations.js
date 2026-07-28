import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { complaintApi } from "@/api/modules/complaint.api";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export function useCreateComplaintMutation() {
  return useMutation({
    mutationFn: (data) => complaintApi.create(data).then((r) => r.data),
  });
}

export function useUpdateComplaintStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => complaintApi.updateStatus(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESTAURANT_COMPLAINTS }),
  });
}
