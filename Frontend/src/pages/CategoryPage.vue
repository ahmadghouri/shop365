<template>
  <div class="mobile-spacing lg:mt-4 lg:px-32">
    <!-- Category Title -->
    <div class="relative mb-6">
      <button
        @click="goBack"
        class="absolute left-0 top-1/2 transform -translate-y-1/2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 text-gray-800 hover:text-gray-500 transition duration-150"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <h1
        class="text-2xl font-bold text-center sm:text-3xl md:text-4xl lg:text-5xl text-gray-800"
      >
        {{ categoryTitle }}
      </h1>
    </div>

    <!-- Horizontal Scrollable Filter Section -->
    <div class="overflow-x-auto whitespace-nowrap mb-8">
      <button
        v-for="filter in filters"
        :key="filter"
        @click="filterProducts(filter)"
        :class="[
          'inline-block px-4 py-2 mx-2 text-sm font-medium rounded-full cursor-pointer',
          filter === selectedFilter
            ? 'bg-yellow-500 text-white hover:bg-yellow-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        ]"
      >
        {{ filter }}
      </button>
    </div>

    <!-- Products Section -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <router-link
        v-for="product in filteredProducts"
        :key="product.id"
        :to="{
          name: 'ProductDetailsPage',
          params: { id: product.id },
        }"
        class="bg-white py-6 px-4 rounded-md flex flex-col items-center shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out relative"
      >
        <!-- Discount Badge -->
        <div
          v-if="product.discount > 0"
          class="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md transform -rotate-6"
        >
          {{ product.discount }}% OFF
        </div>

        <!-- Image Section -->
        <div
          class="w-[120px] h-[120px] overflow-hidden rounded-md flex justify-center items-center mb-4"
        >
          <img
            class="w-full h-full object-contain"
            :src="product.image_url"
            alt="product image"
          />
        </div>

        <!-- Title & Price Section using Flexbox -->
        <div class="flex flex-col justify-between flex-grow text-center w-full">
          <!-- Title -->
          <h2 class="text-sm lg:text-lg font-medium text-slate-800 mb-2 px-2">
            {{ product.title }}
          </h2>

          <!-- Price Section - Stick it at the bottom -->
          <div class="mt-auto">
            <p v-if="product.discount > 0" class="text-sm mb-1">
              <span class="text-gray-500 line-through text-base">
                Rs:{{ product.price }}
              </span>
              <span class="text-red-600 font-bold text-xl ml-2">
                Rs:{{ product.final_price }}
              </span>
            </p>
            <p v-else class="text-gray-800 font-semibold text-base">
              Rs:{{ product.price }}
            </p>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useProductStore } from "../store/productStore";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();

const categoryTitle = ref(route.query.title);
const filters = ref(["All", "Burger", "Pizza", "Pasta", "Fries", "Drinks"]);
const selectedFilter = ref("All");

const filteredProducts = computed(() => {
  if (selectedFilter.value === "All") {
    return productStore.products;
  }
  return productStore.products.filter((product) =>
    product.title.toLowerCase().includes(selectedFilter.value.toLowerCase())
  );
});

// Filter products based on the selected filter
const filterProducts = (filter) => {
  selectedFilter.value = filter;
};

// Go back to the previous page
const goBack = () => {
  router.back();
};

onMounted(() => {
  productStore.getProducts(route.params.id);
});
</script>

<style scoped>
.product-card {
  height: 300px;
}

.product-image-container {
  height: 60%;
  overflow: hidden;
  border-radius: 0.375rem;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain; /* Ensure image covers the container */
}
</style>
