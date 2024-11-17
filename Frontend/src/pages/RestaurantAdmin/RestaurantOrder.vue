<template>
  <div class="max-w-6xl mx-auto p-6 rounded-md">
    <div class="flex justify-between">
      <h1 class="text-2xl md:text-3xl font-bold mb-6">Restaurant Orders</h1>
      <div>
        <button @click="refreshOrders" class="button outline-none">
          Refresh
        </button>
      </div>
    </div>

    <div class="mb-6 relative">
      <div class="overflow-x-auto">
        <div class="flex gap-3 whitespace-nowrap min-w-min pb-2">
          <!-- Added whitespace-nowrap and min-w-min -->
          <button
            @click="selectedStatus = 'pending'"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 min-w-[120px]', // Added min-width
              selectedStatus === 'pending'
                ? 'bg-red-500 text-white'
                : 'border-2 border-red-500 text-red-500 hover:bg-red-50',
            ]"
          >
            New Orders
          </button>
          <button
            @click="selectedStatus = 'preparing'"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 min-w-[120px]', // Added min-width
              selectedStatus === 'preparing'
                ? 'bg-yellow-500 text-white'
                : 'border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-50',
            ]"
          >
            Preparing
          </button>
          <button
            @click="selectedStatus = 'delivered'"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 min-w-[120px]', // Added min-width
              selectedStatus === 'delivered'
                ? 'bg-green-500 text-white'
                : 'border-2 border-green-500 text-green-500 hover:bg-green-50',
            ]"
          >
            Delivered
          </button>
          <button
            @click="selectedStatus = 'cancelled'"
            :class="[
              'px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 min-w-[120px]', // Added min-width
              selectedStatus === 'cancelled'
                ? 'bg-blue-500 text-white'
                : 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
            ]"
          >
            Cancelled
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-lg">Loading orders...</div>
    <div v-else-if="error" class="text-lg text-red-500">
      Error loading orders: {{ error }}
    </div>
    <div v-else-if="ordersListSortedAndFiltered.length === 0" class="text-lg">
      No orders available.
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="order in ordersListSortedAndFiltered"
        :key="order.id"
        :class="[
          'p-4 relative bg-white shadow-md flex flex-col lg:max-w-[362px] min-h-[257px] rounded-lg transition-all duration-300',
          order.newOrder
            ? 'ring-2 ring-red-500 ring-offset-4 ring-offset-white scale-105'
            : '',
        ]"
      >
        <div
          v-if="order.newOrder"
          class="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg"
        >
          New
        </div>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold">Order ID: {{ order.id }}</h2>
            <p class="text-sm text-gray-500">
              Date: {{ formatDate(order.created_at) }}
            </p>
          </div>
          <p
            :class="{
              'bg-red-500 text-white text-sm rounded-full px-4 py-1 text-center':
                order.status === 'pending',
              'bg-yellow-500 text-white text-sm rounded-full px-4 py-1 text-center':
                order.status === 'preparing',
              'bg-green-500 text-white text-sm rounded-full px-4 py-1 text-center':
                order.status === 'delivered',
              'bg-blue-500 text-white text-sm rounded-full px-4 py-1 text-center':
                order.status === 'delivered',
            }"
          >
            {{ capitalize(order.status) }}
          </p>
        </div>

        <div class="flex items-center">
          <div class="flex-grow flex flex-col space-y-2 mb-8">
            <div class="text-sm">
              <strong>Name:</strong> {{ order.user.name || "No name" }}
            </div>
            <div class="text-sm">
              <strong>Phone:</strong>
              {{ order.user.phone_no || "No phone number" }}
            </div>
            <div class="text-sm">
              <strong>Address:</strong>
              {{ order.user.household?.address || "No Address" }},
              {{ order.user.household?.town?.town_name || "No Town Provided" }}
            </div>
          </div>
          <div class="text-right mb-4">
            <h3 class="text-sm">Total Price</h3>
            <p class="text-lg font-semibold">{{ order.total_price }}</p>
          </div>
        </div>

        <!-- <button
          @click="openModal(order)"
          class="button absolute outline-none top-[199px] md:left-[185px] text-white py-2 px-4 rounded-lg max-w-[154px] min-h-[42px]"
        >
          Proceed Order
        </button> -->

        <button
          @click="openModal(order)"
          class="button outline-none text-white py-2 px-4 rounded-lg max-w-[154px] min-h-[42px]"
        >
          Proceed Order
        </button>
      </div>
    </div>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md p-4 md:p-0"
    >
      <div
        class="w-full md:w-[800px] relative bg-[#FFFFFF] rounded-lg max-h-[90vh] overflow-hidden"
      >
        <!-- Modal Header -->
        <div
          class="bg-[#F3F4F6] w-full h-auto min-h-[56px] px-4 md:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div
            class="font-semibold text-lg md:text-xl flex items-center justify-between w-full md:w-auto"
          >
            <p>Order ID: {{ selectedOrder.id }}</p>
            <button @click="closeModal" class="md:hidden">
              <img src="/public/close-icon.svg" alt="close" />
            </button>
          </div>

          <!-- Status Buttons - Hidden on Mobile -->
          <div class="hidden md:inline-flex gap-4 items-center">
            <button
              @click="updateOrderStatus('pending')"
              :class="{
                'bg-red-500 text-white': selectedOrder.status === 'pending',
                'border-red-500 text-red-500':
                  selectedOrder.status !== 'pending',
              }"
              class="border-2 px-4 py-1 rounded-full text-center text-sm font-medium"
            >
              Pending
            </button>
            <button
              @click="updateOrderStatus('preparing')"
              :class="{
                'bg-yellow-500 text-white':
                  selectedOrder.status === 'preparing',
                'border-yellow-500 text-yellow-500':
                  selectedOrder.status !== 'preparing',
              }"
              class="border-2 px-4 py-1 rounded-full text-center text-sm font-medium"
            >
              Preparing
            </button>
            <button
              @click="updateOrderStatus('delivered')"
              :class="{
                'bg-green-500 text-white': selectedOrder.status === 'delivered',
                'border-green-500 text-green-500':
                  selectedOrder.status !== 'delivered',
              }"
              class="border-2 px-4 py-1 rounded-full text-center text-sm font-medium"
            >
              Delivered
            </button>

            <button
              @click="updateOrderStatus('cancelled')"
              :class="{
                'bg-blue-500 text-white': selectedOrder.status === 'cancelled',
                'border-blue-500 text-blue-500':
                  selectedOrder.status !== 'cancelled',
              }"
              class="border-2 px-4 py-1 rounded-full text-center text-sm font-medium"
            >
              Cancelled
            </button>
          </div>

          <button @click="closeModal" class="hidden md:block">
            <img src="/public/close-icon.svg" alt="close" />
          </button>
        </div>

        <!-- Customer Info Section -->
        <div class="px-4 md:px-6 py-4">
          <div
            class="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0"
          >
            <div class="flex gap-3 items-center">
              <p class="text-[#747474] text-sm">Name:</p>
              <p class="ml-3">{{ selectedOrder.user.name || "No Name" }}</p>
            </div>

            <div class="flex gap-3 items-center">
              <p class="text-[#747474] text-sm">Phone:</p>
              <p class="ml-3">{{ selectedOrder.user.phone_no }}</p>
            </div>
          </div>

          <div class="flex items-center mt-2">
            <p class="text-[#747474] text-sm">Address:</p>
            <p class="ml-3 text-sm">
              {{ selectedOrder.user.household?.address || "No Address" }},
              {{
                selectedOrder.user.household?.town?.town_name ||
                "No Town Provided"
              }}
            </p>
          </div>
        </div>

        <!-- Mobile Status Selector -->
        <div class="px-4 md:hidden mb-4">
          <select
            v-model="selectedOrder.status"
            @change="updateOrderStatus($event.target.value)"
            class="w-full p-3 border-2 rounded-lg focus:outline-none transition-colors duration-300"
            :class="{
              'border-red-500': selectedOrder.status === 'pending',
              'border-yellow-500': selectedOrder.status === 'preparing',
              'border-green-500': selectedOrder.status === 'delivered',
              'border-blue-500': selectedOrder.status === 'cancelled',
            }"
          >
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <!-- Order Items Section -->
        <div
          class="mt-4 px-4 md:px-6 overflow-y-auto"
          style="max-height: calc(90vh - 300px)"
        >
          <div v-if="selectedOrder.items.length > 0">
            <div
              v-for="item in selectedOrder.items"
              :key="item.id"
              class="relative mb-4 p-4 bg-[#E5E7EB] rounded-lg"
            >
              <div class="flex flex-col md:flex-row gap-4">
                <!-- Product Image -->
                <div class="flex-shrink-0">
                  <img
                    :src="item.product.image_url"
                    alt="No image"
                    class="w-full md:w-[100px] h-[100px] object-contain rounded-lg"
                  />
                </div>

                <!-- Product Details -->
                <div class="space-y-2 flex-grow">
                  <p class="text-lg font-semibold">{{ item.product.title }}</p>
                  <p class="text-sm">
                    Description:
                    <span class="ml-2 text-[#6d6d6d]">{{
                      item.product.description
                    }}</span>
                  </p>
                  <p class="text-sm">
                    Type:
                    <span class="ml-2 text-[#6d6d6d]">{{
                      item.product.type
                    }}</span>
                  </p>
                  <p class="text-sm">
                    Quantity:
                    <span class="ml-2 text-[#6d6d6d]">{{ item.quantity }}</span>
                  </p>
                </div>

                <!-- Price -->
                <div class="mt-2 md:mt-0 text-right">
                  <p class="text-lg md:text-xl font-semibold">
                    Price: {{ item.price }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No items in this order.</p>
          </div>
        </div>

        <!-- Total Price Section -->
        <div class="px-4 md:px-6 py-4 bg-white sticky bottom-0 shadow-top">
          <div class="flex justify-between items-center">
            <div></div>
            <div
              class="py-3 px-4 bg-[#272727] text-white rounded-lg flex gap-4 md:gap-10 items-center justify-center w-full md:w-auto"
            >
              <h1 class="text-sm md:text-base">Total Price:</h1>
              <h1 class="text-sm md:text-base">
                {{ selectedOrder.total_price }}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useOrderStore } from "../../store/orderStore"; // Adjust the path accordingly
