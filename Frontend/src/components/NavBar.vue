<template>
  <div class="relative">
    <!-- News Ticker -->
    <div class="bg-gradient-to-r from-red-600 to-red-500 shadow-md">
      <div class="overflow-hidden whitespace-nowrap py-2">
        <div class="animate-ticker flex items-center space-x-8">
          <!-- Duplicated content for seamless looping -->
          <div v-for="i in 3" :key="i" class="flex items-center text-white text-sm font-medium shrink-0">
            <font-awesome-icon :icon="['fas', 'bullhorn']" class="mx-4" />
            <span class="tracking-wide">
              🎉 Free Delivery on Orders Above 1000! For SHOP365 Mart Shop Now and Save on Delivery Charges!
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Existing Navigation -->
    <nav class="mobile-spacing sticky top-0 flex justify-between bg-white items-center lg:mt-0 lg:px-32 lg:border-b lg:border-gray-200">
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
        <router-link to="/home/profile" class="text-lg text-gray-800 hover:text-yellow-500">
          Profile
        </router-link>
        <router-link to="/home/vieworders" class="text-lg text-gray-800 hover:text-yellow-500">
          View Orders
        </router-link>
        <router-link to="/home/services" class="text-lg text-gray-800 hover:text-yellow-500">
          Services
        </router-link>
        <router-link to="/home/contact" class="text-lg text-gray-800 hover:text-yellow-500">
          Contact Us
        </router-link>
      </div>

      <!-- Points and Cart Container -->
      <div class="flex items-center space-x-4">
        <!-- Points Display (Desktop Only) -->
        <div v-if="points >= 0" class="hidden lg:flex points-badge group">
          <div class="points-display">
            <div class="points-icon">
              <font-awesome-icon :icon="['fas', 'crown']" />
            </div>
            <div class="points-value">
              {{ points }}
              <span class="points-label">points</span>
            </div>
            <!-- Tooltip -->
            <div class="points-tooltip">
              Earn more points with every purchase!
            </div>
          </div>
        </div>

        <!-- Cart Icon with Counter -->
        <div class="relative bg-yellow-500 rounded-full w-16 h-16 lg:w-10 lg:h-10 flex justify-center items-center shadow-lg transition-transform duration-200 transform hover:scale-105 navbar-cart-icon">
          <router-link to="/home/cart">
            <font-awesome-icon :icon="['fas', 'shopping-cart']" class="text-white text-3xl lg:text-xl" />
            <!-- Counter Badge -->
            <span v-if="cartStore.cartCount > 0" class="absolute -top-1 -right-2 lg:-top-1 lg:-right-2 lg:w-5 lg:h-5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs lg:text-xs font-bold rounded-full px-1.5 lg:px-0.5 py-0.5 lg:py-0 w-7 h-7 flex items-center justify-center border border-white">
              {{ cartStore.cartCount }}
            </span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Sidebar for mobile screens -->
    <transition name="slide-left">
      <div v-if="sidebarOpen" ref="sidebarRef" class="fixed inset-0 bg-black/50 z-40 flex lg:hidden" @click="closeSidebar">
        <div class="bg-white w-64 h-full p-6 shadow-lg relative" @click.stop>
          <!-- Close Button -->
          <button @click="toggleSidebar" class="absolute top-4 right-4 focus:outline-none text-black">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Points Display in Sidebar -->
          <div v-if="points >= 0" class="mobile-points-container">
            <div class="points-crown">
              <font-awesome-icon :icon="['fas', 'crown']" />
            </div>
            <div class="points-info">
              <span class="points-number">{{ points }}</span>
              <span class="points-text">Reward Points</span>
            </div>
          </div>

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
import { faShoppingCart, faCrown, faBullhorn } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "vue-router";
import { watch } from "vue";
import { useAuthStore } from "../stores/authStore";
import { storeToRefs } from "pinia";

library.add(faShoppingCart, faCrown, faBullhorn);

const cartStore = useCartStore();
const authStore = useAuthStore();
const { points } = storeToRefs(authStore);
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
  if (authStore.isAuthenticated) {
    cartStore.fetchCartCount();
    authStore.refreshUser();
  }
});
</script>

<style scoped>
/* Existing transition styles */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-left-enter,
.slide-left-leave-to {
  transform: translateX(-100%);
}

/* News Ticker Animation */
@keyframes ticker {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-100%);
  }
}

.animate-ticker {
  animation: ticker 40s linear infinite;
  display: flex;
  min-width: max-content;
}

.animate-ticker:hover {
  animation-play-state: paused;
}

/* Optional: Add a fading gradient overlay */
.bg-gradient-to-r::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100px;
  background: linear-gradient(to right, transparent, rgba(220, 38, 38, 1));
  pointer-events: none;
}

/* Desktop Points Badge Styles */
.points-badge {
  position: relative;
}

.points-display {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #ffd700, #ffa500);
  border-radius: 20px;
  padding: 0.5rem 1rem;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.points-display:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
}

.points-icon {
  margin-right: 8px;
  font-size: 1.2rem;
  animation: crown-shine 2s infinite;
}

.points-value {
  font-weight: bold;
  font-size: 1.1rem;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.points-label {
  font-size: 0.8rem;
  opacity: 0.9;
}

/* Tooltip styles */
.points-tooltip {
  position: absolute;
  bottom: -40px;
  left: 50%;
  transform: translateX(-50%) scale(0);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
  transition: all 0.3s ease;
  opacity: 0;
  pointer-events: none;
}

.points-display:hover .points-tooltip {
  transform: translateX(-50%) scale(1);
  opacity: 1;
}

/* Mobile Points Styles */
.mobile-points-container {
  background: linear-gradient(135deg, #ffd700, #ffa500);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 2rem;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.points-crown {
  font-size: 1.5rem;
  color: white;
  animation: crown-shine 2s infinite;
}

.points-info {
  display: flex;
  flex-direction: column;
}

.points-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  line-height: 1;
}

.points-text {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
}

/* Animations */
@keyframes crown-shine {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

/* Shimmer effect for desktop points display */
.points-display::after {
  content: "";
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transform: rotate(45deg);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

/* Responsive styles */
@media (max-width: 1024px) {
  .points-container {
    display: none;
  }
}
</style>
