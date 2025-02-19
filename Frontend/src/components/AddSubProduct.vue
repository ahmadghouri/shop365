<script setup>
import { ref } from "vue";
import { useProductStore } from "../store/productStore";

const props = defineProps({
  business: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close"]);
const productStore = useProductStore();
const imageError = ref("");
const isLoading = ref(false);

const form = ref({
  title: "",
  description: "",
  price: "",
  type: "",
  image: null,
  business: props.business,
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 15 * 1024) {
      // 15KB limit
      imageError.value = "Image size must be less than 15KB";
      event.target.value = "";
      return;
    }
    imageError.value = "";
    form.value.image = file;
  }
};

const submitForm = async () => {
  try {
    console.log("Business id", props.businessId);

    isLoading.value = true;
    const formData = new FormData();
    Object.keys(form.value).forEach((key) => {
      if (form.value[key] !== null && form.value[key] !== "") {
        formData.append(key, form.value[key]);
      }
    });

    await productStore.storeProduct(formData);
    emit("close");
  } catch (error) {
    console.error("Error adding product:", error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">Add New Product</h2>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700">Title</label>
        <input
          v-model="form.title"
          type="text"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Price</label>
        <input
          v-model="form.price"
          type="number"
          step="0.01"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700">Type</label>
        <input
          v-model="form.type"
          type="text"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700"
          >Description</label
        >
        <textarea
          v-model="form.description"
          rows="3"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700"
          >Image (Max 15KB)</label
        >
        <input
          type="file"
          @change="handleFileChange"
          accept="image/*"
          class="mt-1 block w-full"
        />
        <p v-if="imageError" class="mt-1 text-sm text-red-600">
          {{ imageError }}
        </p>
      </div>

      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="$emit('close')"
          class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          :disabled="isLoading"
        >
          {{ isLoading ? "Adding..." : "Add Product" }}
        </button>
      </div>
    </form>
  </div>
</template>
