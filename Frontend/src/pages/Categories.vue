<template>
  <div>
    <h1
      class="mobile-spacing mt-3 text-2xl font-bold text-center sm:text-3xl md:text-4xl lg:text-5xl text-gray-800"
    >
      Restaurants
    </h1>
    <div
      class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 mobile-spacing mt-6 px-4 md:px-8 lg:px-12"
    >
      <router-link
        v-for="category in businessStore.businesses"
        :key="category.id"
        :to="{
          name: 'CategoryPage',
          params: { id: category.id },
          query: { title: category.name },
        }"
        class="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl"
      >
        <div class="w-full h-48 sm:h-32 overflow-hidden">
          <img
            class="w-full h-full object-cover"
            :src="category.image_url"
            alt="Category Image"
          />
        </div>
        <div class="p-4 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
            <h1 class="text-xl font-semibold text-gray-900 mb-2">
              {{ category.name }}
            </h1>
            <div class="flex items-center mb-2">
              <!-- Dot Indicator for Open/Closed -->
              <span
                :class="{
                  'bg-green-500': isOpen(category.opening_time, category.closing_time),
                  'bg-red-500': !isOpen(category.opening_time, category.closing_time),
                }"
                class="w-3 h-3 rounded-full mr-2"
              ></span>
            </div>
          </div>
            <p class="text-gray-700 text-sm mb-2">
              <span class="font-semibold">Type:</span> {{ category.type }}
            </p>
          </div>
          <div class="mt-4 text-center">
            <router-link
              :to="{
                name: 'CategoryPage',
                params: { id: category.id },
                query: { title: category.name },
              }"
              class="text-yellow-500 hover:text-yellow-700 font-semibold"
            >
              View Details
            </router-link>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { useBusinessStore } from "../store/businessStore";
import { onMounted } from "vue";
import dayjs from "dayjs";

const businessStore = useBusinessStore();

const isOpen = (openingTime, closingTime) => {
  const currentTime = dayjs(); 
  const open = dayjs().set("hour", parseInt(openingTime.split(":")[0])).set("minute", parseInt(openingTime.split(":")[1])).set("second", 0);
  let close = dayjs().set("hour", parseInt(closingTime.split(":")[0])).set("minute", parseInt(closingTime.split(":")[1])).set("second", 0);

  
  if (close.isBefore(open)) {
    close = close.add(1, "day");
  }

  
  return currentTime.isAfter(open) && currentTime.isBefore(close);
};



onMounted(() => {
  businessStore.getBusinesses();
});
</script>

<style scoped>
/* Optional: Additional styles */
</style>
