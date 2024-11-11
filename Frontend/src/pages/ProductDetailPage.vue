<template>
  <div v-if="product" class="mobile-spacing lg:px-20 xl:px-32 py-10">
    <!-- Back Arrow -->
    <div class="flex items-center mt-4 lg:mt-0">
      <button @click="goBack" class="h-4 w-4 lg:h-6 lg:w-6">
        <!-- Back Arrow Icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-full w-full text-gray-900 hover:text-gray-700 transition duration-150"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
    </div>

    <!-- Responsive Container for Product Details -->
    <div class="flex flex-col lg:flex-row lg:gap-10 mt-6 lg:mt-10">
      <!-- Product Image -->
      <div class="lg:w-1/2 flex justify-center items-center">
        <div
          class="rounded-lg overflow-hidden w-32 h-32 lg:w-96 lg:h-96 bg-transparent"
        >
          <img
            ref="productImage"
            class="object-contain w-full h-full image"
            :src="product.image_url"
            alt="Product image"
          />
        </div>
      </div>

      <!-- Product Information -->
      <div class="bg-white p-4 lg:p-8 rounded-lg shadow-lg lg:w-1/2">
        <div
          class="text-center mt-2 lg:text-left flex justify-between items-center"
        >
          <h2
            class="text-2xl text-left lg:text-3xl lg:max-w-full font-semibold text-gray-900"
          >
            {{ product.title }}
          </h2>
          <div v-if="product.type.toLowerCase() !== 'services'">
            <p v-if="product.discount > 0" class="text-sm lg:text-lg mb-1">
              <span class="text-gray-500 line-through text-base lg:text-sm">
                Rs:{{ product.price }}
              </span>
              <span class="text-red-600 font-bold text-xl ml-2 lg:text-2xl">
                Rs:{{ product.final_price }}
              </span>
            </p>
            <p v-else class="text-lg lg:text-xl text-gray-800 font-semibold">
              Rs:{{ product.price }}
            </p>
          </div>
        </div>

        <!-- Description and Quantity Controls -->
        <div class="mt-6 space-y-4">
          <div>
            <label class="font-semibold text-gray-900">Description</label>
            <p class="text-sm lg:text-base text-gray-600 mt-1">
              {{ product.description }}
            </p>
          </div>
        </div>

        <div class="mt-6" v-if="product.type.toLowerCase() !== 'services'">
          <label class="font-semibold text-gray-900">Quantity</label>
          <div
            class="flex items-center mt-2 border border-gray-300 rounded-md overflow-hidden w-max mx-auto lg:mx-0"
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

        <!-- Buttons for Order and Add to Cart -->
        <div
          v-if="product.type.toLowerCase() !== 'services'"
          class="mt-8 flex flex-col items-center lg:items-start space-y-3"
        >
          <button class="button" @click="handleOrderNow">Order Now</button>
          <button class="button-border" @click="addToCart">Add To Cart</button>
        </div>

        <div v-else class="mt-8 flex items-center">
          <button class="button" @click.prevent="openContactPopup(product)">
            Book Now
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showContactPopup"
      class="fixed inset-0 bg-black mobile-spacing bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white mobile-spacing md:p-8 rounded-lg max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">{{ selectedProduct.title }}</h2>
        <p class="text-gray-700 mb-6">{{ selectedProduct.description }}</p>
        <div class="flex justify-end">
          <button
            @click="closeContactPopup"
            class="px-4 py-2 bg-yellow-500 text-white font-semibold rounded-full hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading Spinner -->
  <div v-else class="flex justify-center items-center h-screen bg-gray-100">
    <div
      class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500"
    ></div>
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
const productImageRef = ref(null);
const showContactPopup = ref(false);
const selectedProduct = ref(null);

const openContactPopup = (product) => {
  selectedProduct.value = product;
  showContactPopup.value = true;
};

const closeContactPopup = () => {
  showContactPopup.value = false;
  selectedProduct.value = null;
};

onMounted(async () => {
  const productId = route.params.id;
  const businessId = route.query.business_id;

  await productStore.getProduct(productId, businessId);
});

const product = computed(() => productStore.product);
const food = computed(() => (product.value ? product.value.title : ""));

const addToCart = async () => {
  const cartItem = {
    product_id: route.params.id,
    quantity: quantity.value,
  };

  const nav = document.querySelector(".navbar-cart-icon");
  const productImage = document.querySelector(".image");

  if (nav && productImage) {
    const start = productImage.getBoundingClientRect();
    const end = nav.getBoundingClientRect();

    createFlyingElement(productImage.src, start, end);
  }

  try {
    await cartStore.addToCart(cartItem);
    // toast.success("Product added to cart successfully!");
  } catch (error) {
    toast.error("Failed to add product to cart.");
  }
};

function createFlyingElement(productImage, start, end) {
  console.log("Creating flying element");

  const flyingElement = document.createElement("img");
  flyingElement.src = productImage;
  flyingElement.style.position = "fixed";
  flyingElement.style.top = `${start.top}px`;
  flyingElement.style.left = `${start.left}px`;
  flyingElement.style.width = `${start.width}px`;
  flyingElement.style.height = `${start.height}px`;
  flyingElement.style.objectFit = "contain";
  flyingElement.style.zIndex = "9999";
  flyingElement.style.opacity = "0.8";
  flyingElement.style.pointerEvents = "none";

  document.body.appendChild(flyingElement);

  const isMobile = window.innerWidth <= 768;
  const mobileAdjustment = isMobile ? 1.1 : 1;

  flyingElement.animate(
    [
      {
        left: `${start.left}px`,
        top: `${start.top}px`,
        width: `${start.width}px`,
        height: `${start.height}px`,
        opacity: 0.8,
      },
      {
        left: `${end.left * mobileAdjustment}px`,
        top: `${end.top * mobileAdjustment}px`,
        width: "20px",
        height: "20px",
        opacity: 0.5,
      },
    ],
    {
      duration: 800,
      easing: "ease-in-out",
    }
  ).onfinish = () => {
    document.body.removeChild(flyingElement);
  };
}

const handleOrderNow = async () => {
  await addToCart();
  router.push({ name: "Cart" });
};

const increaseQuantity = () => {
  quantity.value++;
};

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// Go back to the previous page
const goBack = () => {
  router.back();
};
</script>

<style scoped>
/* Add your styles here */
</style>
