import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useBusinessStore = defineStore("business", {
  state: () => ({
    businesses: [],
  }),
  actions: {
    async getBusinesses() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/business`);
        this.businesses = response.data.data;
      } catch (error) {
        console.error("Failed to fetch businesses", error);
      }
    },

    async deleteBusiness(id) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/api/business/${id}`
        );
        this.businesses = this.businesses.filter(
          (business) => business.id !== id
        );
      } catch (error) {
        console.error("Failed to fetch businesses", error);
      }
    },
    async addBusiness(newBusiness) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/business`,
          newBusiness
        );
        this.businesses.push(response.data);
      } catch (error) {
        console.error("Error adding business:", error);
      }
    },

    async editBusiness(editBusiness, id) {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/business/${id}`,
          editBusiness
        );

        const index = this.businesses.findIndex(
          (business) => business.id === id
        );

        if (index !== -1) {
          this.businesses[index] = {
            ...this.businesses[index],
            ...editBusiness,
          };
        }
      } catch (error) {
        console.error("Error editing business:", error);
      }
    },
  },
});
