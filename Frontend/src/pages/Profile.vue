<template>
  <div class="mobile-spacing" v-if="profile">
    <div class="flex flex-col relative">
      <div class="relative mt-2">
        <!-- Back Arrow Button -->
        <button
          @click="goBack"
          class="absolute left-0 top-1/2 transform -translate-y-1/2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4 text-gray-700 hover:text-gray-900"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <!-- Orders Title -->
        <div class="flex justify-center">
          <h1 class="text-center text-xl font-semibold">Profile</h1>
        </div>
      </div>
      <div class="flex flex-col mt-6 space-y-4">
        <label for="phone" class="mt-1">Phone Number</label>
        <input
          class="max-w-full min-h-12 rounded-lg border-[#ECECEB] border-2 mt-2 p-4"
          type="text"
          :value="profile.user?.phone_no || ''"
        />

        <label for="name" class="mt-1">Name</label>
        <input
          class="max-w-full min-h-12 rounded-lg border-[#ECECEB] border-2 mt-2 p-4"
          type="text"
          :value="profile.user.name || 'No Name'"
        />

        <label for="password" class="mt-1">Password</label>
        <input
          class="max-w-full min-h-12 rounded-lg border-[#ECECEB] border-2 mt-2 p-4"
          type="password"
          value="********"
          readonly
        />

        <label for="address" class="mt-1">Address</label>
        <textarea
          class="rounded-lg border-[#ECECEB] border-2 mt-2 p-4"
          :value="computedAddress"
          readonly
        ></textarea>
      </div>
    </div>

    <!-- Fixed buttons at the bottom -->
    <div
      class="fixed inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-white p-4"
    >
      <button class="button" @click="logout">Logout</button>
    </div>
  </div>

  <div v-else>
    <!-- Show a loading spinner or message while data is being fetched -->
    <p>Loading...</p>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import { API_BASE_URL } from "../config/api";
import { useRouter } from "vue-router";

const profile = ref(null);
const router = useRouter();

const computedAddress = computed(() => {
  if (profile.value && profile.value.household && profile.value.town) {
    return (
      `${profile.value.household.address || ""} ${
        profile.value.town.town_name || ""
      }`.trim() || "No Address"
    );
  }
  return "No Address";
});

const logout = () => {
  localStorage.removeItem("token");
  router.push("/userlogin");
};

const goBack = () => {
  router.back();
};

async function getProfileData() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    profile.value = response.data.data; // Adjust according to actual API response structure
  } catch (error) {
    console.error(error);
    // Handle errors, e.g., show an error message to the user
  }
}

onMounted(async () => {
  await getProfileData();
});
</script>

<style scoped>
/* Optional: Add custom styles here if needed */
</style>
