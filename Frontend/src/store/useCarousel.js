import { defineStore } from "pinia";
import { headerImageApi } from "@/api/modules/header-image.api";
import { queryClient } from "@/api/queries/query-client";
import { QUERY_KEYS } from "@/api/queries/query-keys";

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
        const data = await queryClient.fetchQuery({
          queryKey: QUERY_KEYS.HEADER_IMAGES,
          queryFn: () => headerImageApi.getAll().then((r) => r.data.data || r.data),
        });
        this.images = data;
      } catch (error) {
        this.error = error.message;
        console.error("Failed to fetch carousel images:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});
