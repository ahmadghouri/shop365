<template>
  <div>
    <nav
      class="mobile-spacing sticky top-0 z-50 flex justify-between items-center bg-yellow-500 md:bg-gray-200 text-gray-800 shadow-md"
    >
      <div>
        <button class="md:hidden focus:outline-none" @click="toggleSidebar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="11"
            viewBox="0 0 16 11"
            fill="none"
          >
            <path
              d="M1 1H15M1 5.5H15M1 10H15"
              stroke="#272727"
              stroke-width="1.66667"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
      <div class="text-xl md:text-2xl font-bold">
        <button @click="goToHome">
          <img src="/Shop365-Logo Grey.png" class="w-auto h-4" alt="" />
        </button>
      </div>
      <div class="hidden md:flex gap-5 text-lg">
        <router-link to="/home" class="hover:text-yellow-500 cursor-pointer">Home</router-link>
        <router-link to="/about" class="hover:text-yellow-500 cursor-pointer">About</router-link>
        <router-link to="/contact" class="hover:text-yellow-500 cursor-pointer">Contact</router-link>
        <router-link to="/complains" class="hover:text-yellow-500 cursor-pointer">Complains</router-link>
      </div>
      <div class="flex gap-5">
        <!-- Cart button for larger screens -->
        <router-link
          to="/cart"
          class="hidden md:block border-2 border-gray-800 px-4 py-2 rounded"
          >Cart</router-link
        >
        <!-- Menu icon for mobile screens -->
        <router-link to="/home/cart" class="md:hidden focus:outline-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M14.1666 15C13.2416 15 12.4999 15.7417 12.4999 16.6667C12.4999 17.1087 12.6755 17.5326 12.9881 17.8452C13.3006 18.1577 13.7246 18.3333 14.1666 18.3333C14.6086 18.3333 15.0325 18.1577 15.3451 17.8452C15.6577 17.5326 15.8333 17.1087 15.8333 16.6667C15.8333 16.2246 15.6577 15.8007 15.3451 15.4882C15.0325 15.1756 14.6086 15 14.1666 15ZM0.833252 1.66666V3.33333H2.49992L5.49992 9.65833L4.36659 11.7C4.24159 11.9333 4.16659 12.2083 4.16659 12.5C4.16659 12.942 4.34218 13.3659 4.65474 13.6785C4.9673 13.9911 5.39122 14.1667 5.83325 14.1667H15.8333V12.5H6.18325C6.128 12.5 6.07501 12.478 6.03594 12.439C5.99687 12.3999 5.97492 12.3469 5.97492 12.2917C5.97492 12.25 5.98325 12.2167 5.99992 12.1917L6.74992 10.8333H12.9583C13.5833 10.8333 14.1333 10.4833 14.4166 9.975L17.3999 4.58333C17.4583 4.45 17.4999 4.30833 17.4999 4.16666C17.4999 3.94565 17.4121 3.73369 17.2558 3.57741C17.0996 3.42113 16.8876 3.33333 16.6666 3.33333H4.34159L3.55825 1.66666M5.83325 15C4.90825 15 4.16659 15.7417 4.16659 16.6667C4.16659 17.1087 4.34218 17.5326 4.65474 17.8452C4.9673 18.1577 5.39122 18.3333 5.83325 18.3333C6.27528 18.3333 6.6992 18.1577 7.01176 17.8452C7.32432 17.5326 7.49992 17.1087 7.49992 16.6667C7.49992 16.2246 7.32432 15.8007 7.01176 15.4882C6.6992 15.1756 6.27528 15 5.83325 15Z"
              fill="#272727"
            />
          </svg>
        </router-link>
      </div>
    </nav>

    <!-- Sidebar for mobile screens -->
    <!-- Sidebar for mobile screens -->
    <transition name="slide-left">
<<<<<<< HEAD
      <div v-if="sidebarOpen" class="fixed inset-0 bg-black/5 z-40 flex">
        <div class="sidebar bg-white w-64 h-full p-5 shadow-lg">
=======
      <div v-if="sidebarOpen" ref="sidebarRef" class="fixed inset-0 bg-black/5 z-40 flex">
        <div class="bg-white w-64 h-full p-5 shadow-lg">
>>>>>>> 3fdd77a77af9e8f4a8f2bbcefb996c290df10a68
          <button
            @click="toggleSidebar"
            class="focus:outline-none text-black mb-4"
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
          <ul>
            <li class="py-2 border-b border-gray-300">
              <router-link to="/home/profile" class="text-lg text-gray-800"
                ><button @click="toggleSidebar">Profile</button></router-link
              >
            </li>
            <li class="py-2 border-b border-gray-300">
              <router-link to="/home/vieworders" class="text-lg text-gray-800"
                ><button @click="toggleSidebar">
                  View Orders
                </button></router-link
              >
            </li>
          </ul>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { ref, onMounted, onBeforeUnmount } from "vue";
=======
import { ref, onMounted, onUnmounted } from "vue";
>>>>>>> 3fdd77a77af9e8f4a8f2bbcefb996c290df10a68
import { useRouter } from "vue-router";

const router = useRouter();
const sidebarOpen = ref(false);
const sidebarRef = ref(null);
let clickTimeout = null;

const toggleSidebar = () => {
  if (clickTimeout) clearTimeout(clickTimeout);
  sidebarOpen.value = !sidebarOpen.value;
};

const goToHome = () => {
  router.push("/home/categories");
};

<<<<<<< HEAD
// Close the sidebar when clicking outside
const handleClickOutside = (event) => {
  const sidebar = document.querySelector(".sidebar");
  if (sidebar && !sidebar.contains(event.target) && sidebarOpen.value) {
    toggleSidebar();
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", handleClickOutside);
=======
// Function to handle clicks outside the sidebar
const handleClickOutside = (event) => {
  if (sidebarOpen.value && sidebarRef.value && !sidebarRef.value.contains(event.target)) {
    clickTimeout = setTimeout(() => {
      sidebarOpen.value = false;
    }, 0); // Slight delay to avoid rapid toggle
  }
};

// Add and remove event listener for clicks outside
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
>>>>>>> 3fdd77a77af9e8f4a8f2bbcefb996c290df10a68
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

/* Custom styles for the sidebar if needed */
</style>