import { toast } from "vue3-toastify";
import { storeToRefs } from "pinia";

const orderStore = useOrderStore();
const { ordersList } = storeToRefs(useOrderStore());
const loading = ref(true);
const error = ref(null);
const isModalOpen = ref(false);
const selectedOrder = ref(null);
const selectedStatus = ref("pending");

const I = new Audio("/notification.mp3");
I.volume = 0.25;

const ordersListSortedAndFiltered = computed(() => {
  return [...ordersList.value]
    .map((order) => ({
      ...order,
      newOrderStatus: order.status, // Track initial status
    }))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .filter((order) => {
      if (!!!selectedStatus.value) return true;

      return order.status === selectedStatus.value;
    });
});

const fetchRestaurantOrders = async () => {
  try {
    await orderStore.getRestaurantOrders();
  } catch (err) {
    error.value = "Failed to fetch orders";
    console.error("Error fetching restaurant orders:", err);
  } finally {
    loading.value = false;
  }
};

// Function to update order status
const updateOrderStatus = async (status) => {
  try {
    await orderStore.updateStatus(selectedOrder.value.id, status);
    closeModal();
  } catch (err) {
    console.error("Error updating order status:", err);
  }
};

// Function to format date
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

// Function to capitalize text
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// Function to refresh orders
const refreshOrders = async () => {
  await fetchRestaurantOrders();
};

// Function to open modal
const openModal = (order) => {
  selectedOrder.value = order;
  isModalOpen.value = true;
};

// Function to close modal
const closeModal = () => {
  isModalOpen.value = false;
  selectedOrder.value = null;
};

// Watch for changes in selectedStatus and fetch new orders if needed
watch(selectedStatus, async () => {
  await fetchRestaurantOrders();
});

// Set up WebSocket connection on mounted
onMounted(async () => {
  await fetchRestaurantOrders();
});
</script>

<style scoped></style>
