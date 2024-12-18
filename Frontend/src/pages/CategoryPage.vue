<template>
  <div class="mobile-spacing lg:mt-4 lg:px-32">
    <!-- Category Title -->
    <div class="relative mb-6">
      <button
        @click="goBack"
        class="absolute left-0 top-1/2 transform -translate-y-1/2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 text-gray-800 hover:text-gray-500 transition duration-150"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <h1
        class="text-2xl font-bold text-center sm:text-3xl md:text-4xl lg:text-5xl text-gray-800"
      >
        {{ categoryTitle }}
      </h1>
    </div>

    <div v-if="adminPhone" class="mb-6 text-center">
      <a
        class="inline-flex items-center justify-center px-4 py-2 bg-yellow-500 text-white font-semibold text-sm rounded-full shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-300 ease-in-out"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        {{ adminPhone }}
      </a>
    </div>

    <div class="mb-6" ref="searchContainer">
      <div class="relative max-w-md mx-auto">
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search products..."
          class="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
        />
        <div
          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
        >
          <svg
            class="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>

    <div class="hidden lg:flex justify-center items-center mb-8">
      <button
        @click="openReviewsModal"
        class="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white font-semibold text-sm rounded-full shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        Reviews
      </button>
    </div>

    <!-- Fixed search button -->
    <button
      v-show="showFixedSearch"
      @click="handleSearchClick"
      class="fixed bottom-6 right-6 p-4 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition-all duration-300 z-50"
    >
      <svg class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path
          fill-rule="evenodd"
          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- Search Modal -->
    <div
      v-if="showSearchModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 px-4 z-50"
      @click="closeSearchModal"
    >
      <div class="w-full max-w-md bg-white rounded-lg shadow-xl" @click.stop>
        <div class="p-4">
          <div class="relative">
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search products..."
              class="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              @keyup.enter="closeSearchModal"
              ref="modalSearchInput"
            />
            <div
              class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            >
              <svg
                class="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="lg:hidden mb-4 flex justify-between items-center">
      <button
        @click="openReviewsModal"
        class="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white font-semibold text-sm rounded-full shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        Reviews
      </button>

      <button
        @click="showFilterModal = true"
        class="flex items-center animate-pulse-glow justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white font-semibold text-sm rounded-full shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v1.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span>Filters</span>
      </button>
    </div>
    <!-- Horizontal Scrollable Filter Section -->
    <div class="overflow-x-auto whitespace-nowrap mb-8">
      <button
        v-for="filter in filters"
        :key="filter"
        @click="filterProducts(filter)"
        :class="[
          filter === selectedFilter
            ? 'inline-block px-4 py-2 mx-2 text-sm font-medium rounded-full cursor-pointer bg-yellow-500 text-white hover:bg-yellow-700'
            : 'inline-block px-4 py-2 mx-2 text-sm font-medium rounded-full cursor-pointer bg-gray-200 text-gray-700 hover:bg-gray-300',
        ]"
      >
        {{ filter }}
      </button>
    </div>

    <!-- Products Section -->
    <div
      if="filteredProducts.length > 0"
      class="grid grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <router-link
        v-for="product in filteredProducts"
        :key="product.id"
        :to="{
          name: 'ProductDetailsPage',
          params: { id: product.id },
          query: { business_id: product.business_id },
        }"
        class="bg-white py-6 px-4 rounded-md flex flex-col items-center shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out relative"
      >
        <!-- Discount Badge -->
        <div
          v-if="product.discount > 0"
          class="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md transform -rotate-6"
        >
          {{ product.discount }}% OFF
        </div>

        <!-- Image Section -->
        <div
          class="w-[120px] h-[120px] overflow-hidden rounded-md flex justify-center items-center mb-4"
        >
          <img
            class="w-full h-full object-contain"
            :src="product.image_url"
            alt="product image"
          />
        </div>

        <!-- Title & Price Section using Flexbox -->
        <div class="flex flex-col justify-between flex-grow text-center w-full">
          <!-- Title -->
          <h2 class="text-sm lg:text-lg font-medium text-slate-800 mb-2 px-2">
            {{ product.title }}
          </h2>

          <!-- Price Section - Stick it at the bottom -->
          <div
            :class="
              product.type.toLowerCase() == 'services' ? 'hidden' : 'mt-auto'
            "
          >
            <p v-if="product.discount > 0" class="text-sm mb-1">
              <span class="text-gray-500 line-through text-base">
                Rs:{{ product.price }}
              </span>
              <span class="text-red-600 font-bold text-xl ml-2">
                Rs:{{ product.final_price }}
              </span>
            </p>
            <p v-else class="text-gray-800 font-semibold text-base">
              Rs:{{ product.price }}
            </p>
          </div>
        </div>

        <button
          v-if="product.type.toLowerCase() === 'services'"
          @click.prevent="openContactPopup(product)"
          class="group w-full mt-2 lg:mt-2 flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white font-semibold text-sm rounded-full shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span class="hidden sm:inline">Contact Now</span>
          <span class="sm:hidden">Contact</span>
        </button>

        <!-- Minimal Add to Cart Button with Icon -->
        <button
          v-else
          @click.prevent="addToCart(product)"
          class="group w-full mt-2 lg:mt-2 flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white font-semibold text-sm rounded-full shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span class="hidden sm:inline">Add to Cart</span>
          <span class="sm:hidden">Add</span>
        </button>
      </router-link>
    </div>

    <div
      ref="loadMoreTrigger"
      class="h-10 w-full flex justify-center items-center mt-6"
    >
      <div v-if="isLoading" class="loader">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <!-- No Products Found Message -->
    <div
      v-if="filteredProducts.length === 0 && !isLoading"
      class="text-center py-10"
    >
      <p class="text-xl text-gray-600">No products found.</p>
    </div>

    <!-- Contact Popup -->
    <div
      v-if="showContactPopup"
      class="fixed inset-0 bg-black mobile-spacing bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white mobile-spacing md:p-8 rounded-lg max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">{{ selectedProduct.title }}</h2>
        <p class="text-gray-700 mb-6">{{ selectedProduct.description }}</p>
        <div class="flex justify-end">
          <button
            @click="closeContactPopup"
            class="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <transition name="modal">
      <div
        v-if="showFilterModal"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center"
        @click="showFilterModal = false"
      >
        <div
          class="bg-white w-full rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto transform transition-transform duration-300 ease-in-out"
          @click.stop
        >
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-gray-800">Filters</h2>
            <button
              @click="showFilterModal = false"
              class="text-gray-600 hover:text-gray-800"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="mb-4">
            <input
              type="text"
              v-model="filterSearchQuery"
              placeholder="Search filters..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button
              v-for="filter in filteredFilters"
              :key="filter"
              @click="
                filterProducts(filter);
                showFilterModal = false;
              "
              :class="[
                filter === selectedFilter
                  ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                'px-4 py-3 rounded-xl font-medium text-sm transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400',
              ]"
            >
              {{ filter }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <div
    v-if="showReviewsModal"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click="closeReviewsModal"
  >
    <div
      class="bg-white w-full max-w-md rounded-lg shadow-xl max-h-[80vh] overflow-y-auto"
      @click.stop
    >
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Customer Reviews</h2>
          <button
            @click="closeReviewsModal"
            class="text-gray-600 hover:text-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Overall Rating -->
        <div class="mb-6 text-center">
          <div class="flex justify-center items-center mb-2">
            <template v-for="n in 5" :key="n">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                :class="
                  n <= averageRating ? 'text-yellow-500' : 'text-gray-300'
                "
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </template>
          </div>
          <p class="text-gray-600">
            {{ averageRating.toFixed(1) }} / 5.0
            <span class="text-sm"
              >({{ reviewStore.reviewsList.length }} reviews)</span
            >
          </p>
        </div>

        <!-- Reviews List -->
        <div
          v-if="reviewStore.reviewsList.length === 0"
          class="text-center text-gray-600"
        >
          No reviews yet
        </div>
        <div v-else>
          <div
            v-for="review in reviewStore.reviewsList"
            :key="review.id"
            class="flex items-start space-x-4 mb-6 pb-6 border-b last:border-b-0"
          >
            <!-- User Avatar -->
            <div
              class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 aspect-square"
              :style="{
                backgroundColor: getUserColor(review.user.name),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }"
            >
              {{ review.user.name[0].toUpperCase() }}
            </div>

            <!-- Review Content -->
            <div class="flex-grow">
              <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold text-gray-800">
                  {{ review.user.name }}
                </h3>
                <div class="flex">
                  <template v-for="n in 5" :key="n">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4"
                      :class="
                        n <= review.rating ? 'text-yellow-500' : 'text-gray-300'
                      "
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </template>
                </div>
              </div>
              <p v-if="review.comments" class="text-gray-600 text-sm">
                {{ review.comments }}
              </p>
              <p v-else class="text-gray-500 italic text-sm">
                No comments provided
              </p>
              <span class="text-xs text-gray-500 mt-2 block">
                {{ formatDate(review.created_at) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, reactive } from "vue";
import { useProductStore } from "../store/productStore";
import { useCartStore } from "../store/cartStore";
import { toast } from "vue3-toastify";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import debounce from "lodash/debounce";
import { storeToRefs } from "pinia";
import { useReviewStore } from "../store/useReviewStore";

const route = useRoute();
const router = useRouter();
const productStore = useProductStore();
const {
  filters,
  searchTerm,
  selectedFilter,
  products,
  currentPage,
  totalPages,
  productsListBusinessId,
  number,
} = storeToRefs(productStore);
const cartStore = useCartStore();
const reviewStore = useReviewStore();
const businessId = route.params.id;
const showFilterModal = ref(false);
const filterSearchQuery = ref("");

const categoryTitle = ref(route.query.title);

const isLoading = ref(false);
const loadMoreTrigger = ref(null);

const showContactPopup = ref(false);
const selectedProduct = ref(null);
const showFixedSearch = ref(false);
const showSearchModal = ref(false);
const searchContainer = ref(null);
const modalSearchInput = ref(null);

// State
const showReviewsModal = ref(false);

// Computed
const averageRating = computed(() => {
  if (reviewStore.reviewsList.length === 0) return 0;
  const total = reviewStore.reviewsList.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  return total / reviewStore.reviewsList.length;
});

// Methods
const openReviewsModal = async () => {
  showReviewsModal.value = true;
  await fetchReviews();
};

const closeReviewsModal = () => {
  showReviewsModal.value = false;
};

const fetchReviews = async () => {
  try {
    await reviewStore.getReviews(businessId);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    toast.error("Failed to load reviews");
  }
};

// Utility Methods
const getUserColor = (name) => {
  const colors = [
    "#F44336",
    "#E91E63",
    "#9C27B0",
    "#673AB7",
    "#3F51B5",
    "#2196F3",
    "#03A9F4",
    "#00BCD4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
  ];
  const hashCode = name.split("").reduce((hash, char) => {
    return char.charCodeAt(0) + ((hash << 5) - hash);
  }, 0);
  return colors[Math.abs(hashCode) % colors.length];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const filteredFilters = computed(() => {
  if (!filterSearchQuery.value) return filters.value;

  return filters.value.filter((filter) =>
    filter.toLowerCase().includes(filterSearchQuery.value.toLowerCase())
  );
});

// Reset search query when modal is opened or closed
watch(showFilterModal, (newValue) => {
  if (newValue) {
    filterSearchQuery.value = "";
  }
});

const handleScroll = () => {
  const scrollPosition = window.scrollY;
  const searchContainerPosition =
    searchContainer.value?.getBoundingClientRect().top || 0;
  showFixedSearch.value = searchContainerPosition < -100;
};

const handleSearchClick = () => {
  if (window.innerWidth < 768) {
    // On mobile, show modal
    showSearchModal.value = true;
    // Focus the input after modal animation
    setTimeout(() => {
      modalSearchInput.value?.focus();
    }, 100);
  } else {
    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    // Focus the search input after scrolling
    setTimeout(() => {
      searchContainer.value?.querySelector("input")?.focus();
    }, 800); // Adjust timing based on scroll duration
  }
};

const closeSearchModal = () => {
  showSearchModal.value = false;
};

const adminPhone = computed(() => {
  return number.value;
});

const allProducts = computed(() => products.value);

const filteredProducts = computed(() => {
  return allProducts.value;
});

const fetchProducts = async () => {
  if (isLoading.value) {
    return;
  }

  try {
    isLoading.value = true;

    await productStore.getProducts(
      businessId,
      searchTerm.value,
      currentPage.value == 0 ? 1 : currentPage.value
    );
  } catch (error) {
    toast.error("Failed to fetch products");
    console.error("Error fetching products:", error);
  } finally {
    isLoading.value = false;
  }
};

const filterProducts = (filter) => {
  selectedFilter.value = filter;

  if (selectedFilter.value === "All") {
    searchTerm.value = "";
  } else {
    searchTerm.value = filter;
  }
};

const debounceSearch = debounce(() => {
  fetchProducts();
}, 300);

const setupIntersectionObserver = () => {
  if (!loadMoreTrigger.value) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const trigger = entries[0];
      if (
        trigger.isIntersecting &&
        !isLoading.value &&
        currentPage.value < totalPages.value
      ) {
        currentPage.value += 1;
      }
    },
    {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    }
  );

  observer.observe(loadMoreTrigger.value);

  // Cleanup function
  return () => {
    if (loadMoreTrigger.value) {
      observer.unobserve(loadMoreTrigger.value);
    }
  };
};
const openContactPopup = (product) => {
  selectedProduct.value = product;
  showContactPopup.value = true;
};

