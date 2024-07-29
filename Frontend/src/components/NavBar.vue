<template>
  <nav
    class="mobile-spacing sticky top-0 z-50 flex justify-between items-center bg-yellow-500 md:bg-gray-200 text-gray-800 shadow-md"
  >
    <div class="text-xl md:text-2xl font-bold">
      <h1>Logo</h1>
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
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </router-link>
      </button>
    </div>
  </nav>
</template>

<script setup></script>

<style scoped>
/* Custom styles if needed */
</style>
