import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useOrderStore = defineStore("order", {
  state: () => ({
    orderDetails: [],
    userOrderDetails: [],
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
        console.log(this.orderDetails);
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
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );

        this.orderDetails = response.data.orders;
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
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );

        const updatedOrder = response.data.order; // Corrected to response.data.order
        const index = this.orderDetails.findIndex(
          (order) => order.id === updatedOrder.id
        );
        if (index !== -1) {
          this.orderDetails[index] = updatedOrder;
        }
      } catch (error) {
        console.error("Failed to update order status", error);
        throw error;
      }
    },
  },
});
