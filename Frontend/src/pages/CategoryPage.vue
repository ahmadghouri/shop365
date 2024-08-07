<template>
  <div class="mobile-spacing">
    <!-- Horizontal Scrollable Filter Section -->
    <div class="overflow-x-auto whitespace-nowrap py-4 mb-4">
      <button
        v-for="filter in filters"
        :key="filter"
        @click="filterProducts(filter)"
        class="inline-block px-4 py-2 mx-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300"
      >
        {{ filter }}
      </button>
    </div>

    <!-- Products Section -->
    <div>
      <h1
        class="text-2xl font-bold text-center sm:text-3xl md:text-4xl lg:text-5xl text-gray-800 mb-6"
      >
        {{ categoryTitle }}
      </h1>
      <div class="grid grid-cols-2 gap-4">
        <router-link
          v-for="product in filteredProducts"
          :key="product.id"
          :to="{
            name: 'ProductDetailsPage',
            params: { id: product.id },
          }"
          class="bg-white p-4 rounded-md flex flex-col items-center shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
        >
          <!-- Image Section -->
          <div class="w-full h-40 overflow-hidden rounded-md mb-4">
            <img
              class="w-full h-full object-cover"
              :src="product.image_url"
              alt="Product image"
            />
          </div>

          <!-- Text Section -->
          <div class="text-center">
            <h2 class="text-lg font-semibold text-slate-800 mb-2">
              {{ product.title }}
            </h2>
            <p class="text-slate-600 text-sm mb-2">
              {{ product.description }}
            </p>
            <p class="text-sm text-gray-800 font-semibold">
              Price: {{ product.price }}
            </p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useProductStore } from "../store/productStore";
import { useRoute } from "vue-router";

const route = useRoute();
const productStore = useProductStore();

const categoryTitle = ref(route.query.title);
const filters = ref(["All", "Burger", "Pizza", "Pasta", "Fries", "Drinks"]);
const selectedFilter = ref("All");

// Filtered products based on the selected filter (case insensitive)
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

onMounted(() => {
  productStore.getProducts(route.params.id);
});
</script>

<style scoped></style>
