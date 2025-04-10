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
          v-if="
            product.discount &&
            (product.discount_type === 'percentage' ||
              product.discount_type === 'flat')
          "
          class="absolute top-2 left-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md transform -rotate-6"
        >
          {{
            product.discount_type === "percentage"
              ? `${product.discount}% OFF`
              : `Rs:${product.discount} OFF`
          }}
        </div>

        <!-- Stock Badge -->
        <div
          v-if="
            product.is_active === 0"
          class="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md transform rotate-6"
        >
          Out of Stock
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
            <p
              v-if="
                product.discount &&
                (product.discount_type === 'percentage' ||
                  product.discount_type === 'flat')
              "
              class="text-sm mb-1"
            >
              <span class="text-gray-500 line-through text-base">
                Rs:{{ product.price }}
              </span>
              <span class="text-red-600 font-bold text-xl ml-2">
                Rs:{{ calculateFinalPrice(product) }}
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
          v-if="product.type.toLowerCase() !== 'prescription' && product.price !== 0"
          :disabled="product.is_active === 0"
          @click.prevent="addToCart(product)"
          class="group w-full mt-2 lg:mt-2 flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white font-semibold text-sm rounded-full shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          :class="{'cursor-not-allowed': product.is_active === 0}"
        >
          <!-- Cart Icon -->
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

        <!-- Prescription Button -->
        <button
          v-else
          @click.prevent="openPrescriptionModal(product)"
          class="group w-full mt-2 lg:mt-2 flex items-center justify-center space-x-2 px-4 py-2 bg-black text-white font-semibold text-sm rounded-full shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
            />
          </svg>

          <span class="hidden sm:inline">Upload Prescription</span>
          <span class="sm:hidden">Prescription</span>
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
        <div
          class="text-gray-700 mb-6"
          v-html="selectedProduct.description"
        ></div>
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

  <ReviewsSection
    :show-reviews-modal="showReviewsModal"
    :reviews-list="reviewStore.reviewsList"
    @close="showReviewsModal = false"
  />

  <!-- Registration Popup -->
  <div
    v-if="showRegisterPopup"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  >
    <div class="bg-white p-6 rounded-lg max-w-md w-full mx-4">
      <h2 class="text-2xl font-bold mb-4">Register to Continue</h2>
      <p class="text-gray-600 mb-6">
        Please register or login to add items to your cart.
      </p>
      <div class="flex justify-end space-x-4">
        <button
          @click="showRegisterPopup = false"
          class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
        >
          Cancel
        </button>
        <button
          @click="redirectToRegister"
          class="px-6 py-2 bg-yellow-500 text-white font-semibold rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
        >
          Register Now
        </button>
      </div>
    </div>
  </div>

  <!-- Upload Prescription Dialog -->
  <div
    v-show="showPrescriptionModal"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click="closePrescriptionModal"
  >
    <div class="bg-white prescription-modal w-full max-w-md rounded-lg shadow-xl p-6" @click.stop>
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-gray-800">Upload Prescription</h2>
        <button
          @click="closePrescriptionModal"
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

      <form @submit.prevent="addToCart(selectedProduct)">
        <!-- Image Upload -->
        <div class="md:col-span-2">
          <label class="text-sm font-medium text-gray-600 block mb-2"
            >Prescription Image</label
          >
          <div
            class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-yellow-400 transition-colors duration-200"
          >
            <div class="space-y-2 text-center">
              <div v-if="imagePreview" class="mb-4">
                <img
                  :src="imagePreview"
                  alt="Preview"
                  class="mx-auto h-32 w-auto rounded-lg shadow-sm"
                />
              </div>
              <div class="flex text-sm text-gray-600">
                <label
                  for="image"
                  class="relative cursor-pointer bg-white rounded-md font-medium text-yellow-600 hover:text-yellow-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-yellow-500"
                >
                  <span>Upload a file</span>
                  <input
                    @change="handleFileChange"
                    id="image"
                    type="file"
                    class="sr-only"
                    accept="image/*"
                    capture="environment"
                    required
                  />
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500">PNG, JPG, GIF</p>
              <p v-if="imageError" class="text-xs text-red-500 mt-1">
                {{ imageError }}
              </p>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-gray-600 font-semibold mb-2"
            >Description</label
          >
          <textarea
            v-model="description"
            class="w-full border rounded p-2"
            rows="3"
            placeholder="Enter additional details..."
            required
          ></textarea>
        </div>

        <div class="mb-4">
          <label class="block text-gray-600 font-semibold mb-2"
            >Important *</label
          >
          <div
            class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-md"
          >
            <p class="flex items-center font-medium">
              <svg
                class="w-5 h-5 mr-2 text-yellow-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.766-1.36 2.72-1.36 3.486 0l6.588 11.7c.75 1.33-.213 3-1.743 3H3.415c-1.53 0-2.493-1.67-1.743-3l6.585-11.7zM11 14a1 1 0 11-2 0 1 1 0 012 0zm-1-2a1 1 0 01-1-1V7a1 1 0 112 0v4a1 1 0 01-1 1z"
                  clip-rule="evenodd"
                />
              </svg>
              Prescription payment will be confirmed on call.
            </p>
          </div>
        </div>

        <div class="flex justify-end">
          <!-- Minimal Add to Cart Button with Icon -->
          <button
            type="submit"
            class="group w-full mt-2 lg:mt-2 flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white font-semibold text-sm rounded-full shadow-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            <!-- Cart Icon -->
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
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, reactive } from "vue";
import { useProductStore } from "../store/productStore";
import ReviewsSection from "../components/ReviewsSection.vue";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import { toast } from "vue3-toastify";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { API_BASE_URL } from "../config/api";
import debounce from "lodash/debounce";
import { storeToRefs } from "pinia";
import { useReviewStore } from "../store/useReviewStore";
import { useAuthStore } from "../stores/authStore";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const showRegisterPopup = ref(false);
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
const orderStore = useOrderStore();
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
const showPrescriptionModal = ref(false);

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

