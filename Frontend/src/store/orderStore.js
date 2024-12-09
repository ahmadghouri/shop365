import { API_BASE_URL } from "../config/api";
import { defineStore } from "pinia";
import axios from "axios";
import { useCartStore } from "./cartStore";
import { useUserStore } from "./userStore";

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
    async placeOrder(usePoints) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/order`,
          {
            userPoints: usePoints,
          },
          {}
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
        const response = await axios.get(`${API_BASE_URL}/api/order`, {});
        console.log(response.data.data);

        this.userOrderDetails = response.data.data;
      } catch (error) {
        console.error("Something went wrong", error);
      }
    },

    addOrder(order) {
      this.ordersList.push(order);
    },

    async getRestaurantOrders(page = 1) {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/restaurantAdmin/orders`,
          {
            params: { page },
          }
        );
        const newOrders = response.data.data.orders.filter(
          (order) =>
            !this.ordersList.some(
              (existingOrder) => existingOrder.id === order.id
            )
        );
        this.ordersList = [...this.ordersList, ...newOrders];
        this.businessId = response.data.data.business_id;
        this.isLoaded = true;
      } catch (error) {
        console.error("Something went wrong", error);
      }
    },

    async addToOrderList() {
      console.log("called");

      this.getRestaurantOrders(this.page + 1);
    },

    async updateStatus(id, status) {
      try {
        const response = await axios.put(
          `${API_BASE_URL}/api/orders/${id}/status`,
          { status },
          {}
        );

        const updatedOrder = response.data.data;
        // Update in ordersList
        const orderIndex = this.ordersList.findIndex(
          (order) => order.id === updatedOrder.id
        );
        if (orderIndex !== -1) {
          this.ordersList[orderIndex] = updatedOrder;
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
          {}
        );
        this.adminOrders = response.data.data.orders;
      } catch (error) {
        throw error;
      }
    },

    handleNewOrder(event) {
      if (!event || !event.mergedData) {
        console.error("Merged data is missing in event:", event);
        return;
      }

      const { order, items, audioUrl } = event.mergedData;

      if (!order) {
        console.error("Order data is missing in mergedData:", event.mergedData);
        return;
      }

      // const newOrder = {
      //   id: order.id,
      //   user_id: order.user_id,
      //   total_price: order.total_price,
      //   status: order.status,
      //   created_at: order.created_at,
      //   updated_at: order.updated_at,
      //   items: items
      //     ? items.map((item) => ({
      //         id: item.id,
      //         order_id: item.order_id,
      //         product_id: item.product_id,
      //         price: item.price,
      //         quantity: item.quantity,
      //         created_at: item.created_at,
      //         updated_at: item.updated_at,
      //         product: {
      //           id: item.product.id,
      //           title: item.product.title,
      //           description: item.product.description,
      //           price: item.product.price,
      //           image: item.product.image,
      //           image_url: item.product.image_url,
      //           type: item.product.type,
      //           created_at: item.product.created_at,
      //           updated_at: item.product.updated_at,
      //         },
      //       }))
      //     : [],
      //   user: order.user
      //     ? {
      //         id: order.user.id,
      //         phone_no: order.user.phone_no,
      //         name: order.user.name,
      //         role: order.user.role,
      //         household: order.user.household
      //           ? {
      //               address: order.user.household.address,
      //               town: order.user.household.town
      //                 ? {
      //                     town_name: order.user.household.town.town_name,
      //                   }
      //                 : {},
      //             }
      //           : {},
      //         created_at: order.user.created_at,
      //         updated_at: order.user.updated_at,
      //       }
      //     : {},
      //   newOrder: true,
      // };

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
            address: order.address.household,
            town: {
              town_name: order.address.town,
            },
          },
        },
        items: [], // You might want to modify this if items are sent separately
      };

      this.ordersList = JSON.parse(
        JSON.stringify([newOrder, ...this.ordersList])
      );
    },
  },
});
