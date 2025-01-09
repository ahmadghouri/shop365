<template>
  <div class="p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Add Restaurant</h2>
    <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
      <div class="mb-4">
        <label for="name" class="block text-sm font-medium text-gray-700"
          >Name</label
        >
        <input
          v-model="form.name"
          type="text"
          id="name"
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
      <div class="mb-4">
        <label
          for="opening_time"
          class="block text-sm font-medium text-gray-700"
          >Opening Time</label
        >
        <input
          v-model="form.opening_time"
          type="text"
          id="opening_time"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>
      <div class="mb-4">
        <label
          for="closing_time"
          class="block text-sm font-medium text-gray-700"
          >Closing Time</label
        >
        <input
          v-model="form.closing_time"
          type="text"
          id="closing_time"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          required
        />
      </div>

      <div class="mb-4">
        <label for="parent_id" class="block text-sm font-medium text-gray-700"
          >Parent Business</label
        >
        <select
          v-model="form.parent_id"
          id="parent_id"
          class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">No Parent</option>
          <option
            v-for="business in businessStore.businesses"
            :key="business.id"
            :value="business.id"
          >
            {{ business.name }}
          </option>
        </select>
      </div>

      <div class="flex justify-end">
        <button
          type="button"
          @click="emit('close')"
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
import { useBusinessStore } from "../store/businessStore.js";
import { useRouter } from "vue-router";

const businessStore = useBusinessStore();
const router = useRouter();
const form = ref({
  name: "",
  type: "",
  image: "",
  opening_time: "",
  closing_time: "",
  parent_id: "",
});

const closeForm = () => {
  form.value.name = "";
  form.value.type = "";
  form.value.image = "";
  form.value.opening_time = "";
  form.value.closing_time = "";
  form.value.parent_id = "";
};
const emit = defineEmits(["close"]);

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith("image/")) {
    form.value.image = file;
  } else {
    alert("Please select a valid image file.");
  }
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
    closeForm();
    router.push("/admin/restaurantAdmin");
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};

onMounted(async () => {
  await businessStore.getBusinesses();
});
</script>

<style scoped></style>
