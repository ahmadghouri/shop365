<template>
  <section class="bg-gray-50 min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Log In</h1>

      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label
            for="phone"
            class="block mb-2 text-sm font-medium text-gray-900"
          >
            Your Phone
          </label>
          <input
            v-model="phone"
            type="text"
            name="phone"
            id="phone"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            placeholder="Enter your phone number"
            required
          />
          <!-- Error Message for Phone -->
          <p v-if="errors.phone_no" class="text-sm text-red-600">
            {{ errors.phone_no[0] }}
          </p>
        </div>

        <div>
          <label
            for="password"
            class="block mb-2 text-sm font-medium text-gray-900"
          >
            Password
          </label>
          <input
            v-model="password"
            type="password"
            name="password"
            id="password"
            placeholder="Enter your password"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            required
          />
          <!-- Error Message for Password -->
          <p v-if="errors.password" class="text-sm text-red-600">
            {{ errors.password[0] }}
          </p>
        </div>

        <!-- General Error Message -->
        <p
          v-if="generalError"
          class="text-sm font-medium text-red-600 text-center"
        >
          {{ generalError }}
        </p>

        <button type="submit" class="button">Log In</button>

        <p class="text-sm font-light text-gray-500 text-center mt-4">
          <router-link
            to="/forgotpassword"
            class="font-medium text-yellow-600 hover:underline"
          >
            Forgot Password?
          </router-link>
        </p>

        <p class="text-sm font-light text-gray-500 text-center">
          Don't have an account?
          <router-link
            to="/register"
            class="font-medium text-yellow-600 hover:underline"
          >
            Register
          </router-link>
        </p>

        <p class="text-sm font-light text-gray-500 text-center mt-4">
          Powered by
          <a href="#" class="font-medium text-yellow-600 hover:underline">
            NBT-HUB
          </a>
        </p>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { useRouter } from "vue-router";

const phone = ref("");
const password = ref("");
const errors = ref({});
const generalError = ref("");
const router = useRouter();

const login = async () => {
  errors.value = {};
  generalError.value = "";

  try {
    const response = await axios.post(`${API_BASE_URL}/api/login`, {
      phone_no: phone.value,
      password: password.value,
    });

    const { token, data } = response.data;

    // localStorage.setItem("token", data.token);

    if (response.status === 200 || response.status === 201) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", data.role);
      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data.role === "restaurant_admin") {
        router.push("/admin/restaurantAdminDashboard");
      } else if (data.role === "end_user") {
        router.push("/home/categories");
      }
    }
  } catch (error) {
    if (error.response) {
      const responseData = error.response.data;

      if (responseData.errors) {
        errors.value = responseData.errors;
      } else {
        generalError.value = responseData.message || "An error occurred";
      }
    } else if (error.request) {
      generalError.value = "Network error. Please try again.";
    } else {
      generalError.value = "An unexpected error occurred.";
    }
  }
};
</script>

<style scoped>
/* Add custom styles here if needed */
</style>
