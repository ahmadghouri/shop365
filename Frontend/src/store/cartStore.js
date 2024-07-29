import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useCartStore = defineStore("cart", {
  state: () => ({
    cartItems: [],
  }),
  actions: {
    async addToCart(productInfo) {
      try {
        await axios.post(`${API_BASE_URL}/api/cart`, productInfo, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } catch (error) {
        console.error("Failed to add to cart", error);
      }
    },

    async getCartItems() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/cart`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        this.cartItems = response.data.data;
        console.log(response.data);
      } catch (error) {
        console.error("Failed to fetch cart items", error);
      }
    },

    async removeItem(id) {
      try {
        await axios.delete(`${API_BASE_URL}/api/cart/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const itemIndex = this.cartItems.findIndex((item) => item.id === id);

        if (itemIndex !== -1) {
          const item = this.cartItems[itemIndex];

          if (item.quantity > 1) {
            item.quantity--;
          } else {
            this.cartItems.splice(itemIndex, 1);
          }
        }
      } catch (error) {
        console.error("Failed to remove item from cart", error);
      }
    },
  },
});
