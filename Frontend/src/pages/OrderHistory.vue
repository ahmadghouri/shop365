<template>
  <!-- Main Container -->
  <div class="mobile-spacing lg:px-32" v-if="orderDetails.length > 0">
    <div class="relative mt-2">
      <!-- Back Arrow Button and Refresh Button -->
      <div class="flex justify-between items-center">
        <button @click="goBack" class="">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4 text-gray-700 hover:text-gray-900"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h1 class="text-center text-xl font-semibold">Orders</h1>
        <button
          @click="refreshOrders"
          class="bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>
    </div>

    <!-- Orders List -->
    <div
      v-for="order in orderDetails"
      :key="order.id"
      class="max-w-full mt-6 bg-gray-200 rounded-lg p-4"
    >
      <div class="flex justify-between items-center mb-4">
        <div>
          <h1 class="font-semibold">Order ID: {{ order.id }}</h1>
          <p class="text-[12px] text-[#272727]/60">
            {{ formatDate(order.created_at) }}
          </p>
        </div>

        <div
          :class="{
            'bg-red-500 text-white text-sm rounded-full px-4 py-1 text-center':
              order.status === 'pending',
            'bg-yellow-500 text-white text-sm rounded-full px-4 py-1 text-center':
              order.status === 'preparing',
            'bg-green-500 text-white text-sm rounded-full px-4 py-1 text-center':
              order.status === 'delivered',
          }"
        >
          {{ order.status }}
        </div>
      </div>

      <p
        :class="{
          'text-[12px] font-semibold text-red-500 italic':
            order.status === 'pending',
          'text-[12px] font-semibold text-yellow-500 italic':
            order.status === 'preparing',
          'text-[12px] font-semibold text-green-500 italic':
            order.status === 'delivered',
        }"
      >
        {{ getOrderStatusMessage(order.status) }}
      </p>

      <div class="mt-2 border-t border-gray-200">
        <p class="text-sm font-semibold text-gray-700">Order Items:</p>
        <div
          v-for="item in order.items"
          :key="item.id"
          class="flex justify-between text-sm py-1"
        >
          <span>
            {{ item.product.title }}
            <span class="text-gray-500">x {{ item.quantity }}</span>
          </span>
          <span class="font-semibold text-gray-800">
            PKR {{ (item.price * item.quantity).toLocaleString() }}
          </span>
        </div>
      </div>

      <div class="mt-2 text-right">
        <h1 class="text-lg font-semibold">
          Total Price: PKR {{ order.total_price.toLocaleString() }}
        </h1>
      </div>
    </div>
  </div>

  <!-- Loading Spinner -->
  <div v-else class="flex justify-center items-center h-screen bg-gray-100">
    <div
      class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"
    ></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useOrderStore } from "../store/orderStore";

const orderDetails = ref([]);
const orderStore = useOrderStore();
const router = useRouter();

async function getOrderDetails() {
  try {
    await orderStore.getOrderDetails();
    orderDetails.value = orderStore.userOrderDetails;

    orderDetails.value.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  } catch (error) {
    console.error(error);
  }
}

async function refreshOrders() {
  await getOrderDetails();
}

onMounted(async () => {
  await getOrderDetails();
});

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

const getOrderStatusMessage = (status) => {
  if (status === "pending") {
    return "Estimated Delivery in 45-50 minutes";
  } else if (status === "preparing") {
    return "Estimated Delivery in 30 minutes";
  } else if (status === "delivered") {
    return "Enjoy your meal";
  } else {
    return "";
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped></style>
