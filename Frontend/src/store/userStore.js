import { defineStore } from "pinia";
import { userApi } from "@/api/modules/user.api";
import { authApi } from "@/api/modules/auth.api";
import { businessApi } from "@/api/modules/business.api";
import { orderApi } from "@/api/modules/order.api";
import { queryClient } from "@/api/queries/query-client";
import { QUERY_KEYS } from "@/api/queries/query-keys";

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
        const response = await userApi.getAll({ page, per_page: perPage });
        const data = response.data;

        const users = data.users?.data || data.data?.data || [];
        this.users = page === 1 ? users : [...this.users, ...users];
        this.currentPage = data.users?.current_page || data.data?.current_page || 1;
        this.lastPage = data.users?.last_page || data.data?.last_page || 1;
        this.totalUsersCount = data.total_users_count || data.data?.total || 0;
        this.todayUsersCount = data.today_users_count || 0;
      } catch (error) {
        this.error = error.response?.data?.message || "An error occurred.";
      } finally {
        this.loading = false;
      }
    },

    async getUsersPreviousTwoDays() {
      try {
        const response = await userApi.getRecentUsers();
        const data = response.data.data || response.data;
        this.users = data.users || data;
        this.totalUsersPrevCount = data.total_count || 0;
        this.todayUsersCount = data.today_users_count || 0;
      } catch (error) {
        console.error(error);
      }
    },

    async deleteUser(id) {
      try {
        await userApi.delete(id);
        this.users = this.users.filter((u) => u.id !== id);
        queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      } catch (error) {
        console.error(error);
      }
    },

    async updateUser(id, updatedData) {
      try {
        await userApi.update(id, updatedData);
        this.user = { ...this.user, ...updatedData };
      } catch (error) {
        console.error("Error updating user:", error);
      }
    },

    async getSingleProfile() {
      try {
        const data = await queryClient.fetchQuery({
          queryKey: QUERY_KEYS.PROFILE,
          queryFn: () => authApi.profile().then((r) => r.data.data),
        });
        this.user = data.user;
        this.user.household = data.household;
        this.user.town = data.town;
      } catch (error) {
        console.error("Failed to get profile:", error);
      }
    },

    async fetchUsers(groceryBusinessId) {
      this.loading = true;
      this.error = null;
      try {
        let businessId = groceryBusinessId;
        if (!businessId) {
          const bizResponse = await businessApi.getAll();
          const businesses = bizResponse.data.data || bizResponse.data;
          const grocery = Array.isArray(businesses)
            ? businesses.find((b) => b.type === "Grocery" || b.name === "Shop365 Mart")
            : null;
          businessId = grocery?.id || grocery?._id;
        }
        if (!businessId) { this.groceryUsers = []; return; }
        const response = await orderApi.getGroceryUsers(businessId);
        this.groceryUsers = response.data;
      } catch (error) {
        this.error = error instanceof Error ? error.message : "An error occurred";
      } finally {
        this.loading = false;
      }
    },
  },
});
