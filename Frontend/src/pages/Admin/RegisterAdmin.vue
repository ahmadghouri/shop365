<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Register Admin</h2>
      <form @submit.prevent="registerAdmin">
        <div class="mb-4">
          <label for="name" class="block text-gray-700">Name</label>
          <input type="text" id="name" v-model="form.name"
            class="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-blue-500"
            required />
        </div>
        <div class="mb-4">
          <label for="phone_no" class="block text-gray-700">Phone Number</label>
          <input type="text" id="phone_no" v-model="form.phone_no"
            class="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-blue-500"
            required />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-gray-700">Password</label>
          <input type="password" id="password" v-model="form.password"
            class="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-blue-500"
            required />
        </div>

        <div class="mb-4">
          <label for="restaurant" class="block text-gray-700">Restaurant</label>
          <select id="restaurant" v-model="form.business"
            class="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:border-blue-500 focus:ring-blue-500"
            required>
            <option value="" disabled>Select a restaurant</option>
            <option v-for="restaurant in businessStore.businesses" :key="restaurant.id" :value="restaurant.name">
              {{ restaurant.name }}
            </option>
          </select>
        </div>
        <div class="flex justify-center">
          <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Register
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useBusinessStore } from "../../store/businessStore";
import { API_BASE_URL } from "../../config/api";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

const businessStore = useBusinessStore();
const form = ref({
  name: "",
  phone_no: "",
  password: "",
  business: "",
});

const closeForm = () => {
  form.value.name = "";
  form.value.phone_no = "";
  form.value.password = "";
  form.value.business = "";
};

const registerAdmin = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/createAdmins`,
      form.value,
    );

    closeForm();
    if (response.status === 200 || response.status === 201) {
      toast.success("Admin registered successfully");
    }
  } catch (error) {
    if (error.response) {
      toast.error(`Error: ${error.response.data.message}`);
    } else if (error.request) {
      toast.error("Network error. Please try again.");
    } else {
      toast.error("An unexpected error occurred.");
    }
  }
};

onMounted(async () => {
  await businessStore.getBusinesses();
});
</script>

<style scoped></style>
