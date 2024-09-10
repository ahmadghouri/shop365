<template>
  <section class="">
    <!-- Mobile Version -->
    <div class="overflow-x-auto py-4 mb-4 lg:hidden">
      <div class="flex space-x-4">
        <div
          v-for="service in services"
          :key="service[0]"
          class="w-16 h-16 bg-white rounded shadow flex-shrink-0 flex flex-col items-center justify-center text-center cursor-pointer"
          @click="selectService(service[0])"
        >
          <img :src="service[1]" alt="" class="object-contain w-8 h-8 mb-1" />
          <span class="text-xs">{{ service[0] }}</span>
        </div>
      </div>
    </div>

    <!-- Desktop Version -->
    <div class="overflow-x-auto py-4 mb-4 hidden lg:block lg:py-8 lg:px-4">
      <div class="flex space-x-4 min-w-max">
        <div
          v-for="service in services"
          :key="service[0]"
          class="group relative w-40 h-40 bg-white rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer transition duration-300 ease-in-out hover:shadow-xl hover:bg-gray-100"
          @click="selectService(service[0])"
        >
          <img
            :src="service[1]"
            alt=""
            class="object-contain w-12 h-12 mb-2 transition-transform transform group-hover:scale-110"
          />
          <span
            class="text-sm font-medium text-gray-700 group-hover:text-gray-900"
            >{{ service[0] }}</span
          >
          <div
            class="absolute inset-0 rounded-lg bg-gradient-to-r from-gray-100 to-gray-100 opacity-0 group-hover:opacity-10 transition duration-300"
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
  ["Services", "/services1.png"],
]);

const emit = defineEmits(["serviceSelected"]);

const selectService = (service) => {
  emit("serviceSelected", service);
};
</script>

<style scoped></style>
