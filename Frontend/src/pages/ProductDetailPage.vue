<template>
  <div v-if="product" class="mobile-spacing space-y-6">
    <h1 class="text-3xl font-bold text-center text-gray-900">
      {{ food }}
    </h1>

    <div class="rounded-lg overflow-hidden shadow-lg">
      <img
        class="w-full h-64 object-cover"
        :src="product.image_url"
        alt="Product image"
      />
    </div>

    <div class="bg-white p-4 rounded-lg shadow-lg">
      <div class="text-center space-y-3">
        <h2 class="text-2xl font-semibold text-gray-900">
          {{ product.title }}
        </h2>
        <p class="text-lg text-gray-800 font-semibold">{{ product.price }}</p>
        <p class="text-sm text-gray-700">
          {{ product.description }}
        </p>
      </div>

      <div class="mt-6 space-y-4">
        <div>
          <label class="font-semibold text-gray-900">Description</label>
          <p class="text-sm text-gray-600 mt-1">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
            lacinia odio vitae vestibulum.
          </p>
        </div>
        <div>
          <label class="font-semibold text-gray-900">Contact</label>
          <p class="text-sm text-gray-600 mt-1">+92-3344556677</p>
        </div>
      </div>

      <div class="mt-6">
        <label class="font-semibold text-gray-900">Quantity</label>
        <div
          class="flex items-center mt-2 border border-gray-300 rounded-md overflow-hidden w-max mx-auto"
        >
          <button
            @click="decreaseQuantity"
            class="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none transition-colors"
          >
            -
          </button>
          <span class="px-6 py-2 text-gray-800 bg-white">
            {{ quantity }}
          </span>
          <button
            @click="increaseQuantity"
            class="px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none transition-colors"
          >
            +
          </button>
        </div>
      </div>

      <div class="mt-8 flex flex-col items-center space-y-3">
        <button class="button" @click="handleOrderNow">Order Now</button>

        <button class="button-border" @click="addToCart">Add To Cart</button>
      </div>
    </div>
  </div>
  <div v-else>
    <p>Loading...</p>
    <!-- Customize this loading state as needed -->
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();
const productStore = useProductStore();
const quantity = ref(1);

onMounted(async () => {
  await productStore.getProduct(route.params.id);
});

const product = computed(() => productStore.product);
const food = computed(() => (product.value ? product.value.title : ""));

const addToCart = async () => {
  const cartItem = {
    product_id: route.params.id,
    quantity: quantity.value,
  };

  try {
    await cartStore.addToCart(cartItem);
    toast.success("Product added to cart successfully!");
  } catch (error) {
    toast.error("Failed to add product to cart.");
  }
};

const handleOrderNow = async () => {
  await addToCart(); // Add the item to the cart
  router.push({ name: "Cart" }); // Navigate to the cart page
};

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
