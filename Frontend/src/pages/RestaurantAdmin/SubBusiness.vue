<script setup>
import { onMounted, computed } from "vue";
import { useBusinessStore } from "../../store/businessStore";
import { ChevronRight } from "lucide-vue-next";
import { useRouter } from "vue-router";

const businessStore = useBusinessStore();

// Retrieve the user data from localStorage
const user = JSON.parse(localStorage.getItem("user") || "{}");
const businessId = user?.business_id;

const isLoading = computed(() => businessStore.loading);
const router = useRouter();

const formatTime = (time) => {
  // Handle the specific time format from the API (e.g., "09:00:00AM")
  return time ? time.replace(/:00([AP]M)$/, "$1") : "";
};

const viewProductDetails = (name, businessId) => {
  try {
    // Encode the name to make it URL-safe
    const encodedName = encodeURIComponent(name);
    router.push(`/business/${businessId}/${encodedName}`);
  } catch (error) {
    console.error("Error navigating to products page:", error);
  }
};

onMounted(async () => {
  if (businessId) {
    await businessStore.subBusiness(businessId);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <h1 class="text-3xl font-bold text-gray-900 text-center mb-8">
        Business List
      </h1>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex justify-center items-center min-h-[400px]"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"
        ></div>
      </div>

      <!-- Products Grid -->
      <div
        v-else-if="businessStore.subBusinesses?.length"
        class="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div
          v-for="product in businessStore.subBusinesses"
          :key="product.id"
          class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
        >
          <!-- Image Container -->
          <div class="relative h-56 overflow-hidden">
            <img
              :src="product.image_url"
              :alt="product.name"
              class="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            />
            <div
              class="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium"
              :class="
                product.status === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              "
            >
              {{ product.status }}
            </div>
          </div>

          <!-- Content -->
          <div class="p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-2">
              {{ product.name }}
            </h2>
            <div class="space-y-3">
              <p class="text-gray-600 flex items-center">
                <span class="material-icons-outlined text-sm mr-2"
                  >category</span
                >
                {{ product.type }}
              </p>
              <div class="flex items-center text-gray-600">
                <span class="material-icons-outlined text-sm mr-2"
                  >schedule</span
                >
                <span
                  >{{ formatTime(product.opening_time) }} -
                  {{ formatTime(product.closing_time) }}</span
                >
              </div>
              <div class="flex items-center text-gray-600">
                <span class="material-icons-outlined text-sm mr-2"
                  >Discount</span
                >
                <span>{{ product.discount }}% Off</span>
              </div>
              <div class="flex items-center text-gray-600 text-sm">
                <span class="material-icons-outlined text-sm mr-2">update</span>
                <span
                  >Updated:
                  {{ new Date(product.updated_at).toLocaleDateString() }}</span
                >
              </div>
            </div>

            <!-- Action Button -->
            <button
              @click="viewProductDetails(product.name, product.id)"
              class="mt-6 w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              View Products
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="min-h-[400px] flex flex-col items-center justify-center text-gray-500"
      >
        <span class="material-icons-outlined text-6xl mb-4">inventory_2</span>
        <p class="text-xl">No businesses available</p>
        <p class="mt-2">Add some business to get started</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bg-primary {
  @apply bg-blue-600;
}

.bg-primary-dark {
  @apply bg-blue-700;
}

.text-primary {
  @apply text-blue-600;
}

/* Smooth fade in animation for cards */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > div {
  animation: fadeIn 0.5s ease-out forwards;
}

.grid > div:nth-child(1) {
  animation-delay: 0.1s;
}
.grid > div:nth-child(2) {
  animation-delay: 0.2s;
}
.grid > div:nth-child(3) {
  animation-delay: 0.3s;
}
.grid > div:nth-child(4) {
  animation-delay: 0.4s;
}
.grid > div:nth-child(5) {
  animation-delay: 0.5s;
}
.grid > div:nth-child(6) {
  animation-delay: 0.6s;
}
</style>
