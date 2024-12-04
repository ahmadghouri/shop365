import { ref } from "vue";
import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useReviewStore = defineStore("reviews", () => {
  const reviewsList = ref([]);

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

  return {
    postReview,
    getReviews,
    reviewsList,
  };
});
