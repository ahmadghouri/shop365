<template>
  <div>
    <!-- Loading Spinner -->
    <div
      v-if="loading"
      class="flex justify-center items-center h-screen bg-gray-100"
    >
      <div
        class="animate-spin rounded-full h-14 w-14 border-t-2 border-yellow-500"
      ></div>
    </div>

    <!-- Business Stats Section -->
    <div
      v-else
      class="container mx-auto md:py-10 md:px-8 mobile-spacing min-h-screen bg-gray-50"
    >
      <!-- Page Title -->
      <h1
        class="text-4xl font-light text-center mb-12 text-gray-800 tracking-wide"
      >
        Business Statistics
      </h1>

      <!-- Filter Options -->
      <div class="text-center mb-8">
        <button
          @click="applyFilter('all')"
          :class="{
            'bg-blue-500 text-white': selectedFilter === 'all',
            'bg-gray-100 text-gray-700': selectedFilter !== 'all',
          }"
          class="py-2 px-4 rounded-md mx-2"
        >
          All Time
        </button>
        <button
          @click="applyFilter('today')"
          :class="{
            'bg-blue-500 text-white': selectedFilter === 'today',
            'bg-gray-100 text-gray-700': selectedFilter !== 'today',
          }"
          class="py-2 px-4 rounded-md mx-2"
        >
          Today
        </button>
        <button
          @click="applyFilter('week')"
          :class="{
            'bg-blue-500 text-white': selectedFilter === 'week',
            'bg-gray-100 text-gray-700': selectedFilter !== 'week',
          }"
          class="py-2 px-4 rounded-md mx-2"
        >
          Last Week
        </button>
        <button
          @click="applyFilter('month')"
          :class="{
            'bg-blue-500 text-white': selectedFilter === 'month',
            'bg-gray-100 text-gray-700': selectedFilter !== 'month',
          }"
          class="py-2 px-4 rounded-md mx-2"
        >
          Last Month
        </button>
      </div>

      <!-- Conditional Rendering for No Data -->
      <div v-if="businesses.length === 0" class="text-center text-gray-600">
        <p>No sales data available for this period.</p>
      </div>

      <!-- Business Stats Cards -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        <!-- Business Stat Card -->
        <div
          v-for="business in businesses"
          :key="business.id"
          class="p-8 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
        >
          <h2 class="text-2xl font-semibold mb-3 text-gray-800">
            {{ business.name }}
          </h2>
          <div class="flex flex-col space-y-2">
            <div class="text-gray-600">
              <span class="font-semibold text-gray-900">Total Orders:</span>
              <span class="ml-2">{{ business.total_orders }}</span>
            </div>
            <div class="text-gray-600">
              <span class="font-semibold text-gray-900">Total Revenue:</span>
              <span class="ml-2"
                >PKR {{ business.total_revenue.toLocaleString() }}</span
              >
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

// State to store business stats, loading state, and selected filter
const businesses = ref([]);
const loading = ref(true);
const selectedFilter = ref("all");

// Fetch the token from local storage
const token = localStorage.getItem("token");

// Function to fetch business stats from API
const fetchBusinessStats = async (filter = "all") => {
  loading.value = true;
  try {
    const response = await axios.get(
      `http://localhost:8000/api/admin/business-stats?filter=${filter}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    businesses.value = response.data.data;
  } catch (error) {
    console.error("Error fetching business stats:", error);
  } finally {
    loading.value = false;
  }
};

// Function to apply filter
const applyFilter = (filter) => {
  selectedFilter.value = filter;
  fetchBusinessStats(filter);
};

// Fetch the data on component mount with default 'all' filter
onMounted(() => {
  fetchBusinessStats();
});
</script>

<style scoped>
/* Minimal Loading Spinner */

.hover\:scale-105:hover {
  transform: scale(1.05);
}
</style>
