<template>
  <div>
    <!-- Loading Spinner -->
    <div v-if="loading" class="flex justify-center items-center h-screen bg-gray-100">
      <div class="animate-spin rounded-full h-14 w-14 border-t-2 border-yellow-500"></div>
    </div>

    <!-- Business Stats Section -->
    <div v-else class="container mx-auto py-6 px-4 sm:py-10 sm:px-8 mobile-spacing min-h-screen bg-gray-50">
      <!-- Page Title -->
      <h1 class="text-2xl sm:text-4xl font-light text-center mb-8 sm:mb-12 text-gray-800 tracking-wide">
        Business Statistics
      </h1>

      <!-- Filter Options -->
      <div class="text-center mb-6 sm:mb-8">
        <button @click="applyFilter('all')" :class="{
          'bg-blue-500 text-white': selectedFilter === 'all',
          'bg-gray-100 text-gray-700': selectedFilter !== 'all',
        }" class="py-2 px-3 sm:px-4 rounded-md mx-1 sm:mx-2 text-sm sm:text-base">
          All Time
        </button>
        <button @click="applyFilter('today')" :class="{
          'bg-blue-500 text-white': selectedFilter === 'today',
          'bg-gray-100 text-gray-700': selectedFilter !== 'today',
        }" class="py-2 px-3 sm:px-4 rounded-md mx-1 sm:mx-2 text-sm sm:text-base">
          Today
        </button>
        <button @click="applyFilter('week')" :class="{
          'bg-blue-500 text-white': selectedFilter === 'week',
          'bg-gray-100 text-gray-700': selectedFilter !== 'week',
        }" class="py-2 px-3 sm:px-4 rounded-md mx-1 sm:mx-2 text-sm sm:text-base">
          Last Week
        </button>
        <button @click="applyFilter('month')" :class="{
          'bg-blue-500 text-white': selectedFilter === 'month',
          'bg-gray-100 text-gray-700': selectedFilter !== 'month',
        }" class="py-2 px-3 sm:px-4 rounded-md mx-1 sm:mx-2 text-sm sm:text-base">
          Last Month
        </button>
      </div>

      <!-- Conditional Rendering for No Data -->
      <div v-if="businesses.length === 0" class="text-center text-gray-600">
        <p>No sales data available for this period.</p>
      </div>

      <!-- Business Stats Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
        <!-- Business Stat Card -->
        <div v-for="business in businesses" :key="business.id" @click="showBusinessOrders(business.id)"
          class="p-6 sm:p-8 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 cursor-pointer">
          <h2 class="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3 text-gray-800">
            {{ business.name }}
          </h2>
          <div class="flex flex-col space-y-1 sm:space-y-2">
            <div class="text-gray-600">
              <span class="font-semibold text-gray-900">Total Orders:</span>
              <span class="ml-1 sm:ml-2">{{ business.total_orders }}</span>
            </div>
            <div class="text-gray-600">
              <span class="font-semibold text-gray-900">Total Revenue:</span>
              <span class="ml-1 sm:ml-2">PKR {{ business.total_revenue.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Orders Modal -->
      <!-- container mx-auto py-6 px-4 sm:py-10 sm:px-8 mobile-spacing min-h-screen
      bg-gray-50 -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
        <div
          class="bg-white rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 opacity-100"
          :class="modalAnimation">
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div class="flex justify-between items-center">
              <h2 class="text-3xl font-bold tracking-wide">Todays Orders</h2>
              <button @click="closeModal"
                class="text-white hover:text-gray-200 transition-colors duration-300 text-2xl">
                ✕
              </button>
            </div>
          </div>

          <!-- Orders List Container -->
          <div class="p-6 overflow-y-auto max-h-[60vh]">
            <!-- No Orders State -->
            <div v-if="orderStore.adminOrders.length === 0" class="text-center py-12 animate-fade-in">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-24 w-24 mx-auto text-gray-300 mb-4" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <p class="text-xl text-gray-500">
                No orders found for this business.
              </p>
            </div>

            <!-- Orders List -->
            <div v-else class="space-y-4">
              <div v-for="(order, index) in orderStore.adminOrders" :key="order.id"
                class="border-l-4 border-blue-500 bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-all duration-300 transform hover:translate-x-2">
                <div class="flex justify-between items-start">
                  <div>
                    <div class="flex items-center mb-2">
                      <span class="font-bold text-lg text-gray-800 mr-3">
                        Order #{{ order.id }}
                      </span>
                      <span :class="{
                        'bg-yellow-100 text-yellow-800':
                          order.status === 'pending',
                        'bg-green-100 text-green-800':
                          order.status === 'completed',
                        'bg-blue-100 text-blue-800':
                          order.status === 'processing',
                      }" class="px-2 py-1 rounded-full text-xs uppercase font-semibold tracking-wide">
                        {{ order.status }}
                      </span>
                    </div>

                    <div class="text-gray-600 space-y-1">
                      <p>
                        <strong class="text-gray-800">Total:</strong>
                        PKR {{ order.total_price.toLocaleString() }}
                      </p>
                      <p>
                        <strong class="text-gray-800">Customer:</strong>
                        {{ order.user.name }}
                      </p>
                      <p>
                        <strong class="text-gray-800">Contact:</strong>
                        {{ order.user.phone_no }}
                      </p>
                      <p class="text-sm text-gray-500">
                        {{ new Date(order.created_at).toLocaleString() }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Order Items -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <p class="text-sm font-semibold text-gray-700 mb-2">
                    Order Items:
                  </p>
                  <div v-for="item in order.items" :key="item.id" class="flex justify-between text-sm py-1">
                    <span>
                      {{ item.product.title }}
                      <span class="text-gray-500">x {{ item.quantity }}</span>
                    </span>
                    <span class="font-semibold text-gray-800">
                      PKR {{ item.price.toLocaleString() }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useOrderStore } from "../../store/orderStore";
import { API_BASE_URL } from "../../config/api";

// State
const businesses = ref([]);
const loading = ref(true);
const selectedFilter = ref("all");
const showModal = ref(false);
const orderStore = useOrderStore();

// Functions
const fetchBusinessStats = async (filter = "all") => {
  loading.value = true;
  try {
    const response = await axios.get(
      `${API_BASE_URL}/api/admin/business-stats?filter=${filter}`
    );
    businesses.value = response.data.data;
  } catch (error) {
    console.error("Error fetching business stats:", error);
  } finally {
    loading.value = false;
  }
};

const applyFilter = (filter) => {
  selectedFilter.value = filter;
  fetchBusinessStats(filter);
};

const showBusinessOrders = async (businessId) => {
  try {
    await orderStore.getAdminOrders(businessId);
    orderStore.adminOrders.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
    showModal.value = true;
  } catch (error) {
    console.error("Error fetching business orders:", error);
  }
};

const closeModal = () => {
  showModal.value = false;
};

// Fetch initial data
onMounted(() => {
  fetchBusinessStats();
});
</script>

<style scoped>
.hover\:scale-105:hover {
  transform: scale(1.05);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
</style>
