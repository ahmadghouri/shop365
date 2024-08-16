<template>
  <div class="mobile-spacing">
    <section>
      <div>
        <span class="text-[#888888] text-xl mb-2">
          Hi {{ name || 'Loading...' }}
        </span>
        <h1 class="text-yellow-500 text-4xl font-bold">Find Your Food.</h1>
      </div>
    </section>

    <!-- Hero Image Section -->
    <section class="flex justify-center">
      <div class="h-[180px] w-[374px] shadow-md flex justify-center items-center p-5 mt-8 gap-4 bg-yellow-500/15 rounded-lg">
        <div class="flex-1 h-full flex items-center">
          <img src="/public/hero.png" alt="Hero Image" class="h-full w-full object-contain rounded-lg" />
        </div>
        <div class="flex-1 flex flex-col items-center justify-center text-center">
          <span class="text-xl font-semibold">Free Delivery</span>
          <p class="text-sm text-[#888888]">All Over the city.</p>
          <button class="mt-4 rounded-full bg-yellow-500 px-4 py-1 text-sm text-white">
            Order Now
          </button>
        </div>
      </div>
    </section>

    <!-- Services Component -->
    <Services />

    <h1 class="mt-3 text-2xl font-bold text-left sm:text-3xl md:text-4xl lg:text-5xl text-gray-800">
      Restaurants
    </h1>

    <!-- Filters -->
    <div class="overflow-x-auto whitespace-nowrap py-4 mb-4">
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
    </div>

    <!-- Restaurant Categories -->
    <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6 md:px-8 lg:px-12">
      <router-link
        v-for="category in filteredRestaurants"
        :key="category.id"
        :to="{
          name: 'CategoryPage',
          params: { id: category.id },
          query: { title: category.name },
        }"
        :class="[
          'bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 hover:shadow-xl category-link',
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
        <div class="category-image-container">
          <img
            class="category-image"
            :src="category.image_url"
            alt="Category Image"
          />
        </div>
        <div class="p-4 flex flex-col justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 mb-2">
              {{ category.name }}
            </h1>

            <div class="flex items-center mb-2">
              <!-- Dot Indicator for Open/Closed -->
              <span
                :class="{
                  'bg-green-500': isOpen(category.opening_time, category.closing_time),
                  'bg-red-500': !isOpen(category.opening_time, category.closing_time),
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
          <div class="mt-4 text-center">
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
  </div>
</template>

<script setup>
import { useBusinessStore } from "../store/businessStore";
import { ref, computed, onMounted } from "vue";
import moment from "moment-timezone";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import Services from "../components/Services.vue";

const businessStore = useBusinessStore();
const filters = ref(["All", "opened", "closed"]);
const selectedFilter = ref("All");
const profile = ref(null);
const name = ref("");

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
  
  if (selectedFilter.value === "All") {
    return businessStore.businesses;
  } else if (selectedFilter.value === "opened") {
    return businessStore.businesses.filter((business) =>
      isOpen(business.opening_time, business.closing_time)
    );
  } else if (selectedFilter.value === "closed") {
    return businessStore.businesses.filter(
      (business) => !isOpen(business.opening_time, business.closing_time)
    );
  }

  return [];
});

const filterProducts = (filter) => {
  selectedFilter.value = filter;
};

async function getProfileData() {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    profile.value = response.data.data;
    name.value = response.data.data.user.name;
  } catch (error) {
    console.error(error);
  }
}

onMounted(async () => {
  await businessStore.getBusinesses();
  await getProfileData();
});
</script>

<style scoped>
.category-link {
  height: 250px; /* Set fixed height for the link container */
}

.category-image-container {
  height: 40%; /* Adjust as needed */
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensure image covers the container */
}
</style>
