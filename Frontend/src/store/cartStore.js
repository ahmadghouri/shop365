import { defineStore } from "pinia";
import { API_BASE_URL } from "../config/api";
import axios from "axios";

export const useCartStore = defineStore("cart", {
  state: () => ({
    cartItems: [],
    cartCount: 0,
    voucherDiscount: 0,
    isGuest: !localStorage.getItem("token"),
    migrationInProgress: false,
  }),

  persist: {
    storage: localStorage,
    paths: ["cartItems", "cartCount", "voucherDiscount", "isGuest"],
  },

  actions: {
    async applyVoucher(voucherCode) {
      if (this.isGuest) {
        throw {
          response: {
            data: {
              message: "Please login to apply voucher codes",
            },
          },
        };
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/cart/apply-voucher`,
          {
            voucher_code: voucherCode,
          }
        );
        this.voucherDiscount = response.data.discount;
        return {
          message: "Voucher applied successfully",
          ...response.data,
        };
      } catch (error) {
        this.voucherDiscount = 0;
        console.error("Voucher application error:", error);
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

    async addToCart(cartItem) {
      if (this.isGuest) {
        const existingItem = this.cartItems.find(
          (item) => item.product_id === cartItem.product_id
        );

        if (existingItem) {
          existingItem.quantity += cartItem.quantity;
        } else {
          // For guest cart, we need to store the complete product information
          this.cartItems.push({
            id: Date.now(), // temporary ID for guest cart
            product_id: cartItem.product_id,
            quantity: cartItem.quantity,
            product: cartItem.product, // Store the complete product object
          });
        }
        this.cartCount += cartItem.quantity;
        return Promise.resolve(); // Return resolved promise for consistent behavior
      }

      try {
        await axios.post(`${API_BASE_URL}/api/cart`, cartItem);
        await this.fetchCartCount();
      } catch (error) {
        console.error("Failed to add to cart", error);
        throw error;
      }
    },

    async getCartItems() {
      if (this.isGuest) {
        return this.cartItems;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/cart`);
        this.cartItems = response.data.data;
        return response.data;
      } catch (error) {
        console.error("Failed to fetch cart items", error);
        throw error;
      }
    },

    async removeItem(id) {
      if (this.isGuest) {
        const itemIndex = this.cartItems.findIndex((item) => item.id === id);
        if (itemIndex !== -1) {
          this.cartCount -= this.cartItems[itemIndex].quantity;
          this.cartItems.splice(itemIndex, 1);
        }
        return;
      }

      try {
        await axios.delete(`${API_BASE_URL}/api/cart/${id}`);
        await this.getCartItems();
        await this.fetchCartCount();
      } catch (error) {
        console.error("Failed to remove item from cart", error);
        throw error;
      }
    },

    async updateItemQuantity(id, quantity) {
      if (this.isGuest) {
        const item = this.cartItems.find((item) => item.id === id);
        if (item) {
          const quantityDiff = quantity - item.quantity;
          item.quantity = quantity;
          this.cartCount += quantityDiff;
        }
        return;
      }

      try {
        await axios.patch(`${API_BASE_URL}/api/cart/update/${id}`, {
          quantity,
        });
        await this.getCartItems();
        await this.fetchCartCount();
      } catch (error) {
        console.error("Failed to update item quantity", error);
        throw error;
      }
    },

    async fetchCartCount() {
      if (this.isGuest) {
        this.cartCount = this.cartItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/api/cart/item-count`);
        this.cartCount = response.data.item_count;
      } catch (error) {
        console.error("Error fetching cart count:", error);
        throw error;
      }
    },

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

    async migrateGuestCart() {
      if (!this.cartItems.length || this.migrationInProgress) return;

      try {
        this.migrationInProgress = true;
        console.log("Starting cart migration", this.cartItems);

        // Create a copy of cart items before migration
        const itemsToMigrate = [...this.cartItems];

        // Migrate each item from guest cart to authenticated cart
        for (const item of itemsToMigrate) {
          const cartItem = {
            quantity: item.quantity,
            product_id: item.product_id,
          };

          try {
            await axios.post(`${API_BASE_URL}/api/cart`, cartItem);
          } catch (error) {
            console.error("Failed to migrate item:", error);
          }
        }

        // Clear guest cart after migration
        this.cartItems = [];
        this.isGuest = false;

        // Fetch the new cart state
        await this.fetchCartCount();
        await this.getCartItems();

        console.log("Cart migration completed");
      } catch (error) {
        console.error("Cart migration failed:", error);
        throw error;
      } finally {
        this.migrationInProgress = false;
      }
    },
  },
});
