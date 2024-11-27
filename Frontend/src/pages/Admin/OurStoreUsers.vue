<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-8">
    <div class="container mx-auto">
      <!-- Page Header -->
      <h1
        class="text-5xl font-extrabold text-center text-gray-800 mb-12 tracking-tight"
      >
        SHOP365 Users
      </h1>

      <!-- Users Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="user in users"
          :key="user.id"
          class="bg-white shadow-xl rounded-2xl p-6 transform transition-all hover:scale-105 hover:shadow-2xl"
        >
          <!-- User Profile Header -->
          <div class="flex items-center mb-6">
            <div
              class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-4"
            >
              {{ user.name.charAt(0) }}
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-800">{{ user.name }}</h2>
              <p class="text-gray-500">User ID: {{ user.id }}</p>
            </div>
          </div>

          <!-- User Details -->
          <div class="space-y-4">
            <div class="bg-gray-50 p-3 rounded-lg">
              <h3 class="text-sm font-semibold text-gray-600 mb-1">
                Contact Information
              </h3>
              <p class="text-gray-800">
                <strong>Phone:</strong> {{ user.phone_no }}
              </p>
            </div>

            <div class="bg-gray-50 p-3 rounded-lg">
              <h3 class="text-sm font-semibold text-gray-600 mb-1">
                User Statistics
              </h3>
              <div class="flex justify-between">
                <div>
                  <strong>Points:</strong>
                  <span class="text-blue-600 font-bold">{{ user.points }}</span>
                </div>
                <div>
                  <strong>Orders:</strong>
                  <span class="text-green-600 font-bold">{{
                    user.order_count
                  }}</span>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 p-3 rounded-lg">
              <h3 class="text-sm font-semibold text-gray-600 mb-1">
                Location Details
              </h3>
              <p><strong>Address:</strong> {{ user.household.address }}</p>
              <p><strong>Town:</strong> {{ user.household.town.town_name }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- No Users Placeholder -->
      <div
        v-if="users.length === 0"
        class="text-center bg-white shadow-md rounded-lg p-12 mt-8"
      >
        <p class="text-2xl text-gray-500">No users found</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { useUserStore } from "../../store/userStore";
import { onMounted } from "vue";

const usersStore = useUserStore();
const { groceryUsers: users } = storeToRefs(usersStore);

onMounted(() => {
  usersStore.fetchUsers();
});
</script>

<style scoped></style>
