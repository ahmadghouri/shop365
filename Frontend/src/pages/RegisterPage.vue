<template>
  <section class="bg-gray-50 min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">
        Create an Account
      </h1>

      <form @submit.prevent="register" class="space-y-6">
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

        <div class="flex items-start">
          <div class="flex items-center h-5">
            <input
              id="terms"
              aria-describedby="terms"
              type="checkbox"
              v-model="termsAccepted"
              class="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-yellow-400"
              required
            />
          </div>
          <div class="ml-3 text-sm">
            <label for="terms" class="font-light text-gray-500">
              I accept the
              <a class="font-medium text-yellow-600 hover:underline" href="#">
                Terms and Conditions
              </a>
            </label>
          </div>
        </div>

        <!-- General Error Message -->
        <p
          v-if="generalError"
          class="text-sm font-medium text-red-600 text-center"
        >
          {{ generalError }}
        </p>

        <button type="submit" class="button">Create an Account</button>
        <p class="text-sm font-light text-gray-500 text-center">
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
const termsAccepted = ref(false);
const errors = ref({}); // To store validation errors
const generalError = ref(""); // To store any general error messages
const router = useRouter();

const register = async () => {
  if (!termsAccepted.value) {
    alert("You must accept the terms and conditions.");
    return;
  }

  errors.value = {}; // Clear previous errors
  generalError.value = ""; // Clear previous general error

  try {
    const response = await axios.post(`${API_BASE_URL}/api/register`, {
      phone_no: phone.value,
      password: password.value,
    });

    const { data } = response;

    localStorage.setItem("token", data.token);

    router.push("/compregister");
  } catch (error) {
    if (error.response) {
      const responseData = error.response.data;

      if (responseData.errors) {
        // If there are validation errors, store them
        errors.value = responseData.errors;
      } else {
        // If it's a general error, store the message
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
/* If you still need custom styles, you can define them here */
</style>
