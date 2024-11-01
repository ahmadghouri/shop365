<template>
  <div class="flex flex-col lg:flex-row h-screen bg-gray-100 overflow-hidden">
    <!-- Button to open sidebar on mobile -->
    <div class="flex justify-between items-center lg:hidden bg-gray-200 p-4">
      <button @click="toggleSidebar" class="text-gray-500 p-2 bg-gray-200 rounded-md focus:outline-none">
        ☰
      </button>

      <h1 class="text-lg font-bold">Admin</h1>

      <button class="p-2 text-red-600 hover:bg-red-100 rounded-md" @click="handleLogout">
        Log out
      </button>
    </div>

    <Sidebar :sidebarOpen="sidebarOpen" @closeSidebar="toggleSidebar" />

    <main class="flex-1 overflow-auto lg:py-12 lg:px-12 pb-24 lg:pb-0">
      <!-- Add padding-bottom to create space for the task bar on mobile -->
      <router-view></router-view>
    </main>

    <!-- task bar -->
    <div class="lg:hidden z-10 relative">
      <div class="w-full bg-gray-200 absolute bottom-0 mobile-spacing">
        <div>
          <ul class="flex justify-between items-center lg:hidden py-2">
            <routerLink to="/admin/restaurantOrders" class="flex flex-col items-center justify-center">
              <img src="/order.png" alt="" class="w-5 h-5" />
              <span>Orders</span>
            </routerLink>
            <routerLink to="/admin/restaurantAdminDashboard" class="flex flex-col items-center justify-center">
              <img src="/product.png" alt="" class="w-5 h-5" />
              <span>Products</span>
            </routerLink>
            <routerLink to="/admin/discount" class="flex flex-col items-center justify-center">
              <img src="/discount.png" alt="" class="w-5 h-5" />
              <span>Discount</span>
            </routerLink>
            <routerLink :to="{ name: 'AdminProfile' }" class="flex flex-col items-center justify-center">
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
import { onMounted, ref } from 'vue';
import { useRouter } from "vue-router";
import Sidebar from "../components/SideBar.vue";
import { useAuthStore } from '../stores/authStore';

const { logout } = useAuthStore();
const sidebarOpen = ref(false);
const route = useRouter();

const handleLogout = () => {
  logout();
  route.push("/userLogin");
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};



onMounted(() => {

  // cordova?.plugins?.notification?.local?.schedule({
  //   title: "The Shop 365",
  //   text: "Welcome to The Shop 365!",
  //   trigger: { at: new Date(new Date().getTime() + 100) },
  //   icon: "file://Appicon.png",  // Customize with an icon (optional)
  //   smallIcon: "file://Appicon.png",
  //   sound: true,  // Play sound when the notification appears
  //   foreground: true,  // Show notification even if app is in foreground
  // });
})
</script>

<style scoped>
/* Ensure there is no horizontal overflow */
body {
  overflow-x: hidden;
}
</style>
