<template>
  <div class="mobile-spacing">
    <div class="relative mt-2">
      <!-- Back Arrow Button -->

      <!-- Orders Title and Refresh Button -->
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
      class="max-w-full min-h-[87px] mt-3 bg-gray-200 rounded-lg flex mobile-spacing justify-between items-center"
    >
      <div>
        <div>
          <h1 class="font-semibold">Order ID: {{ order.id }}</h1>
          <p class="text-[12px] text-[#272727]/60">
            {{ formatDate(order.created_at) }}
          </p>
        </div>
        <div>
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
        </div>
      </div>

      <div>
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
        <h1 class="text-lg font-semibold mt-1">
          Price: {{ order.total_price }}
        </h1>
      </div>
    </div>
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

<style lang="scss" scoped></style>
