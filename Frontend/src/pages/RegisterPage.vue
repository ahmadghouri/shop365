<template>
  <section class="bg-gray-50 min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">
        Create an Account
      </h1>

      <form @submit.prevent="register" class="space-y-6">
        <!-- Phone Number Input -->
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
            @input="sanitizePhoneInput"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            placeholder="Enter your phone number"
            required
          />
          <!-- Error Message for Phone -->
          <p v-if="errors.phone_no" class="text-sm text-red-600">
            {{ errors.phone_no[0] }}
          </p>
        </div>

        <!-- Password Input -->
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

        <!-- Confirm Password Input -->
        <div>
          <label
            for="confirmPassword"
            class="block mb-2 text-sm font-medium text-gray-900"
          >
            Confirm Password
          </label>
          <input
            v-model="confirmPassword"
            type="password"
            name="confirmPassword"
            id="confirmPassword"
            placeholder="Confirm your password"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            required
          />
          <!-- Error Message for Confirm Password -->
          <p v-if="confirmPasswordError" class="text-sm text-red-600">
            {{ confirmPasswordError }}
          </p>
        </div>

        <!-- Terms and Conditions -->
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

        <!-- Submit Button -->
        <button type="submit" class="button">Create an Account</button>

        <!-- Login Link and Footer -->
        <div class="mt-6">
          <p class="text-sm font-light text-gray-500 text-center">
            Already have an account?
            <router-link
              to="/userlogin"
              class="font-medium text-yellow-600 hover:underline"
            >
              Log In
            </router-link>
          </p>
          <div class="flex justify-center mt-2">
            <span
              class="inline-flex items-center px-3 italic py-1.5 text-sm font-medium text-yellow-600"
            >
              Powered by
              <a href="#" class="ml-1 underline">NBT-HUB</a>
            </span>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { authApi } from "@/api/modules/auth.api";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../store/cartStore";

const phone = ref("");
const password = ref("");
const confirmPassword = ref("");
const termsAccepted = ref(true);
const errors = ref({});
const generalError = ref("");
const confirmPasswordError = ref("");
const router = useRouter();

const registerMutation = useMutation({
  mutationFn: (data) => authApi.register(data),
  onSuccess: async () => {
    const authStore = useAuthStore();
    const cartStore = useCartStore();
    const hasGuestCartItems = cartStore.cartItems.length > 0;

    const loginResult = await authStore.login(phone.value, password.value);
    if (loginResult.success) {
      cartStore.$patch({ isGuest: false });
      if (hasGuestCartItems) {
        router.push({ path: "/compregister", query: { fromCart: "true" } });
      } else {
        router.push("/compregister");
      }
    }
  },
  onError: (error) => {
    if (error.response) {
      const responseData = error.response.data;
      if (responseData.errors) errors.value = responseData.errors;
      else generalError.value = responseData.message || "An error occurred";
    } else if (error.request) {
      generalError.value = "Network error. Please try again.";
    } else {
      generalError.value = "An unexpected error occurred.";
    }
  },
});

const register = () => {
  if (!termsAccepted.value) {
    alert("You must accept the terms and conditions.");
    return;
  }
  errors.value = {};
  generalError.value = "";
  confirmPasswordError.value = "";

  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = "Passwords do not match.";
    return;
  }

  registerMutation.mutate({ phone_no: phone.value, password: password.value });
};

const sanitizePhoneInput = () => {
  phone.value = phone.value.replace(/[^0-9]/g, "");
};
</script>

<style scoped>
/* Add any custom styles here if needed */
</style>
