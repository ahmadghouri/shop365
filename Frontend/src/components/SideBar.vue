<template>
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md lg:static lg:translate-x-0 lg:flex lg:flex-col overflow-hidden',
      { '-translate-x-full': !sidebarOpen },
    ]"
    class="transform transition-transform duration-300 ease-in-out"
  >
    <div class="p-4">
      <h1 class="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
      <button
        @click="emitCloseSidebar"
        class="p-2 text-red-600 bg-red-100 rounded-md lg:hidden"
      >
        <img class="w-3 h-3" src="../images/close.png" />
      </button>
    </div>
    <nav class="mt-6 overflow-hidden">
      <ul v-if="role === 'admin'">
        <li class="px-4 py-2">
          <router-link
            to="/admin/dashboard"
            class="block text-gray-700 hover:text-gray-900"
          >
            Restaurants
          </router-link>
        </li>

        <li class="px-4 py-2">
          <router-link
            to="/admin/users"
            class="block text-gray-700 hover:text-gray-900"
          >
            Users
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
            to="/admin/restaurantAdmin"
            class="block text-gray-700 hover:text-gray-900"
          >
            Register Admin
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
            to="/admin/vendors"
            class="block text-gray-700 hover:text-gray-900"
          >
            View Vendors
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
            to="/admin/stats"
            class="block text-gray-700 hover:text-gray-900"
          >
            Stats
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
            to="/admin/shop365/users"
            class="block text-gray-700 hover:text-gray-900"
          >
            SHOP365 Store
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
            to="/admin/vouchers"
            class="block text-gray-700 hover:text-gray-900"
          >
            Voucher
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
          to="/admin/internship-applications"
          class="block text-gray-700 hover:text-gray-900"
        >
          Intern Applications
        </router-link>
      </li>
        <li class="px-4 py-2">
          <router-link
            to="/admin/carousel"
            class="block text-gray-700 hover:text-gray-900"
          >
            Carousel
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
            to="/admin/pos-products"
            class="block text-gray-700 hover:text-gray-900"
          >
            POS Products
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
            to="/userLogin"
            class="block text-gray-700 hover:text-gray-900"
          >
            <button @click="logout">Logout</button>
          </router-link>
        </li>
      </ul>
      <ul v-else-if="role === 'restaurant_admin'">
        <li class="px-4 py-2">
          <router-link
            to="/admin/restaurantOrders"
            class="block text-gray-700 hover:text-gray-900"
          >
            Orders
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
            to="/admin/sub-business"
            class="block text-gray-700 hover:text-gray-900"
          >
            Sub Businesses
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
            to="/admin/restaurantAdminDashboard"
            class="block text-gray-700 hover:text-gray-900"
          >
            Products
          </router-link>
        </li>
        <!-- Shop365 Mart restaurant admin user id -->
        <li v-if="authStore.user?.phone_no === '62222222222'" class="px-4 py-2">
          <router-link
            to="/admin/easyBuyAdminDashboard"
            class="block text-gray-700 hover:text-gray-900"
          >
            EasyBuy Products
          </router-link>
        </li>
        <!-- Shop365 Mart restaurant admin user id -->
        <li v-if="authStore.user?.phone_no === '62222222222'" class="px-4 py-2">
          <router-link
            to="/admin/pos-products"
            class="block text-gray-700 hover:text-gray-900"
          >
            POS Products
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
            to="/admin/discount"
            class="block text-gray-700 hover:text-gray-900"
          >
            Discount
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
            to="/admin/business-reviews"
            class="block text-gray-700 hover:text-gray-900"
          >
            Reviews
          </router-link>
        </li>
        <li class="px-4 py-2">
          <router-link
            to="/userLogin"
            class="block text-gray-700 hover:text-gray-900"
          >
            <button @click="logout">Logout</button>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore";
import { storeToRefs } from "pinia";

const props = defineProps({
  sidebarOpen: Boolean,
});

const emit = defineEmits(["closeSidebar"]);

const emitCloseSidebar = () => {
  emit("closeSidebar");
};

const authStore = useAuthStore();
const { logout } = authStore;
const { role } = storeToRefs(authStore);

console.log(authStore.user)

onMounted(() => {});
</script>

<style scoped>
body {
  overflow-x: hidden;
}
</style>
