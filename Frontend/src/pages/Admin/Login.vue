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
          <input type="text" id="phone" v-model="phone"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <div>
          <label for="password" class="block text-gray-600 text-sm mb-1">
            Password
          </label>
          <input type="password" id="password" v-model="password"
            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required />
        </div>
        <p v-if="error" class="text-red-500 text-sm text-center mt-2">
          {{ error }}
        </p>
        <button type="submit"
          class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <span>Login</span>
        </button>
      </form>
    </div>
  </div>
</template>
<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";

const phone = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();
const authStore = useAuthStore();

const login = async () => {
  if (phone.value.length !== 11 || password.value.length < 6) {
    error.value = "Please enter a valid phone number (11 digits) and password (at least 6 characters).";
    return;
  }

  const result = await authStore.login(phone.value, password.value);

  if (result.success) {
    if (result.role === "admin") {
      router.push("/admin/dashboard");
    } else if (result.role === "restaurant_admin") {
      router.push("/admin/restaurantAdminDashboard");
    } else {
      router.push("/admin");
    }
  } else {
    error.value = result.error;
  }
};
</script>
<style scoped></style>
