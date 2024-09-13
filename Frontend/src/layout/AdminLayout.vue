<template>
  <div class="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
    <!-- Button to open sidebar on mobile -->
    <div class="flex justify-between items-center lg:hidden bg-gray-200 p-4">
      <button
        @click="toggleSidebar"
        class="text-gray-500 p-2 bg-gray-200 rounded-md focus:outline-none"
      >
        ☰
      </button>

      <h1 class="text-lg font-bold">Admin</h1>

      <button
        class="p-2 text-red-600 hover:bg-red-100 rounded-md"
        @click="handleLogout"
      >
        Log out
      </button>
    </div>

    <Sidebar :sidebarOpen="sidebarOpen" @closeSidebar="toggleSidebar" />

    <main class="flex-1 overflow-auto lg:py-12 lg:px-12">
      <router-view></router-view>
    </main>

    <div class="lg:hidden z-10 relative">
      <div
        class="w-full bg-gray-200 min-h-full absolute bottom-0 mobile-spacing"
      >
        <div>
          <ul class="flex justify-between items-center lg:hidden">
            <routerLink
              to="/admin/restaurantOrders"
              class="flex flex-col items-center justify-center"
            >
              <img src="/order.png" alt="" class="w-5 h-5" />
              <span>Orders</span>
            </routerLink>
            <routerLink
              to="/admin/restaurantAdminDashboard"
              class="flex flex-col items-center justify-center"
            >
              <img src="/product.png" alt="" class="w-5 h-5" />
              <span>Products</span>
            </routerLink>
            <routerLink
              to="/admin/discount"
              class="flex flex-col items-center justify-center"
            >
              <img src="/discount.png" alt="" class="w-5 h-5" />
              <span>Discount</span>
            </routerLink>
            <routerLink
              :to="{ name: 'AdminProfile' }"
              class="flex flex-col items-center justify-center"
            >
              <img src="/user.png" alt="" class="w-5 h-5" />
              <span>Profile</span>
            </routerLink>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Sidebar from "../components/SideBar.vue";
import { useRouter } from "vue-router";

const sidebarOpen = ref(false);
const route = useRouter();

const handleLogout = () => {
  localStorage.removeItem("token");
  route.push("/userLogin");
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
</script>

<style scoped>
/* Ensure there is no horizontal overflow */
body {
  overflow-x: hidden;
}
</style>
