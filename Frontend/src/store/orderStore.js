import { defineStore } from "pinia";
import { orderApi } from "@/api/modules/order.api";
import { queryClient } from "@/api/queries/query-client";
import { QUERY_KEYS } from "@/api/queries/query-keys";
import { useCartStore } from "./cartStore";

export const useOrderStore = defineStore("order", {
  state: () => ({
    ordersList: [],
    userOrderDetails: [],
    businessId: "",
    adminOrders: [],
    page: 1,
    isLoaded: false,
  }),
  actions: {
    async placeOrder(usePoints, voucherCode = null) {
      try {
        const cartStore = useCartStore();
        const response = await orderApi.place({
          userPoints: usePoints,
          voucher_code: voucherCode,
        });
        cartStore.cartCount = 0;
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CART_ITEM_COUNT });
        return response;
      } catch (error) {
        console.error("Order didn't take place", error);
        throw error;
      }
    },

    async getOrderDetails() {
      try {
        const data = await queryClient.fetchQuery({
          queryKey: QUERY_KEYS.ORDERS,
          queryFn: () => orderApi.getAll().then((r) => r.data.data),
        });
        this.userOrderDetails = data;
      } catch (error) {
        console.error("Something went wrong", error);
      }
    },

    addOrder(order) {
      this.ordersList.push(order);
    },

    async getRestaurantOrders(page = 1) {
      try {
        const response = await orderApi.getRestaurantOrders({ page });
        const newOrders = response.data.data.orders.filter(
          (order) => !this.ordersList.some((existing) => existing.id === order.id)
        );
        this.ordersList = [...this.ordersList, ...newOrders];
        this.businessId = response.data.data.business_id;
        this.isLoaded = true;
      } catch (error) {
        console.error("Something went wrong", error);
      }
    },

    async addToOrderList() {
      this.page += 1;
      await this.getRestaurantOrders(this.page);
    },

    async updateStatus(id, status) {
      try {
        const response = await orderApi.updateStatus(id, { status });
        const updatedOrder = response.data.data;
        const orderIndex = this.ordersList.findIndex((o) => o.id === updatedOrder.id);
        if (orderIndex !== -1) this.ordersList[orderIndex] = updatedOrder;
        const userIndex = this.userOrderDetails.findIndex((o) => o.id === updatedOrder.id);
        if (userIndex !== -1) this.userOrderDetails[userIndex] = updatedOrder;
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS });
      } catch (error) {
        console.error("Failed to update order status", error);
        throw error;
      }
    },

    async getAdminOrders(businessId) {
      try {
        const response = await orderApi.getBusinessOrders(businessId);
        this.adminOrders = response.data.data.orders;
      } catch (error) {
        throw error;
      }
    },

    handleNewOrder(event) {
      if (!event || !event.mergedData) return;
      const { order } = event.mergedData;
      if (!order) return;

      const newOrder = {
        id: order.id,
        total_price: order.totalPrice,
        status: order.status,
        created_at: order.createdAt,
        newOrder: true,
        user: {
          name: order.name,
          phone_no: order.phone_no,
          household: {
            address: order.address?.household,
            town: { town_name: order.address?.town },
          },
        },
        items: [],
      };

      this.ordersList = JSON.parse(JSON.stringify([newOrder, ...this.ordersList]));
    },
  },
});
