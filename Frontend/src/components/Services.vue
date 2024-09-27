<template>
  <section class="">
    <!-- Mobile Version -->
    <div class="overflow-x-auto py-4 mb-4 lg:hidden">
      <div class="flex space-x-4">
        <div
          v-for="service in services"
          :key="service[0]"
          class="w-16 h-16 bg-white rounded-lg shadow-md flex-shrink-0 flex flex-col items-center justify-center text-center cursor-pointer transition duration-300 ease-in-out"
          :class="{
            'ring-2 ring-yellow-400 shadow-lg': selectedService === service[0],
          }"
          @click="selectService(service[0])"
        >
          <img :src="service[1]" alt="" class="object-contain w-8 h-8 mb-1" />
          <span
            class="text-xs"
            :class="{ 'font-semibold': selectedService === service[0] }"
            >{{ service[0] }}</span
          >
        </div>
      </div>
    </div>

    <!-- Desktop Version -->
    <div class="overflow-x-auto py-4 mb-4 hidden lg:block lg:py-8 lg:px-4">
      <div class="flex space-x-6 min-w-max">
        <div
          v-for="service in services"
          :key="service[0]"
          class="group relative w-40 h-40 bg-white rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer transition duration-300 ease-in-out"
          :class="{
            'shadow-lg transform -translate-y-1':
              selectedService === service[0],
            'hover:shadow-xl hover:bg-gray-50': selectedService !== service[0],
          }"
          @click="selectService(service[0])"
        >
          <div
            class="absolute inset-0 rounded-lg bg-gradient-to-br from-yellow-100 to-yellow-200 opacity-0 transition duration-300"
            :class="{ 'opacity-20': selectedService === service[0] }"
          ></div>
          <img
            :src="service[1]"
            alt=""
            class="object-contain w-12 h-12 mb-2 transition-transform duration-300 z-10"
            :class="{
              'transform scale-110': selectedService === service[0],
              'group-hover:scale-110': selectedService !== service[0],
            }"
          />
          <span
            class="text-sm font-medium text-gray-700 z-10 transition duration-300"
            :class="{
              'text-gray-900 font-semibold': selectedService === service[0],
              'group-hover:text-gray-900': selectedService !== service[0],
            }"
            >{{ service[0] }}</span
          >
          <div
            class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-yellow-400 rounded-t opacity-0 transition-all duration-300"
            :class="{ 'opacity-100': selectedService === service[0] }"
          ></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, defineEmits } from "vue";

const services = ref([
  ["Shop365", "/Asset 2.png"],
  ["Food", "/food1.png"],
  ["Grocery", "/Groccery1.png"],
  ["Doctor", "/doctor1.png"],
  ["Vehicle", "/car1.png"],
  ["Mobile", "/mobile1.png"],
  ["Home", "/Decor.png"],
  ["Electronics", "/electronics.png"],
  ["Toys", "/toys.png"],
  ["Services", "/services1.png"],
]);

const emit = defineEmits(["serviceSelected"]);
const selectedService = ref(null);

const selectService = (service) => {
  selectedService.value = service;
  emit("serviceSelected", service);
};
</script>

<style scoped>
/* Add any additional styles here if needed */
</style>
