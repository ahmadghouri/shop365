<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <div class="bg-white shadow rounded-lg p-5 w-full max-w-md">
      <h2 class="text-xl font-medium text-gray-900 mb-4 text-center">
        Add Product
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" id="title" v-model="title" placeholder="Enter title"
            class="block w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500 text-sm"
            required />
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" v-model="description" placeholder="Enter description"
            class="block w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500 text-sm"
            required></textarea>
        </div>

        <div>
          <label for="price" class="block text-sm font-medium text-gray-700">Price</label>
          <input type="number" id="price" v-model="price" placeholder="Enter price"
            class="block w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500 text-sm"
            required />
        </div>

        <div>
          <label for="type" class="block text-sm font-medium text-gray-700">Type</label>
          <input type="text" id="type" v-model="type" placeholder="Enter type"
            class="block w-full border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500 text-sm"
            required />
        </div>

        <div>
          <label for="image" class="block text-sm font-medium text-gray-700">Image (Max 15KB)</label>
          <input type="file" id="image" @change="handleFileUpload"
            class="block w-full text-sm border border-gray-300 rounded p-2 focus:border-blue-500 focus:ring-blue-500"
            required />
          <p v-if="imageError" class="text-red-500 text-xs mt-1">
            {{ imageError }}
          </p>
        </div>

        <button type="submit"
          class="w-full bg-blue-500 text-white text-sm font-medium py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 hover:bg-blue-600 transition">
          Submit
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";

const title = ref("");
const description = ref("");
const price = ref("");
const type = ref("");
let image = ref(null);
const imageError = ref("");
const router = useRouter();

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.size > 15 * 1024) {
    imageError.value = "Image size must be less than 15KB.";
    image.value = null;
  } else {
    imageError.value = "";
    image.value = file;
  }
};

const handleSubmit = async () => {
  if (!image.value) {
    imageError.value = "Please upload a valid image.";
    return;
  }

  try {

    const formData = new FormData();
    formData.append("title", title.value);
    formData.append("description", description.value);
    formData.append("price", price.value);
    formData.append("type", type.value);
    formData.append("image", image.value);

    const response = await axios.post(
      `${API_BASE_URL}/api/restaurantAdmin/add-products`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success("Product added successfully");
    router.push("/admin/restaurantAdminDashboard");
  } catch (error) {
    console.error(error);
    toast.error("Failed to add product.");
  }
};
</script>

<style scoped></style>
