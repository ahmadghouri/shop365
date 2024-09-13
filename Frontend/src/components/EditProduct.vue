<template>
  <div class="bg-white px-12 py-6 rounded-lg shadow-lg">
    <h2 class="text-xl font-bold mb-4">Edit Product</h2>
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
      <div class="mb-4">
        <label for="title" class="block text-gray-700">Title</label>
        <input
          v-model="form.title"
          type="text"
          id="title"
          class="w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div class="mb-4">
        <label for="description" class="block text-gray-700">Description</label>
        <input
          v-model="form.description"
          type="text"
          id="description"
          class="w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div class="mb-4">
        <label for="price" class="block text-gray-700">Price</label>
        <input
          v-model="form.price"
          type="text"
          id="price"
          class="w-full p-2 border border-gray-300 rounded-md"
          required
        />
      </div>

      <div class="mb-4">
        <label for="image" class="block text-gray-700">Image</label>
        <input
          @change="(e) => (form.image = e.target.files[0])"
          type="file"
          id="image"
          class="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div class="flex justify-end gap-2">
        <button
          @click="$emit('close')"
          type="button"
          class="bg-gray-500 px-4 py-2 text-white rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="bg-blue-500 px-4 py-2 text-white rounded-md"
        >
          Save
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useProductStore } from "../store/productStore";

const props = defineProps({
  product: Object,
});

const emit = defineEmits(["close", "save"]);

const form = ref({
  title: props.product.title,
  description: props.product.description,
  price: props.product.price,
  image: null, // Initialize as null for file upload
});

const productStore = useProductStore();

const handleSubmit = async () => {
  const formData = new FormData();
  formData.append("title", form.value.title);
  formData.append("description", form.value.description);
  formData.append("price", form.value.price);

  // Append the image only if it exists
  if (form.value.image) {
    formData.append("image", form.value.image);
  }

  formData.append("_method", "PUT");

  try {
    await productStore.updateProduct(formData, props.product.id);
    emit("save");
    emit("close");
  } catch (error) {
    console.error("Error updating product:", error);
  }
};
</script>

<style scoped>
/* Add styles if needed */
</style>
