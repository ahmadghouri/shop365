<template>
  <div class="mobile-spacing">
    <h1
      class="mobile-spacing mt-3 text-2xl font-bold text-center sm:text-3xl md:text-4xl lg:text-5xl text-gray-800"
    >
      {{ food }}
    </h1>
    <div v-if="product" class="rounded-md">
      <div class="w-full h-60 overflow-hidden mb-4 rounded-md">
        <img
          class="w-full h-full object-cover"
          :src="product.image_url"
          alt="Product image"
        />
      </div>
      <div class="text-left">
        <div class="flex justify-between items-center mt-4">
          <h2 class="text-xl font-semibold text-slate-800">
            {{ product.title }}
          </h2>
          <p class="text-lg text-gray-800 font-semibold">
            {{ product.price }}
          </p>
        </div>
        <p class="text-slate-600 text-sm">{{ product.description }}</p>

        <div class="mt-3">
          <label class="font-semibold text-gray-800">Description</label>
          <p class="text-sm text-gray-600">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Praesentium, voluptates magnam molestiae temporibus doloribus modi.
          </p>
          <p class="text-sm text-gray-600">
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Praesentium, voluptates magnam.
          </p>
        </div>

        <div class="mt-3">
          <label class="font-semibold text-gray-800">Contact</label>
          <p class="text-sm text-gray-600">+92-3344556677</p>
        </div>

        <div class="mt-4">
          <label class="font-semibold text-gray-800 mb-2">Quantity</label>
          <div
            class="flex items-center mt-1 border border-gray-300 rounded-md overflow-hidden w-max mx-auto"
          >
            <button
              @click="decreaseQuantity"
              class="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none transition-colors"
            >
              -
            </button>
            <span class="px-6 py-2 text-gray-800 bg-white">
              {{ quantity }}
            </span>
            <button
              @click="increaseQuantity"
              class="px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 focus:outline-none transition-colors"
            >
              +
            </button>
          </div>
        </div>

        <div class="mt-4 flex justify-center space-x-4">
          <router-link class="button" to="/orderconfirmation">
            <button>Order Now</button>
          </router-link>
          <button class="button-border" @click="addToCart">Add To Cart</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useCartStore } from "../store/cartStore";
import { useProductStore } from "../store/productStore";
import { useRoute } from "vue-router";
import { toast } from "vue3-toastify";

const route = useRoute();
const cartStore = useCartStore();
const productStore = useProductStore();
const quantity = ref(1);

onMounted(() => {
  productStore.getProduct(route.params.id);
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
