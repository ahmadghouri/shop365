import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useUserStore = defineStore("user", {
  state: () => ({
    users: [],
    groceryUsers: [],
    user: [],
    totalUsersCount: 0,
    todayUsersCount: 0,
    totalUsersPrevCount: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    points: 0,
    loading: false,
    error: null,
  }),

  actions: {
    async getUsers(page = 1, perPage = 10) {
      try {
        this.loading = true;
        const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          params: { page, per_page: perPage },
        });
        const data = response.data;

        if (page === 1) {
          this.users = data.users.data;
        } else {
          this.users = [...this.users, ...data.users.data];
        }

        this.currentPage = data.users.current_page;
        this.lastPage = data.users.last_page;
        this.perPage = data.users.per_page;
        this.totalUsersCount = data.total_users_count;
        this.todayUsersCount = data.today_users_count;
      } catch (error) {
        console.error(error);
        this.error = error.response?.data?.message || "An error occurred.";
      } finally {
        this.loading = false;
      }
    },

    async getUsersPreviousTwoDays() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/users/previous-two-days`,
          {}
        );

        this.users = response.data.users;
        this.totalUsersPrevCount = response.data.total_count;
        this.todayUsersCount = response.data.today_users_count;
      } catch (error) {
        console.error(error);
      }
    },

    async deleteUser(id) {
      try {
        const response = await axios.delete(
          `${API_BASE_URL}/api/admin/users/${id}`,
          {}
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
        this.user = { ...this.user, ...updatedData };
      } catch (error) {
        console.error("Error adding business:", error);
      }
    },

    async getSingleProfile() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/profile`, {});

        this.user = response.data.data.user;
        this.user.household = response.data.data.household;
        this.user.town = response.data.data.town;
      } catch (error) {}
    },

    // only for grocery store
    async fetchUsers() {
      this.loading = true;
      this.error = null;

      try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/grocery/6`);
        this.groceryUsers = response.data;
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "An error occurred";
        console.error("Failed to fetch users:", error);
      } finally {
        this.loading = false;
      }
    },
  },
});
