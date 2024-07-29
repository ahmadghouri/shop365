import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useOrderStore = defineStore("order", {
  state: () => ({
    orderDetails: [],
  }),
  actions: {
    async placeOrder() {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/order`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // Ensure token is valid
            },
          }
        );
      } catch (error) {
        console.error("Order didn't take place", error);
        throw error; // Ensure error is re-thrown for catching in the component
      }
    },

    async getOrderDetails() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/orders`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        this.orderDetails = response.data.data;
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
  },
});
