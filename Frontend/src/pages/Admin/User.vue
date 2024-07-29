<template>
  <div class="bg-gray-100 min-h-screen">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-800">All Users</h1>
    </div>

    <!-- User Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      <div
        v-for="user in userStore.users"
        :key="user.id"
        class="bg-white shadow-md rounded-lg overflow-hidden flex flex-col gap-4 p-4"
      >
        <div class="">
          <div class="flex flex-col">
            <p class="text-xl font-semibold text-gray-800 mb-1">
              {{ user.name || "No Name" }}
            </p>
            <p class="text-md mb-1">Phone:{{ user.phone_no }}</p>
          </div>
          <div class="text-gray-500">
            <p class="mb-1">
              Address: {{ user.household?.address || "No Address" }}
            </p>
            <p class="mb-1">
              Town: {{ user.household?.town?.town_name || "No Town" }}
            </p>
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="editUser(user)"
            class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            @click="deleteUser(user.id)"
            class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useUserStore } from "../../store/userStore";

const userStore = useUserStore();
console.log(userStore);

const fetchUsers = async () => {
  await userStore.getUsers();
};

onMounted(() => {
  fetchUsers();
});

// Dummy methods for edit and delete (you should implement these methods)
const editUser = (user) => {
  console.log("Edit user:", user);
};

const deleteUser = async (userId) => {
  await userStore.deleteUser(userId);
};
</script>

<style scoped>
/* Custom styles if needed */
</style>
