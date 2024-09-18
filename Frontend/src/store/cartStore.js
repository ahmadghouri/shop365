import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useCartStore = defineStore("cart", {
  state: () => ({
    cartItems: [],
    cartCount: 0,
  }),
  actions: {
    async addToCart(productInfo) {
      try {
        await axios.post(`${API_BASE_URL}/api/cart`, productInfo, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        await this.fetchCartCount();
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
        // Delete the item from the server
        await axios.delete(`${API_BASE_URL}/api/cart/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        // Refresh cart items to ensure state is in sync with server
        await this.getCartItems();
        this.cartCount = this.cartCount - 1;
      } catch (error) {
        console.error("Failed to remove item from cart", error);
      }
    },

    async updateItemQuantity(id, quantity) {
      try {
        await axios.patch(
          `${API_BASE_URL}/api/cart/update/${id}`,
          { quantity },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Refresh cart items to ensure state is in sync with server
        await this.getCartItems();
        await this.fetchCartCount();
      } catch (error) {
        console.error("Failed to update item quantity", error);
      }
    },

    async fetchCartCount() {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/cart/item-count`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        this.cartCount = response.data.item_count; // This should trigger reactivity
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    },
  },
});
