<template>
  <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <h1 class="text-3xl font-bold mb-6">Restaurant Orders</h1>

    <div v-if="loading" class="text-lg">Loading orders...</div>
    <div v-else-if="error" class="text-lg text-red-500">
      Error loading orders: {{ error }}
    </div>
    <div v-else-if="orders.length === 0" class="text-lg">
      No orders available.
    </div>

    <div
      v-for="order in orders"
      :key="order.id"
      class="mb-8 p-6 rounded-lg shadow-sm transition-transform transform hover:scale-105"
      :class="{ 'bg-blue-100 border-l-4 border-blue-500': isNewOrder(order) }"
    >
      <h2 class="text-2xl font-semibold mb-4">Order ID: {{ order.id }}</h2>

      <div class="lg:flex gap-10">
        <section class="mb-4">
          <h3 class="text-xl font-semibold mb-2">User Information</h3>
          <p class="text-md">
            <strong>Name:</strong> {{ order.user.name || "No name" }}
          </p>
          <p class="text-md">
            <strong>Phone:</strong> {{ order.user.phone_no }}
          </p>
          <p class="text-md">
            <strong>Address:</strong>
            {{ order.user.household?.address || "No Address" }},
            {{ order.user.household?.town?.town_name || "No Town Provided" }}
          </p>
        </section>
        <section class="mb-4">
          <h3 class="text-xl font-semibold mb-2">Order Information</h3>
          <p class="text-md">
            <strong>Total Price:</strong> {{ order.total_price }}
          </p>
          <p class="text-md">
            <strong>Status:</strong>
            <select
              v-model="order.status"
              @change="updateOrderStatus(order)"
              class="px-3 py-1 rounded-lg border border-gray-300"
            >
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="delivered">Delivered</option>
            </select>
          </p>
          <p class="text-md">
            <strong>Placed At:</strong> {{ formatDate(order.created_at) }}
          </p>
        </section>
      </div>
      <section>
        <h3 class="text-xl font-semibold mb-2">Order Items</h3>
        <div
          v-for="item in order.items"
          :key="item.id"
          class="flex items-center mb-4 p-4 bg-gray-200 rounded-lg shadow-sm"
        >
          <img
            :src="item.product.image_url"
            alt="Product Image"
            class="w-24 h-24 object-cover rounded-lg mr-4"
          />
          <div class="flex-1">
            <h4 class="text-lg font-medium mb-1">{{ item.product.title }}</h4>
            <p class="text-md mb-1">
              <strong>Description:</strong> {{ item.product.description }}
            </p>
            <p class="text-md mb-1">
              <strong>Type:</strong> {{ item.product.type }}
            </p>
            <p class="text-md mb-1"><strong>Price:</strong> {{ item.price }}</p>
            <p class="text-md">
              <strong>Quantity:</strong> {{ item.quantity }}
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useOrderStore } from "../../store/orderStore"; // Adjust the path as needed
import Echo from "laravel-echo";
import Pusher from "pusher-js";

const orderStore = useOrderStore();
const orders = ref([]);
const loading = ref(true);
const error = ref(null);
let intervalId = null;

const fetchRestaurantOrders = async () => {
  try {
    await orderStore.getRestaurantOrders();
    orders.value = orderStore.orderDetails.map((order) => ({
      ...order,
      newOrderStatus: order.status, // Track initial status
    }));
    orders.value.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  } catch (err) {
    error.value = "Failed to fetch orders";
    console.error("Error fetching restaurant orders:", err);
  } finally {
    loading.value = false;
  }
};

const updateOrderStatus = async (order) => {
  try {
    await orderStore.updateOrderStatus(order.id, order.status);
    await fetchRestaurantOrders();
  } catch (err) {
    console.error("Error updating order status:", err);
  }
};

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const isNewOrder = (order) => {
  return order.status === order.newOrderStatus && isOrderRecentlyCreated(order);
};

const isOrderRecentlyCreated = (order) => {
  const now = new Date();
  const orderDate = new Date(order.created_at);
  const diffInMinutes = (now - orderDate) / (1000 * 60);
  return diffInMinutes < 30;
};

onMounted(() => {
  fetchRestaurantOrders();
});

onUnmounted(() => {
  // Clear interval when component is unmounted
  if (intervalId) {
    clearInterval(intervalId);
  }
});
</script>

<style scoped>
.bg-blue-100 {
  background-color: #ebf8ff;
}
.border-blue-500 {
  border-color: #4299e1;
}
</style>
