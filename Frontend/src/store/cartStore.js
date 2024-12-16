import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";

export const useCartStore = defineStore("cart", {
  state: () => ({
    cartItems: [],
    cartCount: 0,
    voucherDiscount: 0,
  }),
  actions: {
    // In your cartStore
    async applyVoucher(voucherCode) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/cart/apply-voucher`,
          {
            voucher_code: voucherCode,
          }
        );

        // Explicitly set the discount
        this.voucherDiscount = response.data.discount;

        // Return an object with a message and the full response data
        return {
          message: "Voucher applied successfully",
          ...response.data,
        };
      } catch (error) {
        this.voucherDiscount = 0;

        // Log the full error for debugging
        console.error("Voucher application error:", error);

        // Throw the error with a specific message
        throw {
          response: {
            data: {
              message:
                error.response?.data?.message || "Failed to apply voucher",
            },
          },
        };
      }
    },

    resetVoucherDiscount() {
      this.voucherDiscount = 0;
    },
    async addToCart(productInfo) {
      try {
        await axios.post(`${API_BASE_URL}/api/cart`, productInfo, {});
        await this.fetchCartCount();
      } catch (error) {
        console.error("Failed to add to cart", error);
      }
    },

    async getCartItems() {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/cart`, {});
        this.cartItems = response.data.data;
        console.log(response.data);
      } catch (error) {
        console.error("Failed to fetch cart items", error);
      }
    },

    async removeItem(id) {
      try {
        // Delete the item from the server
        await axios.delete(`${API_BASE_URL}/api/cart/${id}`, {});

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
          {}
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
          {}
        );
        this.cartCount = response.data.item_count; // This should trigger reactivity
      } catch (error) {
        console.error("Error fetching cart count:", error);
      }
    },

    // Move reorderPreviousOrder inside actions
    async reorderPreviousOrder(orderId) {
      try {
        console.log("order", orderId);

        const response = await axios.post(
          `${API_BASE_URL}/api/reorder/${orderId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Update cart count based on the response
        if (response.data.count) {
          this.cartCount += response.data.count;
        }

        // Refresh cart items to ensure the latest state
        await this.getCartItems();

        // Show success message (you might want to handle this differently based on your UI)
        return {
          success: true,
          message: response.data.message,
          count: response.data.count,
        };
      } catch (error) {
        console.error("Failed to reorder previous order", error);

        // Return error details
        return {
          success: false,
          message:
            error.response?.data?.message || "Failed to reorder previous order",
          error: error,
        };
      }
    },
  },
});
