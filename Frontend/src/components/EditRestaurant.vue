<template>
  <div class="bg-white px-12 py-6 rounded-lg shadow-lg">
    <h2 class="text-xl font-bold mb-4">Edit Restaurant</h2>
    <form @submit.prevent="handleSubmit">
      <div class="mb-4">
        <label for="name" class="block text-gray-700">Name</label>
        <input v-model="form.name" type="text" id="name" class="w-full p-2 border border-gray-300 rounded-md"
          required />
      </div>
      <div class="mb-4">
        <label for="type" class="block text-gray-700">Type</label>
        <input v-model="form.type" type="text" id="type" class="w-full p-2 border border-gray-300 rounded-md"
          required />
      </div>
      <div class="mb-4">
        <label for="opening_time" class="block text-gray-700">Opening Time</label>
        <input v-model="form.opening_time" type="text" id="opening_time"
          class="w-full p-2 border border-gray-300 rounded-md" required />
      </div>
      <div class="mb-4">
        <label for="closing_time" class="block text-gray-700">Closing Time</label>
        <input v-model="form.closing_time" type="text" id="closing_time"
          class="w-full p-2 border border-gray-300 rounded-md" required />
      </div>

      <div class="mb-4">
        <label for="image" class="block text-gray-700">Image</label>
        <input @change="(e) => (form.image = e.target.files[0])" type="file" id="image"
          class="w-full p-2 border border-gray-300 rounded-md" />
      </div>

      <div class="flex justify-end gap-2">
        <button @click="$emit('close')" type="button" class="bg-gray-500 px-4 py-2 text-white rounded-md">
          Cancel
        </button>
        <button type="submit" class="bg-blue-500 px-4 py-2 text-white rounded-md">
          Save
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, } from "vue";
import { useBusinessStore } from "../store/businessStore.js";

const props = defineProps({
  restaurant: Object,
});

const emit = defineEmits(["close"]);

const businessStore = useBusinessStore();

// Define form data with default values
const form = ref({
  name: props.restaurant.name,
  type: props.restaurant.type,
  opening_time: props.restaurant.opening_time,
  closing_time: props.restaurant.closing_time,
  image: null, // Initialize as null for file upload
});

const handleSubmit = async () => {
  const formData = new FormData();
  formData.append("name", form.value.name);
  formData.append("type", form.value.type);
  formData.append("opening_time", form.value.opening_time);
  formData.append("closing_time", form.value.closing_time);

  // Append the image only if it exists
  if (form.value.image) {
    formData.append("image", form.value.image);
  }

  formData.append("_method", "PUT");

  await businessStore.editBusiness(formData, props.restaurant.id);
  emit("close");
};
</script>

<style scoped>
/* Add styles if needed */
</style>
