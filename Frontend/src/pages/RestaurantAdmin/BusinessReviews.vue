<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-800">Customer Reviews</h1>
        <p class="text-gray-600 mt-1">
          Manage and respond to customer feedback
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="reviewStore.loading" class="flex justify-center py-12">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
        ></div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="reviewStore.error"
        class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
      >
        <p class="text-red-600">{{ reviewStore.error }}</p>
      </div>

      <!-- Reviews List -->
      <div v-else class="space-y-6">
        <TransitionGroup name="list">
          <div
            v-for="review in reviewStore.reviewsList"
            :key="review.id"
            class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transform hover:shadow-md transition-all duration-200"
          >
            <!-- Review Header -->
            <div class="p-6 border-b border-gray-100">
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-3">
                    <span class="font-medium text-gray-900">{{
                      review.user?.name || "Anonymous User"
                    }}</span>
                    <div class="flex items-center gap-1">
                      <span
                        v-for="i in 5"
                        :key="i"
                        :class="
                          i <= review.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        "
                      >
                        ★
                      </span>
                    </div>
                  </div>
                  <div class="text-sm text-gray-500 mt-1">
                    {{
                      new Date(review.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    }}
                  </div>
                </div>
                <div
                  class="px-3 py-1 rounded-full text-sm"
                  :class="
                    review.reply
                      ? 'bg-green-50 text-green-700'
                      : 'bg-yellow-50 text-yellow-700'
                  "
                >
                  {{ review.reply ? "Replied" : "Needs Response" }}
                </div>
              </div>

              <!-- Review Content -->
              <div class="mt-4">
                <p class="text-gray-700">{{ review.comments }}</p>
              </div>
            </div>

            <!-- Reply Section -->
            <div class="bg-gray-50 p-6" v-if="review.reply">
              <div class="flex items-start gap-3">
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900 mb-1">
                    Your Reply
                  </div>
                  <p class="text-gray-700">{{ review.reply }}</p>
                </div>
              </div>
            </div>

            <!-- Reply Form -->
            <div v-else class="p-6 bg-gray-50">
              <form @submit.prevent="handleReply(review.id)" class="space-y-4">
                <div>
                  <label
                    :for="'reply-' + review.id"
                    class="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Response
                  </label>
                  <textarea
                    :id="'reply-' + review.id"
                    v-model="replyText[review.id]"
                    rows="3"
                    class="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Write your response to this review..."
                  ></textarea>
                </div>
                <div class="flex justify-end">
                  <button
                    type="submit"
                    :disabled="!replyText[review.id] || isSubmitting[review.id]"
                    class="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{
                      isSubmitting[review.id] ? "Submitting..." : "Submit Reply"
                    }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </TransitionGroup>

        <!-- Empty State -->
        <div
          v-if="!reviewStore.reviewsList.length"
          class="text-center py-12 bg-white rounded-lg border border-gray-100"
        >
          <div class="text-gray-500">No reviews to display</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useReviewStore } from "../../store/useReviewStore";

const reviewStore = useReviewStore();
const replyText = ref({});
const isSubmitting = ref({});

onMounted(async () => {
  try {
    await reviewStore.getBusinessReviews();
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
  }
});

const handleReply = async (reviewId) => {
  if (!replyText.value[reviewId]?.trim()) return;

  isSubmitting.value[reviewId] = true;
  try {
    await reviewStore.replyToReview(reviewId, replyText.value[reviewId]);
    replyText.value[reviewId] = "";
  } catch (error) {
    console.error("Failed to submit reply:", error);
  } finally {
    isSubmitting.value[reviewId] = false;
  }
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
