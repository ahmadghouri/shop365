import { defineStore } from "pinia";
import { businessApi } from "@/api/modules/business.api";
import { queryClient } from "@/api/queries/query-client";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export const useBusinessStore = defineStore("business", {
  state: () => ({
    businesses: [],
    subBusinesses: [],
    error: "",
    loading: true,
  }),
  actions: {
    async getBusinesses() {
      this.loading = true;
      try {
        // Use queryClient to fetch and cache
        const data = await queryClient.fetchQuery({
          queryKey: QUERY_KEYS.BUSINESSES,
          queryFn: () => businessApi.getAll().then((r) => r.data.data),
        });
        this.businesses = data;
      } catch (error) {
        console.error("Failed to fetch businesses", error);
      } finally {
        this.loading = false;
      }
    },

    async subBusiness(businessId) {
      try {
        const data = await queryClient.fetchQuery({
          queryKey: QUERY_KEYS.SUB_BUSINESSES(businessId),
          queryFn: () => businessApi.getSubBusinesses(businessId).then((r) => r.data.data),
        });
        this.subBusinesses = data;
        this.loading = false;
        return data;
      } catch (error) {
        console.error("Failed to fetch sub-businesses", error);
      }
    },

    async deleteBusiness(id) {
      try {
        await businessApi.delete(id);
        this.businesses = this.businesses.filter((b) => b.id !== id);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUSINESSES });
      } catch (error) {
        console.error("Failed to delete business", error);
      }
    },

    async addBusiness(newBusiness) {
      try {
        const response = await businessApi.create(newBusiness);
        this.businesses.push(response.data.data);
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUSINESSES });
        return response.data;
      } catch (error) {
        console.error("Failed to add business", error);
        throw error;
      }
    },

    async editBusiness(id, editBusiness) {
      try {
        const response = await businessApi.update(id, editBusiness);
        const index = this.businesses.findIndex((b) => b.id === id);
        if (index !== -1) this.businesses[index] = response.data.data;
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BUSINESSES });
        return response.data;
      } catch (error) {
        console.error("Failed to edit business", error);
        throw error;
      }
    },
  },
});
