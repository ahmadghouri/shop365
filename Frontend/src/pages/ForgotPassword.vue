<template>
  <section class="bg-gray-50 min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">
        Reset Your Password
      </h1>

      <form @submit.prevent="sendResetRequest" class="space-y-6">
        <div>
          <label
            for="phone"
            class="block mb-2 text-sm font-medium text-gray-900"
          >
            Your Phone Number
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
          <p v-if="errors.phone" class="text-sm text-red-600">
            {{ errors.phone[0] }}
          </p>
        </div>

        <div>
          <label
            for="new-password"
            class="block mb-2 text-sm font-medium text-gray-900"
          >
            New Password
          </label>
          <input
            v-model="newPassword"
            type="password"
            name="new-password"
            id="new-password"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            placeholder="Enter your new password"
            required
          />
          <!-- Error Message for New Password -->
          <p v-if="errors.new_password" class="text-sm text-red-600">
            {{ errors.new_password[0] }}
          </p>
        </div>

        <!-- General Error Message -->
        <p
          v-if="generalError"
          class="text-sm font-medium text-red-600 text-center"
        >
          {{ generalError }}
        </p>

        <button type="submit" class="button">Reset Password</button>

        <p class="text-sm font-light text-gray-500 text-center mt-4">
          Remember your password?
          <router-link
            to="/userlogin"
            class="font-medium text-yellow-600 hover:underline"
          >
            Log In
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
const newPassword = ref("");
const errors = ref({});
const generalError = ref("");
const router = useRouter();

const sendResetRequest = async () => {
  errors.value = {};
  generalError.value = "";

  try {
    await axios.post(`${API_BASE_URL}/api/update-password`, {
      phone_no: phone.value,
      password: newPassword.value,
    });

    router.push("/userlogin");
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
