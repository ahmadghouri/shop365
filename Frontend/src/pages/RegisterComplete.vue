<template>
  <section class="bg-gray-50 min-h-screen flex items-center justify-center p-6">
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
      <h1 class="text-2xl font-bold mb-6 text-center text-gray-800">
        Additional Details
      </h1>

      <form @submit.prevent="register" class="space-y-6">
        <div>
          <label
            for="name"
            class="block mb-2 text-sm font-medium text-gray-900"
          >
            Your Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            v-model="name"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            placeholder="Enter your name"
            required
          />
        </div>

        <div>
          <label
            for="address"
            class="block mb-2 text-sm font-medium text-gray-900"
          >
            Address
          </label>
          <input
            type="text"
            name="address"
            id="address"
            v-model="address"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            placeholder="Enter your address"
            required
          />
        </div>

        <div>
          <label
            for="town"
            class="block mb-2 text-sm font-medium text-gray-900"
          >
            City
          </label>
          <select
            name="town"
            id="town"
            v-model="town"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-2.5"
            required
          >
            <option
              v-for="townOption in towns"
              :key="townOption.id"
              :value="townOption.town_name"
            >
              {{ townOption.town_name }}
            </option>
          </select>
        </div>

        <div class="flex justify-between space-x-4">
          <button
            type="submit"
            class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { useRouter, useRoute } from "vue-router";
import { useCartStore } from "../store/cartStore";

const towns = ref([]);
const name = ref("");
const address = ref("");
const town = ref("");
const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();

const register = async () => {
  try {
    const formattedAddress = address.value.toLowerCase().replace(/\s+/g, "");

    const resp = await axios.post(`${API_BASE_URL}/api/add-details`, {
      name: name.value,
      address: address.value,
      town: town.value,
    });

    if (route.query.fromCart === "true" || cartStore.cartItems.length > 0) {
      router.push("/home/cart");
    } else {
      router.push("/home/categories");
    }
  } catch (error) {
    if (error.response) {
      alert(`Error: ${error.response.data.message}`);
    } else if (error.request) {
      alert("Network error. Please try again.");
    } else {
      alert("An unexpected error occurred.");
    }
  }
};

const options = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/get-towns`);
    towns.value = response.data.data;

    // Automatically select the first town as default
    if (towns.value.length > 0) {
      town.value = towns.value[0].town_name;
    }
  } catch (error) {
    if (error.response) {
      alert(`Error: ${error.response.data.message}`);
    } else if (error.request) {
      alert("Network error. Please try again.");
    } else {
      alert("An unexpected error occurred.");
    }
  }
};

onMounted(() => {
  options();
});
</script>
