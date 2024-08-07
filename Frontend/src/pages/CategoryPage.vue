<template>
  <div class="mobile-spacing">
    <div>
      <h1
        class="text-2xl font-bold text-center sm:text-3xl md:text-4xl lg:text-5xl text-gray-800 mb-6"
      >
        {{ categoryTitle }}
      </h1>
      <div class="grid grid-cols-2 gap-4">
        <router-link
          v-for="product in productStore.products"
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
            <p class="text-slate-600 text-sm mb-2">
              {{ product.type }}
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
