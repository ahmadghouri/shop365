<template>
  <!-- Main Container -->
  <div class="mobile-spacing lg:px-32" v-if="orderDetails.length > 0">
    <div class="relative mt-2 mb-12">
      <!-- Back Arrow Button and Refresh Button -->
      <div class="flex justify-between items-center mb-2">
        <button
          @click="goBack"
          class="text-gray-600 hover:text-gray-900 transition-colors"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h1 class="text-xl font-semibold text-gray-800">My Orders</h1>

        <button
          @click="refreshOrders"
          class="text-yellow-600 hover:text-yellow-700 transition-colors"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>

    <div
      v-for="order in orderDetails"
      :key="order.id"
      class="bg-white shadow-sm rounded-lg p-4 mb-4 border-l-4"
      :class="{
        'border-red-500': order.status === 'pending',
        'border-yellow-500': order.status === 'preparing',
        'border-green-500': order.status === 'delivered',
      }"
    >
      <!-- Order Header -->
      <div class="flex justify-between items-start mb-3">
        <div>
          <h2 class="text-base font-semibold text-gray-800">
            Order #{{ order.id }}
          </h2>
          <p class="text-xs text-gray-500">
            {{ formatDate(order.created_at) }}
          </p>
        </div>

        <span
          class="px-3 py-1 rounded-full text-xs font-medium"
          :class="{
            'bg-red-100 text-red-800': order.status === 'pending',
            'bg-yellow-100 text-yellow-800': order.status === 'preparing',
            'bg-green-100 text-green-800': order.status === 'delivered',
          }"
        >
          {{ order.status }}
        </span>
      </div>

      <!-- Order Items -->
      <div class="border-t pt-3 mt-3">
        <div
          v-for="item in order.items"
          :key="item.id"
          class="flex justify-between text-sm py-1"
        >
          <span class="text-gray-700">
            {{ item.product?.title || "Unnamed Product" }}
            <span class="text-gray-500 ml-2">x {{ item.quantity }}</span>
          </span>
          <span class="font-semibold text-gray-800">
            PKR
            {{ ((item.price || 0) * (item.quantity || 1)).toLocaleString() }}
          </span>
        </div>
      </div>

      <!-- Order Footer -->
      <div class="mt-4 pt-4 border-t flex justify-between items-center">
        <div>
          <p class="text-base font-semibold text-gray-800">
            Total: PKR {{ (order.total_price || 0).toLocaleString() }}
          </p>
        </div>

        <div class="flex space-x-2">
          <button
            @click="reorderOrder(order.id)"
            class="px-3 py-2 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Reorder
          </button>
          <button
            v-if="order.status == 'delivered'"
            @click="handleReview(order)"
            class="px-3 py-2 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Review
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- No Orders State -->
  <div
    v-else-if="!isLoading"
    class="flex flex-col justify-center items-center h-screen bg-gray-50"
  >
    <div class="text-center">
      <svg
        class="mx-auto h-16 w-16 text-gray-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h2 class="text-xl font-semibold text-gray-700 mb-2">No orders yet</h2>
      <p class="text-gray-500">Your recent orders will appear here</p>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="flex justify-center items-center h-screen bg-gray-50">
    <div
      class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"
    ></div>
  </div>

  <div
    v-if="showReviewModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
  >
    <div class="bg-white rounded-lg p-6 w-96">
      <h2 class="text-xl font-semibold mb-4">Rate Your Order</h2>

      <!-- Star Rating -->
      <div class="flex justify-center mb-4">
        <div class="flex space-x-1">
          <button
            v-for="star in 5"
            :key="star"
            @click="rating = star"
            @mouseover="hoverRating = star"
            @mouseleave="hoverRating = rating"
            class="focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8"
              :fill="star <= (hoverRating || rating) ? 'gold' : 'none'"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Comment Textarea -->
      <textarea
        v-model="comment"
        placeholder="Write your review!"
        class="w-full p-2 border rounded mb-4 h-24 resize-none"
      ></textarea>

      <!-- Modal Buttons -->
      <div class="flex justify-between">
        <button
          @click="closeReviewModal"
          class="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          @click="submitReview"
          :disabled="rating === 0"
          class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Submit Review
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useOrderStore } from "../store/orderStore";
import { useCartStore } from "../store/cartStore";
import { toast } from "vue3-toastify";
import { useReviewStore } from "../store/useReviewStore";

const orderDetails = ref([]);
const orderStore = useOrderStore();
const cartStore = useCartStore();
const router = useRouter();
const isLoading = ref(true);
const businessId = ref(0);
const reviewStore = useReviewStore();

const showReviewModal = ref(false);
const currentReviewOrder = ref(null);
const comment = ref("");
const rating = ref(0);
const hoverRating = ref(0);

const handleReview = (order) => {
  // Ensure we have a valid order before opening review modal
  if (order && order.items && order.items.length > 0) {
    currentReviewOrder.value = order;
    showReviewModal.value = true;
  } else {
    toast.error("Unable to review this order");
  }
};

const closeReviewModal = () => {
  showReviewModal.value = false;
  currentReviewOrder.value = null;
  comment.value = "";
  rating.value = 0;
  hoverRating.value = 0;
};

const submitReview = async () => {
  if (rating.value === 0) return;

  try {
    // Add additional null checks
    const order_id = currentReviewOrder.value?.id;
    const first_item = currentReviewOrder.value?.items?.[0];
    const business_id =
      first_item?.product?.business_id || first_item?.business_id;

    if (!order_id || !business_id) {
      toast.error("Invalid order information");
      return;
    }

    await reviewStore.postReview(
      order_id,
      business_id,
      comment.value,
      rating.value
    );

    toast.success("Review submitted successfully");
    closeReviewModal();
  } catch (error) {
    console.error("Error posting review", error);
    toast.error("You have already reviewed this order or an error occurred");
  }
};

async function getOrderDetails() {
  isLoading.value = true;
  try {
    await orderStore.getOrderDetails();
    // Add null check and fallback
    orderDetails.value = orderStore.userOrderDetails || [];
    orderDetails.value.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  } catch (error) {
    console.error(error);
    toast.error("Failed to fetch order details");
    orderDetails.value = []; // Ensure it's an empty array on error
  } finally {
    isLoading.value = false;
  }
}

async function refreshOrders() {
  await getOrderDetails();
}

async function reorderOrder(orderId) {
  try {
    console.log(orderId);

    const result = await cartStore.reorderPreviousOrder(orderId);
    if (result?.success) {
      toast.success(result.message);
      router.push("/home/cart");
    } else {
      toast.error(result?.message || "Failed to reorder");
    }
  } catch (error) {
    console.error("Reorder failed", error);
    toast.error("Failed to reorder. Please try again.");
  }
}

onMounted(async () => {
  await getOrderDetails();
});

const formatDate = (dateString) => {
  if (!dateString) return "Unknown Date";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };

  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getOrderStatusMessage = (status) => {
  if (status === "pending") {
    return "Estimated Delivery in 45-50 minutes";
  } else if (status === "preparing") {
    return "Estimated Delivery in 30 minutes";
  } else if (status === "delivered") {
    return "Enjoy your meal";
  } else {
    return "";
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped></style>
