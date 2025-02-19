<template>
  <div
    v-if="showReviewsModal"
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click="$emit('close')"
  >
    <div
      class="bg-white w-full max-w-md rounded-lg shadow-xl max-h-[80vh] overflow-y-auto"
      @click.stop
    >
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Customer Reviews</h2>
          <button
            @click="$emit('close')"
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
                  n <= localAverageRating ? 'text-yellow-500' : 'text-gray-300'
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
            {{ localAverageRating.toFixed(1) }} / 5.0
            <span class="text-sm">({{ reviewsList.length }} reviews)</span>
          </p>
        </div>

        <!-- Reviews List -->
        <div v-if="reviewsList.length === 0" class="text-center text-gray-600">
          No reviews yet
        </div>
        <div v-else>
          <div
            v-for="review in reviewsList"
            :key="review.id"
            class="mb-6 pb-6 border-b last:border-b-0"
          >
            <!-- Main Review -->
            <div class="flex items-start space-x-4">
              <!-- User Avatar -->
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0 aspect-square"
                :style="{
                  backgroundColor: getUserColor(
                    review.user?.name || 'Anonymous'
                  ),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }"
              >
                {{ (review.user?.name || "Anonymous")[0].toUpperCase() }}
              </div>

              <!-- Review Content -->
              <div class="flex-grow">
                <div class="flex justify-between items-center mb-2">
                  <h3 class="font-semibold text-gray-800">
                    {{ review.user?.name || "Anonymous" }}
                  </h3>
                  <div class="flex">
                    <template v-for="n in 5" :key="n">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        :class="
                          n <= review.rating
                            ? 'text-yellow-500'
                            : 'text-gray-300'
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

            <!-- Business Reply Section -->
            <div v-if="review.reply" class="mt-4 ml-16">
              <div
                class="flex items-start space-x-4 pl-4 border-l-2 border-gray-100"
              >
                <!-- Business Avatar -->
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 text-white font-bold text-sm shrink-0"
                >
                  {{ review.business?.name[0].toUpperCase() || "B" }}
                </div>

                <!-- Reply Content -->
                <div class="flex-grow">
                  <div class="flex items-center mb-1">
                    <h4 class="font-semibold text-gray-800 text-sm">
                      {{ review.business?.name || "Business Response" }}
                    </h4>
                    <span class="text-xs text-gray-500 ml-2">
                      {{ formatDate(review.updated_at) }}
                    </span>
                  </div>
                  <p class="text-gray-600 text-sm">
                    {{ review.reply }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from "vue";

// Props
const props = defineProps({
  showReviewsModal: {
    type: Boolean,
    default: false,
  },
  reviewsList: {
    type: Array,
    default: () => [],
  },
});

// Emits
const emit = defineEmits(["close"]);

// Utility Functions
const getUserColor = (name) => {
  // Generate a consistent color based on the user's name
  const colors = [
    "#3B82F6",
    "#10B981",
    "#6366F1",
    "#F43F5E",
    "#8B5CF6",
    "#F59E0B",
    "#EF4444",
    "#64748B",
  ];
  const hash = name
    .split("")
    .reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  return colors[Math.abs(hash) % colors.length];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Computed property for average rating
const localAverageRating = computed(() => {
  if (props.reviewsList.length === 0) return 0;
  const totalRating = props.reviewsList.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  return totalRating / props.reviewsList.length;
});
</script>
