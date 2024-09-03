<template>
  <section class="mt-4">
    <div class="overflow-x-auto py-4 mb-4">
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
