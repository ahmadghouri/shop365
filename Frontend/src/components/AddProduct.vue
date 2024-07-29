<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Add Product</h2>
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
      <div class="mb-4">
        <label for="name" class="block text-sm font-medium text-gray-700"
          >Name</label
        >
        <input
          v-model="form.title"
          type="text"
          id="name"
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
        <label for="type" class="block text-sm font-medium text-gray-700"
          >Type</label
        >
        <input
          v-model="form.type"
          type="text"
          id="type"
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
      <div class="mb-4">
        <label for="image" class="block text-sm font-medium text-gray-700"
          >Image</label
        >
        <input
          @change="handleFileChange"
          type="file"
          id="image"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          accept="image/*"
          required
        />
      </div>

      <div>
        <label
          for="restaurant"
          class="mt-1 block mb-2 text-sm font-medium text-gray-900"
        >
          Restaurant
        </label>
        <select
          name="restaurants"
          id="restaurnats"
          v-model="form.business"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
          required
        >
          <option value="" disabled selected>Select restaurant</option>
          <option
            v-for="restaurant in businessStore.businesses"
            :key="restaurant.id"
            :value="restaurant.name"
          >
            {{ restaurant.name }}
          </option>
        </select>
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
          Add
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useProductStore } from "../store/productStore.js";
import { useBusinessStore } from "../store/businessStore.js";
import { useRouter } from "vue-router";

const businessStore = useBusinessStore();
const route = useRouter();
const productStore = useProductStore();
const form = ref({
  title: "",
  description: "",
  type: "",
  price: "",
  image: "",
  business: "",
});
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    form.value.image = file;
  } else {
    alert("Please select a valid image file.");
  }
};

const emit = defineEmits(["close"]);

const handleSubmit = async () => {
  console.log(form.value.business);
  try {
    const formData = new FormData();
    formData.append("title", form.value.title);
    formData.append("description", form.value.description);
    formData.append("type", form.value.type);
    formData.append("price", form.value.price);
    formData.append("image", form.value.image);
    formData.append("business", form.value.business);

    await productStore.storeProduct(formData);
    route.push(`/admin/dashboard`);
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

onMounted(async () => {
  await businessStore.getBusinesses();
});
</script>

<style scoped></style>
