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
        <div class="flex justify-center gap-4 items-center">
          <h2 class="text-lg font-medium">Total:</h2>
          <p class="text-yellow-600 font-bold">{{ total }}</p>
        </div>
      </div>
    </div>

    <div
      v-if="cartStore.cartItems.length > 0"
      class="bg-gradient-to-r from-yellow-400 to-yellow-500 mobile-spacing rounded-2xl shadow-lg fixed bottom-0 left-0 right-0 mx-4 mb-6 lg:hidden overflow-hidden"
    >
      <div class="flex items-center justify-between space-x-4">
        <div class="flex flex-col">
          <h2 class="text-lg font-semibold text-white">Total:</h2>
          <p class="text-2xl font-bold text-white">{{ total }}</p>
        </div>

        <button
          @click="orderNow"
          class="bg-white text-yellow-600 hover:bg-yellow-100 rounded-full px-8 py-3 font-bold shadow-md transition ease-in-out duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:ring-opacity-50"
        >
          Order Now
        </button>
      </div>
      <div
        class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-yellow-500"
      ></div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";

const cartStore = useCartStore();
const orderStore = useOrderStore();
const router = useRouter();

const showErrorPopup = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  try {
    await cartStore.getCartItems();
  } catch (error) {
    showError("Failed to load cart items. Please try again.");
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

const total = computed(() => {
  return cartStore.cartItems.reduce((sum, item) => {
    if (item.product) {
      const price = item.product.final_price || item.product.price;
      return sum + price * item.quantity;
    }
    return sum;
  }, 0);
});

const orderNow = async () => {
  if (total.value <= 0) {
    // Display the error popup if total is less than or equal to zero
    showError("You cannot place an order with a total amount of 0.");
    return;
  }
  try {
    const response = await orderStore.placeOrder();

    if (
      response.status === 200 &&
      response.data.message === "Order(s) placed successfully"
    ) {
      cartStore.cartItems = [];
      setTimeout(() => {
        router.push("/home/orderconfirmation");
      }, 1000);
    } else {
      let errorMessage = response.data.message || "Something went wrong.";
      if (response.data.failed_businesses?.length > 0) {
        const failedBusinesses = response.data.failed_businesses.join(", ");
        errorMessage += ` The following restaurants have an order amount less than 500: ${failedBusinesses}.`;
      }
      toast.error(errorMessage);
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
  }
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

<style scoped></style>
