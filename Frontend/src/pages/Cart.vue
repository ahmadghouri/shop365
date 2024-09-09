<template>
  <section class="min-h-screen flex flex-col mobile-spacing relative">
    <div class="flex justify-between items-center mt-3">
      <div class="flex items-center gap-3">
        <button @click="goBack" class="">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-4 h-4 text-gray-700 hover:text-gray-900"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h1 class="text-2xl font-semibold">Cart</h1>
      </div>
      <button
        @click="orderNow"
        class="bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg text-sm px-5 py-2.5"
      >
        Order Now
      </button>
    </div>

    <div class="flex-1 overflow-y-auto mt-4 mb-20">
      <!-- Added mb-20 to make space for the fixed total box -->
      <div v-if="cartStore.cartItems.length > 0">
        <div
          v-for="item in cartStore.cartItems"
          :key="item.id"
          class="bg-white p-4 rounded-md shadow-md mb-4"
        >
          <div class="flex items-center">
            <div class="w-24 h-24 overflow-hidden rounded-md">
              <img
                class="w-full h-full object-contain"
                :src="item.product.image_url"
                alt="image here"
              />
            </div>
            <div class="ml-4 flex-1">
              <h2 class="text-lg font-medium">{{ item.product.title }}</h2>
              <p class="text-gray-500">Quantity: {{ item.quantity }}</p>
              <p
                v-if="item.product.final_price"
                class="text-yellow-600 font-bold"
              >
                {{ item.product.final_price }}
              </p>
              <p v-else class="text-yellow-600 font-bold">
                {{ item.product.price }}
              </p>
            </div>
            <button
              @click="removeFromCart(item.id)"
              class="text-red-500 hover:text-red-700 ml-4"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 mt-10">
        No items in your cart
      </div>
    </div>

    <!-- Fixed position total box -->
    <div
      v-if="cartStore.cartItems.length > 0"
      class="bg-white p-4 rounded-md shadow-md fixed bottom-0 left-0 right-0 mx-4 mb-4"
    >
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium">Total:</h2>
        <p class="text-yellow-600 font-bold">{{ total }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import { useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import { laraEcho } from "../echo.config";

const cartStore = useCartStore();
const orderStore = useOrderStore();
const router = useRouter();

onMounted(() => {
  laraEcho.channel("test-channel").listen("TestEvent", (event) => {
    console.log("The real time data is", event);
  });

  return () => {
    laraEcho.leave("test-channel");
  };
});

onMounted(() => {
  cartStore.getCartItems();
});

const removeFromCart = async (id) => {
  try {
    const item = cartStore.cartItems.find((item) => item.id === id);
    if (item) {
      if (item.quantity > 1) {
        await cartStore.updateItemQuantity(id, item.quantity - 1);
      } else {
        await cartStore.removeItem(id);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

const total = computed(() => {
  return cartStore.cartItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);
});

const orderNow = async () => {
  try {
    const response = await orderStore.placeOrder();

    if (
      response.status === 200 &&
      response.data.message === "Order(s) placed successfully"
    ) {
      cartStore.cartItems = [];

      toast.success("Your order has been placed.");
      setTimeout(() => {
        router.push("/home/orderconfirmation");
      }, 1000);
    } else {
      let errorMessage = response.data.message || "Something went wrong.";

      if (
        response.data.failed_businesses &&
        response.data.failed_businesses.length > 0
      ) {
        const failedBusinesses = response.data.failed_businesses.join(", ");
        errorMessage += ` The following restaurants have an order amount less than 500: ${failedBusinesses}.`;
      }

      toast.error(errorMessage);
    }
  } catch (error) {
    let errorMessage = "Something went wrong.";

    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;

      if (
        error.response.data.failed_businesses &&
        error.response.data.failed_businesses.length > 0
      ) {
        const failedBusinesses =
          error.response.data.failed_businesses.join(", ");
        errorMessage += ` The following restaurants have an order amount less than 500: ${failedBusinesses}.`;
      }
    }

    toast.error(errorMessage);
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped></style>
