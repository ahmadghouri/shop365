<template>
  <div class="mobile-spacing lg:w-1/2 lg:mx-auto" v-if="profile">
    <div class="relative lg:px-32 lg:py-8">
      <!-- Header with Back Button and Title -->
      <div class="relative flex items-center justify-between mt-4 lg:mt-8">
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
        <div class="flex-1 text-center">
          <h1 class="text-xl font-semibold lg:text-2xl">Profile</h1>
        </div>
        <div></div>
      </div>

      <!-- Profile Content Here -->
      <div class="flex flex-col space-y-6 lg:space-y-8 mt-6 lg:mt-8">
        <label for="phone" class="mt-1">Phone Number</label>
        <input
          v-model="phone"
          class="max-w-full min-h-12 rounded-lg border-[#ECECEB] border-2 mt-2 p-4"
          type="text"
        />

        <label for="name" class="mt-1">Name</label>
        <input
          v-model="name"
          class="max-w-full min-h-12 rounded-lg border-[#ECECEB] border-2 mt-2 p-4"
          type="text"
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
          v-model="address"
          class="rounded-lg border-[#ECECEB] border-2 mt-2 p-4"
        ></textarea>
      </div>

      <!-- Save Button to Update Profile -->
      <button class="button mt-6" @click="updateProfile">Save</button>
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
import { ref, onMounted } from "vue";
import { useUserStore } from "../store/userStore"; // Pinia store import
import { useRouter } from "vue-router";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

const profile = ref(null);
const router = useRouter();
const profile_id = ref();
const phone = ref("");
const name = ref("");
const address = ref("");

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
    profile.value = response.data.data;
    profile_id.value = response.data.data.user.id;
    phone.value = profile.value.user?.phone_no || "";
    name.value = profile.value.user?.name || "No Name";
    address.value = profile.value.household?.address || "No Address";
  } catch (error) {
    console.error(error);
  }
}

// Use the store to update user
const userStore = useUserStore();

const updateProfile = async () => {
  const updatedData = {
    phone_no: phone.value,
    name: name.value,
    address: address.value,
  };

  try {
    // Send the update request to the API
    await axios.put(
      `${API_BASE_URL}/api/update/${profile_id.value}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    // Optionally, refresh profile data after the update
    await getProfileData();
    alert("Profile updated successfully!"); // Success message
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Failed to update profile."); // Error message
  }
};

onMounted(async () => {
  await getProfileData();
});
</script>

<style scoped>
/* Optional: Add custom styles here if needed */
</style>