//Open & close prescription modal
const openPrescriptionModal = (product) => {
  selectedProduct.value = product;
  showPrescriptionModal.value = true;
};

const closePrescriptionModal = () => {
  showPrescriptionModal.value = false;
};

const calculateFinalPrice = (product) => {
  if (!product.discount) return product.price;

  if (product.discount_type === "percentage") {
    return Math.round(product.price - (product.price * product.discount) / 100);
  } else if (product.discount_type === "flat") {
    return Math.round(product.price - product.discount);
  }

  return product.price;
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

const imagePreview = ref(null);
const imageError = ref(null);
const description = ref("");
const MAX_FILE_SIZE = 50 * 1024; // 50KB in bytes

const form = ref({
  image: null, // This will now store base64 instead of a File object
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  imageError.value = null;
  imagePreview.value = null;

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    imageError.value = "Please select a valid image file.";
    return;
  }

  // Optional: size limit
  // if (file.size > MAX_FILE_SIZE) {
  //   imageError.value = `Image size must be less than 50KB. Current size: ${(
  //     file.size / 1024
  //   ).toFixed(1)}KB`;
  //   return;
  // }

  // Convert to base64
  const reader = new FileReader();
  reader.onload = () => {
    form.value.image = reader.result; // base64 string
    imagePreview.value = reader.result; // for preview too
  };
  reader.onerror = () => {
    imageError.value = "Failed to read image file.";
  };

  reader.readAsDataURL(file); // Triggers base64 encoding
};


const addToCart = async (product) => {
  // if (!authStore.isAuthenticated) {
  //   showRegisterPopup.value = true; // Changed this line
  //   return;
  // }

  const cartItem = {
    product_id: product.id,
    quantity: 1,
    product: {
      id: product.id,
      title: product.title,
      price: product.price,
      final_price: product.final_price,
      image_url: product.image_url,
      business_id: product.business_id,
      // Add prescription details if available
      prescription:
        product.type.toLowerCase() === "prescription"
          ? {
              prescription_image: form.value.image,
              prescription_description: description.value,
            }
          : null,
    },
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
    // Close the prescription modal immediately
  if (product.type.toLowerCase() === "prescription") {
    closePrescriptionModal();
  }
    await cartStore.addToCart(cartItem);
  } catch (error) {
    toast.error("Failed to add product to cart.");
  }
};

const redirectToRegister = () => {
  showRegisterPopup.value = true;
  router.push({ name: "Register" });
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

    // productStore.initializeBusinessData(businessId);
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
/* Responsive modal styles */
@media (max-width: 768px) {
  .prescription-modal {
    width: 90%; /* Adjust width for smaller screens */
    max-height: 80vh; /* Limit height */
    overflow-y: auto; /* Enable scrolling inside the modal */
  }
}

@media (min-width: 769px) {
  .prescription-modal {
    width: 50%; /* Adjust width for larger screens */
    max-height: 70vh; /* Limit height */
    overflow-y: auto; /* Enable scrolling inside the modal */
  }
}
</style>
