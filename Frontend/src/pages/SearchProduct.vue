<template>
  <div class="mobile-spacing lg:mt-4 lg:px-32">
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
    <div v-if="isLoading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

    <!-- No Products Message -->
    <div
      v-if="!isLoading && filteredProducts.length === 0"
      class="text-center text-gray-600 mt-4"
    >
      <p>No products are available at the moment.</p>
    </div>

    <!-- Product Grid -->
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        :class="[
          'bg-slate-100 rounded flex flex-col items-center py-4 cursor-pointer transition-opacity duration-300',
          !isOpen(product.business.opening_time, product.business.closing_time)
            ? 'opacity-50 pointer-events-none'
            : '',
        ]"
        @click="handleProductClick(product)"
      >
        <div
          class="w-[120px] h-[120px] overflow-hidden rounded-md flex justify-center items-center"
        >
          <img
            :src="product.image_url"
            alt="Product image"
            class="w-full h-full object-contain"
          />
        </div>
        <h1
          class="text-lg text-center font-semibold text-slate-800 mb-2 truncate w-[150px]"
        >
          {{ product.title }}
        </h1>
        <div class="flex w-full justify-between items-center px-4 mt-2">
          <div class="flex items-center space-x-1">
            <img src="/shop_icon.png" alt="" class="w-3 h-3" />
            <p class="text-yellow-500 text-[12px]">
              {{ product.business.name.split(" ")[0] }}
            </p>
          </div>
          <p class="font-semibold text-sm">RS: {{ product.price }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";
import moment from "moment-timezone";
import { productApi } from "@/api/modules/product.api";
import { useRouter } from "vue-router";

const searchQuery = ref("");
const route = useRouter();

// TanStack Query - reactive search
const { data: products, isLoading } = useQuery({
  queryKey: ["searchProducts", searchQuery],
  queryFn: () => productApi.getAll({ search: searchQuery.value }).then((r) => r.data.data || []),
  enabled: computed(() => searchQuery.value.length > 0),
});

const fetchProducts = () => {}; // kept for template @submit compatibility

const filteredProducts = computed(() =>
  (products.value || []).filter(
    (product) =>
      isOpen(product.business?.opening_time, product.business?.closing_time) &&
      product.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

const isOpen = (openingTime, closingTime) => {
  if (!openingTime || !closingTime) return true;

  const timezone = "Asia/Karachi";
  const currentTime = moment().tz(timezone);
  const parseTime = (time) => moment.tz(time, ["HH:mm", "HH:mm:ss", "hh:mm:ssA"], timezone);

  const open = parseTime(openingTime);
  let close = parseTime(closingTime);

  if (close.isBefore(open)) {
    close.add(1, "day");
  }

  return currentTime.isAfter(open) && currentTime.isBefore(close);
};

const handleSearch = () => {
  fetchProducts();
};

const handleProductClick = (product) => {
  if (isOpen(product.business.opening_time, product.business.closing_time)) {
    goToProductDetail(product.id);
  }
};

const goToProductDetail = (productId) => {
  route.push(`/home/product/${productId}`);
  console.log("Navigating to product detail page for product:", productId);
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
