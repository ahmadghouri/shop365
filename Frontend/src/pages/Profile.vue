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
        <!-- <label for="phone" class="mt-1">Phone Number</label>
        <input
          v-model="phone"
          class="max-w-full min-h-12 rounded-lg border-[#ECECEB] border-2 mt-2 p-4"
          type="text"
        /> -->

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
      <div class="flex justify-center items-center gap-4">
        <button class="button mt-6" @click="updateProfile">Save</button>
        <button class="button-border mt-6" @click="logoutButton">Logout</button>
      </div>
    </div>
  </div>

  <div v-else class="flex justify-center items-center h-screen bg-gray-100">
    <div
      class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { authApi } from "@/api/modules/auth.api";
import { userApi } from "@/api/modules/user.api";
import { QUERY_KEYS } from "@/api/queries/query-keys";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const router = useRouter();
const authStore = useAuthStore();
const { logout } = authStore;
const queryClient = useQueryClient();

const name = ref("");
const phone = ref("");
const address = ref("");
const profile_id = ref();

// TanStack Query - fetch profile
const { data: profile, isLoading } = useQuery({
  queryKey: QUERY_KEYS.PROFILE,
  queryFn: () => authApi.profile().then((r) => {
    const d = r.data.data;
    profile_id.value = d.user?.id || d.user?._id;
    phone.value = d.user?.phone_no || "";
    name.value = d.user?.name || "No Name";
    address.value = d.household?.address || "No Address";
    return d;
  }),
});

// TanStack Mutation - update profile
const updateMutation = useMutation({
  mutationFn: (data) => userApi.update(profile_id.value, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROFILE });
    alert("Profile updated successfully!");
  },
  onError: () => alert("Failed to update profile."),
});

const updateProfile = () => {
  updateMutation.mutate({ phone_no: phone.value, name: name.value, address: address.value });
};

const logoutButton = () => {
  logout();
  router.push("/userlogin");
};

const goBack = () => router.back();
</script>

