<template>
  <div>
    <!-- Navbar -->
    <nav
      class="mobile-spacing flex justify-between items-center mt-4 lg:mt-0 lg:px-32 lg:border-b lg:border-gray-200"
    >
      <div @click.stop="toggleSidebar" class="cursor-pointer lg:hidden">
        <img src="/public/Menu Icon.png" alt="Menu Icon" />
      </div>

      <div class="cursor-pointer flex-1 text-center lg:flex-none lg:text-left">
        <button @click="moveToHome" class="text-2xl font-bold">
          <span class="text-yellow-500">Shop</span><span>365</span>
        </button>
      </div>

      <!-- Desktop Menu Links -->
      <div class="hidden lg:flex lg:space-x-8 lg:items-center">
        <router-link to="/home/profile" class="text-lg text-gray-800">
          Profile
        </router-link>
        <router-link to="/home/vieworders" class="text-lg text-gray-800">
          View Orders
        </router-link>
      </div>

      <!-- Cart Icon -->
      <div
        class="bg-yellow-500 rounded-full w-14 lg:w-9 h-14 lg:h-9 flex justify-center items-center lg:ml-8"
      >
        <router-link to="/home/cart">
          <font-awesome-icon
            :icon="['fas', 'shopping-cart']"
            class="text-white text-2xl lg:text-lg"
          />
        </router-link>
      </div>
    </nav>

    <!-- Sidebar for mobile screens -->
    <transition name="slide-left">
      <div
        v-if="sidebarOpen"
        ref="sidebarRef"
        class="fixed inset-0 bg-black/50 z-40 flex lg:hidden"
        @click="closeSidebar"
      >
        <div class="bg-white w-64 h-full p-6 shadow-lg relative" @click.stop>
          <!-- Close Button -->
          <button
            @click="toggleSidebar"
            class="absolute top-4 right-4 focus:outline-none text-black"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Sidebar Links -->
          <ul class="mt-12 space-y-6">
            <li>
              <router-link to="/home/profile" class="text-lg text-gray-800">
                <button @click="toggleSidebar">Profile</button>
              </router-link>
            </li>
            <li>
              <router-link to="/home/vieworders" class="text-lg text-gray-800">
                <button @click="toggleSidebar">View Orders</button>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { library } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "vue-router";

library.add(faShoppingCart);

const router = useRouter();

const sidebarOpen = ref(false);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const moveToHome = () => {
  router.push("/home/categories");
};
const closeSidebar = () => {
  sidebarOpen.value = false;
};
</script>

<style scoped>
/* Transition styles for the sidebar */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-in-out;
}
.slide-left-enter,
.slide-left-leave-to {
  transform: translateX(-100%);
}

/* Responsive styles for desktop */
@media (min-width: 1024px) {
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
