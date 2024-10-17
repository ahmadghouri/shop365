<template>
  <div class="bg-gray-50 min-h-screen p-6">
    <div class="mb-6 flex items-center justify-between">
      <h1 class="text-3xl font-semibold text-gray-900">User Management</h1>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "../../store/userStore";

const userStore = useUserStore();
const sortOrder = ref("desc");

const fetchUsers = async () => {
  await userStore.getUsers();
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

<style scoped>
/* Optional custom styles for further refinement */
</style>
