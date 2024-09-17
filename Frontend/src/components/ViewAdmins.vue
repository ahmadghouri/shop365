<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-6 text-gray-700">Vendor Admins</h1>

    <div v-if="loading" class="text-center">
      <span class="text-yellow-500 font-semibold">Loading...</span>
    </div>

    <div v-else-if="error" class="text-center text-red-500">
      <p>Error fetching vendor admins: {{ error }}</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="vendor in vendors"
        :key="vendor.id"
        class="bg-white p-4 rounded-lg shadow-md border border-gray-200"
      >
        <h2 class="text-lg font-semibold text-gray-800">{{ vendor.name }}</h2>
        <p class="text-sm text-gray-500">Phone: {{ vendor.phone_no }}</p>
        <p class="text-sm text-gray-500">
          Business ID: {{ vendor.business_id }}
        </p>
        <p class="text-sm text-gray-500">
          Created At: {{ new Date(vendor.created_at).toLocaleDateString() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

// Define reactive states
const vendors = ref([]);
const loading = ref(false);
const error = ref(null);

// Token (replace with your actual token handling logic)
const token = localStorage.getItem("token");

const fetchVendors = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${API_BASE_URL}/api/admin/vendors`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    vendors.value = response.data.data;
  } catch (err) {
    error.value = err.response ? err.response.data.message : err.message;
  } finally {
    loading.value = false;
  }
};

// Fetch the vendors on page load
onMounted(() => {
  fetchVendors();
});
</script>

<style scoped>
body {
  background-color: #f7fafc;
}
h1 {
  font-family: "Poppins", sans-serif;
}
.grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}
</style>
