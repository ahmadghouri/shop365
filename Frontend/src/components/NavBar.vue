<template>
  <nav
    class="mobile-spacing sticky top-0 z-50 flex justify-between items-center bg-yellow-500 md:bg-gray-200 text-gray-800 shadow-md"
  >
    <div class="text-xl md:text-2xl font-bold">
      <button @click="goToHome">Logo</button>
    </div>
    <div>
      <ul class="hidden md:flex gap-5 text-lg">
        <li class="hover:text-yellow-500 cursor-pointer">Home</li>
        <li class="hover:text-yellow-500 cursor-pointer">About</li>
        <li class="hover:text-yellow-500 cursor-pointer">Contact</li>
        <li class="hover:text-yellow-500 cursor-pointer">Complains</li>
      </ul>
    </div>
    <div class="flex gap-5">
      <!-- Cart button for larger screens -->
      <button
        class="hidden md:block border-2 border-gray-800 px-4 py-2 rounded"
      >
        Cart
      </button>
      <!-- Menu icon for mobile screens -->
      <button class="md:hidden focus:outline-none">
        <router-link to="/home/cart">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 16 16"
          >
            <path
              fill="currentColor"
              d="M6 14.5a1.5 1.5 0 1 1-3.001-.001A1.5 1.5 0 0 1 6 14.5m10 0a1.5 1.5 0 1 1-3.001-.001A1.5 1.5 0 0 1 16 14.5M16 8V2H4a1 1 0 0 0-1-1H0v1h2l.751 6.438A2 2 0 0 0 4 12h12v-1H4a1 1 0 0 1-1-1v-.01z"
            />
          </svg>
        </router-link>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToHome = () => {
  router.push("/home/categories");
};
</script>

<style scoped>
/* Custom styles if needed */
</style>
