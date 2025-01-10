<template>
  <div class="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
    <div
      class="bg-white w-full max-w-2xl rounded-2xl shadow-lg overflow-hidden"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
        <h2 class="text-2xl font-semibold text-white">Add Business</h2>
        <p class="text-blue-100 mt-1">Create a new business listing</p>
      </div>

      <form @submit.prevent="handleSubmit" class="p-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Basic Information -->
          <div class="space-y-6 md:col-span-2">
            <div class="relative">
              <label
                for="name"
                class="text-sm font-medium text-gray-700 block mb-2"
                >Business Name</label
              >
              <input
                v-model="form.name"
                type="text"
                id="name"
                class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                required
              />
            </div>

            <div class="relative">
              <label
                for="type"
                class="text-sm font-medium text-gray-700 block mb-2"
                >Business Type</label
              >
              <input
                v-model="form.type"
                type="text"
                id="type"
                class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                required
              />
            </div>
          </div>

          <!-- Operating Hours -->
          <div class="relative">
            <label
              for="opening_time"
              class="text-sm font-medium text-gray-700 block mb-2"
              >Opening Time</label
            >
            <input
              v-model="form.opening_time"
              type="time"
              id="opening_time"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              required
            />
          </div>

          <div class="relative">
            <label
              for="closing_time"
              class="text-sm font-medium text-gray-700 block mb-2"
              >Closing Time</label
            >
            <input
              v-model="form.closing_time"
              type="time"
              id="closing_time"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              required
            />
          </div>

          <!-- Parent Business -->
          <div class="md:col-span-2">
            <label
              for="parent_id"
              class="text-sm font-medium text-gray-700 block mb-2"
              >Parent Business</label
            >
            <select
              v-model="form.parent_id"
              id="parent_id"
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              <option value="">No Parent Business</option>
              <option
                v-for="business in businessStore.businesses"
                :key="business.id"
                :value="business.id"
              >
                {{ business.name }}
              </option>
            </select>
          </div>

          <!-- Image Upload -->
          <div class="md:col-span-2">
            <label class="text-sm font-medium text-gray-700 block mb-2"
              >Business Image</label
            >
            <div
              class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors duration-200"
            >
              <div class="space-y-2 text-center">
                <div v-if="imagePreview" class="mb-4">
                  <img
                    :src="imagePreview"
                    alt="Preview"
                    class="mx-auto h-32 w-auto rounded-lg shadow-sm"
                  />
                </div>
                <div class="flex text-sm text-gray-600">
                  <label
                    for="image"
                    class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      @change="handleFileChange"
                      id="image"
                      type="file"
                      class="sr-only"
                      accept="image/*"
                      required
                    />
                  </label>
                  <p class="pl-1">or drag and drop</p>
                </div>
                <p class="text-xs text-gray-500">PNG, JPG, GIF up to 15KB</p>
                <p v-if="imageError" class="text-xs text-red-500 mt-1">
                  {{ imageError }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="mt-8 flex justify-end space-x-4">
          <button
            @click="$emit('close')"
            type="button"
            class="px-6 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200"
          >
            Create Business
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useBusinessStore } from "../store/businessStore.js";
import { useRouter } from "vue-router";

const businessStore = useBusinessStore();
const router = useRouter();
const emit = defineEmits(["close"]);

const imagePreview = ref(null);
const imageError = ref(null);
const MAX_FILE_SIZE = 15 * 1024; // 15KB in bytes

const form = ref({
  name: "",
  type: "",
  image: null,
  opening_time: "",
  closing_time: "",
  parent_id: "",
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  imageError.value = null;
  form.value.image = null;
  imagePreview.value = null;

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    imageError.value = "Please select a valid image file.";
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    imageError.value = `Image size must be less than 15KB. Current size: ${(
      file.size / 1024
    ).toFixed(1)}KB`;
    return;
  }

  form.value.image = file;
  imagePreview.value = URL.createObjectURL(file);
};

const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append("name", form.value.name);
    formData.append("type", form.value.type);
    formData.append("image", form.value.image);
    formData.append("opening_time", form.value.opening_time);
    formData.append("closing_time", form.value.closing_time);
    formData.append("parent_id", form.value.parent_id);

    await businessStore.addBusiness(formData);
    router.push("/admin/restaurantAdmin");
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

onMounted(async () => {
  await businessStore.getBusinesses();
});
</script>

<style scoped>
/* Custom focus styles */
input:focus,
select:focus {
  outline: none;
}

/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Remove default time input styling */
input[type="time"] {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
