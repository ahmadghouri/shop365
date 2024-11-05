<template>
  <div class="mobile-spacing relative lg:px-16">
    <Launchment />

    <button
      @click="handleSearch"
      class="fixed bottom-6 left-1/2 lg:left-[95%] transform -translate-x-1/2 z-50 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full px-4 py-4 shadow-lg"
    >
      <img src="/search.png" alt="" />
    </button>

    <section class="lg:hidden">
      <div>
        <span class="text-[#888888] text-xl mb-2">
          Hi {{ name || "Loading..." }}
        </span>
        <h1 class="text-yellow-500 text-3xl font-bold">Find What You Want.</h1>
      </div>
    </section>

    <!-- hero image section for desktop -->

    <section
      class="hidden lg:flex lg:items-center lg:justify-center lg:py-12 px-20 bg-white rounded-lg mt-8"
    >
      <div class="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
        <!-- Image Section -->
        <div class="lg:w-1/2 flex flex-col justify-center mt-6 lg:mt-0">
          <div class="text-center lg:text-left">
            <span class="text-[#888888] text-xl mb-2 block">
              Hi {{ name || "Loading..." }}
            </span>
            <h1 class="text-yellow-500 text-3xl lg:text-4xl font-bold mb-4">
              Find What You Want.
            </h1>
            <p class="text-gray-600 text-base lg:text-lg">
              Explore a variety of services that cater to all your needs. Enjoy
              fast and reliable service anywhere in the city!
            </p>
            <!-- Call to Action Button -->
            <button
              @click="scrollToShops"
              class="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 ease-in-out"
            >
              Discover More
            </button>
          </div>
        </div>

        <div class="lg:w-1/2">
          <img
            src="/hero.svg"
            alt="Hero Image"
            class="rounded-lg object-cover w-full h-auto"
          />
        </div>

        <!-- Text Section -->
      </div>
    </section>

    <!-- Hero Image Section -->
    <section class="flex justify-center lg:hidden">
      <div
        class="h-[180px] w-[374px] shadow-md flex justify-center items-center p-5 mt-8 gap-4 bg-yellow-500/15 rounded-lg"
      >
        <div class="flex-1 h-full flex items-center">
          <img
            src="/hero.svg"
            alt="Hero Image"
            class="h-full w-full object-contain rounded-lg"
          />
        </div>
        <div
          class="flex-1 flex flex-col items-center justify-center text-center"
        >
          <span class="text-xl font-semibold">Free Delivery</span>
          <p class="text-sm text-[#888888]">All Over the city.</p>
          <button
            class="mt-4 rounded-full bg-yellow-500 px-4 py-1 text-sm text-white"
            @click="scrollToShops"
          >
            Order Now
          </button>
        </div>
      </div>
    </section>

    <!-- Services Component -->
    <Services @serviceSelected="filterByService" />

    <section ref="shopsSection" class="lg:px-16">
      <div v-if="isLoading" class="flex justify-center mt-6">
        <div class="loader">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <!-- <div
        v-if="isLoading"
        class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="animate-pulse bg-white shadow-lg rounded-lg overflow-hidden"
          style="height: 250px"
        >
          <div class="h-2/5 bg-gray-300"></div>
          <div class="p-4">
            <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div class="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div class="h-3 bg-gray-300 rounded w-1/4"></div>
          </div>
        </div>
      </div> -->
      <!-- <h1
        class="mt-3 text-2xl font-bold text-left sm:text-3xl md:text-4xl lg:text-5xl text-gray-800"
      >
        {{ selectedService.toLocaleUpperCase() || "FOOD" }}
      </h1> -->

      <!-- Filters -->
      <!-- <div class="overflow-x-auto whitespace-nowrap py-4 mb-4">
        <button
          v-for="filter in filters"
          :key="filter"
          @click="filterProducts(filter)"
          :class="[
            'inline-block px-4 py-2 mx-2 text-sm font-medium rounded-full cursor-pointer',
            filter === selectedFilter
              ? 'bg-yellow-500 text-white hover:bg-yellow-500'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
        >
          {{ filter }}
        </button>
      </div> -->

      <!-- Restaurant Categories -->
      <div
        v-if="!isLoading && filteredRestaurants.length"
        class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6"
      >
        <router-link
          v-for="category in filteredRestaurants"
          :key="category.id"
          :to="{
            name: 'CategoryPage',
            params: { id: category.id },
            query: { title: category.name },
          }"
          :class="[
            'relative bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl category-link',
            !isOpen(category.opening_time, category.closing_time)
              ? 'pointer-events-none opacity-50'
              : '',
          ]"
          :style="
            !isOpen(category.opening_time, category.closing_time)
              ? { cursor: 'not-allowed' }
              : {}
          "
          @click.native.prevent="
            !isOpen(category.opening_time, category.closing_time) &&
              $event.preventDefault()
          "
        >
          <div class="relative category-image-container">
            <img
              class="category-image"
              :src="category.image_url"
              alt="Category Image"
              loading="lazy"
            />
            <!-- Discount Badge -->
            <div
              v-if="category.discount > 0"
              class="absolute top-5 left-0 -rotate-45 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold px-1.5 py-0.5 shadow-md transform"
            >
              {{ category.discount }}% OFF
            </div>
          </div>
          <div class="p-4 flex flex-col justify-between h-[60%]">
            <div>
              <h1
                class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 h-14 lg:h-auto"
              >
                {{ category.name }}
              </h1>
              <div class="flex items-center mb-2">
                <!-- Dot Indicator for Open/Closed -->
                <span
                  :class="{
                    'bg-green-500': isOpen(
                      category.opening_time,
                      category.closing_time
                    ),
                    'bg-red-500': !isOpen(
                      category.opening_time,
                      category.closing_time
                    ),
                  }"
                  class="w-3 h-3 rounded-full mr-2"
                ></span>
                <span class="text-sm">
                  {{
                    isOpen(category.opening_time, category.closing_time)
                      ? "Opened"
                      : "Closed"
                  }}
                </span>
              </div>
            </div>
            <div class="mt-auto text-center">
              <span
                :class="[
                  isOpen(category.opening_time, category.closing_time)
                    ? 'text-yellow-500 hover:text-yellow-700'
                    : 'text-gray-400',
                ]"
                class="font-semibold"
              >
                {{
                  isOpen(category.opening_time, category.closing_time)
                    ? "View Details"
                    : "Closed"
                }}
              </span>
            </div>
          </div>
        </router-link>
      </div>
      <div v-else-if="!isLoading" class="mt-8 text-center text-gray-600">
        Coming Soon
      </div>
    </section>
  </div>
