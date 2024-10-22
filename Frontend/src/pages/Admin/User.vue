<template>
  <div class="bg-gray-50 min-h-screen p-6">
    <div class="mb-6 bg-white shadow-sm rounded-lg p-4">
      <div class="flex justify-between items-center mb-3">
        <h2 class="text-xl font-semibold text-gray-800">User Statistics</h2>
        <button
          @click="refreshData"
          class="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center"
        >
          <svg
            class="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
          Refresh
        </button>
      </div>
      <div class="flex justify-between items-center">
        <div>
          <p class="text-sm text-gray-600">Total Users</p>
          <p class="text-2xl font-bold text-gray-900">
            {{ userStore.totalUsersCount }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-600">New Users Today</p>
          <p class="text-2xl font-bold text-green-600">
            {{ userStore.todayUsersCount }}
          </p>
        </div>
      </div>
    </div>
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-semibold text-gray-900">Users</h1>
      <select
        v-model="sortOrder"
        class="bg-white border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-200"
      >
        <option value="desc">Highest Orders First</option>
        <option value="asc">Lowest Orders First</option>
      </select>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(user, index) in sortedUsers"
        :key="user.id"
        :class="[
          'relative group bg-white shadow-sm rounded-lg overflow-hidden flex flex-col transition-transform duration-200',
          isTopThree(index)
            ? 'border-2 border-yellow-400 bg-yellow-50'
            : 'hover:shadow-lg',
        ]"
      >
        <div class="p-4 flex-grow">
          <div class="flex justify-between items-start mb-4">
            <div>
              <p class="text-lg font-semibold text-gray-800">
                {{ user.name || "No Name" }}
                <span
                  v-if="isTopThree(index)"
                  class="ml-2 text-xs bg-yellow-300 text-gray-700 px-2 py-0.5 rounded-full"
                >
                  Top {{ index + 1 }}
                </span>
              </p>
              <p class="text-sm text-gray-500">{{ user.phone_no }}</p>
            </div>
            <div
              class="text-sm font-medium px-3 py-1 rounded-full"
              :class="
                isTopThree(index)
                  ? 'bg-yellow-300 text-yellow-900'
                  : 'bg-gray-200 text-gray-700'
              "
            >
              {{ user.orders_count }} Order{{
                user.orders_count !== 1 ? "s" : ""
              }}
            </div>
          </div>

          <div class="text-gray-600 text-sm">
            <p class="mb-1">
              <span class="font-medium">Created At:</span>
              {{ new Date(user.created_at).toLocaleDateString() }}
            </p>
            <p class="mb-1">
              <span class="font-medium">Address:</span>
              {{ user.household?.address || "No Address" }}
            </p>
            <p>
              <span class="font-medium">Town:</span>
              {{ user.household?.town?.town_name || "No Town" }}
            </p>
          </div>

          <button
            @click="showDeleteConfirmation(user.id)"
            class="mt-4 bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-xl">
        <h2 class="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p class="mb-4">Are you sure you want to delete this User?</p>
        <div class="flex justify-end space-x-2">
          <button
            @click="confirmDelete"
            class="bg-red-500 px-4 py-2 text-white rounded-md"
          >
            Delete
          </button>
          <button
            @click="cancelDelete"
            class="bg-gray-300 px-4 py-2 text-gray-800 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "../../store/userStore";
import { toast } from "vue3-toastify";

const userStore = useUserStore();
const sortOrder = ref("desc");
const showDeleteConfirm = ref(false);
const userId = ref("");

const token = localStorage.getItem("token");

const showDeleteConfirmation = (id) => {
  userId.value = id;
  showDeleteConfirm.value = true;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  restaurantToDeleteId.value = null;
};

const confirmDelete = async () => {
  if (userId.value) {
    await userStore.deleteUser(userId.value);
    showDeleteConfirm.value = false;
    userId.value = null;
    toast.success("Admin Deleted Successfully");
  }
};

const fetchUsers = async () => {
  await userStore.getUsers();
};

const refreshData = async () => {
  await fetchUsers();
};

onMounted(() => {
  fetchUsers();
});

const sortedUsers = computed(() => {
  return [...userStore.users].sort((a, b) => {
    if (sortOrder.value === "desc") {
      return b.orders_count - a.orders_count;
    } else {
      return a.orders_count - b.orders_count;
    }
  });
});

const isTopThree = (index) => {
  return index < 3 && sortOrder.value === "desc";
};
</script>

<style scoped></style>
