import { ref } from "vue";
import { defineStore } from "pinia";
import { reviewApi } from "@/api/modules/review.api";
import { queryClient } from "@/api/queries/query-client";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export const useReviewStore = defineStore("reviews", () => {
  const reviews = ref([]);
  const restaurantReviews = ref([]);

  async function createReview(order_id, business_id, rating, comments) {
    try {
      const response = await reviewApi.create({ order_id, business_id, rating, comments });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REVIEWS(business_id) });
      return response.data;
    } catch (error) {
      console.error("Failed to create review:", error);
      throw error;
    }
  }

  async function getReviews(business_id) {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.REVIEWS(business_id),
        queryFn: () => reviewApi.getByBusiness(business_id).then((r) => r.data.data),
      });
      reviews.value = data;
      return data;
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  }

  async function getRestaurantReviews() {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.RESTAURANT_REVIEWS,
        queryFn: () => reviewApi.getAll().then((r) => r.data.data || r.data || []),
      });
      restaurantReviews.value = data || [];
      return data;
    } catch (error) {
      console.error("Failed to fetch restaurant reviews:", error);
      restaurantReviews.value = [];
    }
  }

  async function replyToReview(reviewId, replyText) {
    try {
      const response = await reviewApi.reply(reviewId, { reply: replyText });
      const index = restaurantReviews.value.findIndex((r) => r.id === reviewId);
      if (index !== -1) restaurantReviews.value[index].reply = replyText;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RESTAURANT_REVIEWS });
      return response.data;
    } catch (error) {
      console.error("Failed to reply to review:", error);
      throw error;
    }
  }

  return { reviews, restaurantReviews, reviewsList: restaurantReviews, createReview, getReviews, getRestaurantReviews, replyToReview };
});
