<template>
  <section class="bg-gray-50 min-h-screen flex flex-col p-6">
    <h1 class="mobile-spacing mt-3 text-2xl font-semibold">Cart</h1>

    <div class="flex-1 overflow-y-auto">
      <div v-if="cartStore.cartItems.length > 0">
        <div
          v-for="item in cartStore.cartItems"
          :key="item.id"
          class="bg-white p-4 rounded-md shadow-md mb-4"
        >
          <div class="flex items-center">
            <div class="w-24 h-24 overflow-hidden rounded-md">
              <img
                class="w-full h-full object-cover"
                :src="item.product.image_url"
                alt="image here"
              />
            </div>
            <div class="ml-4 flex-1">
              <h2 class="text-lg font-medium">{{ item.product.title }}</h2>
              <p class="text-gray-500">Quantity: {{ item.quantity }}</p>
              <p class="text-yellow-600 font-bold">{{ item.product.price }}</p>
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

    <div
      v-if="cartStore.cartItems.length > 0"
      class="bg-white p-4 rounded-md shadow-md mt-4"
    >
      <div class="flex justify-between items-center">
        <h2 class="text-lg font-medium">Total:</h2>
        <p class="text-yellow-600 font-bold">{{ total }}</p>
      </div>

      <button
        @click="orderNow"
        class="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-4"
      >
        Order Now
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import { toast } from "vue3-toastify";
import { useRouter } from "vue-router"; // Use 'useRouter' instead of 'useRoute'

const cartStore = useCartStore();
const orderStore = useOrderStore();
const router = useRouter(); // Initialize the router object

onMounted(() => {
  cartStore.getCartItems();
});

const removeFromCart = async (id) => {
  console.log(id);

  try {
    const item = cartStore.cartItems.find((item) => item.id === id);
    if (item) {
      if (item.quantity > 1) {
        // Decrease the quantity if more than 1
        await cartStore.updateItemQuantity(id, item.quantity - 1);
      } else {
        // Remove the item if quantity is 1
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
    await orderStore.placeOrder();
    cartStore.cartItems = [];
    toast.success("Your order has been placed.");
    // Wait for the toast to show before navigating
    setTimeout(() => {
      router.push("/orderconfirmation");
    }, 2000); // Adjust the delay as needed
  } catch (error) {
    toast.error("Something went wrong.");
  }
};
</script>

<style scoped></style>
