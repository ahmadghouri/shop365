<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Edit Product</h2>
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
      <div class="mb-4">
        <label for="title" class="block text-sm font-medium text-gray-700"
          >Title</label
        >
        <input
          v-model="form.title"
          type="text"
          id="title"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      <div class="mb-4">
        <label for="description" class="block text-sm font-medium text-gray-700"
          >Description</label
        >
        <input
          v-model="form.description"
          type="text"
          id="description"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      <div class="mb-4">
        <label for="price" class="block text-sm font-medium text-gray-700"
          >Price</label
        >
        <input
          v-model="form.price"
          type="text"
          id="price"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      <div class="flex justify-end">
        <button
          type="button"
          @click="$emit('close')"
          class="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Save
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import { useProductStore } from "../store/productStore.js";

const props = defineProps({
  product: Object,
});

const emit = defineEmits(["close", "save"]);

const form = ref({
  title: "",
  description: "",
  price: "",
});

const productStore = useProductStore();

const handleSubmit = async () => {
  try {
    await productStore.updateProduct(form.value, props.product.id);
    emit("save");
    emit("close");
  } catch (error) {
    console.error("Error updating product:", error);
  }
};
</script>

<style scoped></style>
