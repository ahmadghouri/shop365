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

    <div class="mb-6">
      <label class="mr-4">Filter by status:</label>
      <select v-model="selectedStatus" class="p-2 border rounded">
        <option value="">All</option>
        <option value="pending">Pending</option>
        <option value="preparing">Preparing</option>
        <option value="delivered">Delivered</option>
      </select>
    </div>

    <div v-if="loading" class="text-lg">Loading orders...</div>
    <div v-else-if="error" class="text-lg text-red-500">
      Error loading orders: {{ error }}
    </div>
    <div v-else-if="filteredOrders.length === 0" class="text-lg">
      No orders available.
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="order in filteredOrders"
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

        <button
          @click="openModal(order)"
          class="button absolute outline-none top-[199px] md:left-[185px] text-white py-2 px-4 rounded-lg max-w-[154px] min-h-[42px]"
        >
          Proceed Order
        </button>
      </div>
    </div>

    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md mobile-spacing"
    >
      <div class="w-[800px] relative bg-[#FFFFFF] rounded-lg">
        <div
          class="bg-[#F3F4F6] w-full h-[56px] px-6 py-4 flex items-center justify-between"
        >
          <div class="font-semibold text-xl">
            <p>Order ID: {{ selectedOrder.id }}</p>
          </div>

          <div class="inline-flex gap-4 items-center">
            <button
              @click="updateOrderStatus('pending')"
              :class="{
                'bg-red-500 text-white': selectedOrder.status === 'pending',
                'border-red-500 text-red-500':
                  selectedOrder.status !== 'pending',
              }"
              class="border-2 px-4 py-1 rounded-full text-center text-sm font-medium hidden md:block"
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
              class="border-2 px-4 py-1 rounded-full text-center text-sm font-medium hidden md:block lg:block"
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
              class="border-2 px-4 py-1 rounded-full text-center text-sm font-medium hidden md:block"
            >
              Delivered
            </button>
          </div>

          <div>
            <button @click="closeModal">
              <img src="/public/close-icon.svg" alt="" />
            </button>
          </div>
        </div>

        <div class="px-6 py-4">
          <div class="flex justify-between items-center">
            <div class="flex gap-3 items-center">
              <p class="text-[#747474] text-sm">Name:</p>
              <p class="ml-3">{{ selectedOrder.user.name || "No Name" }}</p>
            </div>

            <div class="flex gap-3 items-center">
              <p class="text-[#747474] text-sm">Phone:</p>
              <p class="ml-3">{{ selectedOrder.user.phone_no }}</p>
            </div>
          </div>

          <div class="flex items-center">
            <p class="text-[#747474] text-sm">Address:</p>
            <p class="ml-3">
              {{ selectedOrder.user.household?.address || "No Address" }},
              {{
                selectedOrder.user.household?.town?.town_name ||
                "No Town Provided"
              }}
            </p>
          </div>
        </div>

        <!-- for mobile only -->
        <!-- <div class="px-7 md:hidden lg:hidden">
          <select
            :class="`p-2 border-2 rounded focus:outline-none transition-colors duration-300 ${borderColor}`"
            class="bg-white text-gray-700"
          >
            <option value="" disabled selected>Select</option>
            <option
              value=""
              @click="updateOrderStatus('pending')"
              class="hover:bg-red-500 focus:bg-red-500 focus:text-white"
            >
              Pending
            </option>
            <option
              value=""
              @click="updateOrderStatus('preparing')"
              class="hover:bg-yellow-500 focus:bg-yellow-500 focus:text-white"
            >
              Preparing
            </option>
            <option
              value=""
              @click="updateOrderStatus('delivered')"
              class="hover:bg-green-500 focus:bg-green-500 focus:text-white"
            >
              Delivered
            </option>
          </select>
        </div> -->

        <div class="px-7 md:hidden lg:hidden">
          <select
            :class="`p-2 border-2 rounded focus:outline-none transition-colors duration-300 ${borderColor}`"
            class="bg-white text-gray-700"
            @change="updateOrderStatus($event.target.value)"
          >
            <option value="" disabled selected>Select</option>
            <option
              value="pending"
              class="hover:bg-red-500 focus:bg-red-500 focus:text-white"
            >
              Pending
            </option>
            <option
              value="preparing"
              class="hover:bg-yellow-500 focus:bg-yellow-500 focus:text-white"
            >
              Preparing
            </option>
            <option
              value="delivered"
              class="hover:bg-green-500 focus:bg-green-500 focus:text-white"
            >
              Delivered
            </option>
          </select>
        </div>

        <div class="mt-8 px-6 py-4 overflow-y-auto h-[400px]">
          <div v-if="selectedOrder.items.length > 0">
            <div
              v-for="item in selectedOrder.items"
              :key="item.id"
              class="relative mb-4 p-4 bg-[#E5E7EB] rounded-lg flex justify-between items-center"
            >
              <!-- Product Image and Details Row -->
              <div class="flex items-center gap-4">
                <!-- Product Image -->
                <div class="flex-shrink-0">
                  <img
                    :src="item.product.image_url"
                    alt="No image"
                    class="w-[100px] h-[100px] object-contain rounded-lg"
                  />
                </div>

                <!-- Product Details -->
                <div class="space-y-2">
                  <p class="text-lg md:text-xl font-semibold">
                    {{ item.product.title }}
                  </p>
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
              </div>

              <!-- Price in Lower Right Corner -->
              <div class="absolute bottom-4 right-4 text-right">
                <p class="text-lg md:text-2xl font-semibold">
                  Price: {{ item.price }}
                </p>
              </div>
            </div>
          </div>
          <div v-else>
            <p>No items in this order.</p>
          </div>
        </div>

        <div class="flex justify-between px-6 py-4">
          <div></div>
          <div
            class="py-4 px-4 flex gap-10 bg-[#272727] text-white rounded-lg min-h-[56px] shrink-0 items-start justify-center max-w-[200px]"
          >
            <h1>Total Price:</h1>
            <h1>{{ selectedOrder.total_price }}</h1>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useOrderStore } from "../../store/orderStore"; // Adjust the path accordingly
