import { useMutation, useQueryClient } from "@tanstack/vue-query";
import { reviewApi } from "@/api/modules/review.api";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export function useCreateReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => reviewApi.create(data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

export function useReplyReviewMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, data }) => reviewApi.reply(reviewId, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESTAURANT_REVIEWS }),
  });
}
