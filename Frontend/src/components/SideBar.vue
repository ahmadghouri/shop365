<template>
  <aside :class="[
    'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md lg:static lg:translate-x-0 lg:flex lg:flex-col overflow-hidden',
    { '-translate-x-full': !sidebarOpen },
  ]" class="transform transition-transform duration-300 ease-in-out">
    <div class="p-4">
      <h1 class="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
      <button @click="emitCloseSidebar" class="p-2 text-red-600 bg-red-100 rounded-md lg:hidden">
        <img class="w-3 h-3" src="../images/close.png" />
      </button>
    </div>
    <nav class="mt-6 overflow-hidden">
      <ul v-if="role === 'admin'">
        <li class="px-4 py-2">
          <router-link to="/admin/dashboard" class="block text-gray-700 hover:text-gray-900">
            Restaurants
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link to="/admin/users" class="block text-gray-700 hover:text-gray-900">
            Users
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link to="/admin/restaurantAdmin" class="block text-gray-700 hover:text-gray-900">
            Register Admin
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link to="/admin/vendors" class="block text-gray-700 hover:text-gray-900">
            View Vendors
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link to="/admin/stats" class="block text-gray-700 hover:text-gray-900">
            Stats
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link to="/userLogin" class="block text-gray-700 hover:text-gray-900">
            <button @click="logout">Logout</button>
          </router-link>
        </li>
      </ul>
      <ul v-else-if="role === 'restaurant_admin'">
        <li class="px-4 py-2">
          <router-link to="/admin/restaurantOrders" class="block text-gray-700 hover:text-gray-900">
            Orders
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link to="/admin/restaurantAdminDashboard" class="block text-gray-700 hover:text-gray-900">
            Products
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link to="/admin/discount" class="block text-gray-700 hover:text-gray-900">
            Discount
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link to="/userLogin" class="block text-gray-700 hover:text-gray-900">
            <button @click="logout">Logout</button>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted } from "vue";

const props = defineProps({
  sidebarOpen: Boolean,
});

const emit = defineEmits(["closeSidebar"]);

const emitCloseSidebar = () => {
  emit("closeSidebar");
};

const role = ref(localStorage.getItem("role"));

const logout = () => {
  localStorage.removeItem("token");
};

onMounted(() => {
  role.value = localStorage.getItem("role");
});
</script>

<style scoped>
body {
  overflow-x: hidden;
}
</style>