</template>

<script setup>
import { useBusinessStore } from "../store/businessStore";
import { ref, computed, onMounted } from "vue";
import moment from "moment-timezone";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import Services from "../components/Services.vue";
import { useRouter } from "vue-router";
import Launchment from "./Launchment.vue";

const businessStore = useBusinessStore();
const filters = ref(["All", "opened", "closed"]);
const selectedFilter = ref("All");
const selectedService = ref("Food");
const profile = ref(null);
const name = ref("");
const router = useRouter();
const shopsSection = ref(null);
const isLoading = ref(true);

const scrollToShops = () => {
  if (shopsSection.value) {
    shopsSection.value.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

const handleSearch = () => {
  router.push("/home/search");
};

const isOpen = (openingTime, closingTime) => {
  const timezone = "Asia/Karachi";
  const currentTime = moment().tz(timezone);
  const parseTime = (time) => moment.tz(time, "hh:mm:ssA", timezone);

  const open = parseTime(openingTime);
  let close = parseTime(closingTime);

  if (close.isBefore(open)) {
    close.add(1, "day");
  }

  return currentTime.isAfter(open) && currentTime.isBefore(close);
};

const filteredRestaurants = computed(() => {
  if (!businessStore.businesses) return [];

  const typeFilter = selectedService.value.toLowerCase();

  // Filter by selected service type
  let filtered = businessStore.businesses;

  if (typeFilter) {
    filtered = filtered.filter(
      (business) =>
        business.type && business.type.toLowerCase().includes(typeFilter)
    );
  }

  // Apply the selected filter for "All", "opened", or "closed"
  if (selectedFilter.value === "opened") {
    filtered = filtered.filter((business) =>
      isOpen(business.opening_time, business.closing_time)
    );
  } else if (selectedFilter.value === "closed") {
    filtered = filtered.filter(
      (business) => !isOpen(business.opening_time, business.closing_time)
    );
  }

  // If there are no businesses after filtering, return an empty array to trigger "Coming Soon"
  return filtered.length ? filtered : [];
});

const filterProducts = (filter) => {
  selectedFilter.value = filter;
};

const filterByService = (service) => {
  selectedService.value = service;
  localStorage.setItem("selectedService", service);
};

async function getProfileData() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/profile`, {});
    profile.value = response.data.data;
    name.value = response.data.data.user.name;
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  const serviceFromStorage = localStorage.getItem("selectedService");
  if (serviceFromStorage) {
    selectedService.value = serviceFromStorage;
  }

  setInterval(() => {
    isLoading.value = false;
  }, 2000);

  try {
    await Promise.all([businessStore.getBusinesses(), getProfileData()]);
  } catch (error) {
    console.error("Error loading data:", error);
  }
});
</script>

<style scoped>
.category-link {
  height: 250px;
  /* Set fixed height for the link container */
}

.category-image-container {
  height: 40%;
  /* Adjust as needed */
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Ensure image covers the container */
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }

  100% {
    background-position: 1000px 0;
  }
}

.animate-pulse {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
  background-size: 1000px 100%;
}

.loader {
  display: flex;
  justify-content: center;
}

.loader span {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin: 0 5px;
  background-color: rgb(234 179 8);
  /* Change color as needed */
  border-radius: 50%;
  animation: bounce 0.6s infinite alternate;
}

.loader span:nth-child(2) {
  animation-delay: 0.2s;
}

.loader span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0% {
    transform: translateY(0);
  }

  100% {
    transform: translateY(-15px);
  }
}
</style>
