import { defineStore } from "pinia";
import { cartApi } from "@/api/modules/cart.api";
import { orderApi } from "@/api/modules/order.api";
import { queryClient } from "@/api/queries/query-client";
import { QUERY_KEYS } from "@/api/queries/query-keys";

export const useCartStore = defineStore("cart", {
  state: () => ({
    cartItems: [],
    cartCount: 0,
    voucherDiscount: 0,
    voucherCode: null,
    isGuest: false,
  }),
  persist: true,
  actions: {
    async addItem(cartItem) {
      if (this.isGuest) {
        const existing = this.cartItems.find((i) => i.product_id === cartItem.product_id);
        if (existing) {
          existing.quantity += cartItem.quantity;
        } else {
          this.cartItems.push({
            id: `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            product_id: cartItem.product_id,
            quantity: cartItem.quantity,
            product: cartItem.product,
          });
        }
        this.cartCount += cartItem.quantity;
        return;
      }

      try {
        await cartApi.add(cartItem);
        await this.fetchCartCount();
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      } catch (error) {
        console.error("Failed to add item:", error);
        throw error;
      }
    },

    async getCartItems() {
      if (this.isGuest) return;
      try {
        const data = await queryClient.fetchQuery({
          queryKey: QUERY_KEYS.CART,
          queryFn: () => cartApi.getAll().then((r) => r.data.data?.cartItems || r.data.data || []),
        });
        this.cartItems = data;
        return data;
      } catch (error) {
        console.error("Failed to get cart items:", error);
      }
    },

    async removeItem(id) {
      if (this.isGuest) {
        this.cartItems = this.cartItems.filter((i) => i.id !== id);
        this.cartCount = this.cartItems.reduce((s, i) => s + i.quantity, 0);
        return;
      }
      try {
        await cartApi.remove(id);
        await this.getCartItems();
        await this.fetchCartCount();
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      } catch (error) {
        console.error("Failed to remove item:", error);
      }
    },

    async updateItemQuantity(id, quantity) {
      if (this.isGuest) {
        const item = this.cartItems.find((i) => i.id === id);
        if (item) item.quantity = quantity;
        this.cartCount = this.cartItems.reduce((s, i) => s + i.quantity, 0);
        return;
      }
      try {
        await cartApi.updateQuantity(id, { quantity });
        await this.getCartItems();
        await this.fetchCartCount();
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
      } catch (error) {
        console.error("Failed to update quantity:", error);
      }
    },

    async fetchCartCount() {
      if (this.isGuest) {
        this.cartCount = this.cartItems.reduce((s, i) => s + i.quantity, 0);
        return;
      }
      try {
        const data = await queryClient.fetchQuery({
          queryKey: QUERY_KEYS.CART_ITEM_COUNT,
          queryFn: () => cartApi.getItemCount().then((r) => r.data.data?.count || r.data.item_count || 0),
          staleTime: 0,
        });
        this.cartCount = data;
      } catch (error) {
        console.error("Failed to fetch cart count:", error);
      }
    },

    async applyVoucher(voucherCode) {
      try {
        const response = await cartApi.applyVoucher({ voucher_code: voucherCode });
        this.voucherDiscount = response.data.discount || 0;
        this.voucherCode = voucherCode;
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    async reorder(orderId) {
      try {
        const response = await orderApi.reorder(orderId);
        await this.fetchCartCount();
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
        return response.data;
      } catch (error) {
        console.error("Failed to reorder:", error);
        throw error;
      }
    },

    async migrateGuestCart() {
      if (!this.isGuest || this.cartItems.length === 0) return;
      for (const item of this.cartItems) {
        try {
          await cartApi.add({ product_id: item.product_id, quantity: item.quantity });
        } catch (error) {
          console.error("Failed to migrate item:", error);
        }
      }
      this.cartItems = [];
      this.cartCount = 0;
      this.isGuest = false;
      await this.fetchCartCount();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
    },

    setGuestMode(isGuest) {
      this.isGuest = isGuest;
    },

    clearCart() {
      this.cartItems = [];
      this.cartCount = 0;
      this.voucherDiscount = 0;
      this.voucherCode = null;
    },
  },
});
