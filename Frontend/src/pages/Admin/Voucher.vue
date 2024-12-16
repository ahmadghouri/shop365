<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="w-full max-w-md">
      <div
        class="bg-white shadow-2xl rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105"
      >
        <div class="px-8 py-10">
          <h2
            class="text-center text-4xl font-extrabold text-gray-900 mb-10 tracking-tight"
          >
            Create Voucher
          </h2>

          <form @submit.prevent="createVoucher" class="space-y-6">
            <div>
              <label
                for="business"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Business
              </label>
              <div class="relative">
                <select
                  v-model="voucherData.business_id"
                  id="business"
                  required
                  class="appearance-none w-full bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out"
                >
                  <option value="" disabled>Select Business</option>
                  <option
                    v-for="business in businessStore.businesses"
                    :key="business.id"
                    :value="business.id"
                  >
                    {{ business.name }}
                  </option>
                </select>
                <div
                  class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400"
                >
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 6.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label
                for="code"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Voucher Code
              </label>
              <input
                type="text"
                v-model="voucherData.code"
                id="code"
                required
                maxlength="12"
                placeholder="Enter voucher code"
                :class="[
                  'w-full rounded-lg py-3 px-4 text-sm transition duration-200 ease-in-out',
                  voucherData.code.length > 12
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500',
                ]"
              />
              <p
                :class="[
                  'mt-2 text-sm',
                  voucherData.code.length > 12
                    ? 'text-red-600'
                    : 'text-gray-500',
                ]"
              >
                {{ voucherData.code.length }}/12 characters
              </p>
            </div>

            <div>
              <label
                for="discount"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Discount Amount
              </label>
              <input
                type="number"
                v-model.number="voucherData.discount_amount"
                id="discount"
                required
                min="0"
                placeholder="Enter discount amount"
                class="w-full rounded-lg py-3 px-4 text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out"
              />
            </div>

            <div>
              <label
                for="expiry"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Expiry Date
              </label>
              <input
                type="date"
                v-model="voucherData.expiry_date"
                id="expiry"
                required
                class="w-full rounded-lg py-3 px-4 text-sm border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 ease-in-out"
              />
            </div>

            <div>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out transform active:scale-95 disabled:opacity-50"
              >
                <span v-if="isSubmitting" class="flex items-center">
                  <svg
                    class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </span>
                <span v-else>Create Voucher</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Success Notification -->
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="successMessage"
          class="mt-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-md"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-green-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700 font-medium">
                {{ successMessage }}
              </p>
            </div>
          </div>
        </div>
      </transition>

      <!-- Error Notification -->
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="errorMessage"
          class="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-md"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <svg
                class="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700 font-medium">
                {{ errorMessage }}
              </p>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useBusinessStore } from "../../store/businessStore";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const businessStore = useBusinessStore();

const voucherData = ref({
  business_id: null,
  code: "",
  discount_amount: null,
  expiry_date: null,
});

const isSubmitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const createVoucher = async () => {
  // Validate input
  if (!voucherData.value.business_id) {
    errorMessage.value = "Please select a business";
    return;
  }

  // Validate voucher code length
  if (voucherData.value.code.length > 12) {
    errorMessage.value = "Voucher code cannot be longer than 12 characters";
    return;
  }

  // Reset previous messages
  errorMessage.value = "";
  successMessage.value = "";

  // Start submission
  isSubmitting.value = true;

  try {
    // Send data to API
    const response = await axios.post(
      `${API_BASE_URL}/api/admin/create-voucher`,
      {
        business_id: voucherData.value.business_id,
        code: voucherData.value.code,
        discount_amount: voucherData.value.discount_amount,
        expiry_date: voucherData.value.expiry_date,
      }
    );

    // Handle successful creation
    successMessage.value = "Voucher Created Successfully";

    // Reset form
    voucherData.value = {
      business_id: null,
      code: "",
      discount_amount: null,
      expiry_date: null,
    };
  } catch (error) {
    // Handle error
    errorMessage.value =
      error.response?.data?.message || "Failed to create voucher";
    console.error("Voucher creation error:", error);
  } finally {
    // Stop submission
    isSubmitting.value = false;
  }
};

onMounted(async () => {
  try {
    await businessStore.getBusinesses();
  } catch (error) {
    errorMessage.value = "Failed to load businesses";
    console.error("Failed to load businesses:", error);
  }
});
</script>

<style scoped>
/* Additional custom styles can be added here if needed */
input:focus,
select:focus {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}
</style>
