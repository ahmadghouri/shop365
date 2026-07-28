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
import { useQuery, useMutation } from "@tanstack/vue-query";
import { authApi } from "@/api/modules/auth.api";
import { townApi } from "@/api/modules/town.api";
import { QUERY_KEYS } from "@/api/queries/query-keys";
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCartStore } from "../store/cartStore";

const name = ref("");
const address = ref("");
const town = ref("");
const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();

// TanStack Query - fetch towns
const { data: townsData } = useQuery({
  queryKey: QUERY_KEYS.TOWNS,
  queryFn: () => townApi.getTowns().then((r) => {
    const t = r.data.data;
    if (t && t.length > 0 && !town.value) {
      town.value = t[0].town_name;
    }
    return t;
  }),
});

const towns = computed(() => townsData.value || []);

// TanStack Mutation - add details
const addDetailsMutation = useMutation({
  mutationFn: (data) => authApi.addDetails(data),
  onSuccess: () => {
    if (route.query.fromCart === "true" || cartStore.cartItems.length > 0) {
      router.push("/home/cart");
    } else {
      router.push("/home/categories");
    }
  },
  onError: (error) => {
    const msg = error.response?.data?.message || error.message || "An error occurred";
    alert(`Error: ${msg}`);
  },
});

const register = () => {
  addDetailsMutation.mutate({
    name: name.value,
    address: address.value,
    town: town.value,
  });
};
</script>

