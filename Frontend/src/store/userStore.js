import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [],
    user: [],
  }),

  actions: {
    async getUsers() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        this.users = response.data;
        console.log(this.users);
      } catch (error) {
        console.error(error);
      }
    },

    async deleteUser(id) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/api/admin/users/${id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        localStorage.removeItem("token");
        this.users = this.users.filter((user) => user.id !== id);
      } catch (error) {
        console.error(error);
      }
    },

    async updateUser(id, updatedData) {
      try {
        const response = await axios.put(`${API_BASE_URL}/api/update/${id}`, {
          updatedData,
        });
      } catch (error) {
        console.error("Error adding business:", error);
      }
    },

    async getSingleProfile() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } catch (error) {}
    },
  },
});
