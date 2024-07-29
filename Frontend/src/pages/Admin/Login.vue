<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white p-6 rounded-lg shadow-md w-full max-w-sm mx-4">
      <h2 class="text-xl font-semibold text-gray-800 text-center mb-4">
        Admin Login
      </h2>
      <form @submit.prevent="login" class="space-y-4">
        <div>
          <label for="phone" class="block text-gray-600 text-sm mb-1">
            Phone Number
          </label>
          <input
            type="text"
            id="phone"
            v-model="phone"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label for="password" class="block text-gray-600 text-sm mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <p v-if="error" class="text-red-500 text-sm text-center mt-2">
          {{ error }}
        </p>
        <button
          type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span>Login</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { useRouter } from "vue-router";

const phone = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();

// Computed property for form validation
const isValid = computed(() => {
  return phone.value.length === 11 && password.value.length >= 6;
});

const login = async () => {
  if (!isValid.value) {
    error.value =
      "Please enter a valid phone number (11 digits) and password (at least 6 characters).";
    return;
  }

  try {
    error.value = "";
    const response = await axios.post(`${API_BASE_URL}/api/login`, {
      phone_no: phone.value,
      password: password.value,
    });

    const { token, data } = response.data;
    console.log("Login response:", response); // Log the full response for debugging
    if (response.status === 200 || response.status === 201) {
      localStorage.setItem("adminToken", token);
      localStorage.setItem("role", data.role);
      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data.role === "restaurant_admin") {
        router.push("/admin/restaurantAdminDashboard");
      } else {
        router.push("/admin");
      }
    } else {
      error.value = "Unexpected response status.";
    }
  } catch (e) {
    if (e.response && e.response.data && e.response.data.error) {
      error.value = e.response.data.error;
    } else {
      error.value = "Invalid credentials";
    }
  }
};
</script>

<style scoped></style>