import "../../echo.config";
import { toast } from "vue3-toastify";

const orderStore = useOrderStore();
const orders = ref([]);
const loading = ref(true);
const error = ref(null);
const isModalOpen = ref(false);
const selectedOrder = ref(null);
const selectedStatus = ref("pending");

// Function to fetch orders from the server
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

const borderColor = computed(() => {
  switch (selectedStatus.value) {
    case "pending":
      return "border-red-500";
    case "preparing":
      return "border-yellow-500";
    case "delivered":
      return "border-green-500";
    default:
      return "border-gray-300";
  }
});

const handleNewOrder = (event) => {
  if (!event || !event.mergedData) {
    console.error("Merged data is missing in event:", event);
    return;
  }

  const { order, items, audioUrl } = event.mergedData;

  if (!order) {
    console.error("Order data is missing in mergedData:", event.mergedData);
    return;
  }

  const transformedOrder = {
    id: order.id,
    user_id: order.user_id,
    total_price: order.total_price,
    status: order.status,
    created_at: order.created_at,
    updated_at: order.updated_at,
    items: items
      ? items.map((item) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          price: item.price,
          quantity: item.quantity,
          created_at: item.created_at,
          updated_at: item.updated_at,
          product: {
            id: item.product.id,
            title: item.product.title,
            description: item.product.description,
            price: item.product.price,
            image: item.product.image,
            image_url: item.product.image_url,
            type: item.product.type,
            created_at: item.product.created_at,
            updated_at: item.product.updated_at,
          },
        }))
      : [],
    user: order.user
      ? {
          id: order.user.id,
          phone_no: order.user.phone_no,
          name: order.user.name,
          role: order.user.role,
          household: {
            address: order.user.household.address,
            town: {
              town_name: order.user.household.town.town_name,
            },
          },
          created_at: order.user.created_at,
          updated_at: order.user.updated_at,
        }
      : {},
    newOrder: true,
  };

  console.log(transformedOrder);

  orders.value = [transformedOrder, ...orders.value];
};

// Function to update order status
const updateOrderStatus = async (status) => {
  try {
    await orderStore.updateStatus(selectedOrder.value.id, status);
    orders.value = orders.value.map((order) =>
      order.id === selectedOrder.value.id ? { ...order, status } : order
    );
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

const filteredOrders = computed(() => {
  if (selectedStatus.value === "") return orders.value;
  return orders.value.filter((order) => order.status === selectedStatus.value);
});

// Watch for changes in selectedStatus and fetch new orders if needed
watch(selectedStatus, async () => {
  await fetchRestaurantOrders();
});

// Set up WebSocket connection on mounted
onMounted(async () => {
  await fetchRestaurantOrders();
  console.log(window.Echo);

  if (window.Echo) {
    window.Echo.channel("order-channel." + orderStore.businessId)
      .listen("OrderPlaced", (event) => {
        handleNewOrder(event);
        console.log(event);

        toast.success("New Order Received");
      })
      .error((error) => {
        console.error("Echo error:", error);
      });
  } else {
    console.error("Echo instance is not defined");
  }
});
</script>

<style scoped></style>
