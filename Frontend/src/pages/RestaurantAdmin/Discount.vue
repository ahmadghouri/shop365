<template>
  <div class="mobile-spacing">
    <h1 class="text-2xl font-bold text-gray-800 mb-4">Apply Discount</h1>

    <form @submit.prevent="applyDiscount" class="space-y-4 lg:max-w-[400px]">
      <div>
        <label for="discount" class="block text-gray-700 font-semibold mb-1">
          Discount Percentage
        </label>
        <input id="discount" v-model.number="discount" type="number" min="0" max="100"
          :placeholder="discountPlaceholder" class="w-full p-2 border border-gray-300 rounded-md" required />
      </div>

      <p>{{ discountPlaceholder }}</p>

      <button type="submit"
        class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-150">
        Apply Discount
      </button>
    </form>

    <p v-if="responseMessage" class="mt-4 text-center text-gray-700">
      {{ responseMessage }}
    </p>

    <!-- Display Discount Details -->
    <div v-if="discountDetails" class="mt-8 p-4 border rounded-lg bg-white shadow-lg">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Current Discount</h2>
      <p class="text-gray-700">
        <span class="font-semibold">Discount:</span>
        {{ discountDetails.discount }}%
      </p>
      <p class="text-gray-700">
        <span class="font-semibold">Created At:</span>
        {{ formatDate(discountDetails.created_at) }}
      </p>
      <button @click="removeDiscount"
        class="mt-4 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-150">
        Remove Discount
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";

const discount = ref(0);
const responseMessage = ref("");
const discountDetails = ref(null);

const discountPlaceholder = computed(() => {
  return discountDetails.value
    ? `Current discount: ${discountDetails.value.discount}%`
    : "Current discount: 0%";
});

// Load discount details from local storage on component mount
onMounted(() => {
  const savedDiscount = localStorage.getItem("discountDetails");
  if (savedDiscount) {
    discountDetails.value = JSON.parse(savedDiscount);
    discount.value = discountDetails.value.discount; // Set discount to reflect current value
  }
});

const applyDiscount = async () => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/restaurantAdmin/products/discount`,
      {
        discount: discount.value,
      }
    );

    responseMessage.value = "Discount applied successfully!";
    // Update discount details from response
    discountDetails.value = {
      discount: response.data.data.discount,
      created_at: response.data.data.created_at,
    };
    discount.value = discountDetails.value.discount; // Update the discount value
    // Save discount details to local storage
    localStorage.setItem(
      "discountDetails",
      JSON.stringify(discountDetails.value)
    );
  } catch (error) {
    responseMessage.value = "Failed to apply discount. Please try again.";
  }
};

const removeDiscount = async () => {
  try {
    await axios.get(
      `${API_BASE_URL}/api/restaurantAdmin/products/removeDiscount`,
      {}
    );
    responseMessage.value = "Discount removed successfully!";
    discountDetails.value = null; // Clear discount details
    discount.value = 0; // Reset discount input
    // Remove discount details from local storage
    localStorage.removeItem("discountDetails");
  } catch (error) {
    responseMessage.value = "Failed to remove discount. Please try again.";
  }
};

const formatDate = (dateString) => {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
</script>

<style scoped>
/* Add your styles here */
</style>
