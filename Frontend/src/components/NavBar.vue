<template>
  <div class="relative">
    <!-- <div class="bg-yellow-500 overflow-hidden">
      <div class="animate-marquee whitespace-nowrap py-2">
        <span class="text-white font-semibold mx-8"
          >🚀 Welcome To SHOP365 Too busy to shop? Let us handle it! Groceries
          and your favorite foods delivered straight to you with a single tap!
        </span>
        <span class="text-white font-semibold mx-8"
          >🚀 Welcome To SHOP365 Too busy to shop? Let us handle it! Groceries
          and your favorite foods delivered straight to you with a single tap!
        </span>
        <span class="text-white font-semibold mx-8"
          >🚀 Welcome To SHOP365 Too busy to shop? Let us handle it! Groceries
          and your favorite foods delivered straight to you with a single tap!
        </span>
        <span class="text-white font-semibold mx-8"
          >🚀 Welcome To SHOP365 Too busy to shop? Let us handle it! Groceries
          and your favorite foods delivered straight to you with a single tap!
        </span>
        <span class="text-white font-semibold mx-8"
          >🚀 Welcome To SHOP365 Too busy to shop? Let us handle it! Groceries
          and your favorite foods delivered straight to you with a single tap!
        </span>
      </div>
    </div> -->

    <nav
      class="mobile-spacing sticky top-0 flex justify-between bg-white items-center lg:mt-0 lg:px-32 lg:border-b lg:border-gray-200"
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
        <router-link
          to="/home/profile"
          class="text-lg text-gray-800 hover:text-yellow-500"
        >
          Profile
        </router-link>
        <router-link
          to="/home/vieworders"
          class="text-lg text-gray-800 hover:text-yellow-500"
        >
          View Orders
        </router-link>
        <router-link
          to="/home/services"
          class="text-lg text-gray-800 hover:text-yellow-500"
        >
          Services
        </router-link>
        <router-link
          to="/home/contact"
          class="text-lg text-gray-800 hover:text-yellow-500"
        >
          Contact Us
        </router-link>
      </div>

      <!-- Cart Icon with Counter -->
      <div
        class="relative bg-yellow-500 rounded-full w-16 h-16 lg:w-10 lg:h-10 flex justify-center items-center lg:ml-8 shadow-lg transition-transform duration-200 transform hover:scale-105 navbar-cart-icon"
      >
        <router-link to="/home/cart">
          <font-awesome-icon
            :icon="['fas', 'shopping-cart']"
            class="text-white text-3xl lg:text-xl"
          />
          <!-- Counter Badge -->
          <span
            v-if="cartStore.cartCount > 0"
            class="absolute -top-1 -right-2 lg:-top-1 lg:-right-2 lg:w-5 lg:h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs lg:text-xs font-bold rounded-full px-1.5 lg:px-0.5 py-0.5 lg:py-0 w-7 h-7 flex items-center justify-center border border-white"
          >
            {{ cartStore.cartCount }}
          </span>
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
            <li>
              <router-link to="/home/services" class="text-lg text-gray-800">
                <button @click="toggleSidebar">Services</button>
              </router-link>
            </li>
            <li>
              <router-link to="/home/contact" class="text-lg text-gray-800">
                <button @click="toggleSidebar">Contact</button>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCartStore } from "../store/cartStore";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "vue-router";
import { watch } from "vue";

library.add(faShoppingCart);

const cartStore = useCartStore();
const router = useRouter();
const sidebarOpen = ref(false);

watch(
  () => cartStore.cartCount,
  (newCount) => {
    console.log("Cart count updated:", newCount);
  }
);

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const moveToHome = () => {
  router.push("/home/categories");
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

onMounted(() => {
  cartStore.fetchCartCount();
});
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

/* Animation for the marquee */
@keyframes marquee {
  0% {
    transform: translateX(10%);
  }

  100% {
    transform: translateX(-50%);
  }
}

.animate-marquee {
  display: inline-block;
  white-space: nowrap;
  animation: marquee 60s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}
</style>
