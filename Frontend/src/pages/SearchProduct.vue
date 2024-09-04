<template>
  <div class="mobile-spacing">
    <!-- Search Bar -->
    <div class="mb-4 flex">
      <input
        type="text"
        placeholder="Search here"
        class="w-full h-12 border-2 px-4 rounded-l focus:outline-none"
        v-model="searchQuery"
        @input="handleSearch"
      />
      <!-- Search Button -->
      <button
        @click="handleSearch"
        class="h-12 px-4 bg-yellow-500 text-white font-semibold rounded-r"
      >
        Search
      </button>
    </div>

    <!-- Product Grid or Skeleton Loader -->
    <div v-if="isLoading" class="grid grid-cols-2 gap-4">
      <!-- Skeleton loader for each product card -->
      <div
        v-for="n in 6"
        :key="n"
        class="bg-slate-100 rounded flex flex-col items-center py-4 animate-pulse"
      >
        <div class="w-[120px] h-[120px] bg-gray-300 rounded"></div>
        <div class="w-3/4 h-4 mt-2 bg-gray-300 rounded"></div>
        <div class="flex w-full justify-between items-center px-4 mt-2">
          <div class="w-1/3 h-4 bg-gray-300 rounded"></div>
          <div class="w-1/4 h-4 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Product Grid -->
    <div v-else class="grid grid-cols-2 gap-4">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="bg-slate-100 rounded flex flex-col items-center py-4"
      >
        <div class="max-w-[120px] min-h-[120px]">
          <img
            :src="product.image_url"
            alt="Product image"
            class="object-contain"
          />
        </div>
        <h1 class="text-center font-semibold !leading-tight">
          {{ product.title }}
        </h1>
        <div class="flex w-full justify-between items-center px-4 mt-2">
          <div class="flex items-center space-x-1">
            <img src="/shop_icon.png" alt="" class="w-3 h-3" />
            <p class="text-sm text-yellow-500 text-[12px]">
              {{ product.business.name }}
            </p>
          </div>
          <p class="font-semibold text-sm">RS: {{ product.price }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const searchQuery = ref("");
const products = ref([]);
const isLoading = ref(false);

const fetchProducts = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/api/products`, {
      params: { search: searchQuery.value },
    });
    products.value = response.data.data;
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    isLoading.value = false;
  }
};

const filteredProducts = computed(() =>
  products.value.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

const handleSearch = () => {
  fetchProducts();
};

fetchProducts();
</script>

<style scoped>
.animate-pulse {
  animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
