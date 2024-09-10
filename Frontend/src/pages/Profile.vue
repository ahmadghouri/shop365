<template>
  <div class="mobile-spacing lg:w-1/2 lg:mx-auto" v-if="profile">
    <div class="relative lg:px-32 lg:py-8">
      <!-- Header with Back Button and Title -->
      <div class="relative flex items-center justify-between mt-4 lg:mt-8">
        <!-- Back Arrow Button -->
        <button
          @click="goBack"
          class="absolute left-0 top-1/2 transform -translate-y-1/2 lg:left-0 lg:top-auto lg:relative lg:transform-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-6 h-6 text-gray-700 hover:text-gray-900"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <!-- Profile Title -->
        <div class="flex-1 text-center">
          <h1 class="text-xl font-semibold lg:text-2xl">Profile</h1>
        </div>

        <!-- Empty Div for Alignment (if needed) -->
        <div></div>
      </div>

      <!-- Profile Content Here -->
      <div class="flex flex-col space-y-6 lg:space-y-8 mt-6 lg:mt-8">
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
      <button class="button mt-6" @click="logout">Logout</button>
    </div>
  </div>

  <div v-else class="flex justify-center items-center h-screen bg-gray-100">
    <div
      class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"
    ></div>
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