const closeContactPopup = () => {
  showContactPopup.value = false;
  selectedProduct.value = null;
};

const goBack = () => {
  router.back();
};

const addToCart = async (product) => {
  const cartItem = {
    product_id: product.id,
    quantity: 1,
  };

  const nav = document.querySelector(".navbar-cart-icon");
  const productElement = event.target.closest(".bg-white");
  const productImage = productElement.querySelector("img");

  if (nav && productImage) {
    const startRect = productImage.getBoundingClientRect();
    const endRect = nav.getBoundingClientRect();

    createFlyingElement(productImage.src, startRect, endRect);
  }

  try {
    await cartStore.addToCart(cartItem);
  } catch (error) {
    toast.error("Failed to add product to cart.");
  }
};

function createFlyingElement(productImage, startRect, endRect) {
  const flyingElement = document.createElement("img");
  flyingElement.src = productImage;
  flyingElement.style.position = "fixed";
  flyingElement.style.left = `${startRect.left}px`;
  flyingElement.style.top = `${startRect.top}px`;
  flyingElement.style.width = `${startRect.width}px`;
  flyingElement.style.height = `${startRect.height}px`;
  flyingElement.style.objectFit = "contain";
  flyingElement.style.zIndex = "9999";
  flyingElement.style.opacity = "0.8";
  flyingElement.style.pointerEvents = "none";

  document.body.appendChild(flyingElement);

  const isMobile = window.innerWidth <= 768;
  const mobileAdjustment = isMobile ? 1.1 : 1;

  flyingElement.animate(
    [
      {
        left: `${startRect.left}px`,
        top: `${startRect.top}px`,
        width: `${startRect.width}px`,
        height: `${startRect.height}px`,
        opacity: 0.8,
      },
      {
        left: `${endRect.left * mobileAdjustment}px`,
        top: `${endRect.top * mobileAdjustment}px`,
        width: "20px",
        height: "20px",
        opacity: 0.5,
      },
    ],
    {
      duration: 800,
      easing: "ease-in-out",
    }
  ).onfinish = () => {
    document.body.removeChild(flyingElement);
  };
}

watch(searchTerm, () => {
  products.value = [];
  currentPage.value = 0;
  debounceSearch();
});
watch(currentPage, debounceSearch);

let observerCleaner = undefined;

onMounted(async () => {
  window.addEventListener("scroll", handleScroll);
  if (businessId != productsListBusinessId.value) {
    productStore.clearData();

    debounceSearch();

    productStore.fetchFilters(businessId);
    productStore.getNumber(businessId);
  }

  observerCleaner = setupIntersectionObserver();

  productsListBusinessId.value = businessId;
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  if (observerCleaner) {
    observerCleaner();
  }
});
</script>

<style scoped>
@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 10px 5px rgba(255, 215, 0, 0.6);
    transform: scale(1.05);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 1.5s infinite;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
.modal-enter-to,
.modal-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.product-card {
  height: 300px;
}

.product-image-container {
  height: 60%;
  overflow: hidden;
  border-radius: 0.375rem;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
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
