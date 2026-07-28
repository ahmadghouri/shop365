import { useQuery } from "@tanstack/vue-query";
import { reviewApi } from "@/api/modules/review.api";
import { QUERY_KEYS } from "./query-keys";

export function useReviewsQuery(businessId, options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.REVIEWS(businessId),
    queryFn: () => reviewApi.getByBusiness(businessId).then((r) => r.data.data),
    enabled: !!businessId,
    ...options,
  });
}

export function useRestaurantReviewsQuery(options = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.RESTAURANT_REVIEWS,
    queryFn: () => reviewApi.getAll().then((r) => r.data.data),
    ...options,
  });
}
