<template>
  <section class="mt-4">
    <div class="overflow-x-auto py-4 mb-4">
      <div class="flex space-x-4">
        <div
          v-for="service in services"
          :key="service"
          class="w-16 h-16 bg-white rounded shadow flex-shrink-0 flex flex-col items-center justify-center text-center"
        >
          <img :src="service[1]" alt="" class="object-contain w-8 h-8 mb-1" />
          <span class="text-xs">{{ service[0] }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";

const services = ref([
  ["Food", "/food1.png"],
  ["Groccery", "/Groccery1.png"],
  ["Doctor", "/doctor1.png"],
  ["Food", "/food1.png"],
  ["Groccery", "/Groccery1.png"],
  ["Doctor", "/doctor1.png"],
]);
</script>

<style scoped></style>
