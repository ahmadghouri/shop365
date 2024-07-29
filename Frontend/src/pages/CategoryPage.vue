<template>
  <div class="">
    <h1
      class="mobile-spacing mt-3 text-2xl font-bold text-center sm:text-3xl md:text-4xl lg:text-5xl text-gray-800"
    >
      {{ categoryTitle }}
    </h1>
    <div class="grid grid-cols-1 mobile-spacing gap-5">
      <router-link
        v-for="product in productStore.products"
        :key="product.id"
        :to="{
          name: 'ProductDetailsPage',
          params: { id: product.id },
        }"
        class="bg-gray-100 p-4 rounded-md flex items-center space-x-4 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out"
      >
        <!-- Image Section -->
        <div class="w-32 h-32 overflow-hidden rounded-md bg-white shadow-sm">
          <img
            class="w-full h-full object-cover"
            :src="product.image_url"
            alt="Product image"
          />
        </div>

        <!-- Text Section -->
        <div class="flex-1 text-left">
          <h2 class="text-lg font-semibold text-slate-800 mb-1">
            {{ product.title }}
          </h2>
          <p class="text-slate-600 text-sm mb-1">
            {{ product.description }}
          </p>
          <p class="text-slate-600 text-sm mb-1">
            {{ product.type }}
          </p>
          <p class="text-sm text-gray-800 font-semibold">
            Price: ${{ product.price }}
          </p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useProductStore } from "../store/productStore";
import { useRoute } from "vue-router";

const route = useRoute();
const productStore = useProductStore();

const categoryTitle = ref(route.query.title);
onMounted(() => {
  productStore.getProducts(route.params.id);
});
</script>

<style scoped></style>
