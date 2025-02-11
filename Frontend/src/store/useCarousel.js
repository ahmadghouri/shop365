// stores/carouselStore.js
import { defineStore } from "pinia";
import axios from "axios";
import { API_BASE_URL } from "../config/api.js";

export const useCarouselStore = defineStore("carousel", {
  state: () => ({
    images: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchImages() {
      this.loading = true;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/header-images`);
        this.images = response.data;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
  },
});
