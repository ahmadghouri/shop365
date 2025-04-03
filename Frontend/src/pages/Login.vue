<template>
  <section class="bg-gray-50 min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">Log In</h1>

      <form @submit.prevent="handleLogin" class="space-y-6">
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
          <p v-if="errors.password" class="text-sm text-red-600">
            {{ errors.password[0] }}
          </p>
        </div>

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
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const phone = ref("");
const password = ref("");
const errors = ref({});
const generalError = ref("");
const router = useRouter();
const authStore = useAuthStore();

const handleLogin = async () => {
  errors.value = {};
  generalError.value = "";

  const result = await authStore.login(phone.value, password.value);

  if (result.success) {
    if (result.role === "admin") {
      router.push("/admin/dashboard");
    } else if (result.role === "restaurant_admin") {
      router.push("/admin/restaurantAdminDashboard");
    } else if (result.role === "end_user") {
      router.push("/home/categories");
    }
  } else {
    errors.value = result.errors || {};
    console.log(result.errors);

    generalError.value = result.message || "An error occurred during login.";
  }
};
</script>

<style scoped>
/* Add custom styles here if needed */
</style>
