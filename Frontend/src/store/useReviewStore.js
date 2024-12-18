import { ref } from "vue";
import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useReviewStore = defineStore("reviews", () => {
  const reviewsList = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const postReview = async (order_id, business_id, comments, rating) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/reviews`,
        {
          order_id: order_id,
          business_id: business_id,
          comments: comments,
          rating: rating,
        },
        {}
      );
      reviewsList.value.push(response.data.data);
    } catch (error) {
      console.error("Review didn't take place", error);
      throw error;
    }
  };

  const getReviews = async (business_id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/reviews/${business_id}`,
        {}
      );
      reviewsList.value = response.data.reviews.data;
    } catch (error) {
      console.error("Something went wrong", error);
      throw error;
    }
  };

  const getBusinessReviews = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/restaurantAdmin/get-reviews`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      reviewsList.value = response.data.reviews;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to fetch reviews";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const replyToReview = async (reviewId, replyText) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/restaurantAdmin/review/${reviewId}/reply`,
        { reply: replyText },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const index = reviewsList.value.findIndex(
        (review) => review.id === reviewId
      );
      if (index !== -1) {
        // Preserve the existing user data while updating the review
        reviewsList.value[index] = {
          ...reviewsList.value[index],
          ...response.data.review,
        };
      }

      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to submit reply";
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  return {
    postReview,
    getReviews,
    reviewsList,
    loading,
    error,
    getBusinessReviews,
    replyToReview,
  };
});
