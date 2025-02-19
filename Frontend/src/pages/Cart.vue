<template>
  <section class="min-h-screen flex flex-col mobile-spacing relative lg:px-32">
    <div class="flex justify-between items-center mt-3">
      <button @click="goBack" class="text-gray-500 hover:text-gray-800">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2"
          stroke="currentColor"
          class="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <h1 class="text-xl font-semibold">Items</h1>
      <div>
        <button
          @click="orderNow"
          class="bg-yellow-500 hidden lg:block hover:bg-yellow-600 text-white rounded-md px-6 py-2 font-medium shadow-lg transition ease-in-out duration-300"
        >
          Order Now
        </button>
      </div>
    </div>

    <div class="bg-white p-4 rounded-lg shadow-md mt-6">
      <div class="flex justify-between items-center mb-4">
        <div class="flex space-x-3 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 text-yellow-500 mt-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h2 class="text-lg font-semibold text-gray-800">
            {{ cartStore.isGuestUser ? "Guest User" : "Delivery Address" }}
          </h2>
        </div>
        <button
          @click="toggleEditAddress"
          class="text-yellow-600 hover:text-yellow-700 font-medium"
        >
          {{ isEditingAddress ? "Cancel" : "Edit" }}
        </button>
      </div>

      <div v-if="cartStore.isGuestUser" class="text-gray-700">
        <p class="mb-2">
          Please
          <router-link
            to="/register"
            class="text-yellow-600 hover:text-yellow-700"
            >create an account</router-link
          >
          or
          <router-link
            to="/userlogin"
            class="text-yellow-600 hover:text-yellow-700"
            >login</router-link
          >
          to complete your order
        </p>
      </div>

      <div v-if="!isEditingAddress" class="text-gray-700">
        <p class="mb-2">
          <span class="font-medium">Address:</span> {{ address }}
        </p>
      </div>

      <div v-else class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Address</label
          >
          <textarea
            v-model="editAddress"
            rows="3"
            class="w-full p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
          ></textarea>
        </div>
        <button
          @click="saveAddress"
          class="w-full bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 transition duration-300"
        >
          Save Address
        </button>
      </div>
    </div>

    <div v-if="authStore.points >= 0" class="mb-4 mt-4">
      <div
        class="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl shadow-lg p-4 relative overflow-hidden"
      >
        <div class="absolute top-0 left-0 w-full h-1 bg-white/30">
          <div
            class="h-full bg-white transition-all duration-500 ease-out"
            :style="{
              width: `${Math.min((authStore.points / 40) * 100, 100)}%`,
            }"
          ></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-8 h-8 text-white animate-pulse"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p class="text-white font-semibold text-sm">Loyalty Points</p>
              <h2 class="text-white text-2xl font-bold tracking-wide">
                {{ authStore.points }} Points
              </h2>
            </div>
          </div>

          <div class="text-right">
            <p class="text-white/80 text-sm">Needed for Order</p>
            <span class="text-white font-bold">250 Points</span>
          </div>
        </div>

        <div class="mt-2 text-sm text-white/90">
          {{
            authStore.points >= 250
              ? "Ready to use points!"
              : `${250 - authStore.points} more points to unlock`
          }}
        </div>
        <div
          v-if="authStore.points >= 250"
          class="mt-2 flex items-center justify-between"
        >
          <div class="flex items-center space-x-3">
            <span class="text-white/90">Use Points</span>
            <label class="flex items-center cursor-pointer">
              <div class="relative">
                <input
                  type="checkbox"
                  v-model="usePointsForOrder"
                  class="sr-only"
                />
                <div
                  class="w-10 h-4 bg-white/30 rounded-full shadow-inner"
                ></div>
                <div
                  class="dot absolute -left-1 -top-1 bg-white w-6 h-6 rounded-full transition transform"
                  :class="{
                    'translate-x-full bg-yellow-300': usePointsForOrder,
                    'bg-white': !usePointsForOrder,
                  }"
                ></div>
              </div>
            </label>
          </div>
          <span class="text-white/90">
            {{
              usePointsForOrder ? "Points will be used" : "Ready to use points!"
            }}
          </span>
        </div>
      </div>
    </div>

    <div
      v-if="cartStore.cartItems.length > 0"
      class="bg-white p-4 rounded-lg shadow mb-4"
    >
      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2"
      >
        <input
          v-model="voucherCode"
          type="text"
          placeholder="Enter voucher code"
          class="w-full sm:flex-1 p-2 border border-gray-300 rounded-md focus:ring-yellow-500 focus:border-yellow-500"
        />
        <button
          @click="applyVoucher"
          :disabled="!voucherCode"
          class="w-full sm:w-auto bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-300 disabled:opacity-50"
        >
          Apply
        </button>
      </div>

      <!-- Voucher success/error message -->
      <div v-if="voucherMessage" class="mt-2">
        <p
          :class="{
            'text-green-600': voucherSuccess,
            'text-red-600': !voucherSuccess,
          }"
          class="text-sm"
        >
          {{ voucherMessage }}
        </p>

        <!-- Additional details for inactive products -->
        <div v-if="inactiveProductNames" class="mt-2 text-sm text-gray-600">
          <p v-if="voucherSuccess">
            Voucher not applied to the following inactive products:
            <span class="font-medium">{{ inactiveProductNames }}</span>
          </p>
          <p v-else>
            Remove or replace the following inactive products:
            <span class="font-medium">{{ inactiveProductNames }}</span>
          </p>
        </div>

        <!-- Remaining amount needed to apply voucher -->
        <div
          v-if="remainingAmount > 0 && !voucherSuccess"
          class="mt-2 text-sm text-gray-600"
        >
          Add products worth
          <span class="font-medium">{{ remainingAmount }}</span>
          more to apply the voucher.
        </div>
      </div>
    </div>

    <div
      v-if="showErrorPopup"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="bg-white mobile-spacing lg:p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
      >
        <h2 class="text-xl font-bold mb-4 text-red-600">Error</h2>
        <p class="text-gray-700 mb-4">{{ errorMessage }}</p>
        <button
          @click="closeErrorPopup"
          class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
        >
          Close
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto mt-6 mb-20">
      <div
        v-if="isProcessing"
        class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      >
        <div class="text-center">
          <svg class="mx-auto w-24 h-24 lg:w-32 lg:h-32" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="#FDE68A"
              stroke-width="8"
              fill="none"
            />
            <path
              class="order-progress"
              d="M50 10 A40 40 0 0 1 90 50"
              stroke="#FBBF24"
              stroke-width="8"
              fill="none"
              stroke-linecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="360 50 50"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx="50" cy="50" r="20" fill="#FBBF24">
              <animate
                attributeName="r"
                values="20;22;20"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
          <p class="mt-4 text-white text-xl font-semibold animate-pulse">
            Processing Order...
          </p>
        </div>
      </div>

      <div v-if="cartStore.cartItems.length > 0">
        <div
          v-for="item in cartStore.cartItems"
          :key="item.id"
          class="bg-white p-4 rounded-lg shadow mb-4 flex items-center space-x-4"
        >
          <div class="w-20 h-20 rounded-lg overflow-hidden">
            <img
              v-if="item.product"
              class="w-full h-full object-contain"
              :src="item.product.image_url"
              alt="Product Image"
            />
            <img
              v-else
              class="w-full h-full object-cover"
              src="https://via.placeholder.com/100x100.png?text=Unavailable"
              alt="Product Unavailable"
            />
          </div>

          <div class="flex-1">
            <h2 class="text-lg font-medium text-gray-800">
              {{ item.product ? item.product.title : "Product unavailable" }}
            </h2>
            <p class="text-sm text-gray-500 mt-1">
              Quantity: {{ item.quantity }}
            </p>
            <p class="text-lg font-semibold text-yellow-600 mt-1">
              {{
                item.product
                  ? item.product.final_price || item.product.price
                  : 0
              }}
            </p>
            <div class="flex items-center space-x-2 mt-2">
              <button
                @click="decreaseQuantity(item)"
                class="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!item.product"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M18 12H6"
                  />
                </svg>
              </button>

              <span class="text-lg font-medium">{{ item.quantity }}</span>

              <button
                @click="increaseQuantity(item)"
                class="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-gray-200"
                :disabled="!item.product"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center text-gray-400 mt-10">
        No items in your cart
      </div>

      <div
        v-if="cartStore.cartItems.length > 0"
        class="bg-white p-4 rounded-md shadow-md max-w-48 hidden lg:block"
      >
        <div class="flex flex-col justify-center items-center">
          <div class="flex gap-4 items-center">
            <h2 class="text-lg font-medium">Sub Total:</h2>
            <p class="text-gray-600 font-bold">
              {{ originalTotal.toFixed(2) }}
            </p>
          </div>
          <div
            class="flex gap-4 items-center"
            v-if="cartStore.voucherDiscount > 0"
          >
            <h2 class="text-lg font-medium">Discount:</h2>
            <p class="text-red-600 font-bold">
              -{{ cartStore.voucherDiscount.toFixed(2) }}
            </p>
          </div>
          <div class="flex gap-4 items-center">
            <h2 class="text-lg font-medium">Total:</h2>
            <p class="text-yellow-600 font-bold">{{ total.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- this is for mobile order now button -->
    <div
      v-if="cartStore.cartItems.length > 0"
      class="bg-gradient-to-r from-yellow-400 to-yellow-500 mobile-spacing rounded-2xl shadow-lg fixed bottom-0 left-0 right-0 mx-4 mb-6 lg:hidden overflow-hidden"
    >
      <div class="flex items-center justify-between p-4 space-x-4">
        <div class="flex flex-col">
          <!-- Sub Total and Total Container -->
          <div class="flex items-center space-x-2">
            <span class="text-white text-sm font-medium">Sub:</span>
            <span class="text-white text-base font-bold">
              {{ originalTotal.toFixed(2) }}
            </span>
          </div>

          <!-- Discount -->
          <div
            v-if="cartStore.voucherDiscount > 0"
            class="flex items-center space-x-2"
          >
            <span class="text-white text-sm font-medium">Disc:</span>
            <span class="text-red-100 text-base font-bold">
              -{{ cartStore.voucherDiscount.toFixed(2) }}
            </span>
          </div>

          <div class="flex items-center space-x-2">
            <span class="text-white text-sm font-medium">Total:</span>
            <span class="text-white text-lg font-bold">
              {{ total.toFixed(2) }}
            </span>
          </div>
        </div>

        <!-- Order Now Button -->
        <button
          @click="orderNow"
          class="bg-white text-yellow-600 rounded-full px-6 py-2 font-bold text-sm animate-pulse-glow transform hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50"
        >
          Order Now
        </button>
      </div>

      <!-- Gradient Accent Line -->
      <div
        class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-yellow-500"
      ></div>
    </div>

    <!-- New Order Confirmation Popup -->
    <div
      v-if="showOrderConfirmation"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div
        class="bg-white mobile-spacing lg:p-6 rounded-lg shadow-xl max-w-md w-full mx-4 text-center"
      >
        <svg
          class="mx-auto w-16 h-16 text-green-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Order Confirmed!</h2>
        <p class="text-gray-600 mb-4">
          Your order has been successfully placed.
        </p>
        <div class="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            class="bg-green-500 h-2.5 rounded-full"
            :style="{ width: `${confirmationProgress}%` }"
          ></div>
        </div>
        <p class="text-sm text-gray-500">
          Redirecting to home page in
          {{ Math.ceil(confirmationTimer / 1000) }} seconds...
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import { useRouter } from "vue-router";
import { API_BASE_URL } from "../config/api";
import { toast } from "vue3-toastify";
import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const cartStore = useCartStore();
const orderStore = useOrderStore();
const router = useRouter();
const authStore = useAuthStore();

// voucher code
const voucherCode = ref("");
const voucherMessage = ref("");
const voucherSuccess = ref(false);

const showErrorPopup = ref(false);
const errorMessage = ref("");
const isProcessing = ref(false);
const showOrderConfirmation = ref(false);
const confirmationTimer = ref(5000); // 30 seconds
const confirmationProgress = ref(0);

// New refs for address section
const name = ref("");
const phone = ref("");
const address = ref("");
const editName = ref("");
const editPhone = ref("");
const editAddress = ref("");
const isEditingAddress = ref(false);
const profile_id = ref();
const usePointsForOrder = ref(false);

const applyVoucher = async () => {
  try {
    voucherMessage.value = "";
    voucherSuccess.value = false;

    cartStore.resetVoucherDiscount();

    // Apply voucher
    const result = await cartStore.applyVoucher(voucherCode.value);

    // Set success message
    voucherMessage.value = result.message || "Voucher applied successfully";
    voucherSuccess.value = true;
  } catch (error) {
    // Set error message
    voucherMessage.value =
      error.response?.data?.message || "Failed to apply voucher";
    voucherSuccess.value = false;
  }
};

const originalTotal = computed(() => {
  return cartStore.cartItems.reduce((sum, item) => {
    if (item.product) {
      const price = item.product.final_price || item.product.price;
      return sum + price * item.quantity;
    }
    return sum;
  }, 0);
});

const total = computed(() => {
  return Math.max(originalTotal.value - cartStore.voucherDiscount, 0);
});

const orderNow = async () => {
  if (cartStore.isGuestUser) {
    // Redirect to registration with fromCart parameter
    router.push({
      path: "/register",
      query: { fromCart: "true" },
    });
    return;
  }
  if (total.value <= 0) {
    showError("You cannot place an order with a total amount of 0.");
    return;
  }
  if (usePointsForOrder.value && authStore.points <= 250) {
    showError("Minimum 250 points required to use points.");
    return;
  }
  isProcessing.value = true;
  try {
    console.log(voucherCode.value, "voucher code");

    const response = await orderStore.placeOrder(
      usePointsForOrder.value,
      voucherCode.value
    );

    if (
      response.status === 200 &&
      response.data.message === "Order(s) placed successfully"
    ) {
      if (usePointsForOrder.value) {
        const pointsUsed = response.data.pointsUsed || 0;
        await authStore.refreshUser(); // Refresh to get updated points
      }
      showOrderConfirmation.value = true;
      startConfirmationTimer();
      cartStore.resetVoucherDiscount();
    } else {
      let errorMessage = response.data.message || "Something went wrong.";
      if (response.data.failed_businesses?.length > 0) {
        const failedBusinesses = response.data.failed_businesses.join(", ");
        errorMessage += ` The following restaurants have an order amount less than 500: ${failedBusinesses}.`;
      }
      showError(errorMessage);
    }
  } catch (error) {
    let errorMessage = "Something went wrong.";
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
      if (error.response.data.failed_businesses?.length > 0) {
        const failedBusinesses =
          error.response.data.failed_businesses.join(", ");
        errorMessage += ` The following restaurants have an order amount less than 500: ${failedBusinesses}.`;
      }
    }
    showError(errorMessage);
  } finally {
    isProcessing.value = false;
  }
};

const showRegistrationPrompt = () => {
  // showErrorPopup.value = true;
  // errorMessage.value = "Please create an account to complete your order";

  // Add a slight delay before redirecting
  // setTimeout(() => {
  router.push("/userLogin");
  // }, 2000);
};

async function getProfileData() {
  if (cartStore.isGuest) return;
  try {
    const response = await axios.get(`${API_BASE_URL}/api/profile`, {});
    const profile = response.data.data;
    profile_id.value = profile.user.id;
    phone.value = profile.user?.phone_no || "";
    name.value = profile.user?.name || "No Name";
    address.value = profile.household?.address || "No Address";

    // Initialize edit values
    editPhone.value = phone.value;
    editName.value = name.value;
    editAddress.value = address.value;
  } catch (error) {
    console.error("Error fetching profile:", error);
    showError("Failed to load profile data");
  }
}

// Toggle edit address mode
const toggleEditAddress = () => {
  if (isEditingAddress.value) {
    // Reset edit values when canceling
    editPhone.value = phone.value;
    editName.value = name.value;
    editAddress.value = address.value;
  }
  isEditingAddress.value = !isEditingAddress.value;
};

const saveAddress = async () => {
  try {
    await axios.put(
      `${API_BASE_URL}/api/update/${profile_id.value}`,
      {
        phone_no: editPhone.value,
        name: editName.value,
        address: editAddress.value,
      },
      {}
    );

    // Update local values
    phone.value = editPhone.value;
    name.value = editName.value;
    address.value = editAddress.value;

    isEditingAddress.value = false;
    toast.success("Address updated");
  } catch (error) {
    console.error("Error updating address:", error);
    toast.error("Failed to update address. Please try again.");
  }
};

onMounted(async () => {
  try {
    await cartStore.getCartItems();
    if (!cartStore.isGuest) {
      await getProfileData();
    }
  } catch (error) {
    if (!cartStore.isGuest) {
      showError("Failed to load cart items. Please try again.");
    }
  }
});

const increaseQuantity = async (item) => {
  try {
    await cartStore.updateItemQuantity(item.id, item.quantity + 1);
  } catch (error) {
    console.error(error);
  }
};

const decreaseQuantity = async (item) => {
  try {
    if (item.quantity > 1) {
      await cartStore.updateItemQuantity(item.id, item.quantity - 1);
    } else {
      await cartStore.removeItem(item.id);
    }
  } catch (error) {
    console.error("Failed to decrease quantity", error);
  }
};

const startConfirmationTimer = () => {
  const interval = 100; // Update every 100ms for smooth animation
  const timer = setInterval(() => {
    confirmationTimer.value -= interval;
    confirmationProgress.value =
      ((5000 - confirmationTimer.value) / 5000) * 100;

    if (confirmationTimer.value <= 0) {
      clearInterval(timer);
      showOrderConfirmation.value = false;
      cartStore.cartItems = [];
      router.push("/home/categories");
    }
  }, interval);
};

const showError = (message) => {
  errorMessage.value = message;
  showErrorPopup.value = true;
};

const closeErrorPopup = () => {
  showErrorPopup.value = false;
  errorMessage.value = "";
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.order-progress {
  stroke-dasharray: 126;
  stroke-dashoffset: 126;
  animation: progress 1.5s ease-out infinite;
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 20px 10px rgba(255, 215, 0, 0.6);
    transform: scale(1.05);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 1.5s infinite;
}

@keyframes progress {
  0% {
    stroke-dashoffset: 126;
  }

  100% {
    stroke-dashoffset: 0;
  }
}
</style>
