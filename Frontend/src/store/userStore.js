import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [],
  }),

  actions: {
    async getUsers() {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/admin/users`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
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
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );

        this.users = this.users.filter((user) => user.id !== id);
      } catch (error) {
        console.error(error);
      }
    },
  },
});
