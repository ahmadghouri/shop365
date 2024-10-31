import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";
import { useCartStore } from "./cartStore";

export const useOrderStore = defineStore("order", {
  state: () => ({
    orderDetails: [],
    userOrderDetails: [],
    businessId: "",
    adminOrders: [],
  }),
  actions: {
    async placeOrder() {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/order`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const cartStore = useCartStore();
        cartStore.cartCount = 0;
        return response;
      } catch (error) {
        console.error("Order didn't take place", error);
        throw error;
      }
    },

    async getOrderDetails() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/order`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        this.userOrderDetails = response.data.data;
      } catch (error) {
        console.error("Something went wrong", error);
      }
    },

    addOrder(order) {
      this.orderDetails.push(order);
    },

    async getRestaurantOrders() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/restaurantAdmin/orders`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        this.orderDetails = response.data.data.orders;
        this.businessId = response.data.data.business_id;
      } catch (error) {
        console.error("Something went wrong", error);
      }
    },

    async updateStatus(id, status) {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/orders/${id}/status`,
          { status },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const updatedOrder = response.data.data;

        // Update in orderDetails
        const orderIndex = this.orderDetails.findIndex(
          (order) => order.id === updatedOrder.id
        );
        if (orderIndex !== -1) {
          this.orderDetails[orderIndex] = updatedOrder;
        }

        // Update in userOrderDetails
        const userOrderIndex = this.userOrderDetails.findIndex(
          (order) => order.id === updatedOrder.id
        );
        if (userOrderIndex !== -1) {
          this.userOrderDetails[userOrderIndex] = updatedOrder;
        }
      } catch (error) {
        console.error("Failed to update order status", error);
        throw error;
      }
    },

    async getAdminOrders(businessId) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/business-orders/${businessId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        this.adminOrders = response.data.data.orders;
      } catch (error) {
        throw error;
      }
    },
  },
});
